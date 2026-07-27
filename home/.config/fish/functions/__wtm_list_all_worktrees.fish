## Parse `git worktree list --porcelain` into one pipe-separated record per
## worktree:
##
##     <name>|<branch>|<path>|<commit>|<is_bare>
##
## <name>    basename of the worktree path
## <branch>  refname with refs/heads/ stripped; "(bare)" or "detached" if none
## <path>    absolute worktree path
## <commit>  HEAD sha, or "unknown"
## <is_bare> "true" or "false"
##
## Iterates git's output directly (command substitution splits on newlines and
## preserves blank lines, so blank lines mark block boundaries — no fragile
## string-split on "\n"). Must run from the bare repository root.
function __wtm_list_all_worktrees
    if not git rev-parse --is-bare-repository >/dev/null 2>&1
        return 1
    end

    set -l name ""
    set -l branch ""
    set -l path ""
    set -l commit ""
    set -l is_bare false

    for line in (git worktree list --porcelain 2>/dev/null)
        if test -z "$line"
            # Blank line ends the current block.
            if test -n "$path"
                __wtm_emit_worktree $name $branch $path $commit $is_bare
            end
            set name ""; set branch ""; set path ""; set commit ""; set is_bare false
            continue
        end

        set -l kv (string split -m 1 " " -- $line)
        switch $kv[1]
            case worktree
                set path $kv[2]
                set name (basename $kv[2])
            case HEAD
                set commit $kv[2]
            case branch
                set branch (string replace "refs/heads/" "" -- $kv[2])
            case bare
                set is_bare true
        end
    end

    # Porcelain output may end without a trailing blank line.
    if test -n "$path"
        __wtm_emit_worktree $name $branch $path $commit $is_bare
    end

    return 0
end
