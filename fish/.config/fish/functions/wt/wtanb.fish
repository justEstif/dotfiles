function wtanb --description "Add a worktree with a new branch based on main"
    if test (count $argv) -eq 0 -o "$argv[1]" = --help
        echo "Usage: wtanb <branch>"
        echo ""
        echo "Creates a new branch off main and adds a worktree at .worktrees/<branch>."
        echo "Slashes in branch name are converted to hyphens for the directory name."
        echo ""
        echo "Example:"
        echo "  wtanb feature/my-work"
        echo "  # creates branch 'feature/my-work' and worktree at .worktrees/feature-my-work"
        return 0
    end

    _wt_assert_git_root || return 1
    set branch $argv[1]
    set dirname (echo $branch | sed 's/\//-/g')
    git worktree add -b $branch .worktrees/$dirname main
end
