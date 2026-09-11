# Auto-start Herdr in interactive shells outside Herdr.
if status is-interactive
    and not set -q HERDR_ENV
    and command -q herdr
    herdr
end
