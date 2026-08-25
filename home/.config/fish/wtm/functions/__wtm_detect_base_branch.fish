## Detect the repository's default/base branch from origin/HEAD, falling back
## to main, then master. Works against the current repo by default; pass a
## git dir path as $argv[1] to query a different repository (used by init,
## which operates on a freshly cloned .git before any worktree exists).
##
## Args: [git_dir]
## Prints: branch name. Returns 1 if none can be detected.
function __wtm_detect_base_branch
    set -l g git
    if test (count $argv) -ge 1; and test -n "$argv[1]"
        set g git --git-dir=$argv[1]
    end

    set -l ref ($g symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | string collect)
    set -l trimmed (string trim -- $ref)
    if test -n "$trimmed"
        string replace "refs/remotes/origin/" "" -- $trimmed
        return 0
    end

    if $g rev-parse --verify -q refs/remotes/origin/main >/dev/null 2>&1
        echo main
        return 0
    end

    if $g rev-parse --verify -q refs/remotes/origin/master >/dev/null 2>&1
        echo master
        return 0
    end

    return 1
end
