# script for installing all my common apps
function install_apps
    install_git & install_ripgrep & install_fzf
    install_asdf & install_fisher
    install_lazygit & install_xplr
    install_nvim
    install_wezterm
end

function install_git
    sudo apt install -y git-all
end

function install_nvim
    curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
    chmod u+x nvim.appimage
    sudo mv ./nvim.appimage /usr/local/bin/nvim
end

function install_asdf
    sudo apt install -y curl
    set ASDF_VERSION (curl -s https://api.github.com/repos/asdf-vm/asdf/releases/latest | grep -Po '"tag_name": "v\K[^"]*')
    git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v$ASDF_VERSION
    source ~/.asdf/asdf.fish
end

function install_fisher
    curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
end

function install_lazygit
    set LAZYGIT_VERSION (curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*')
    curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_{$LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
    tar xf lazygit.tar.gz lazygit
    sudo install lazygit /usr/local/bin
    rm lazygit.tar.gz lazygit
end

function install_ripgrep
    sudo apt install -y ripgrep
end

function install_fzf
    sudo apt install -y fzf
end

function install_xplr
    curl -Lo https://github.com/sayanarijit/xplr/releases/latest/download/xplr-linux.tar.gz
    tar xzvf xplr-linux.tar.gz
    sudo mv xplr /usr/local/bin/
    rm xplr-linux.tar.gz
end

function install_wezterm
    sudo apt install -y wezterm
end
