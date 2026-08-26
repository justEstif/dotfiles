function __pi_sandbox_help
    printf '%s\n' \
        'Usage: pi-sandbox [OPTIONS] -- [PI_ARG...]' \
        '' \
        'Run Pi in a least-privilege Docker container. Arguments after -- are' \
        'passed to Pi unchanged. Pi tools and Bash commands are denied by default.' \
        '' \
        'Prerequisites:' \
        '  Docker CLI and a running daemon. Prefer rootless Docker on Linux;' \
        '  access to a conventional Docker daemon is effectively root-equivalent.' \
        '  On macOS, start the Colima daemon with: colima start' \
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
        '      --share-auth        Mount host Pi auth read/write for token refresh' \
        '      --dry-run           Print the escaped Docker command without running it' \
        '  -h, --help              Show this wrapper help' \
        '' \
        'The container defaults to a read-only root, read-only working directory,' \
        'no network, isolated tmpfs /tmp, no Linux capabilities, no-new-privileges,' \
        'temporary Pi state, no Pi tools, and no Bash commands.' \
        '' \
        'Provider access:' \
        '  Network isolation currently blocks model API calls; --allow-net remains' \
        '  unavailable until the allowlisting proxy is implemented. Pass credentials' \
        '  through normal Pi --api-key arguments after --, grant a provider variable' \
        '  with --allow-env, or explicitly mount host auth with --share-auth.' \
        '  Shared auth is read/write so refreshed OAuth tokens persist on the host;' \
        '  use it only when the sandbox and allowed code are trusted with credentials.' \
        '' \
        'Examples:' \
        '  pi-sandbox --help' \
        '  pi-sandbox -- --help' \
        '  pi-sandbox --share-auth --allow-read . -- --tools read,grep -p "Review this repo"' \
        '  pi-sandbox --allow-write . --allow-command "git status*" -- --tools bash'
end
