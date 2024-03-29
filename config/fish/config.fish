function fish_user_key_bindings
    fish_vi_key_bindings
end

###### variables ######
set -x EDITOR nvim
set fish_greeting # Turn off the fish welcome message
set fzf_directory_opts --bind "ctrl-o:execute($EDITOR {} &> /dev/tty)"

###### Alias ######
alias cdu="cd -" # go to the prev dir
alias ..='cd ..' # go to the parent dir

alias lf='ranger_cd' # file manager
alias lz='lazygit' # git client

alias v='nvim'
alias vd='cd ~/dotfiles/config/nvim/; nvim'
alias notes='cd ~/Documents/estifanos_notes/; nvim'

alias killnode="killall -9 node" # kill all node apps

alias l="exa -lba" # ls
alias ls="exa" # ls
alias la='exa -albF --git' # list, size, type, git

zoxide init fish | source

# pnpm
set -gx PNPM_HOME "/home/estif/.local/share/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

# tabtab source for packages
# uninstall by removing these lines
[ -f ~/.config/tabtab/fish/__tabtab.fish ]; and . ~/.config/tabtab/fish/__tabtab.fish; or true
