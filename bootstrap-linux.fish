nvim
fzf
fish
lazygit
rigprep
mise
ghostty
stow
aporetic-sans-mono
zellij

function stow_dotfiles
    for dir in (ls -d */)
        echo "stow $dir"
        stow $dir
    end

    fc-cache -f -v
end
