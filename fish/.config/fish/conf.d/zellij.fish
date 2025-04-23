if status is-interactive
    and test "$TERM_PROGRAM" != vscode
    eval (zellij setup --generate-auto-start fish | string collect)
end
