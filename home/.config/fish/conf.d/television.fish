# Television shell integration: ctrl-t (smart autocomplete), ctrl-r (history)
if status is-interactive; and type -q tv
    tv init fish | source
end
