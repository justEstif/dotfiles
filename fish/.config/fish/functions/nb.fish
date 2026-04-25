function nb
    set -l subcommands list search edit delete move show notebooks template import export sync git add

    if test (count $argv) -eq 0
        cd ~/.nb && pi
        return
    end

    if contains $argv[1] $subcommands
        command nb $argv
    else
        cd ~/.nb && pi -p "$argv"
    end
end