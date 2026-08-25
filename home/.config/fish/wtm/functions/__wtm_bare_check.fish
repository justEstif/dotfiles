## Ensure we are at the root of a bare git repository. Returns 1 (with a
## message on stderr) otherwise. Mirrors wtm's guard but uses git's own
## `--is-bare-repository` predicate instead of reading core.bare directly.
function __wtm_bare_check
    set -l bare (git rev-parse --is-bare-repository 2>/dev/null)
    if test "$bare" != true
        echo "wtm: this command must be run from a bare git repository" >&2
        return 1
    end
    return 0
end
