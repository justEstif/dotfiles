function __pi_sandbox_cmd_skills --description "Load pi-sandbox usage guides (served from fish/pi-sandbox/skills)"
    set -l rest $argv
    set -l sub list
    if test (count $rest) -ge 1
        set sub $rest[1]
    end

    # Skill docs live next to the wrapper in skills/, so they ship and
    # version together with the functions.
    set -l skills_dir (dirname (status filename))/../skills

    switch $sub
        case list ""
            for d in $skills_dir/*/
                set -l name (basename $d)
                set -l desc ""
                set -l doc $d/(basename $d).md
                if test -f $doc
                    set desc (grep -m1 -E '^[A-Za-z].*' $doc | head -c 72)
                end
                printf "  %-16s %s\n" $name $desc
            end
        case get
            if test (count $rest) -lt 2
                echo "pi-sandbox skills get: missing skill name" >&2
                return 1
            end
            set -l name $rest[2]
            set -l full
            if contains -- --full $rest[3..]
                set -l full 1
            end
            set -l file $skills_dir/$name/$name.md
            if not test -f $file
                echo "pi-sandbox: no skill named '$name' in $skills_dir" >&2
                return 1
            end
            if set -q full[1]
                cat $file
            else
                sed '/^## Full reference/,$d' $file
            end
        case path
            if test (count $rest) -ge 2
                echo $skills_dir/$rest[2]
            else
                echo $skills_dir
            end
        case '*'
            echo "pi-sandbox skills: unknown subcommand '$sub'" >&2
            echo "usage: pi-sandbox skills [list] | get <name> [--full] | path [name]" >&2
            return 1
    end
end
