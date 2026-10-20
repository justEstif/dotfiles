# Auto-start Herdr only inside Ghostty; desktop apps that spawn fish
# (editors, file managers, ...) get a plain shell instead.
if status is-interactive
    and test "$TERM_PROGRAM" = ghostty
    and not set -q HERDR_ENV
    and command -q herdr
    herdr
end
