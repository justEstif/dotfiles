-- OSC 52 remote clipboard (ported from omarchy's LazyVim template).
-- Activates only inside tmux/SSH/herdr panes: yanks are emitted as OSC 52 so
-- they reach the local terminal even through nested remote sessions, and
-- pastes prefer the local Wayland clipboard when available.
require("omarchy.remote_clipboard").setup()
