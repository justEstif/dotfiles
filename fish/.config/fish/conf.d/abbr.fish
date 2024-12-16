# abbreviations
abbr -a v nvim
abbr -a lz lazygit
abbr -a ls ls -la
abbr -a killnode "killall -9 node" # kill all node apps

set -l os (uname)

if test "$os" = Linux
    abbr -a apt-up "sudo apt update && sudo apt upgrade"
end

if test "$os" = Darwin
    abbr -a cohesion 'open "$HOME/Documents/frontier/Cohesion Devkit.app"'
end
