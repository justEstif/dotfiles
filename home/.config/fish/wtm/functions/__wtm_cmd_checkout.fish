## wtm checkout <name>
##
## If a worktree named <name> already exists, cd into it. Otherwise, if a
## remote branch origin/<name> exists, fetch it and create a worktree (using
## the local branch if one already exists, otherwise branching from the
## remote tracking ref), wire up tracking, run the post_create hook, and cd
## in. Aborts if neither a worktree nor a remote branch exists.
function __wtm_cmd_checkout --argument-names name
    if test -z "$name"
        echo "wtm: checkout requires a branch name" >&2
        echo "    wtm checkout <name>" >&2
        return 1
    end

    __wtm_bare_check; or return 1

    set -l existing (__wtm_find_worktree $name)
    if test -n "$existing"
        set -l parts (string split "|" -- $existing)
        # parts: name branch path commit is_bare
        echo "✅ Worktree '$name' exists at $parts[3]"
        echo "📁 cd $parts[3]"
        cd "$parts[3]"
        return 0
    end

    # No local worktree — does the exact remote branch exist?
    if not __wtm_remote_sha $name >/dev/null
        echo "wtm: worktree '$name' not found and no remote branch 'origin/$name' exists" >&2
        echo "    to create a new one: wtm create $name --from <base_branch>" >&2
        return 1
    end

    echo "Found remote branch 'origin/$name'. Creating worktree ..."
    __wtm_fetch_branch $name; or return 1

    set -l bare_root (pwd)
    set -l worktree_path "$bare_root/$name"

    if git show-ref --verify -q "refs/heads/$name"
        if not git worktree add "$worktree_path" "$name"
            echo "wtm: failed to create worktree '$name'" >&2
            return 1
        end
    else
        if not git worktree add -b $name "$worktree_path" "origin/$name"
            echo "wtm: failed to create worktree '$name'" >&2
            return 1
        end
    end
    echo "✅ Created worktree '$name' at $worktree_path"

    git -C "$worktree_path" config "branch.$name.remote" origin 2>/dev/null
    git -C "$worktree_path" config "branch.$name.merge" "refs/heads/$name" 2>/dev/null

    __wtm_run_hook post_create "$worktree_path" "$name" "$name" "$bare_root"
    or return 1

    echo "📁 cd $worktree_path"
    cd "$worktree_path"
end
