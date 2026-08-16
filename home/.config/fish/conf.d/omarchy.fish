# =============================================================================
# omarchy.fish — omarchy integration for fish
# =============================================================================
# Ports omarchy's bash environment/aliases/functions
# (/usr/share/omarchy/default/bash/{envs,aliases,fns/*}) to fish.
# fish itself is not managed by omarchy, so this file fills that gap.
#
# NOT ported (intentionally):
#   - bash ssh() reconnect wrapper (bash-specific terminal disarm internals)
#   - kitty icat ff preview branch (kitty isn't a terminal here)
#   - tmux layout fns tdl/tds/tdlm/tsl + alias t (tmux removed; herdr replaces)
# =============================================================================

if not status is-interactive
    exit 0
end

# ---- env parity (/usr/share/omarchy/default/bash/envs) ----------------------
# EDITOR stays nvim (set in variables.fish, our preference over
# omarchy-launch-editor). SUDO_EDITOR mirrors it explicitly.
set -gx SUDO_EDITOR nvim
set -gx BROWSER omarchy-launch-browser
set -gx BAT_THEME ansi

# Color man pages with bat
set -gx MANROFFOPT -c
set -gx MANPAGER "sh -c 'col -bx | bat -l man -p'"

# ---- aliases (/usr/share/omarchy/default/bash/aliases) ----------------------

# File system
if type -q eza
    alias ls='eza -lh --group-directories-first --icons=auto'
    alias lsa='ls -a'
    alias lt='eza --tree --level=2 --long --icons --git'
    alias lta='lt -a'
end

if type -q fzf
    alias ff="fzf --preview 'bat --style=numbers --color=always {}'"
    alias eff='$EDITOR "(ff)"'
end

# Directories
abbr -a .. 'cd ..'
abbr -a ... 'cd ../..'
abbr -a .... 'cd ../../..'

# Tools (guarded: only when the tool exists on this machine)
type -q omarchy-agent; and abbr -a a 'omarchy-agent --inline'
type -q opencode; and abbr -a c 'opencode --auto'
type -q claude; and abbr -a cx 'printf "\033[2J\033[3J\033[H" && claude --permission-mode bypassPermissions'
type -q codex; and abbr -a cy 'codex -s danger-full-access -a never'
type -q docker; and abbr -a d docker
abbr -a h herdr
abbr -a mup 'MISE_MINIMUM_RELEASE_AGE=0 mise up'

# Herdr dev layouts (formerly tmux's tdl/tdl c aliases — herdr replaces tmux).
# Target real binaries: abbreviations can't expand inside `herdr pane run`,
# so these must name actual commands (pi/codex via mise), not abbrs like c/cx.
abbr -a ic 'hdl pi'
abbr -a ix 'hdl codex'
abbr -a icx 'hdl pi codex'

# Git
abbr -a g git
abbr -a gcm 'git commit -m'
abbr -a gcam 'git commit -a -m'
abbr -a gcad 'git commit -a --amend'

# ---- functions (/usr/share/omarchy/default/bash/aliases + fns/*) ------------

# nvim with directory fallback (alias n in omarchy)
function n --description 'nvim — opens . when no args'
    if test (count $argv) -eq 0
        nvim .
    else
        nvim $argv
    end
end

# xdg-open wrapper
function open --description 'Open file/URL in default app'
    xdg-open $argv >/dev/null 2>&1 &
end

# Worktrees: create + trust + cd (omarchy fns/worktrees)
function ga --description 'Create a new worktree+branch and cd into it'
    if test (count $argv) -lt 1
        echo "Usage: ga [branch name]"
        return 1
    end
    set -l branch $argv[1]
    set -l base (basename $PWD)
    set -l wt_path "../$base--$branch"
    git worktree add -b $branch $wt_path
    and mise trust $wt_path
    and cd $wt_path
end

# Worktrees: remove worktree+branch (omarchy fns/worktrees)
function gd --description 'Remove current worktree and its branch'
    if gum confirm "Remove worktree and branch?"
        set -l cwd (pwd)
        set -l worktree (basename $cwd)

        # split on first `--`
        set -l parts (string split --max=1 -- "--" $worktree)

        # Protect against accidentally nuking a non-worktree directory
        if test (count $parts) -eq 2
            cd "../$parts[1]"
            and git worktree remove $cwd --force
            and git branch -D $parts[2]
        end
    end
end

# Compression (omarchy fns/compression)
function compress --description 'tar.gz a directory'
    tar -czf (string trim --right --char=/ $argv[1]).tar.gz (string trim --right --char=/ $argv[1])
end
alias decompress='tar -xzf'

# Drives (omarchy fns/drives)
function iso2sd --description 'Write iso file to sd card'
    if test (count $argv) -lt 1
        echo "Usage: iso2sd <input_file> [output_device]"
        echo "Example: iso2sd ~/Downloads/ubuntu-25.04-desktop-amd64.iso /dev/sda"
        return 1
    end

    set -l iso $argv[1]
    set -l drive ''
    if test (count $argv) -ge 2
        set drive $argv[2]
    end

    if test -z "$drive"
        set -l available_sds (lsblk -dpno NAME | grep -E '/dev/sd')

        if test -z "$available_sds"
            echo "No SD drives found and no drive specified"
            return 1
        end

        set drive (omarchy-drive-select $available_sds)

        if test -z "$drive"
            echo "No drive selected"
            return 1
        end
    end

    sudo dd bs=4M status=progress oflag=sync if="$iso" of="$drive"
    and sudo eject "$drive"
