function nb-vault-agent --description 'role-bound Pi agent for the nb knowledge vault'
    set -l vault ~/.nb/nb-vault
    if not test -d $vault
        echo "nb-vault-agent: run 'mise bootstrap' to install the vault" >&2
        return 1
    end

    set -l skill_args
    for skill_dir in $vault/pi-agent/skills/*/
        set -a skill_args --skill $skill_dir
    end

    set -l extension_args
    for ext in $vault/pi-agent/extensions/*.ts
        test -f $ext; and set -a extension_args --extension $ext
    end

    pushd $vault >/dev/null
    env PI_CODING_AGENT_DIR=~/.config/pi-agents/vault \
        pi --no-extensions --no-skills --no-approve $skill_args $extension_args $argv
    set -l status_code $status
    popd >/dev/null
    return $status_code
end
