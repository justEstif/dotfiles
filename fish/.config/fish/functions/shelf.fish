function shelf --description "Upload and manage files on shelf.estifanos.cc"
    set -l base_url "https://shelf.estifanos.cc"
    set -l token "$SHELF_API_TOKEN"

    if test -z "$token"
        echo (set_color red)"✗ Set SHELF_API_TOKEN env variable with your API token"(set_color normal)
        echo "  Get it from $base_url/admin"
        return 1
    end

    if test (count $argv) -eq 0
        echo "Usage:"
        echo "  shelf <file...> [--folder dir] [--visibility public|private|protected]"
        echo "  shelf rm <path...>"
        echo "  shelf ls [path]"
        return 1
    end

    # --- Subcommands ---
    switch $argv[1]
        case rm delete
            # Delete files by path
            set -l paths $argv[2..-1]
            if test (count $paths) -eq 0
                echo (set_color red)"✗ Specify paths to delete"(set_color normal)
                return 1
            end
            for p in $paths
                set -l resp (curl -sf -X DELETE "$base_url/admin/api/files/$p" \
                    -H "Authorization: Bearer $token" 2>&1)
                if test $status -eq 0
                    echo (set_color green)"✓"(set_color normal)" deleted $p"
                else
                    echo (set_color red)"✗ failed to delete $p"(set_color normal)
                end
            end
            return 0

        case ls list
            # List files
            set -l resp (curl -sf "$base_url/admin/api/files" \
                -H "Authorization: Bearer $token" 2>&1)
            if test $status -ne 0
                echo (set_color red)"✗ Failed to list files"(set_color normal)
                return 1
            end
            echo $resp | jq -r '.files[] | "\(.path)  \(.size)"' 2>/dev/null
            return 0
    end

    # --- Upload ---
    set -l files
    set -l folder ""
    set -l visibility ""

    set -l i 1
    while test $i -le (count $argv)
        switch $argv[$i]
            case --folder -f
                set i (math $i + 1)
                set folder $argv[$i]
            case --visibility -v
                set i (math $i + 1)
                set visibility $argv[$i]
            case --help -h
                echo "Usage:"
                echo "  shelf <file...> [--folder dir] [--visibility public|private|protected]"
                echo "  shelf rm <path...>"
                echo "  shelf ls [path]"
                return 0
            case '*'
                set -a files $argv[$i]
        end
        set i (math $i + 1)
    end

    if test (count $files) -eq 0
        echo (set_color red)"✗ No files specified"(set_color normal)
        return 1
    end

    for file in $files
        if not test -f "$file"
            echo (set_color red)"✗ File not found: $file"(set_color normal)
            return 1
        end
    end

    set -l curl_args
    for file in $files
        set -a curl_args -F "files=@$file"
    end

    if test -n "$folder"
        set -a curl_args -F "folder=$folder"
    end

    set -a curl_args -H "Authorization: Bearer $token"
    set -a curl_args "$base_url/admin/api/upload"

    set -l resp (curl -sf $curl_args)

    if test $status -ne 0
        echo (set_color red)"✗ Upload failed"(set_color normal)
        return 1
    end

    set -l errors (echo $resp | jq -r '.errors[]?' 2>/dev/null)
    set -l paths (echo $resp | jq -r '.uploaded[].path' 2>/dev/null)

    for err in $errors
        echo (set_color red)"✗ $err"(set_color normal)
    end

    for p in $paths
        echo (set_color green)"✓"(set_color normal)" $base_url/$p"
    end

    # Set visibility if requested
    if test -n "$visibility"
        switch $visibility
            case public private protected
                set -l first_path (echo $paths | head -1)

                if test -n "$first_path"
                    set -l vresp (curl -sf -X POST "$base_url/admin/api/visibility" \
                        -H "Authorization: Bearer $token" \
                        -F "path=$first_path" \
                        -F "visibility=$visibility")

                    if test $status -eq 0
                        set -l vcolor (switch "$visibility"
                            case public; echo green
                            case private; echo brmagenta
                            case protected; echo yellow
                        end)
                        echo (set_color $vcolor)"◆ $visibility"(set_color normal)
                    else
                        echo (set_color red)"✗ Failed to set visibility"(set_color normal)
                    end
                end
            case '*'
                echo (set_color red)"✗ Invalid visibility: $visibility (use public, private, or protected)"(set_color normal)
        end
    end

    # Copy first URL to clipboard
    set -l first_path (echo $paths | head -1)
    if test -n "$first_path"
        if set -q WAYLAND_DISPLAY
            echo -n "$base_url/$first_path" | wl-copy 2>/dev/null
        else
            echo -n "$base_url/$first_path" | xclip -selection clipboard 2>/dev/null
        end
        and echo (set_color --dim)'  copied to clipboard'(set_color normal)
    end
end
