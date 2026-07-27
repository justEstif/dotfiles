## wtm — worktree manager for bare git repositories.
##
## A fish plugin for the "bare repo + sibling worktree directories" workflow:
##
##     myrepo/
##     ├── .git/      <- bare git internals
##     └── main/      <- worktrees live directly under the bare root
##         feature-x/
##
## Run every command from the bare repository root (the dir containing .git/).

function wtm --description "Manage git worktrees in a bare repository"
    if test (count $argv) -eq 0
        __wtm_help
        return 1
    end

    set -l cmd $argv[1]
    set -l rest
    if test (count $argv) -gt 1
        set rest $argv[2..]
    end

    switch $cmd
        case init
            __wtm_cmd_init $rest
        case create
            __wtm_cmd_create $rest
        case checkout
            __wtm_cmd_checkout $rest
        case list ls
            __wtm_cmd_list $rest
        case delete rm
            __wtm_cmd_delete $rest
        case cleanup
            __wtm_cmd_cleanup $rest
        case help -h --help
            __wtm_help
        case '*'
            echo "wtm: unknown command '$cmd'" >&2
            echo >&2
            __wtm_help >&2
            return 1
    end
end
