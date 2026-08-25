## Completion helper: list remote branch names (origin/* with the prefix
## stripped, HEAD excluded, deduped) for --from / --base / checkout.
function __wtm_complete_branches
    git branch -r --format='%(refname:short)' 2>/dev/null \
        | string replace -r '^origin/' '' \
        | string match -rv '^(HEAD|origin)$' \
        | sort -u
end
