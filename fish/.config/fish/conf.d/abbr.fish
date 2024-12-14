# abbreviations
abbr -a v nvim
abbr -a lz lazygit
abbr -a killnode "killall -9 node" # kill all node apps

set -l os (uname)

if test "$os" = Darwin
    abbr -a cohesion 'open "$HOME/Documents/frontier/Cohesion Devkit.app"'
end
