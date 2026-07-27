## wtm delete <name> [--force|-f]
##
## Removes a worktree by name (path basename or branch). Refuses to delete the
## bare repository itself. --force bypasses git's "modified or contains
## untracked files" refusal.
function __wtm_cmd_delete
    set -l name ""
    set -l force false

    for arg in $argv
        switch $arg
            case --force -f
                set force true
            case -h --help
                echo "usage: wtm delete <name> [--force]"
                return 0
            case '*'
                if test -z "$name"
                    set name $arg
                else
                    echo "wtm: unexpected argument '$arg'" >&2
                    return 1
                end
        end
    end

    if test -z "$name"
        echo "wtm: delete requires a worktree name" >&2
        echo "    wtm delete <name> [--force]" >&2
        return 1
    end

    __wtm_bare_check; or return 1

    set -l row (__wtm_find_worktree $name)
    if test -z "$row"
        echo "wtm: worktree '$name' not found" >&2
        return 1
    end

    set -l parts (string split "|" -- $row)
    # parts: name branch path commit is_bare
    set -l wt_path $parts[3]
    set -l is_bare $parts[5]

    if test "$is_bare" = true
        echo "wtm: cannot delete the bare repository" >&2
        return 1
    end

    if test "$force" = true
        if not git worktree remove --force "$wt_path"
            echo "wtm: failed to delete worktree '$name'" >&2
            return 1
        end
    else
        if not git worktree remove "$wt_path"
            echo "wtm: failed to delete worktree '$name' (worktree may have uncommitted/untracked files; use --force)" >&2
            return 1
        end
    end

    echo "✅ Deleted worktree '$name' at $wt_path"
end
