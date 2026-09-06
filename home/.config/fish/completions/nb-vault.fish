# Vault-specific nb completions: plugins from _plugins/.
# Installed alongside the official nb.fish; both apply to the `nb` command.

complete -c nb -n "__fish_use_subcommand" -a "work-log" -d "Create/open the vault work log (today|yesterday|YYYY-MM-DD)"
complete -c nb -n "__fish_use_subcommand" -a "vault-bookmark" -d "Capture a bookmark into the vault inbox"
complete -c nb -n "__fish_use_subcommand" -a "vault-move" -d "Move a note and rewrite inbound relative links"
complete -c nb -n "__fish_seen_subcommand_from work-log" -a "today yesterday" -d "work-log target"
