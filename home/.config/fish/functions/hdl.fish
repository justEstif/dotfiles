# =============================================================================
# herdr.fish — herdr dev-layout functions
# =============================================================================
# Port of omarchy's /usr/share/omarchy/default/bash/fns/herdr to fish.
# herdr replaces both zellij and tmux on this machine (tmux's tdl/tds/tdlm/tsl
# equivalents). Requires herdr to be running (HERDR_PANE_ID set).
# =============================================================================

# Echo a split ratio as a float
# Usage: _herdr_ratio <numerator> <denominator>
function _herdr_ratio
    awk -v a=$argv[1] -v b=$argv[2] 'BEGIN { printf "%.4f", a / b }'
end

# Split a herdr pane and echo the id of the new pane
# Usage: _herdr_split <pane_id> <right|down> <ratio> <cwd>
function _herdr_split
    herdr pane split $argv[1] --direction $argv[2] --ratio $argv[3] --cwd $argv[4] --no-focus |
        jq -r '.result.pane.pane_id'
end

# Create a Herdr Dev Layout with editor, ai, and terminal
# Usage: hdl <c|cx|codex|other_ai> [<second_ai>]
function hdl --description 'Herdr Dev Layout: editor, AI right, terminal bottom'
    if test (count $argv) -lt 1; or test -z "$argv[1]"
        echo "Usage: hdl <c|cx|codex|other_ai> [<second_ai>]"
        return 1
    end
    if test -z "$HERDR_PANE_ID"
        echo "You must start herdr to use hdl."
        return 1
    end

    set -l current_dir $PWD
    set -l editor_pane $HERDR_PANE_ID
    set -l ai $argv[1]
    set -l ai2 ''
    if test (count $argv) -ge 2
        set ai2 $argv[2]
    end

    # Name the current tab after the base directory name
    herdr tab rename $HERDR_TAB_ID (basename $current_dir) >/dev/null

    # Split tab vertically - top 85%, bottom 15%
    _herdr_split $editor_pane down 0.85 $current_dir >/dev/null

    # Split editor pane horizontally - AI on right 30%
    set -l ai_pane (_herdr_split $editor_pane right 0.7 $current_dir)

    # If second AI provided, split the AI pane vertically
    if test -n "$ai2"
        set -l ai2_pane (_herdr_split $ai_pane down 0.5 $current_dir)
        herdr pane run $ai2_pane $ai2 >/dev/null
    end

    # Run ai in the right pane
    herdr pane run $ai_pane $ai >/dev/null

    # Run editor in the left pane
    herdr pane run $editor_pane "$EDITOR ." >/dev/null
end

# Create a Herdr Dev Square layout with editor, diff watch, terminal, and AI
# Usage: hds
function hds --description 'Herdr Dev Square: editor, diff watch, terminal, AI'
    if test (count $argv) -ge 1
        echo "Usage: hds"
        return 1
    end
    if test -z "$HERDR_PANE_ID"
        echo "You must start herdr to use hds."
        return 1
    end

    set -l current_dir $PWD
    set -l editor_pane $HERDR_PANE_ID

    herdr tab rename $HERDR_TAB_ID (basename $current_dir) >/dev/null

    set -l terminal_pane (_herdr_split $editor_pane down 0.5 $current_dir)
    set -l diff_pane (_herdr_split $editor_pane right 0.5 $current_dir)
    set -l ai_pane (_herdr_split $terminal_pane right 0.5 $current_dir)

    herdr pane run $editor_pane "nvim ." >/dev/null
    herdr pane run $diff_pane "hunk diff --watch" >/dev/null
    herdr pane run $ai_pane "opencode" >/dev/null
end

# Create multiple hdl tabs with one per subdirectory in the current directory
# Usage: hdlm <c|cx|codex|other_ai> [<second_ai>]
function hdlm --description 'One hdl tab per subdirectory of the cwd'
    if test (count $argv) -lt 1; or test -z "$argv[1]"
        echo "Usage: hdlm <c|cx|codex|other_ai> [<second_ai>]"
        return 1
    end
    if test -z "$HERDR_PANE_ID"
        echo "You must start herdr to use hdlm."
        return 1
    end

    set -l ai $argv[1]
    set -l ai2 ''
    if test (count $argv) -ge 2
        set ai2 $argv[2]
    end
    set -l base_dir $PWD
    set -l first true

    # Rename the workspace to the current directory name
    herdr workspace rename $HERDR_WORKSPACE_ID (basename $base_dir) >/dev/null

    for dir in $base_dir/*/
        test -d $dir; or continue
        set -l dirpath (string trim --right --char=/ $dir)

        if test $first = true
            # Reuse the current tab for the first project
            herdr pane run $HERDR_PANE_ID "cd '$dirpath' && hdl $ai $ai2" >/dev/null
            set first false
        else
            set -l pane_id (herdr tab create --workspace $HERDR_WORKSPACE_ID --cwd $dirpath --no-focus |
                jq -r '.result.root_pane.pane_id')
            herdr pane run $pane_id "cd '$dirpath' && hdl $ai $ai2" >/dev/null
        end
    end
end

# Create a multi-pane swarm layout with the same command in each pane (great for AI)
# Usage: hsl <pane_count> <command>
function hsl --description 'Herdr Swarm Layout: N panes running the same command'
    if test (count $argv) -ne 2
        echo "Usage: hsl <pane_count> <command>"
        return 1
    end
    if test -z "$HERDR_PANE_ID"
        echo "You must start herdr to use hsl."
        return 1
    end

    set -l count $argv[1]
    set -l cmd $argv[2]
    set -l current_dir $PWD

    herdr tab rename $HERDR_TAB_ID (basename $current_dir) >/dev/null

    # Tile into a grid: ceil(sqrt(count)) columns, rows spread across them
    set -l cols 1
    while test (math "$cols * $cols") -lt $count
        set cols (math "$cols + 1")
    end

    # Even columns come from splitting the rightmost one off at 1/(n-k+1) each time,
    # which keeps the array in left-to-right order
    set -l columns $HERDR_PANE_ID
    for k in (seq 1 (math "$cols - 1"))
        set columns $columns (_herdr_split $columns[-1] right (_herdr_ratio 1 (math "$cols - $k + 1")) $current_dir)
    end

    # Split each column into its share of rows, again evenly and top-to-bottom
    set -l panes
    for index in (seq 1 $cols)
        set -l col $columns[$index]
        set -l rows (math "$count / $cols")
        if test (math "$index - 1") -lt (math "$count % $cols")
            set rows (math "$rows + 1")
        end
        set panes $panes $col
        set -l last $col
        for j in (seq 2 $rows)
            set last (_herdr_split $last down (_herdr_ratio 1 (math "$rows - $j + 2")) $current_dir)
            set panes $panes $last
        end
    end

    for pane in $panes
        herdr pane run $pane "$cmd" >/dev/null
    end
end
