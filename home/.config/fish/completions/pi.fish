# Completion for the pi coding agent

function __pi_needs_subcommand
    set -l cmd (commandline -opc)
    if [ (count $cmd) -eq 1 ]
        return 0
    end
    return 1
end

function __pi_is_subcommand
    set -l cmd (commandline -opc)
    set -l sub $argv[1]
    if [ (count $cmd) -ge 2 ]; and [ $cmd[2] = $sub ]
        return 0
    end
    return 1
end

function __pi_extensions
    pi list 2>/dev/null | string match -r '^\s*\S+' | string trim
end

function __pi_providers
    printf '%s\n' anthropic openai google openai-codex openrouter azure \
        ai-gateway groq xai deepseek zai zai-coding-cn mistral minimax \
        moonshot opencode kimi cloudflare qwen-token-plan xiaomi bedrock
end

function __pi_thinking_levels
    printf '%s\n' off minimal low medium high xhigh max
end

function __pi_modes
    printf '%s\n' text json rpc
end

function __pi_tui_modes
    printf '%s\n' regular fullscreen
end

function __pi_builtin_tools
    printf '%s\n' read bash powershell edit write grep find ls
end

# Subcommands
complete -c pi -n '__pi_needs_subcommand' -xa 'install remove uninstall update list config auth' -d 'Subcommand'
complete -c pi -n '__pi_needs_subcommand' -l help -l version -d 'Info'

# install / remove / uninstall
complete -c pi -n '__pi_is_subcommand install; or __pi_is_subcommand remove; or __pi_is_subcommand uninstall' -xa '(__pi_extensions)'
complete -c pi -n '__pi_is_subcommand install; or __pi_is_subcommand remove; or __pi_is_subcommand uninstall' -s l -d 'Local (project) scope'

# update
complete -c pi -n '__pi_is_subcommand update' -xa 'self pi (__pi_extensions)'

# auth
complete -c pi -n '__pi_is_subcommand auth' -xa 'print-api-key print-bearer-token check'

# Global options
complete -c pi -f -s h -l help -d 'Show help'
complete -c pi -f -s v -l version -d 'Show version'
complete -c pi -x -l provider -xa '(__pi_providers)' -d 'Provider name'
complete -c pi -f -l model -d 'Model pattern or ID'
complete -c pi -x -l api-key -d 'API key'
complete -c pi -f -l system-prompt -d 'System prompt text'
complete -c pi -f -l append-system-prompt -d 'Append to system prompt'
complete -c pi -x -l mode -xa '(__pi_modes)' -d 'Output mode'
complete -c pi -f -s p -l print -d 'Non-interactive mode'
complete -c pi -f -s c -l continue -d 'Continue previous session'
complete -c pi -f -s r -l resume -d 'Select session to resume'
complete -c pi -r -l session -d 'Session file or partial UUID'
complete -c pi -x -l session-id -d 'Exact project session ID'
complete -c pi -r -l fork -d 'Fork session file or partial UUID'
complete -c pi -x -l session-dir -d 'Session storage directory'
complete -c pi -f -l no-session -d 'Do not save session'
complete -c pi -x -s n -l name -d 'Session display name'
complete -c pi -x -l models -d 'Model patterns for Ctrl+P cycling'
complete -c pi -f -s nt -l no-tools -d 'Disable all tools'
complete -c pi -f -s nbt -l no-builtin-tools -d 'Disable built-in tools'
complete -c pi -x -s t -l tools -xa '(__pi_builtin_tools)' -d 'Tool allowlist'
complete -c pi -x -s xt -l exclude-tools -xa '(__pi_builtin_tools)' -d 'Tool denylist'
complete -c pi -x -l thinking -xa '(__pi_thinking_levels)' -d 'Thinking level'
complete -c pi -r -s e -l extension -d 'Load extension file'
complete -c pi -f -s ne -l no-extensions -d 'Disable extension discovery'
complete -c pi -r -l skill -d 'Load skill file or directory'
complete -c pi -f -s ns -l no-skills -d 'Disable skills discovery'
complete -c pi -r -l prompt-template -d 'Load prompt template file or directory'
complete -c pi -f -s np -l no-prompt-templates -d 'Disable prompt templates'
complete -c pi -r -l theme -d 'Load theme file or directory'
complete -c pi -x -l use-theme -d 'Set initial interactive theme'
complete -c pi -f -l no-themes -d 'Disable theme discovery'
complete -c pi -f -s nc -l no-context-files -d 'Disable AGENTS.md/CLAUDE.md discovery'
complete -c pi -r -l export -d 'Export session file to HTML'
complete -c pi -x -l list-models -d 'List available models'
complete -c pi -f -l verbose -d 'Force verbose startup'
complete -c pi -x -l tui-mode -xa '(__pi_tui_modes)' -d 'TUI mode'
complete -c pi -f -s a -l approve -d 'Trust project-local files'
complete -c pi -f -s na -l no-approve -d 'Ignore project-local files'
complete -c pi -f -l offline -d 'Disable startup network operations'
complete -c pi -f -l mcp-config -r -d 'Path to MCP config file'
