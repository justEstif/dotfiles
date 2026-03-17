function _wt_assert_git_root --description "Abort if not at the git root"
    set git_root (git rev-parse --show-toplevel 2>/dev/null)
    if test $status -ne 0
        echo "error: not inside a git repository" >&2
        return 1
    end
    if test "$git_root" != "$PWD"
        echo "error: must be run from the git root" >&2
        echo "  current: $PWD" >&2
        echo "  git root: $git_root" >&2
        return 1
    end
end

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
    git fetch origin $branch:$branch && git worktree add .worktrees/$dirname $branch
end

function wt-batch --description "Add worktrees for multiple new branches off main and run a command in each"
    if test (count $argv) -lt 2 -o "$argv[1]" = --help
        echo "Usage: wt-batch <branch-prefix> <dir1> [dir2 ...] [-- <command>]"
        echo ""
        echo "Creates a worktree for each dir under .worktrees/<branch-prefix>-<dir>."
        echo "If a command is provided after --, runs it inside each worktree directory."
        echo ""
        echo "Examples:"
        echo "  wt-batch feature/refactor service-a service-b"
        echo "  # creates .worktrees/feature-refactor-service-a and .worktrees/feature-refactor-service-b"
        echo ""
        echo "  wt-batch feature/refactor service-a service-b -- npm install"
        echo "  # same, then runs 'npm install' in each worktree"
        return 0
    end

    _wt_assert_git_root || return 1
    set prefix $argv[1]
    set dirs
    set cmd
    set in_cmd 0

    for arg in $argv[2..]
        if test "$arg" = --
            set in_cmd 1
            continue
        end
        if test $in_cmd -eq 1
            set -a cmd $arg
        else
            set -a dirs $arg
        end
    end

    for dir in $dirs
        set branch "$prefix/$dir"
        set dirname (echo $branch | sed 's/\//-/g')
        echo "→ Creating worktree for $branch at .worktrees/$dirname"
        git worktree add -b $branch .worktrees/$dirname main
        if test (count $cmd) -gt 0
            echo "→ Running '$cmd' in .worktrees/$dirname"
            fish -c "cd .worktrees/$dirname && $cmd"
        end
    end
end
