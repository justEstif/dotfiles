# Check if we need to run daily updates
set -l update_stamp_file "$HOME/.cache/last_apt_up"
set -l current_date (date +%Y-%m-%d)
set -l os (uname)

# Create cache dir if it doesn't exist
if not test -d "$HOME/.cache"
    mkdir -p "$HOME/.cache"
end

# Check if the stamp file exists and has today's date
if not test -f "$update_stamp_file"; or test (cat "$update_stamp_file" 2>/dev/null) != "$current_date"
    # It's an interactive shell, so we can prompt the user
    if status is-interactive
        echo -e "\e[1;33m[Daily Check]\e[0m You haven't updated your system today."
        echo "Running daily updates..."

        if test "$os" = Linux
            sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y && mise cache clear && mise up
        else if test "$os" = Darwin
            brew update && brew upgrade && mise cache clear && mise up
        end

        # If the update succeeded, save today's date
        if test $status -eq 0
            echo "$current_date" >"$update_stamp_file"
            echo -e "\e[1;32m[Daily Check]\e[0m System updated successfully!"
        else
            echo -e "\e[1;31m[Daily Check]\e[0m Updates failed. Will try again next terminal session."
        end
    end
end
