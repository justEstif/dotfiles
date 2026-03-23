function _wt_assert_git_root --description "Abort if not at the git root"
    set is_bare (git rev-parse --is-bare-repository 2>/dev/null)
    if test $status -ne 0
        echo "error: not inside a git repository" >&2
        return 1
    end

    if test "$is_bare" = "true"
        set git_dir (git rev-parse --absolute-git-dir 2>/dev/null)
        if test $status -ne 0
            echo "error: unable to determine bare repository path" >&2
            return 1
        end
        if test "$git_dir" != "$PWD"
            echo "error: must be run from the bare repository root" >&2
            echo "  current: $PWD" >&2
            echo "  bare root: $git_dir" >&2
            return 1
        end
        return 0
    end

    set git_root (git rev-parse --show-toplevel 2>/dev/null)
    if test $status -ne 0
        echo "error: unable to determine git root" >&2
        return 1
    end
    if test "$git_root" != "$PWD"
        echo "error: must be run from the git root" >&2
        echo "  current: $PWD" >&2
        echo "  git root: $git_root" >&2
        return 1
    end
end
