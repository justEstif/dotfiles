if test (uname) = "Darwin"
    # On macOS, use Homebrew path
    /opt/homebrew/bin/mise activate fish | source
else
    # On other systems (Linux, etc.), use the original path
    $HOME/.local/bin/mise activate fish | source
end
