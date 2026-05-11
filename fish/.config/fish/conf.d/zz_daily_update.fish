# Daily update check — runs once per calendar day in interactive shells.
# Named zz_ to ensure it loads last, after paths/mise/brew are on PATH.

set -l update_stamp_file "$HOME/.cache/last_update"
set -l current_date (date +%Y-%m-%d)
set -l os (uname)

# Ensure cache dir exists
if not test -d "$HOME/.cache"
    mkdir -p "$HOME/.cache"
end

# Read and trim the stamp to guard against whitespace/empty-file edge cases
set -l stamp (string trim -- (cat "$update_stamp_file" 2>/dev/null))

if not test -f "$update_stamp_file"; or test "$stamp" != "$current_date"
    if status is-interactive
        set_color --bold yellow
        echo "[Daily Check] You haven't updated your system today. Running updates..."
        set_color normal

        set -l update_status 1

        if test "$os" = Linux
            if not command -q sudo
                set_color --bold red
                echo "[Daily Check] sudo not found — skipping system updates."
                set_color normal
            else
                sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y && mise cache clear && mise up
                set update_status $status
            end
        else if test "$os" = Darwin
            if not command -q brew
                set_color --bold red
                echo "[Daily Check] brew not found in PATH — skipping Homebrew updates."
                set_color normal
            else
                brew update && brew upgrade && mise cache clear && mise up
                set update_status $status
            end
        end

        if test $update_status -eq 0
            echo "$current_date" >"$update_stamp_file"
            set_color --bold green
            echo "[Daily Check] System updated successfully!"
            set_color normal
        else
            set_color --bold red
            echo "[Daily Check] Updates failed. Will try again next terminal session."
            set_color normal
        end
    end
end
