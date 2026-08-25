## wtm status [worktree] [--base <branch>] [--local]
##
## Show local Git, base-branch, pull-request, review, and CI state for each
## worktree. Pass a worktree name for a detailed view. GitHub fields require
## gh and jq; --local skips network access and GitHub entirely.
function __wtm_cmd_status
    set -l selected ""
    set -l base_override ""
    set -l local_only false
    set -l i 1

    while test $i -le (count $argv)
        switch $argv[$i]
            case --base
                set i (math $i + 1)
                if test $i -gt (count $argv)
                    echo "wtm: --base requires a branch name" >&2
                    return 1
                end
                set base_override $argv[$i]
            case --local
                set local_only true
            case -h --help
                echo "usage: wtm status [worktree] [--base <branch>] [--local]"
                return 0
            case '-*'
                echo "wtm: unknown option '$argv[$i]'" >&2
                return 1
            case '*'
                if test -n "$selected"
                    echo "wtm: status accepts at most one worktree name" >&2
                    return 1
                end
                set selected $argv[$i]
        end
        set i (math $i + 1)
    end

    __wtm_bare_check; or return 1

    set -l base_branch $base_override
    if test -z "$base_branch"
        set base_branch (__wtm_detect_base_branch)
        or begin
            echo "wtm: could not detect base branch; pass --base <branch>" >&2
            return 1
        end
    end

    if test "$local_only" = false
        printf 'Fetching origin/%s ... ' $base_branch >&2
        if git fetch --quiet origin $base_branch
            echo done >&2
        else
            echo failed >&2
            echo "wtm: continuing with the existing origin/$base_branch ref" >&2
        end
    end

    if not git rev-parse --verify -q "origin/$base_branch" >/dev/null
        echo "wtm: origin/$base_branch does not exist locally" >&2
        return 1
    end

    set -l github_enabled false
    set -l repo_slug ""
    set -l prs_json '[]'
    set -l threads_json '{}'
    if test "$local_only" = false; and type -q gh; and type -q jq
        set repo_slug (gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)
        if test -n "$repo_slug"
            set prs_json (gh pr list --repo "$repo_slug" --state all --limit 200 \
                --json number,state,url,headRefName,baseRefName,mergeStateStatus,reviewDecision 2>/dev/null \
                | jq -c '.' | string collect)
            set -l owner (string split / -- $repo_slug)[1]
            set -l repo (string split / -- $repo_slug)[2]
            set threads_json (gh api graphql \
                -f query='query($owner:String!,$repo:String!){repository(owner:$owner,name:$repo){pullRequests(states:OPEN,first:100){nodes{headRefName reviewThreads(first:100){nodes{isResolved}}}}}}' \
                -f owner="$owner" -f repo="$repo" \
                --jq '.data.repository.pullRequests.nodes | map({key:.headRefName,value:([.reviewThreads.nodes[] | select(.isResolved == false)] | length)}) | from_entries' 2>/dev/null | string collect)
            if test -n "$prs_json"; and test -n "$threads_json"
                set github_enabled true
            else
                echo "wtm: GitHub unavailable; showing local status only" >&2
            end
        else
            echo "wtm: GitHub unavailable; showing local status only" >&2
        end
    else if test "$local_only" = false
        echo "wtm: gh and jq are required for PR status; showing local status only" >&2
    end

    set -l rows (__wtm_list_all_worktrees)
    set -l matched false
    set -l output_rows

    for row in $rows
        set -l parts (string split "|" -- $row)
        set -l name $parts[1]
        set -l branch $parts[2]
        set -l path $parts[3]
        set -l is_bare $parts[5]

        if test "$is_bare" = true
            continue
        end
        if test -n "$selected"; and test "$selected" != "$name"; and test "$selected" != "$branch"
            continue
        end
        set matched true

        set -l dirty_count (git -C "$path" status --porcelain 2>/dev/null | count)
        set -l git_state clean
        if test $dirty_count -gt 0
            set git_state "dirty:$dirty_count"
        end
        if test (git -C "$path" diff --name-only --diff-filter=U 2>/dev/null | count) -gt 0
            set git_state conflict
        end

        set -l remote_state no-remote
        if git rev-parse --verify -q "origin/$branch" >/dev/null
            set -l remote_counts (git rev-list --left-right --count "origin/$branch...$branch" 2>/dev/null | string split \t)
            if test (count $remote_counts) -eq 2
                set -l behind_remote $remote_counts[1]
                set -l ahead_remote $remote_counts[2]
                if test $behind_remote -eq 0; and test $ahead_remote -eq 0
                    set remote_state synced
                else
                    set remote_state "↑$ahead_remote ↓$behind_remote"
                end
            end
        end

        set -l base_counts (git rev-list --left-right --count "origin/$base_branch...$branch" 2>/dev/null | string split \t)
        set -l base_state unknown
        set -l behind_base 0
        set -l ahead_base 0
        if test (count $base_counts) -eq 2
            set behind_base $base_counts[1]
            set ahead_base $base_counts[2]
            if test "$branch" = "$base_branch"
                set base_state base
            else if git merge-base --is-ancestor "$branch" "origin/$base_branch" 2>/dev/null
                set base_state merged
            else if test $behind_base -eq 0
                set base_state current
            else
                set base_state "behind:$behind_base"
            end
        end

        set -l pr_number ""
        set -l pr_state "—"
        set -l pr_base ""
        set -l pr_url ""
        set -l merge_state ""
        set -l review_decision ""
        set -l unresolved ""
        set -l checks ""

        if test "$github_enabled" = true; and test "$branch" != "$base_branch"
            set -l pr_json (echo "$prs_json" | jq --arg branch "$branch" '[.[] | select(.headRefName == $branch)] | sort_by(.number) | reverse | .[0] // empty')
            if test -n "$pr_json"
                set pr_number (echo "$pr_json" | jq -r '.number')
                set pr_state (echo "$pr_json" | jq -r '.state')
                set pr_base (echo "$pr_json" | jq -r '.baseRefName')
                set pr_url (echo "$pr_json" | jq -r '.url')
                set merge_state (echo "$pr_json" | jq -r '.mergeStateStatus // "UNKNOWN"')
                set review_decision (echo "$pr_json" | jq -r '.reviewDecision // "NONE"')
                set unresolved (echo "$threads_json" | jq -r --arg branch "$branch" '.[$branch] // 0')
                if test -n "$selected"
                    set checks (gh pr view "$pr_number" --repo "$repo_slug" --json statusCheckRollup 2>/dev/null | jq -r '
                        .statusCheckRollup as $c |
                        if ($c | length) == 0 then "none"
                        else ([ $c[] | select((.conclusion // .state) == "SUCCESS") ] | length | tostring) + " pass, " +
                             ([ $c[] | select((.conclusion // .state) == "FAILURE" or (.conclusion // .state) == "ERROR") ] | length | tostring) + " fail, " +
                             ([ $c[] | select((.conclusion // .state) == "PENDING" or (.conclusion // .state) == "QUEUED" or (.conclusion // .state) == "IN_PROGRESS" or (.conclusion // .state) == "EXPECTED") ] | length | tostring) + " pending"
                        end')
                end
            end
        end

        set -l review_state "—"
        if test -n "$pr_number"
            set -l lifecycle $pr_state
            if test "$lifecycle" = OPEN
                set review_state "$unresolved open"
                if test "$review_decision" = CHANGES_REQUESTED
                    set review_state "$review_state · changes"
                else if test "$review_decision" = REVIEW_REQUIRED
                    set review_state "$review_state · review"
                end
            end
            set pr_state "#$pr_number $lifecycle"
            if test "$merge_state" = DIRTY
                set pr_state "$pr_state · CONFLICT"
            else if test -n "$merge_state"; and test "$lifecycle" = OPEN
                set pr_state "$pr_state · $merge_state"
            end
        end

        if test -n "$selected"
            echo
            echo "$name [$branch]"
            echo "  Worktree:  $git_state"
            echo "  Remote:    $remote_state"
            echo "  Base:      $base_branch — $base_state (ahead $ahead_base, behind $behind_base)"
            if test -n "$pr_number"
                echo "  PR:        $pr_state → $pr_base"
                echo "  Mergeable: $merge_state"
                echo "  Review:    $review_decision"
                echo "  Threads:   $unresolved unresolved"
                echo "  Checks:    $checks"
                echo "  URL:       $pr_url"
            else
                echo "  PR:        $pr_state"
            end
        else
            set -a output_rows "$name|$git_state|$remote_state|$base_state|$pr_state|$review_state"
        end
    end

    if test "$matched" = false
        echo "wtm: worktree '$selected' not found" >&2
        return 1
    end

    if test -z "$selected"
        echo
        printf '%-24s %-11s %-12s %-12s %-30s %s\n' WORKTREE GIT REMOTE (string upper -- $base_branch) PR REVIEW
        echo (string repeat -n 112 ─)
        for row in $output_rows
            set -l fields (string split "|" -- $row)
            printf '%-24s %-11s %-12s %-12s %-30s %s\n' $fields[1] $fields[2] $fields[3] $fields[4] $fields[5] $fields[6]
        end
    end
end
