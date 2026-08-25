function __pi_sandbox_help
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
        '      --allow-command CMD Allow one exact, simple Bash command; repeatable' \
        '      --ask-command CMD  Ask once before one exact Bash command; repeatable' \
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
        'environment; temporary Pi state; no Pi tools; no Bash commands.' \
        '' \
        'Examples:' \
        '  pi-sandbox --help               # wrapper help' \
        '  pi-sandbox -- --help            # Pi help' \
        '  pi-sandbox --allow-read . -- --tools read,grep -p "Review this repo"' \
        '  pi-sandbox --allow-command "git status" -- --tools bash' \
        '' \
        'Mise constrains Pi and descendants. The explicit Pi extension denies Bash' \
        'commands unless an exact simple command is allowed or approved. Network' \
        'grants currently fail closed because Mise host allowlists are unavailable' \
        'on Linux and unreliable with the current macOS Seatbelt generator.'
end
