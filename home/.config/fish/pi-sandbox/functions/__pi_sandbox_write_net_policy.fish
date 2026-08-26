function __pi_sandbox_write_net_policy --argument-names state_dir
    set -e argv[1]
    set -l config_dir $state_dir/home/.pi/agent/network-proxy
    set -l config_file $config_dir/policy.json

    command mkdir -m 700 -p -- $config_dir; or return 1

    begin
        printf '{\n  "allow": ['
        set -l first 1
        for rule in $argv
            set -l pair (string split -m1 : -- $rule)
            if test "$pair[1]" != allow
                continue
            end
            set -l escaped (string replace -a -- '\\' '\\\\' $pair[2])
            set escaped (string replace -a -- '"' '\\"' $escaped)
            if test $first -eq 0
                printf ', '
            end
            printf '"%s"' $escaped
            set first 0
        end
        printf '],\n  "deny": ['
        set first 1
        for rule in $argv
            set -l pair (string split -m1 : -- $rule)
            if test "$pair[1]" != deny
                continue
            end
            set -l escaped (string replace -a -- '\\' '\\\\' $pair[2])
            set escaped (string replace -a -- '"' '\\"' $escaped)
            if test $first -eq 0
                printf ', '
            end
            printf '"%s"' $escaped
            set first 0
        end
        printf ']\n}\n'
    end >$config_file; or return 1

    command chmod 600 $config_file
    printf '%s\n' $config_file
end
