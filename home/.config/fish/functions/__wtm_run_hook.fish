## Run a lifecycle hook committed at <worktree>/.wtm/<hook-name>, if present.
## Hooks run via bash (so committed hooks are portable) with the worktree as
## cwd and a set of WTM_* env vars. Missing hooks are a silent no-op.
##
## Args: <hook_name> <worktree_path> <worktree_name> <base_branch> <bare_repo_path>
## Returns: the hook's exit status, or 0 if no hook was present.
function __wtm_run_hook --argument-names hook_name worktree_path worktree_name base_branch bare_repo_path
    set -l hook_path "$worktree_path/.wtm/$hook_name"
    if not test -f "$hook_path"
        return 0
    end

    echo "🪝 Running $hook_name hook..."

    env WORKTREE_DIR=$worktree_path \
        WORKTREE_NAME=$worktree_name \
        BASE_BRANCH=$base_branch \
        BARE_REPO_PATH=$bare_repo_path \
        bash "$hook_path"
    set -l code $status

    if test $code -ne 0
        echo "❌ $hook_name hook failed (exit $code)" >&2
        return $code
    end

    echo "✅ $hook_name hook completed"
    return 0
end
