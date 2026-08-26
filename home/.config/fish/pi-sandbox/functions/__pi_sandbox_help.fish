function __pi_sandbox_help
    printf '%s\n' \
        'Usage: pi-sandbox [OPTIONS] -- [PI_ARG...]' \
        '' \
        'Run Pi in a least-privilege Docker container. Arguments after -- are' \
        'passed to Pi unchanged. Pi tools and Bash commands are denied by default.' \
        '' \
        'Options:' \
        '  -C, --cwd PATH          Working directory (default: current directory)' \
        '      --allow-read PATH   Bind-mount a readable path; repeatable' \
        '      --allow-write PATH  Bind-mount a writable directory; repeatable' \
        '      --allow-net HOST    Reserved for the allowlisting proxy; fails closed' \
        '      --allow-env NAME    Forward an environment variable/glob; repeatable' \
        '      --allow-command PAT Allow Bash commands matching PAT; repeatable' \
        '      --ask-command PAT   Ask before Bash commands matching PAT; repeatable' \
        '      --deny-command PAT  Deny Bash commands matching PAT; repeatable' \
        '      --state-dir PATH    Create isolated Pi state at PATH (must not exist)' \
        '      --keep-state        Retain isolated state and print its location' \
        '      --dry-run           Print the escaped Docker command without running it' \
        '  -h, --help              Show this wrapper help' \
        '' \
        'The container defaults to a read-only root, read-only working directory,' \
        'no network, isolated tmpfs /tmp, no Linux capabilities, no-new-privileges,' \
        'temporary Pi state, no Pi tools, and no Bash commands.' \
        '' \
        'Examples:' \
        '  pi-sandbox --help' \
        '  pi-sandbox -- --help' \
        '  pi-sandbox --allow-read . -- --tools read,grep -p "Review this repo"' \
        '  pi-sandbox --allow-write . --allow-command "git status*" -- --tools bash'
end
