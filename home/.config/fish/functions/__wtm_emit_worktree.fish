## Print a single worktree record as one pipe-separated line:
##
##     <name>|<branch>|<path>|<commit>|<is_bare>
##
## Used by __wtm_list_all_worktrees. Pipe was chosen as the field separator
## because fish never expands backslash escapes like \t/\n inside double
## quotes, so a real tab cannot be written as a literal — and pipe is illegal
## in git branch names and vanishingly rare in repo paths.
##
## Args: name branch path commit is_bare
function __wtm_emit_worktree --argument-names name branch path commit is_bare
    if test -z "$branch"
        if test "$is_bare" = true
            set branch "(bare)"
        else
            set branch "detached"
        end
    end
    if test -z "$commit"
        set commit unknown
    end
    printf '%s|%s|%s|%s|%s\n' $name $branch $path $commit $is_bare
end
