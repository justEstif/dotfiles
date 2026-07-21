# Make mise shims available to non-interactive shells and scripts
fish_add_path ~/.local/share/mise/shims

set -gx EDITOR nvim
set fish_greeting

set -x RIPGREP_CONFIG_PATH $HOME/.config/ripgrep/ripgreprc
set -x FZF_DEFAULT_OPTS "--preview 'cat {}'"

set -l os (uname)

if test "$os" = Darwin
    set -x XDG_CONFIG_HOME $HOME/.config
    set -x HOMEBREW_NO_REQUIRE_TAP_TRUST 1
end
