function vault-agent --description 'role-bound pi agent for the Obsidian knowledge vault'
    # State (sessions, auth, models-store) lives outside the vault so Obsidian Sync
    # never sees it; policy in the vault's pi-agent/ is symlinked in from there.
    set -l skill_args
    for skill in obsidian-cli obsidian-markdown icm-architect
        set -a skill_args --skill ~/Documents/obsidian-vault/pi-agent/skills/$skill
    end

    env PI_CODING_AGENT_DIR=~/.config/pi-agents/vault \
        pi --no-extensions --no-skills --no-approve $skill_args $argv
end
