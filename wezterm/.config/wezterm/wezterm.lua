local wezterm = require("wezterm")
local utils = require("utils")
local act = wezterm.action

local config = {}

if utils.is_dark() then
	config.color_scheme = "Tokyo Night Moon"
else
	config.color_scheme = "Tokyo Night Day"
end

local platform = utils.platform()

config.font = wezterm.font("Iosevka")
if platform.is_mac then
	config.font_size = 18
else
	config.font_size = 12
end

-- command palette
config.command_palette_font_size = config.font_size
config.command_palette_rows = 10
local scheme = wezterm.get_builtin_color_schemes()[config.color_scheme]
config.command_palette_bg_color = scheme.background
config.window_frame = {
	font = config.font,
}

config.window_padding = {
	left = 0,
	right = 0,
	top = 0,
	bottom = 0,
}

config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = false

config.disable_default_key_bindings = true
config.use_dead_keys = false
config.keys = {
	-- Tab and Pane Navigation
	{ key = "l", mods = "CTRL|SHIFT", action = act.ActivateTabRelative(1) },
	{ key = "h", mods = "CTRL|SHIFT", action = act.ActivateTabRelative(-1) },
	{ key = "P", mods = "CTRL|SHIFT", action = act.ActivateCommandPalette },

	-- Font Size
	{ key = "+", mods = "CTRL|SHIFT", action = act.IncreaseFontSize },
	{ key = "_", mods = "CTRL|SHIFT", action = act.DecreaseFontSize },
	{ key = ")", mods = "CTRL|SHIFT", action = act.ResetFontSize },

	-- Copy and Paste
	{ key = "c", mods = "CTRL|SHIFT", action = act.CopyTo("Clipboard") },
	{ key = "v", mods = "CTRL|SHIFT", action = act.PasteFrom("Clipboard") },

	-- Reload and Configuration
	{ key = "n", mods = "CTRL|SHIFT", action = act.SpawnWindow },

	-- Split Panes
	{ key = "s", mods = "CTRL|SHIFT", action = act.SplitVertical({ domain = "CurrentPaneDomain" }) },
	{ key = "|", mods = "CTRL|SHIFT", action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
	{ key = "t", mods = "CTRL|SHIFT", action = act.SpawnTab("CurrentPaneDomain") },

	-- Tab Management
	{ key = "j", mods = "CTRL|SHIFT", action = act.ActivateTabRelative(-1) },
	{ key = "k", mods = "CTRL|SHIFT", action = act.ActivateTabRelative(1) },
	{ key = "w", mods = "CTRL|SHIFT", action = act.CloseCurrentTab({ confirm = false }) },
	{ key = "x", mods = "CTRL|SHIFT", action = act.CloseCurrentPane({ confirm = false }) },
	{ key = "r", mods = "CTRL|SHIFT", action = utils.rename_tab() },

	-- Pane Direction
	{ key = "LeftArrow", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Left") },
	{ key = "RightArrow", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Right") },
	{ key = "UpArrow", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Up") },
	{ key = "DownArrow", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Down") },
}

return config
