# >>> mise:activate >>> managed by mise — do not edit between markers
mise activate fish | source
# <<< mise:activate <<<

if status is-interactive; and command -q starship
    starship init fish | source
end

