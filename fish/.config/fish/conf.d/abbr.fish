# abbreviations
abbr -a v nvim
abbr -a update "sudo apt update && sudo apt upgrade"
abbr -a lz lazygit
abbr -a killnode "killall -9 node" # kill all node apps

set -l os (uname)

if test "$os" = Linux
  abbr -a dark_theme "gsettings set org.gnome.desktop.interface color-scheme prefer-dark"
  abbr -a light_theme "gsettings set org.gnome.desktop.interface color-scheme prefer-light"
end