end

function format-drive --description 'Format an entire drive as a single exFAT partition'
    if test (count $argv) -ne 2
        echo "Usage: format-drive <device> <name>"
        echo "Example: format-drive /dev/sda 'My Stuff'"
        echo -e "\nAvailable drives:"
        lsblk -d -o NAME -n | awk '{print "/dev/"$1}'
    else
        echo "WARNING: This will completely erase all data on $argv[1] and label it '$argv[2]'."
        read -l -P "Are you sure you want to continue? (y/N): " confirm

        if string match -qr '^[Yy]$' -- $confirm
            sudo wipefs -a $argv[1]
            and sudo dd if=/dev/zero of=$argv[1] bs=1M count=100 status=progress
            and sudo parted -s $argv[1] mklabel gpt
            and sudo parted -s $argv[1] mkpart primary 1MiB 100%
            and sudo parted -s $argv[1] set 1 msftdata on

            set -l partition
            if string match -q '*nvme*' -- $argv[1]
                set partition "$argv[1]p1"
            else
                set partition "$argv[1]1"
            end
            sudo partprobe $argv[1]; or true
            sudo udevadm settle; or true

            sudo mkfs.exfat -n "$argv[2]" "$partition"

            echo "Drive $argv[1] formatted as exFAT and labeled '$argv[2]'."
        end
    end
end

# Rsync-on-change watchers (omarchy fns/rsyncing)
function rsw --description 'Start a background rsync-on-change watcher'
    if test (count $argv) -ne 2
        echo "Usage: rsw <source> <destination>"
        return 1
    end
    set -l src (string trim --right --char=/ $argv[1])
    set -l dest $argv[2]

    # Reuse one SSH connection per login, so 1Password only prompts once.
    set -l sockets "$XDG_RUNTIME_DIR"
    if test -z "$sockets"
        set sockets "$HOME/.ssh/sockets"
    end
    mkdir -p $sockets
    set -l rsh "ssh -o ControlMaster=auto -o ControlPath=$sockets/rsw-%r@%h:%p -o ControlPersist=yes"
    setsid --fork env RSYNC_RSH="$rsh" bash -c 'rsync -a "$1/" "$2"; while inotifywait -r -q -e modify,create,delete,move "$1"; do rsync -a "$1/" "$2"; done' rsw-watch "$src" "$dest" >/dev/null 2>&1
    echo "Watching $src -> $dest"
end

function lsw --description 'List active rsync-on-change watchers'
    set -l found 0
    while read -l pid cmd
        set -l rest (string replace -r -- '^.*rsw-watch ' '' -- $cmd)
        echo "$pid: "(string trim -- (string replace -r -- ' [^ ]+$' '' -- $rest))" -> "(string match -r -- '[^ ]+$' $rest)
        set found 1
    end < (pgrep -af 'rsw-watch ' | psub)
    test $found -eq 1; or echo "No active watches"
end

function dsw --description 'Stop rsync-on-change watchers'
    set -l found 0
    for pid in (pgrep -f 'rsw-watch ')
        kill -- -$pid 2>/dev/null; and echo "Stopped watch (pid $pid)"; and set found 1
    end
    test $found -eq 1; or echo "No active watches"
end

# SSH port forwarding (omarchy fns/ssh-port-forwarding)
function fip --description 'Forward local ports to a host over SSH'
    if test (count $argv) -lt 2
        echo "Usage: fip <host> <port1> [port2] ..."
        return 1
    end
    set -l host $argv[1]
    for port in $argv[2..-1]
        ssh -f -N -L "$port:localhost:$port" "$host"
        and echo "Forwarding localhost:$port -> $host:$port"
    end
end

function dip --description 'Stop SSH port forwards'
    if test (count $argv) -eq 0
        echo "Usage: dip <port1> [port2] ..."
        return 1
    end
    for port in $argv
        if pkill -f "ssh.*-L $port:localhost:$port"
            echo "Stopped forwarding port $port"
        else
            echo "No forwarding on port $port"
        end
    end
end

function lip --description 'List active SSH port forwards'
    pgrep -af "ssh.*-L [0-9]+:localhost:[0-9]+"
    or echo "No active forwards"
end

# ---- symlink drift self-heal -------------------------------------------------
# Tools that sed-rewrite configs (`omarchy font set`, `omarchy display text
# size`) atomically replace files, severing mise dotfiles symlinks. One cheap
# stat per prompt on the known target; heal-mise-dotfiles sweeps all drift.
function __omarchy_heal_dotfiles --on-event fish_prompt
    if not test -L ~/.config/ghostty/config; and type -q heal-mise-dotfiles
        heal-mise-dotfiles >/dev/null 2>&1
    end
end
