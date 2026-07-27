## Does the worktree at <path> have local commits not reachable from
## origin/<base_branch>? Returns 0 (true) if so. (If the check itself fails we
## conservatively return true so a worktree is never deleted on a guess.)
##
## Args: <path> <base_branch>
function __wtm_has_unpushed --argument-names path base_branch
    set -l n (git -C $path log "origin/$base_branch..HEAD" --oneline 2>/dev/null | count)
    if test $n -gt 0
        return 0
    end
    # If the log command itself errored (n unset / origin ref missing), be safe.
    if test -z "$n"
        return 0
    end
    return 1
end
