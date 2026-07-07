if status is-interactive
    and not set -q HERDR_ENV
    and command -q herdr
    exec herdr
end
