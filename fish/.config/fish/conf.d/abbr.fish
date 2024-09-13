# abbreviations
abbr -a v nvim
abbr -a lz lazygit
abbr -a killnode "killall -9 node" # kill all node apps
abbr -a lf 'cd (xplr --print-pwd-as-result)'

set -l os (uname)

if test "$os" = Linux
  abbr -a dark_theme "gsettings set org.gnome.desktop.interface color-scheme prefer-dark"
  abbr -a light_theme "gsettings set org.gnome.desktop.interface color-scheme prefer-light"
  abbr -a update "sudo apt update && sudo apt upgrade"
end
