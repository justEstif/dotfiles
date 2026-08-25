## Completions for wtm.

complete -c wtm -f -n __fish_use_subcommand -a init -d "Clone repo into a wtm bare structure"
complete -c wtm -f -n __fish_use_subcommand -a create -d "Create a worktree and cd into it"
complete -c wtm -f -n __fish_use_subcommand -a checkout -d "Create/enter a worktree from a remote branch"
complete -c wtm -f -n __fish_use_subcommand -a list -d "List worktrees"
complete -c wtm -f -n __fish_use_subcommand -a status -d "Show Git, PR, review, and CI status"
complete -c wtm -f -n __fish_use_subcommand -a delete -d "Delete a worktree"
complete -c wtm -f -n __fish_use_subcommand -a cleanup -d "Find and delete merged worktrees"
complete -c wtm -f -n __fish_use_subcommand -a help -d "Show help"

# create <name> --from <base> [--no-shell]
complete -c wtm -n "__fish_seen_subcommand_from create" -l from -d "Base branch" -r -a "(__wtm_complete_branches)"
complete -c wtm -n "__fish_seen_subcommand_from create" -l no-shell -d "Do not cd into the worktree"

# status [worktree] [--base <branch>] [--local]
complete -c wtm -f -n "__fish_seen_subcommand_from status st" -a "(__wtm_complete_worktree_names)"
complete -c wtm -n "__fish_seen_subcommand_from status st" -l base -d "Base branch" -r -a "(__wtm_complete_branches)"
complete -c wtm -n "__fish_seen_subcommand_from status st" -l local -d "Skip fetch and GitHub checks"

# delete <name> [--force]
complete -c wtm -f -n "__fish_seen_subcommand_from delete" -a "(__wtm_complete_worktree_names)"
complete -c wtm -n "__fish_seen_subcommand_from delete" -l force -d "Force delete"

# checkout <name>
complete -c wtm -f -n "__fish_seen_subcommand_from checkout" -a "(__wtm_complete_branches)"

# cleanup [--base <branch>] [--dry-run] [--yes]
complete -c wtm -n "__fish_seen_subcommand_from cleanup" -l base -d "Base branch for merge detection" -r -a "(__wtm_complete_branches)"
complete -c wtm -n "__fish_seen_subcommand_from cleanup" -l dry-run -d "Preview without deleting"
complete -c wtm -n "__fish_seen_subcommand_from cleanup" -l yes -d "Delete all candidates without prompting"
