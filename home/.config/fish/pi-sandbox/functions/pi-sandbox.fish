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
    set -l allow_commands
    set -l ask_commands
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
                __pi_sandbox_help
                return 0
            case -C --cwd --allow-read --allow-write --allow-net --allow-env --allow-command --ask-command --state-dir
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
                    case --allow-command; set -a allow_commands $value
                    case --ask-command; set -a ask_commands $value
                    case --state-dir; set state_dir $value
                end
            case '--allow-read=*' '--allow-write=*' '--allow-net=*' '--allow-env=*' '--allow-command=*' '--ask-command=*' '--state-dir=*' '--cwd=*'
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
                    case --allow-command; set -a allow_commands $value
                    case --ask-command; set -a ask_commands $value
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

    set allow_read (__pi_sandbox_resolve_paths read $cwd $allow_read); or return $status
    set allow_write (__pi_sandbox_resolve_paths write $allow_write); or return $status

    for name in $allow_env
        if not string match -qr '^[A-Za-z_][A-Za-z0-9_]*(\*)?$' -- $name
            printf 'pi-sandbox: invalid environment name/glob: %s\n' $name >&2
            return 2
        end
    end
    for rule in $allow_commands $ask_commands
        if test -z "$rule"; or string match -qr '[\n\r]' -- $rule
            printf 'pi-sandbox: command rules must be non-empty single lines\n' >&2
            return 2
        end
    end
    for host in $allow_net
        if not string match -qr '^(\*\.)?[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$' -- $host
            printf 'pi-sandbox: invalid hostname: %s\n' $host >&2
            return 2
        end
    end

    set -l state (__pi_sandbox_create_state $state_dir); or return $status
    set state_dir $state[1]
    set -l nonce $state[2]

    set -l function_file (status filename)
    set -l extension_dir (path resolve (path dirname $function_file)/../../../../.pi/agent/extensions/pi-sandbox)
    if not test -f $extension_dir/index.ts
        printf 'pi-sandbox: permission-gate extension is missing: %s\n' $extension_dir >&2
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
    for item in MISE_DATA_DIR MISE_OFFLINE PI_CODING_AGENT_DIR PI_SANDBOX_ALLOW_COMMANDS PI_SANDBOX_ASK_COMMANDS
        set -a mise_args --allow-env=$item
    end

    set -l env_args \
        MISE_DATA_DIR=$mise_data_dir \
        MISE_OFFLINE=1 \
        HOME=$state_dir/home \
        PI_CODING_AGENT_DIR=$state_dir/agent \
        PI_SANDBOX_ALLOW_COMMANDS=(string join \n -- $allow_commands) \
        PI_SANDBOX_ASK_COMMANDS=(string join \n -- $ask_commands)
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
    else if not __pi_sandbox_cleanup_state $state_dir $nonce $cwd
        test $status_code -ne 0; or set status_code 1
    end
    return $status_code
end
