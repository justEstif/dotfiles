if status is-interactive
    switch "$TERM_PROGRAM"
        case vscode zed
            # Don't auto-start zellij in these terminals
        case '*'
            eval (zellij setup --generate-auto-start fish | string collect)
    end
end
