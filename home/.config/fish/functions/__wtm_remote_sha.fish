## Print the sha of the exact remote branch origin/<branch> if it exists, else
## print nothing and return 1.
##
## Scopes ls-remote to the fully-qualified ref and then CONFIRMS the returned
## ref equals refs/heads/<branch>. This defends against git ls-remote's
## tail-matching: a short pattern like `auth` would also match `feat/auth`.
## (The upstream wtm applies this guard in fetch/checkout but NOT in cleanup —
## a real bug we fix here by routing all remote-existence checks through this
## helper.)
##
## Args: <branch>
function __wtm_remote_sha --argument-names branch
    if test -z "$branch"
        return 1
    end

    set -l exact_ref "refs/heads/$branch"

    # Command substitution splits git's output into real lines for us.
    for line in (git ls-remote --heads origin "$exact_ref" 2>/dev/null)
        set -l m (string match -r '^([0-9a-f]+)\s+(refs/heads/\S+)$' -- $line)
        if test (count $m) -ge 3; and test "$m[3]" = "$exact_ref"
            echo $m[2]
            return 0
        end
    end

    return 1
end
