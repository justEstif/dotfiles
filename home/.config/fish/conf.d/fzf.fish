# fzf shell integration: ctrl-t (files), ctrl-r (history), alt-c (dirs)
if type -q fzf
    fzf --fish | source
end
