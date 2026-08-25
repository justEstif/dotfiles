## wtm cleanup [--base <branch>] [--dry-run] [--yes]
##
## Finds worktrees whose branches are merged into the base branch (or whose
## remote branch was deleted after a merge), have no uncommitted changes, and
## have no unpushed commits — then offers to delete them.
##
## Selection is interactive via fzf (multi-select) unless --yes is given.
## --dry-run lists candidates without deleting. Protected branches
## (main/master/next/prerelease) and the bare repo are never candidates.
function __wtm_cmd_cleanup
    set -l base_override ""
    set -l dry_run false
    set -l yes false

    set -l i 1
    while test $i -le (count $argv)
        switch $argv[$i]
            case --dry-run
                set dry_run true
            case --yes -y
                set yes true
            case --base
                set i (math $i + 1)
                if test $i -gt (count $argv)
                    echo "wtm: --base requires a branch name" >&2
                    return 1
                end
                set base_override $argv[$i]
            case -h --help
                echo "usage: wtm cleanup [--base <branch>] [--dry-run] [--yes]"
                return 0
            case '*'
                echo "wtm: unknown option '$argv[$i]'" >&2
                return 1
        end
        set i (math $i + 1)
    end

    __wtm_bare_check; or return 1

    set -l base_branch
    if test -n "$base_override"
        set base_branch $base_override
    else
        set base_branch (__wtm_detect_base_branch)
        or begin
            echo "wtm: could not detect base branch (no origin/HEAD, main, or master)" >&2
            echo "    specify one with --base <branch>" >&2
            return 1
        end
    end
    echo "Using base branch: $base_branch"

    echo "Fetching latest from origin/$base_branch ..."
    if not git fetch origin $base_branch 2>/dev/null
        echo "wtm: failed to fetch origin/$base_branch" >&2
        return 1
    end

    echo "Scanning worktrees for cleanup candidates ..."

    set -l PROTECTED main master next prerelease
    set -l all_rows (__wtm_list_all_worktrees)
    set -l total (count $all_rows)
    set -l idx 0
    set -l candidates

    for row in $all_rows
        set idx (math $idx + 1)
        set -l parts (string split "|" -- $row)
        # parts: name branch path commit is_bare
        set -l wname $parts[1]
        set -l wbranch $parts[2]
        set -l wpath $parts[3]
        set -l wcommit $parts[4]
        set -l wbare $parts[5]

        printf '\rChecking %d/%d: %-24s' $idx $total $wname >&2

        if test "$wbare" = true
            continue
        end
        if contains -- $wbranch $PROTECTED
            continue
        end

        if __wtm_is_merged $wbranch $wcommit $base_branch
        and not __wtm_has_uncommitted $wpath
        and not __wtm_has_unpushed $wpath $base_branch
            set -a candidates $row
        end
    end
    printf '\r\033[K' >&2

    if test (count $candidates) -eq 0
        echo "No worktrees are safe to clean up."
        echo "(kept if unmerged, dirty, or have unpushed commits)"
        return 0
    end

    echo
    echo "Found "(count $candidates)" worktree(s) safe to clean up:"
    for row in $candidates
        set -l parts (string split "|" -- $row)
        echo "  - $parts[1] [$parts[2]]"
    end

    if test "$dry_run" = true
        echo
        echo "Dry run — no worktrees were deleted."
        return 0
    end

    set -l to_delete
    if test "$yes" = true
        set to_delete $candidates
    else
        if not type -q fzf
            echo "wtm: fzf is required for interactive cleanup (install fzf, or pass --yes/--dry-run)" >&2
            return 1
        end

        set -l fzf_input
        for row in $candidates
            set -l parts (string split "|" -- $row)
            set -a fzf_input "$parts[1] [$parts[2]]"
        end

        echo
        echo "Select worktrees to delete (TAB marks, ctrl-a toggles all):"
        set -l selected (printf '%s\n' $fzf_input | fzf --multi \
            --height=40% --layout=reverse \
            --prompt='delete> ' \
            --header='TAB mark / ctrl-a all / enter confirm / esc cancel')

        if test (count $selected) -eq 0
            echo "No worktrees selected."
            return 0
        end

        # Map each selected display line back to its row by name.
        for sel in $selected
            set -l selname (string split " " -- $sel)[1]
            for row in $candidates
                set -l parts (string split "|" -- $row)
                if test "$parts[1]" = "$selname"
                    set -a to_delete $row
                    break
                end
            end
        end

        echo
        read -P "Delete "(count $to_delete)" worktree(s)? [y/N] " confirm
        if not string match -qi 'y' -- $confirm
            echo "Cancelled."
            return 0
        end
    end

    echo
    for row in $to_delete
        set -l parts (string split "|" -- $row)
        set -l wname $parts[1]
        set -l wpath $parts[3]
        # Candidates are verified clean; --force avoids edge refusals
        # (e.g. worktree is the current directory).
        if git worktree remove --force "$wpath" 2>/dev/null
            echo "✅ Deleted '$wname'"
        else
            echo "❌ Failed to delete '$wname'" >&2
        end
    end

    git worktree prune 2>/dev/null
    echo "Pruned stale worktree references."
    echo
    echo "Cleanup complete. Deleted "(count $to_delete)" worktree(s)."
end
