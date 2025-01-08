abbr -a v nvim
abbr -a lz lazygit
abbr -a l ls -1hA # ls column view, hidden files
abbr -a killnode "killall -9 node" # kill all node apps

set -l os (uname)

if test "$os" = Linux
    abbr -a apt-up "sudo apt update && sudo apt upgrade"
end

if test "$os" = Darwin
    abbr -a cohesion 'open "$HOME/Documents/frontier/Cohesion Devkit.app"'
end
