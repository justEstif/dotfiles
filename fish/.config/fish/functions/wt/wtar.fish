function wtar --description "Add a worktree for a remote branch"
    if test (count $argv) -eq 0 -o "$argv[1]" = --help
        echo "Usage: wtar <branch>"
        echo ""
        echo "Fetches a remote branch and adds a worktree at .worktrees/<branch>."
        echo "Slashes in branch name are converted to hyphens for the directory name."
        echo ""
        echo "Example:"
        echo "  wtar feature/my-work"
        echo "  # fetches origin/feature/my-work and adds worktree at .worktrees/feature-my-work"
        return 0
    end

    _wt_assert_git_root || return 1
    set branch $argv[1]
    set dirname (echo $branch | sed 's/\//-/g')
    git fetch origin $branch:$branch \
        && git worktree add .worktrees/$dirname $branch \
        && git -C .worktrees/$dirname branch --set-upstream-to origin/$branch $branch
end
