function vault-agent --description 'role-bound pi agent for the Obsidian knowledge vault'
    # State (sessions, auth, models-store) lives outside the vault so Obsidian Sync
    # never sees it; policy in the vault's pi-agent/ is symlinked in from there.
    env PI_CODING_AGENT_DIR=~/.config/pi-agents/vault \
        pi --no-skills \
        --skill ~/Documents/obsidian-vault/pi-agent/skills/obsidian-cli \
        --skill ~/Documents/obsidian-vault/pi-agent/skills/obsidian-markdown \
        --skill ~/Documents/obsidian-vault/pi-agent/skills/icm-architect $argv
end
