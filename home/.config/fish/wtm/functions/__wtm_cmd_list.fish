## wtm list — print all worktrees in a compact table.
##
##     Worktrees:
##     ────────────────────────────────────────────────────────────────────────────
##     main                           [main]              ab5eeda4f
##     feature-auth                   [feature-auth]      c0ffee123
##     demo                           (bare)              unknown
function __wtm_cmd_list
    __wtm_bare_check; or return 1

    set -l rows (__wtm_list_all_worktrees)
    if test (count $rows) -eq 0
        echo "No worktrees found"
        return 0
    end

    echo
    echo Worktrees:
    echo (string repeat -n 80 ─)

    for row in $rows
        set -l parts (string split "|" -- $row)
        # parts: name branch path commit is_bare
        set -l name $parts[1]
        set -l branch $parts[2]
        set -l commit $parts[4]
        set -l is_bare $parts[5]

        set -l status_str
        if test "$is_bare" = true
            set status_str "(bare)"
        else
            set status_str "[$branch]"
        end

        set -l short_commit
        if test -n "$commit"; and test "$commit" != unknown
            set short_commit (string sub -l 9 -- $commit)
        else
            set short_commit unknown
        end

        printf '%-30s %-20s %s\n' $name $status_str $short_commit
    end
end
