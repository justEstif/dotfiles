function pi-sandbox --description 'Run Pi with explicit Mise sandbox permissions'
    set -l cwd $PWD
    set -l real_home $HOME
    set -l mise_data_dir $MISE_DATA_DIR
    test -n "$mise_data_dir"; or set mise_data_dir $real_home/.local/share/mise
    set -l keep_state 0
    set -l dry_run 0
    set -l state_dir
    set -l allow_read
    set -l allow_write
    set -l allow_net
    set -l allow_env
    set -l deny_flags --deny-all
    set -l pi_argv
    set -l saw_separator 0

    while test (count $argv) -gt 0
        set -l arg $argv[1]
        set -e argv[1]
        if test $saw_separator -eq 1
            set -a pi_argv $arg
            continue
        end

        switch $arg
            case --
                set saw_separator 1
            case -h --help
                printf '%s\n' \
                    'Usage: pi-sandbox [OPTIONS] -- [PI_ARG...]' \
                    '' \
                    'Run Pi inside a least-privilege Mise sandbox. Arguments after --' \
                    'are passed to Pi unchanged. Pi tools are disabled by default; enable' \
                    'only the tools needed with Pi’s own --tools flag after --.' \
                    '' \
                    'Options:' \
                    '  -C, --cwd PATH         Working directory (default: current directory)' \
                    '      --allow-read PATH  Permit filesystem reads; repeatable' \
                    '      --allow-write PATH Permit filesystem writes; repeatable' \
                    '      --allow-net HOST   Reserved; rejected until nested proxying is safe' \
                    '      --allow-env NAME   Inherit an environment variable/glob; repeatable' \
                    '      --deny-read        Deny filesystem reads except explicit grants' \
                    '      --deny-write       Deny filesystem writes except explicit grants' \
                    '      --deny-net         Deny network access except explicit grants' \
                    '      --deny-env         Deny environment inheritance except grants' \
                    '      --deny-all         Deny reads, writes, network, and environment' \
                    '      --state-dir PATH   Create isolated Pi state at PATH (must not exist)' \
                    '      --keep-state       Retain isolated state and print its location' \
                    '      --dry-run          Print the escaped command without executing it' \
                    '  -h, --help             Show this wrapper help' \
                    '' \
                    'Defaults: read the working directory; no writes; no network; sanitized' \
                    'environment; temporary Pi state; no Pi tools.' \
                    '' \
                    'Examples:' \
                    '  pi-sandbox --help               # wrapper help' \
                    '  pi-sandbox -- --help            # Pi help' \
                    '  pi-sandbox --allow-read . -- --tools read,grep -p "Review this repo"' \
                    '' \
                    'Mise constrains Pi and descendants. The explicit Pi extension adds Bash' \
                    'confinement when bash is enabled. Network grants currently fail closed:' \
                    'Mise and sandbox-runtime cannot safely nest host proxy permissions yet.'
                return 0
            case -C --cwd --allow-read --allow-write --allow-net --allow-env --state-dir
                if test (count $argv) -eq 0
                    printf 'pi-sandbox: %s requires a value\n' $arg >&2
                    return 2
                end
                set -l value $argv[1]
                set -e argv[1]
                switch $arg
                    case -C --cwd; set cwd $value
                    case --allow-read; set -a allow_read $value
                    case --allow-write; set -a allow_write $value
                    case --allow-net; set -a allow_net $value
                    case --allow-env; set -a allow_env $value
                    case --state-dir; set state_dir $value
                end
            case '--allow-read=*' '--allow-write=*' '--allow-net=*' '--allow-env=*' '--state-dir=*' '--cwd=*'
                set -l name (string split -m1 = -- $arg)[1]
                set -l value (string split -m1 = -- $arg)[2]
                if test -z "$value"
                    printf 'pi-sandbox: %s requires a value\n' $name >&2
                    return 2
                end
                switch $name
                    case --cwd; set cwd $value
                    case --allow-read; set -a allow_read $value
                    case --allow-write; set -a allow_write $value
                    case --allow-net; set -a allow_net $value
                    case --allow-env; set -a allow_env $value
                    case --state-dir; set state_dir $value
                end
            case --keep-state
                set keep_state 1
            case --dry-run
                set dry_run 1
            case --deny-read --deny-write --deny-net --deny-env --deny-all
                set -a deny_flags $arg
            case '*'
                printf 'pi-sandbox: unknown option before --: %s\n' $arg >&2
                return 2
        end
    end

    if test $saw_separator -eq 0
        printf 'pi-sandbox: missing required -- separator\n' >&2
        return 2
    end
    if not command -q mise
        printf 'pi-sandbox: mise is required\n' >&2
        return 127
    end

    set cwd (path resolve -- $cwd 2>/dev/null)
    if test -z "$cwd"; or not test -d "$cwd"
        printf 'pi-sandbox: working directory does not exist\n' >&2
        return 2
    end

    if test (count $allow_net) -gt 0
        printf 'pi-sandbox: --allow-net is not yet safe with nested Bash confinement\n' >&2
        return 2
    end

    set -l normalized_read $cwd
    for item in $allow_read
        set -l resolved (path resolve -- $item 2>/dev/null)
        if test -z "$resolved"; or not test -e "$resolved"
            printf 'pi-sandbox: read path does not exist: %s\n' $item >&2
            return 2
        end
        set -a normalized_read $resolved
    end
    set allow_read $normalized_read

    set -l normalized_write
    for item in $allow_write
        set -l resolved (path resolve -- $item 2>/dev/null)
        if test -z "$resolved"; or not test -d "$resolved"
            printf 'pi-sandbox: write path must be an existing directory: %s\n' $item >&2
            return 2
        end
        set -a normalized_write $resolved
    end
    set allow_write $normalized_write

    for name in $allow_env
        if not string match -qr '^[A-Za-z_][A-Za-z0-9_]*(\*)?$' -- $name
            printf 'pi-sandbox: invalid environment name/glob: %s\n' $name >&2
            return 2
        end
    end
    for host in $allow_net
        if not string match -qr '^(\*\.)?[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$' -- $host
            printf 'pi-sandbox: invalid hostname: %s\n' $host >&2
            return 2
        end
    end

    set -l tmp_root $TMPDIR
    test -n "$tmp_root"; or set tmp_root /tmp
    set -l created_state 0
    if test -n "$state_dir"
        if not string match -q '/*' -- $state_dir
            set state_dir $PWD/$state_dir
        end
        set state_dir (path normalize -- $state_dir)
        if test -z "$state_dir"; or test -e "$state_dir"
            printf 'pi-sandbox: --state-dir must name a path that does not exist\n' >&2
            return 2
        end
        command mkdir -m 700 -p -- $state_dir; or return 1
    else
        set state_dir (command mktemp -d "$tmp_root/pi-sandbox.XXXXXX"); or return 1
    end
    set created_state 1
    command mkdir -m 700 -p -- $state_dir/agent $state_dir/home
    set -l nonce (random)(random)(random)
    printf '%s\n' $nonce >$state_dir/.pi-sandbox-state

    set -l function_file (status filename)
    set -l extension_dir (path resolve (path dirname $function_file)/../../../../.pi/agent/extensions/pi-sandbox)
    if not test -f $extension_dir/index.ts; or not test -d $extension_dir/node_modules/@anthropic-ai/sandbox-runtime
        printf 'pi-sandbox: sandbox extension is not installed; run npm install in %s\n' $extension_dir >&2
        command rm -rf -- $state_dir
        return 1
    end

    set -l pi_version (command mise --cd /tmp current pi 2>/dev/null)
    if test -z "$pi_version"
        printf 'pi-sandbox: no Mise-managed Pi version is active\n' >&2
        command rm -rf -- $state_dir
        return 127
    end

    set -l mise_args $deny_flags
    for item in $allow_read $extension_dir
        set -a mise_args --allow-read=$item
    end
    for item in $allow_write $state_dir
        set -a mise_args --allow-write=$item
    end
    for item in $allow_env
        set -a mise_args --allow-env=$item
    end
    for item in MISE_DATA_DIR MISE_OFFLINE PI_CODING_AGENT_DIR PI_SANDBOX_READ PI_SANDBOX_WRITE PI_SANDBOX_NET
        set -a mise_args --allow-env=$item
    end

    set -l env_args \
        MISE_DATA_DIR=$mise_data_dir \
        MISE_OFFLINE=1 \
        HOME=$state_dir/home \
        PI_CODING_AGENT_DIR=$state_dir/agent \
        PI_SANDBOX_READ=(string join \n -- $allow_read) \
        PI_SANDBOX_WRITE=(string join \n -- $allow_write) \
        PI_SANDBOX_NET=(string join \n -- $allow_net)
    set -l command_args mise exec $mise_args pi@$pi_version -- pi \
        --no-tools --no-session --no-context-files --no-extensions --no-skills \
        --no-prompt-templates --no-themes --no-approve --extension $extension_dir/index.ts \
        $pi_argv

    if test $dry_run -eq 1
        string join ' ' -- (string escape -- env $env_args $command_args)
        set keep_state 0
        set -l status_code 0
    else
        cd $cwd; or return 1
        env $env_args $command_args
        set status_code $status
    end

    if test $keep_state -eq 1
        printf 'pi-sandbox: state retained at %s\n' $state_dir >&2
    else if test $created_state -eq 1
        set -l marker (string trim -- (command cat $state_dir/.pi-sandbox-state 2>/dev/null))
        if test "$marker" = "$nonce"; and test "$state_dir" != /; and test "$state_dir" != "$HOME"; and test "$state_dir" != "$cwd"
            command rm -rf -- $state_dir
        else
            printf 'pi-sandbox: refusing unsafe state cleanup: %s\n' $state_dir >&2
            test $status_code -ne 0; or set status_code 1
        end
    end
    return $status_code
end
