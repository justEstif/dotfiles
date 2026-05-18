function shelf --description "Upload files to shelf.estifanos.cc"
    set -l base_url "https://shelf.estifanos.cc"
    set -l token "$SHELF_API_TOKEN"

    if test -z "$token"
        echo "Set SHELF_API_TOKEN env variable with your API token"
        echo "Get it from $base_url/admin"
        return 1
    end

    if test (count $argv) -eq 0
        echo "Usage: shelf <file...> [--folder subfolder]"
        echo "       shelf <file...> [-f subfolder]"
        return 1
    end

    set -l files
    set -l folder ""

    set -l i 1
    while test $i -le (count $argv)
        switch $argv[$i]
            case --folder -f
                set i (math $i + 1)
                set folder $argv[$i]
            case --help -h
                echo "Usage: shelf <file...> [--folder subfolder]"
                echo "Uploads files to $base_url"
                return 0
            case '*'
                set -a files $argv[$i]
        end
        set i (math $i + 1)
    end

    if test (count $files) -eq 0
        echo "No files specified"
        return 1
    end

    for file in $files
        if not test -f "$file"
            echo "File not found: $file"
            return 1
        end
    end

    set -l args
    for file in $files
        set -a args -F "files=@$file"
    end

    if test -n "$folder"
        set -a args -F "folder=$folder"
    end

    set -a args -H "Authorization: Bearer $token"
    set -a args "$base_url/admin/api/upload"

    set -l resp (curl -s $args 2>&1)

    if test $status -ne 0
        echo "Upload failed: $resp"
        return 1
    end

    # Parse and display results
    echo $resp | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for f in data.get('uploaded', []):
        print(f['url'])
    for e in data.get('errors', []):
        print(f'error: {e}', file=sys.stderr)
except json.JSONDecodeError:
    print(sys.stdin.read())
" 2>&1

    # Copy first URL to clipboard if available
    set -l first_url (echo $resp | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    uploads = data.get('uploaded', [])
    if uploads:
        print(uploads[0]['url'])
except: pass
" 2>/dev/null)

    if test -n "$first_url"
        echo -n "$first_url" | pbcopy 2>/dev/null || echo -n "$first_url" | xclip -selection clipboard 2>/dev/null
        and echo "(copied to clipboard)"
    end
end
