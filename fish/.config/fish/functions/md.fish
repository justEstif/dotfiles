function md --description 'Open Markdown files in Obsidian'
    if test (count $argv) -eq 0
        echo 'usage: md FILE...'
        return 2
    end

    if not type -q open
        echo 'md: macOS open command not found' >&2
        return 1
    end

    open -a Obsidian -- $argv
end
