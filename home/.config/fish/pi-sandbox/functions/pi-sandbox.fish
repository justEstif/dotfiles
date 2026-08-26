function pi-sandbox --description 'Run Pi in a least-privilege Docker container'
    set -l cwd $PWD
    set -l keep_state 0
    set -l share_auth 0
    set -l dry_run 0
    set -l state_dir
    set -l allow_read
    set -l allow_write
    set -l allow_net
    set -l allow_net_hosts
    set -l deny_net_hosts
    set -l allow_env
    set -l allow_commands
    set -l ask_commands
    set -l deny_commands
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
            case -C --cwd --allow-read --allow-write --allow-net --allow-net-host --deny-net-host --allow-env --allow-command --ask-command --deny-command --state-dir
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
                    case --allow-net-host; set -a allow_net_hosts $value
                    case --deny-net-host; set -a deny_net_hosts $value
                    case --allow-env; set -a allow_env $value
                    case --allow-command; set -a allow_commands $value
                    case --ask-command; set -a ask_commands $value
                    case --deny-command; set -a deny_commands $value
                    case --state-dir; set state_dir $value
                end
            case '--cwd=*' '--allow-read=*' '--allow-write=*' '--allow-net=*' '--allow-net-host=*' '--deny-net-host=*' '--allow-env=*' '--allow-command=*' '--ask-command=*' '--deny-command=*' '--state-dir=*'
                set -l pair (string split -m1 = -- $arg)
                set -l name $pair[1]
                set -l value $pair[2]
                if test -z "$value"
                    printf 'pi-sandbox: %s requires a value\n' $name >&2
                    return 2
                end
                switch $name
                    case --cwd; set cwd $value
                    case --allow-read; set -a allow_read $value
                    case --allow-write; set -a allow_write $value
                    case --allow-net; set -a allow_net $value
                    case --allow-net-host; set -a allow_net_hosts $value
                    case --deny-net-host; set -a deny_net_hosts $value
                    case --allow-env; set -a allow_env $value
                    case --allow-command; set -a allow_commands $value
                    case --ask-command; set -a ask_commands $value
                    case --deny-command; set -a deny_commands $value
                    case --state-dir; set state_dir $value
                end
            case --keep-state
                set keep_state 1
            case --share-auth
                set share_auth 1
            case --dry-run
                set dry_run 1
            case --deny-read --deny-write --deny-net --deny-env --deny-all
                # Docker starts denied; these flags are explicit, idempotent documentation.
            case '*'
                printf 'pi-sandbox: unknown option before --: %s\n' $arg >&2
                return 2
        end
    end

    if test $saw_separator -eq 0
        printf 'pi-sandbox: missing required -- separator\n' >&2
        return 2
    end
    if not command -q docker
        printf 'pi-sandbox: docker-cli is required (install with mise)\n' >&2
        return 127
    end

    set cwd (path resolve -- $cwd 2>/dev/null)
    if test -z "$cwd"; or not test -d "$cwd"
        printf 'pi-sandbox: working directory does not exist\n' >&2
        return 2
    end
    set -l network_mode none
    set -l host_proxy_mode 0
    set -l has_allow_net_all 0
    if test (count $allow_net) -gt 0
        set has_allow_net_all 1
    end
    set -l has_host_rules 0
    if test (count $allow_net_hosts) -gt 0; or test (count $deny_net_hosts) -gt 0
        set has_host_rules 1
    end
    if test $has_allow_net_all -eq 1; and test $has_host_rules -eq 1
        printf 'pi-sandbox: --allow-net all cannot be combined with --allow-net-host/--deny-net-host\n' >&2
        return 2
    end
    if test (count $deny_net_hosts) -gt 0; and test (count $allow_net_hosts) -eq 0
        printf 'pi-sandbox: --deny-net-host requires at least one --allow-net-host\n' >&2
        return 2
    end
    if test (count $allow_net) -gt 0
        if test (count $allow_net) -ne 1; or test "$allow_net[1]" != all
            printf 'pi-sandbox: --allow-net currently accepts only "all"\n' >&2
            return 2
        end
        set network_mode bridge
    else if test (count $allow_net_hosts) -gt 0
        set host_proxy_mode 1
    end
    set -l normalized_allow_net_hosts
    for rule in $allow_net_hosts
        set -a normalized_allow_net_hosts (__pi_sandbox_validate_net_host_rule --allow-net-host $rule); or return $status
    end
    set -l normalized_deny_net_hosts
    for rule in $deny_net_hosts
        set -a normalized_deny_net_hosts (__pi_sandbox_validate_net_host_rule --deny-net-host $rule); or return $status
    end
    set allow_net_hosts $normalized_allow_net_hosts
    set deny_net_hosts $normalized_deny_net_hosts

    set -l host_auth_file
    if test $share_auth -eq 1
        set -l host_agent_dir $PI_CODING_AGENT_DIR
        test -n "$host_agent_dir"; or set host_agent_dir $HOME/.pi/agent
        set host_auth_file (path resolve -- $host_agent_dir/auth.json 2>/dev/null)
        if test -z "$host_auth_file"; or not test -f $host_auth_file
            printf 'pi-sandbox: --share-auth requires host Pi auth at %s/auth.json\n' $host_agent_dir >&2
            return 2
        end
    end

    set allow_read (__pi_sandbox_resolve_paths read $cwd $allow_read); or return $status
    set allow_write (__pi_sandbox_resolve_paths write $allow_write); or return $status
    for name in $allow_env
        if not string match -qr '^[A-Za-z_][A-Za-z0-9_]*(\*)?$' -- $name
            printf 'pi-sandbox: invalid environment name/glob: %s\n' $name >&2
            return 2
        end
    end
    for rule in $allow_commands $ask_commands $deny_commands
        if test -z "$rule"; or string match -qr '[[:cntrl:]]' -- $rule
            printf 'pi-sandbox: command patterns must be non-empty and contain no control characters\n' >&2
            return 2
        end
    end

    set -l state (__pi_sandbox_create_state $state_dir); or return $status
    set state_dir $state[1]
    set -l nonce $state[2]

    set -l function_file (status filename)
    set -l plugin_dir (path resolve (path dirname $function_file)/..)
    set -l dockerfile $plugin_dir/Dockerfile
    set -l net_proxy_script $plugin_dir/proxy/hostname-connect-proxy.js
    set -l image pi-sandbox:0.84.3-permissions-27.0.1
    if not test -f $dockerfile
        printf 'pi-sandbox: Dockerfile is missing\n' >&2
        __pi_sandbox_cleanup_state $state_dir $nonce $cwd >/dev/null
        return 1
    end
    if test $host_proxy_mode -eq 1; and not test -f $net_proxy_script
        printf 'pi-sandbox: hostname proxy script is missing\n' >&2
        __pi_sandbox_cleanup_state $state_dir $nonce $cwd >/dev/null
        return 1
    end
    set -l policy_rules
    for pattern in $allow_commands
        set -a policy_rules allow:$pattern
    end
    for pattern in $ask_commands
        set -a policy_rules ask:$pattern
    end
    for pattern in $deny_commands
        set -a policy_rules deny:$pattern
    end
    if not __pi_sandbox_write_policy $state_dir $policy_rules
        __pi_sandbox_cleanup_state $state_dir $nonce $cwd >/dev/null
        return 1
    end
    set -l host_proxy_network
    set -l host_proxy_container
    if test $host_proxy_mode -eq 1
        set network_mode none
    end

    set -l run_network $network_mode
    set -l docker_args run --rm --interactive --init \
        --read-only \
        --cap-drop ALL \
        --security-opt no-new-privileges \
        --pids-limit 512 \
        --user (id -u):(id -g) \
        --tmpfs /tmp:rw,noexec,nosuid,nodev,size=512m \
        --workdir $cwd \
        --mount type=bind,src=$state_dir/home,dst=/home/pi \
        --env HOME=/home/pi \
        --env PI_CODING_AGENT_DIR=/home/pi/.pi/agent

    if test $share_auth -eq 1
        if not command touch $state_dir/home/.pi/agent/auth.json
            __pi_sandbox_cleanup_state $state_dir $nonce $cwd >/dev/null
            return 1
        end
        set -a docker_args --mount type=bind,src=$host_auth_file,dst=/home/pi/.pi/agent/auth.json
    end
    if isatty stdin; and isatty stdout
        set -a docker_args --tty
    end
    for item in $allow_read
        if not contains -- $item $allow_write
            set -a docker_args --mount type=bind,src=$item,dst=$item,readonly
        end
    end
    for item in $allow_write
        set -a docker_args --mount type=bind,src=$item,dst=$item
    end
    for pattern in $allow_env
        for name in (set -n -x)
            if string match -q $pattern -- $name
                set -a docker_args --env $name
            end
        end
    end
    if test $host_proxy_mode -eq 1
        set -a docker_args --env HTTPS_PROXY=http://pi-sandbox-proxy:8443 \
            --env HTTP_PROXY=http://pi-sandbox-proxy:8443 \
            --env ALL_PROXY=http://pi-sandbox-proxy:8443 \
            --env NO_PROXY=localhost,127.0.0.1
    end

    set -l pi_args \
        --no-tools --no-session --no-context-files --no-extensions --no-skills \
        --no-prompt-templates --no-themes --no-approve \
        --extension /usr/local/lib/node_modules/@gotgenes/pi-permission-system/src/index.ts \
        $pi_argv

    if test $dry_run -eq 1
        string join ' ' -- (string escape -- docker $docker_args --network $run_network $image $pi_args)
        set keep_state 0
        set -l status_code 0
    else
        __pi_sandbox_ensure_image $image $dockerfile
        if test $status -ne 0
            set status_code 1
        else
            if test $host_proxy_mode -eq 1
                set -l net_rules
                for host in $allow_net_hosts
                    set -a net_rules allow:$host
                end
                for host in $deny_net_hosts
                    set -a net_rules deny:$host
                end
                set -l net_policy_file (__pi_sandbox_write_net_policy $state_dir $net_rules)
                if test $status -ne 0
                    set status_code 1
                else
                    set -l host_proxy_state (__pi_sandbox_setup_net_proxy $image $net_proxy_script $net_policy_file)
                    if test $status -ne 0
                        set status_code 1
                    else
                        set host_proxy_network $host_proxy_state[1]
                        set host_proxy_container $host_proxy_state[2]
                        set run_network $host_proxy_network
                    end
                end
            end
            if test -z "$status_code"
                command docker $docker_args --network $run_network $image $pi_args
                set status_code $status
            end
        end
    end
    if test $host_proxy_mode -eq 1
        __pi_sandbox_cleanup_net_proxy $host_proxy_network $host_proxy_container >/dev/null
        if test $status -ne 0
            test -n "$status_code"; and test $status_code -ne 0; or set status_code 1
        end
    end

    if test $keep_state -eq 1
        printf 'pi-sandbox: state retained at %s\n' $state_dir >&2
    else if not __pi_sandbox_cleanup_state $state_dir $nonce $cwd
        test $status_code -ne 0; or set status_code 1
    end
    return $status_code
end
