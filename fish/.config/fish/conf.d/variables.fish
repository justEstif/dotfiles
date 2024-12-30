set -gx EDITOR nvim
set fish_greeting

set -x RIPGREP_CONFIG_PATH $HOME/.config/ripgrep/ripgreprc
set -x FZF_DEFAULT_OPTS "--preview 'cat {}'"
set -x MANPAGER 'nvim +Man!'

set -l os (uname)

if test "$os" = Darwin
    set -x XDG_CONFIG_HOME $HOME/.config
end
