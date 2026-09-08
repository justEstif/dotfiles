function nb --description 'nb: bare subcommands → nb-vault; todo/bookmark → vault plugins'
    # Route bare subcommands into the nb-vault notebook so the wrong notebook
    # can never be the default, and remap todo/bookmark to the vault plugins
    # (vault-todo requires an explicit scope; vault-bookmark tags to inbox).
    # Anything already prefixed (nb local:list) or a global command passes
    # through untouched. Set HK=0 nb git push ... style escape hatches unaffected.
    if set -q argv[1]
        and not string match -q -- '*:*' $argv[1]
        and not string match -q -- '-*' $argv[1]
        switch $argv[1]
            case todo todos
                set argv[1] nb-vault:vault-todo
            case bookmark
                set argv[1] nb-vault:vault-bookmark
            case help version update browser completions plugins notebooks use sync remote status history settings
                # global commands: pass through untouched
            case '*'
                set argv[1] nb-vault:$argv[1]
        end
    end
    command nb $argv
end
