function __pi_sandbox_resolve_paths --argument-names mode
    set -e argv[1]
    for item in $argv
        set -l resolved (path resolve -- $item 2>/dev/null)
        if test -z "$resolved"
            printf 'pi-sandbox: %s path does not exist: %s\n' $mode $item >&2
            return 2
        end
        if test $mode = write; and not test -d "$resolved"
            printf 'pi-sandbox: write path must be an existing directory: %s\n' $item >&2
            return 2
        end
        if test $mode = read; and not test -e "$resolved"
            printf 'pi-sandbox: read path does not exist: %s\n' $item >&2
            return 2
        end
        printf '%s\n' $resolved
    end
end
