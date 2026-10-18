# Auto-start Herdr only inside Ghostty; desktop apps that spawn fish
# (editors, file managers, ...) get a plain shell instead.
if status is-interactive
    and set -q GHOSTTY_ENV
    and not set -q HERDR_ENV
    and command -q herdr
    herdr
end
