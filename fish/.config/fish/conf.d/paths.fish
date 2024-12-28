set -e fish_user_paths

set -U fish_user_paths $HOME/.local/share/nvim/mason/bin $fish_user_paths

set -l os (uname)

if test "$os" = Linux
end

if test "$os" = Darwin
    set -U fish_user_paths "/Applications/Visual Studio Code.app/Contents/Resources/app/bin" $fish_user_paths
end
