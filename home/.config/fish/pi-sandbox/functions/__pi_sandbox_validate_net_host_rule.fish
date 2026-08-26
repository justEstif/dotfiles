function __pi_sandbox_validate_net_host_rule --argument-names flag rule
    set -l normalized (string lower -- (string trim -- $rule))
    if test -z "$normalized"
        printf 'pi-sandbox: %s requires a non-empty hostname rule\n' $flag >&2
        return 2
    end

    set -l label '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?'
    set -l exact "^$label(?:\\.$label)+\$"
    set -l wildcard "^\\*\\.$label(?:\\.$label)+\$"
    if not string match -qr -- $exact $normalized; and not string match -qr -- $wildcard $normalized
        printf 'pi-sandbox: invalid hostname rule for %s: %s\n' $flag $rule >&2
        return 2
    end

    printf '%s\n' $normalized
end
