function zedall --description "Open all files in a folder (and subfolders) in Zed"
    if test (count $argv) -ne 1
        echo "usage: zedall <dir>" >&2
        return 1
    end
    find $argv[1] -type f | xargs zed
end
