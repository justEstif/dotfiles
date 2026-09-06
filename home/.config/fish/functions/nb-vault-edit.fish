function nb-vault-edit --description 'Open the nb vault workspace in nvim'
    cd ~/.nb/nb-vault
    nvim . $argv
end
