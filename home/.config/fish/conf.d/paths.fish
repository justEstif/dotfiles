set -e fish_user_paths

set -U fish_user_paths $HOME/.local/share/nvim/mason/bin $fish_user_paths
set -U fish_user_paths "$HOME/.local/bin" $fish_user_paths

if test (uname) = Darwin
    fish_add_path /opt/homebrew/bin /opt/homebrew/sbin
end
