function pcp --description 'Copy current directory or resolved file/folder path(s) to clipboard'
    set -l paths

    if test (count $argv) -eq 0
        set paths (pwd)
    else
        set paths (path resolve -- $argv)
        or return 1
    end

    switch (uname)
        case Darwin
            printf '%s\n' $paths | pbcopy
        case Linux
            if type -q wl-copy
                printf '%s\n' $paths | wl-copy
            else if type -q xclip
                printf '%s\n' $paths | xclip -selection clipboard
            else if type -q xsel
                printf '%s\n' $paths | xsel --clipboard --input
            else
                echo 'pcp: no clipboard tool found (wl-copy, xclip, or xsel)' >&2
                return 1
            end
        case '*'
            echo 'pcp: unsupported OS' >&2
            return 1
    end

    echo "copied: $paths"
end
