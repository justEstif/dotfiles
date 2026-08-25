function __pi_sandbox_create_state --argument-names requested
    set -l state_dir
    if test -n "$requested"
        set state_dir $requested
        if not string match -q '/*' -- $state_dir
            set state_dir $PWD/$state_dir
        end
        set state_dir (path normalize -- $state_dir)
        if test -z "$state_dir"; or test -e "$state_dir"
            printf 'pi-sandbox: --state-dir must name a path that does not exist\n' >&2
            return 2
        end
        command mkdir -m 700 -p -- $state_dir; or return 1
    else
        set -l tmp_root $TMPDIR
        test -n "$tmp_root"; or set tmp_root /tmp
        set state_dir (command mktemp -d "$tmp_root/pi-sandbox.XXXXXX"); or return 1
    end

    command mkdir -m 700 -p -- $state_dir/agent $state_dir/home; or return 1
    set -l nonce (random)(random)(random)
    printf '%s\n' $nonce >$state_dir/.pi-sandbox-state; or return 1
    printf '%s\n%s\n' $state_dir $nonce
end
