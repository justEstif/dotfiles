## Completion helper: list non-bare worktree names for `wtm delete`.
function __wtm_complete_worktree_names
    for row in (__wtm_list_all_worktrees 2>/dev/null)
        set -l parts (string split "|" -- $row)
        # parts: name branch path commit is_bare
        if test "$parts[5]" != true
            echo $parts[1]
        end
    end
end
