# >>> mise:activate >>> managed by mise — do not edit between markers
mise activate fish | source
# <<< mise:activate <<<

# nb reads ~/.nbrc itself; source it so NB_* settings are visible to other tooling
test -f ~/.nbrc; and source ~/.nbrc
