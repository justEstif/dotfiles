function __wtm_cmd_skills --description "Load wtm usage guides (served from ~/.config/wtm/skills)"
    set -l rest $argv
    set -l sub list
    if test (count $rest) -ge 1
        set sub $rest[1]
    end

    # Skills live in ~/.config/wtm/skills/<name>/SKILL.md — version-matched
    # with the dotfiles checkout, so they never drift from the CLI.
    set -l skills_dir ~/.config/wtm/skills

    switch $sub
        case list ""
            for d in $skills_dir/*/
                set -l name (basename $d)
                set -l desc ""
                if test -f $d/SKILL.md
                    # First `description:`-style line: use the first non-heading text line
                    set desc (string match -r -- '^description:\s*(.+)' <$d/SKILL.md | tail -1)
                    if test (count $desc) -eq 0
                        set desc (grep -m1 -E '^[A-Za-z].*' $d/SKILL.md | head -c 72)
                    end
                end
                printf "  %-16s %s\n" $name $desc
            end
        case get
            if test (count $rest) -lt 2
                echo "wtm skills get: missing skill name" >&2
                return 1
            end
            set -l name $rest[2]
            set -l full
            if contains -- --full $rest[3..]
                set full 1
            end
            set -l file $skills_dir/$name/SKILL.md
            if not test -f $file
                echo "wtm: no skill named '$name' in $skills_dir" >&2
                return 1
            end
            if set -q full[1]
                cat $file
            else
                # Everything except optional full-reference sections
                sed '/^## Full reference/,$d' $file
            end
        case path
            if test (count $rest) -ge 2
                echo $skills_dir/$rest[2]
            else
                echo $skills_dir
            end
        case '*'
            echo "wtm skills: unknown subcommand '$sub'" >&2
            echo "usage: wtm skills [list] | get <name> [--full] | path [name]" >&2
            return 1
    end
end
