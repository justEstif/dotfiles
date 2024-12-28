function test_file --description "Create a random file with optional filetype"
    set -l ext txt
    if test (count $argv) -gt 0
        set ext $argv[1]
    end
    command touch "testing_"(date +%s)".$ext"
end
