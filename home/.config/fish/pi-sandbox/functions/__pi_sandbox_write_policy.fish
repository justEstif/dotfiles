function __pi_sandbox_write_policy --argument-names state_dir
    set -e argv[1]
    set -l config_dir $state_dir/home/.pi/agent/extensions/pi-permission-system
    set -l config_file $config_dir/config.json

    command mkdir -m 700 -p -- $config_dir; or return 1

    begin
        printf '{\n  "permission": {\n    "*": "allow",\n    "bash": {\n      "*": "deny"'
        for rule in $argv
            set -l pair (string split -m1 : -- $rule)
            set -l decision $pair[1]
            set -l pattern $pair[2]
            set -l escaped (string replace -a -- '\\' '\\\\' $pattern)
            set escaped (string replace -a -- '"' '\\"' $escaped)
            printf ',\n      "%s": "%s"' $escaped $decision
        end
        printf '\n    },\n    "external_directory": "deny"\n  }\n}\n'
    end >$config_file; or return 1

    command chmod 600 $config_file
end
