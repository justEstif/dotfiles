## Find a single worktree by name (matching either the path basename or the
## branch) and print its record row. Prints nothing and returns 1 if not found.
##
## Args: <name>
function __wtm_find_worktree --argument-names name
    for row in (__wtm_list_all_worktrees)
        set -l parts (string split "|" -- $row)
        # parts: name branch path commit is_bare
        if test "$parts[1]" = "$name"; or test "$parts[2]" = "$name"
            echo $row
            return 0
        end
    end
    return 1
end
