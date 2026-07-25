# Auto-start zellij in interactive shells.
#   * skip when already inside zellij
#   * skip inside editor-integrated terminals (VS Code, Zed)
#   * reattach to the most recent session (creating it if none), so closing
#     and reopening Ghostty returns you to the same session
# To get a fresh session per window instead, use `exec zellij` below.
if status is-interactive; and not set -q ZELLIJ; and command -q zellij; and not string match -qr -- '^(vscode|zed)$' "$TERM_PROGRAM"
    exec zellij attach -c
end
