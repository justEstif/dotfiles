## Is a worktree's branch merged into <base_branch>?
##
## Returns 0 (true) when EITHER:
##   - the exact remote branch origin/<branch> no longer exists (it was almost
##     certainly deleted after a merge), OR
##   - the worktree's commit is an ancestor of origin/<base_branch>.
##
## Uses __wtm_remote_sha for the remote-existence check so that a branch named
## `auth` is not fooled into thinking the remote still exists just because
## `feat/auth` does — that tail-match bug exists in upstream wtm's cleanup.
##
## Args: <branch> <commit> <base_branch>
function __wtm_is_merged --argument-names branch commit base_branch
    if not __wtm_remote_sha $branch >/dev/null 2>&1
        return 0
    end
    if git merge-base --is-ancestor $commit "origin/$base_branch" 2>/dev/null
        return 0
    end
    return 1
end
