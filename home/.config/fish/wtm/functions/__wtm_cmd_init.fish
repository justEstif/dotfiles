## wtm init <url> [path] — clone a repository into a wtm-managed bare
## structure:
##
##     <target>/
##     ├── .git/        <- bare git internals
##     └── <default>/   <- initial worktree
##
## Accepts SSH, HTTPS, and ssh:// URLs as well as local paths. The adopt
## variant of the upstream tool is intentionally NOT implemented (clone only).
function __wtm_cmd_init
    set -l url ""
    set -l path ""
    switch (count $argv)
        case 0
            echo "wtm: init requires a repository URL" >&2
            echo "    wtm init <url> [path]" >&2
            echo "    (in-place adopt is not supported; clone fresh instead)" >&2
            return 1
        case 1
            set url $argv[1]
        case '*'
            set url $argv[1]
            set path $argv[2]
    end

    # Derive target directory from the URL when none is given. Strip a trailing
    # slash and a .git suffix, then take the final path segment after : or /.
    set -l target_dir $path
    if test -z "$target_dir"
        set -l cleaned (string trim --right --chars=/ -- $url)
        set cleaned (string replace --regex '\.git$' "" -- $cleaned)
        set -l match (string match -r '[/:]([[:alnum:]._\-]+)$' -- $cleaned)
        if test (count $match) -lt 2
            echo "wtm: could not derive a directory name from '$url'" >&2
            return 1
        end
        set target_dir $match[2]
    end

    if test -e $target_dir
        echo "wtm: directory already exists: $target_dir" >&2
        return 1
    end

    echo "Initializing wtm repository: $target_dir"
    mkdir -p $target_dir
    or return 1

    set -l gitdir "$target_dir/.git"
    echo "Cloning $url ..."
    if not git clone --bare $url $gitdir
        # Best-effort cleanup of the half-created directory.
        rm -rf $target_dir
        return 1
    end

    # Ensure the standard fetch refspec is in place, then fetch all branches.
    git --git-dir=$gitdir config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    echo "Fetching all branches ..."
    if not git --git-dir=$gitdir fetch origin
        return 1
    end

    set -l default_branch (__wtm_detect_base_branch $gitdir)
    or begin
        echo "wtm: could not detect a default branch (no origin/HEAD, main, or master)" >&2
        return 1
    end
    echo "Detected default branch: $default_branch"

    # Check out the default branch ON A BRANCH, not a detached HEAD. The
    # upstream tool used `worktree add <path> origin/<branch>`, which checks
    # out the commit detached — so commits made in the default worktree are
    # orphaned and `git push` pushes the stale ref. Prefer the local branch
    # the bare clone created; fall back to creating one from the remote ref.
    if git --git-dir=$gitdir show-ref --verify -q "refs/heads/$default_branch"
        if not git --git-dir=$gitdir worktree add "$target_dir/$default_branch" "$default_branch"
            echo "wtm: failed to create initial worktree for $default_branch" >&2
            return 1
        end
    else
        if not git --gitdir=$gitdir worktree add -b "$default_branch" "$target_dir/$default_branch" "origin/$default_branch"
            echo "wtm: failed to create initial worktree for $default_branch" >&2
            return 1
        end
    end

    # Wire up upstream tracking so `git status` reports ahead/behind.
    git -C "$target_dir/$default_branch" config "branch.$default_branch.remote" origin 2>/dev/null
    git -C "$target_dir/$default_branch" config "branch.$default_branch.merge" "refs/heads/$default_branch" 2>/dev/null

    echo
    echo "Repository initialized: $target_dir"
    echo "Next steps:"
    echo "    cd $target_dir/$default_branch"
    echo "    wtm create <name> --from $default_branch"
    echo "    wtm list"
    echo
    echo "Tip: commit a script to .wtm/post_create on $default_branch to auto-set-up new worktrees."
end
