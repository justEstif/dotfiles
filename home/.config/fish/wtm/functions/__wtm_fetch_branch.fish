## Fetch the latest tip of a remote branch into refs/remotes/origin/<branch>
## and verify the result. Returns 1 (with a message on stderr) if the remote
## branch is missing or the fetch is inconsistent.
##
## Args: <branch>
function __wtm_fetch_branch --argument-names branch
    if test -z "$branch"
        echo "wtm: __wtm_fetch_branch requires a branch name" >&2
        return 1
    end

    set -l commit_hash (__wtm_remote_sha $branch)
    if test -z "$commit_hash"
        echo "wtm: remote branch '$branch' not found on origin" >&2
        return 1
    end

    # Drop any stale/corrupted tracking ref, then force-fetch a fresh one.
    git update-ref -d "refs/remotes/origin/$branch" 2>/dev/null
    if not git fetch origin "+$branch:refs/remotes/origin/$branch" 2>/dev/null
        echo "wtm: failed to fetch '$branch' from origin" >&2
        return 1
    end

    # Verify the tracking ref now matches what the remote advertised.
    set -l local_hash (git rev-parse "origin/$branch" 2>/dev/null | string trim)
    if test "$local_hash" != "$commit_hash"
        echo "wtm: fetch of '$branch' inconsistent — remote at $commit_hash, local at $local_hash" >&2
        return 1
    end

    echo "✅ Fetched $branch at "(string sub -l 9 -- $commit_hash)
    return 0
end
