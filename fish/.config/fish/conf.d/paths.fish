set -e fish_user_paths

set -U fish_user_paths $HOME/.local/share/nvim/mason/bin $fish_user_paths
set -U fish_user_paths $HOME/.asdf/shims $fish_user_paths
set -U fish_user_paths $HOME/.asdf/bin $fish_user_paths

set -l os (uname)

if test "$os" = Linux
 set -U fish_user_paths $HOME/.fzf/bin $fish_user_paths
end
