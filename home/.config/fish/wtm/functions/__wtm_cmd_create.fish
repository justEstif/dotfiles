## wtm create <name> --from <base> [--no-shell]
##
## Fetches the latest <base> from origin, creates a new branch <name> at that
## tip, adds a worktree at <bare-root>/<name>, wires up remote tracking, runs
## the .wtm/post_create hook, and — unlike the upstream binary — cds the
## current shell into the worktree. Pass --no-shell to skip the cd.
function __wtm_cmd_create
    set -l name ""
    set -l base ""
    set -l no_shell false

    set -l i 1
    while test $i -le (count $argv)
        switch $argv[$i]
            case --from
                set i (math $i + 1)
                if test $i -gt (count $argv)
                    echo "wtm: --from requires a branch name" >&2
                    return 1
                end
                set base $argv[$i]
            case --no-shell
                set no_shell true
            case -h --help
                echo "usage: wtm create <name> --from <base_branch> [--no-shell]"
                return 0
            case '*'
                if test -z "$name"
                    set name $argv[$i]
                else
                    echo "wtm: unexpected argument '$argv[$i]'" >&2
                    return 1
                end
        end
        set i (math $i + 1)
    end

    if test -z "$name"
        echo "wtm: create requires a worktree name" >&2
        echo "    wtm create <name> --from <base_branch> [--no-shell]" >&2
        return 1
    end
    if test -z "$base"
        echo "wtm: create requires --from <base_branch>" >&2
        return 1
    end

    __wtm_bare_check; or return 1
    __wtm_fetch_branch $base; or return 1

    set -l bare_root (pwd)
    set -l worktree_path "$bare_root/$name"

    if not git worktree add -b $name "$worktree_path" "origin/$base"
        echo "wtm: failed to create worktree '$name'" >&2
        return 1
    end
    echo "✅ Created worktree '$name' from latest '$base' at $worktree_path"

    # Wire up remote tracking for the new local branch. (The upstream tool
    # also attempted `git fetch origin <name>:refs/...` here, but <name> was
    # just created locally and does not exist on the remote yet, so that
    # fetch always no-ops or fails — dropped.)
    git -C "$worktree_path" config "branch.$name.remote" origin 2>/dev/null
    git -C "$worktree_path" config "branch.$name.merge" "refs/heads/$name" 2>/dev/null

    __wtm_run_hook post_create "$worktree_path" "$name" "$base" "$bare_root"
    or return 1

    if test "$no_shell" = true
        return 0
    end

    echo "📁 cd $worktree_path"
    cd "$worktree_path"
end
