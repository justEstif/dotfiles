## Does the worktree at <path> have any uncommitted state?
## Returns 0 (true) if there are unstaged changes, staged changes, or
## untracked files.
##
## Args: <path>
function __wtm_has_uncommitted --argument-names path
    if not git -C $path diff --quiet 2>/dev/null
        return 0
    end
    if not git -C $path diff --cached --quiet 2>/dev/null
        return 0
    end
    test (git -C $path ls-files --others --exclude-standard 2>/dev/null | count) -gt 0
    return $status
end
