#!/usr/bin/env fish

# Define required packages for both platforms
set -l common_packages nvim fzf fish lazygit ripgrep mise zellij

function detect_os
    switch (uname)
        case Darwin
            echo macos
        case Linux
            echo linux
        case '*'
            echo unknown
    end
end

function install_package_manager
    set -l os (detect_os)
    switch $os
        case macos
            if not command -v brew >/dev/null
                echo "Installing Homebrew..."
                /bin/bash -c "(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            end
        case linux
            if test -f /etc/debian_version
                sudo apt update
            else if test -f /etc/fedora-release
                sudo dnf check-update
            end
    end
end

function install_packages
    set -l os (detect_os)
    for package in $common_packages
        switch $os
            case macos
                echo "Installing $package on macOS..."
                brew install $package
            case linux
                echo "Installing $package on Linux..."
                if test -f /etc/debian_version
                    sudo apt install -y $package
                else if test -f /etc/fedora-release
                    sudo dnf install -y $package
                end
        end
    end
end

function setup_fonts
    set -l os (detect_os)
    switch $os
        case macos
            brew tap homebrew/cask-fonts
            brew install --cask font-iosevka
        case linux
            # Install Iosevka font on Linux
            set font_dir $HOME/.local/share/fonts
            mkdir -p $font_dir
            curl -L https://github.com/be5invis/Iosevka/releases/download/v16.3.0/ttf-iosevka-16.3.0.zip -o /tmp/iosevka.zip
            unzip -o /tmp/iosevka.zip -d $font_dir
            fc-cache -f -v
    end
end

function stow_dotfiles
    # Ensure stow is installed
    switch (detect_os)
        case macos
            brew install stow
        case linux
            if test -f /etc/debian_version
                sudo apt install -y stow
            else if test -f /etc/fedora-release
                sudo dnf install -y stow
            end
    end

    # Stow all directories
    for dir in (ls -d */)
        echo "Stowing $dir"
        stow $dir
    end
end

function main
    set -l os (detect_os)
    echo "Setting up development environment on $os..."

    install_package_manager
    install_packages
    setup_fonts
    stow_dotfiles

    echo "Setup complete! Please restart your shell."
end

# Run the main function
main
