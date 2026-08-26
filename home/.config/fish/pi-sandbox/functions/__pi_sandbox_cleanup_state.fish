function __pi_sandbox_cleanup_state --argument-names state_dir nonce cwd
    set -l marker (string trim -- (command cat $state_dir/.pi-sandbox-state 2>/dev/null))
    if test "$marker" != "$nonce"; or test "$state_dir" = /; or test "$state_dir" = "$HOME"; or test "$state_dir" = "$cwd"
        printf 'pi-sandbox: refusing unsafe state cleanup: %s\n' $state_dir >&2
        return 1
    end
    command rm -rf -- $state_dir
end
