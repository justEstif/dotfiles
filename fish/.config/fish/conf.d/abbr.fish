abbr -a v nvim
abbr -a lz lazygit
abbr -a vf vifm
abbr -a oc opencode
abbr -a l ls -1hA # ls column view, hidden files
abbr -a killnode "killall -9 node" # kill all node apps

set -l os (uname)

if test "$os" = Linux
    abbr -a apt-up "sudo apt update && sudo apt upgrade && sudo apt autoremove && mise up"

    # Linux clipboard commands - check available tools
    if type -q wl-copy
        # Wayland
        abbr -a pc wl-copy
        abbr -a pp wl-paste
    else if type -q xclip
        abbr -a pc "xclip -selection clipboard"
        abbr -a pp "xclip -o -selection clipboard"
    else if type -q xsel
        abbr -a pc "xsel --clipboard --input"
        abbr -a pp "xsel --clipboard --output"
    end

end

if test "$os" = Darwin
    abbr -a apt-up "brew update && brew upgrade && mise up"

    # macOS clipboard commands
    abbr -a pc pbcopy
    abbr -a pp pbpaste
    abbr -a git-pb 'git branch --show-current | pbcopy'
end
