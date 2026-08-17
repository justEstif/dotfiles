# Omarchy launches Herdr itself on Linux; auto-start it only on macOS.
if status is-interactive
    and test (uname) = Darwin
    and not set -q HERDR_ENV
    and command -q herdr
    exec herdr
end
