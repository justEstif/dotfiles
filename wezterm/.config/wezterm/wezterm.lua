local wezterm = require("wezterm")
local utils = require("utils")

local config = {}

if utils.is_dark() then
	config.color_scheme = "Catppuccin Macchiato"
else
	config.color_scheme = "Catppuccin Latte"
end

local platform = utils.platform()

config.font = wezterm.font("Comic Code Ligatures")
if platform.is_mac then
	config.font_size = 14.5
else
	config.font_size = 11
end

config.window_padding = {
	left = 0,
	right = 0,
	top = 0,
	bottom = 0,
}

config.use_fancy_tab_bar = false
config.enable_tab_bar = false

config.disable_default_key_bindings = true
config.use_dead_keys = false

config.keys = {
	-- Copy and Paste
	{ key = "c", mods = "CTRL|SHIFT", action = wezterm.action.CopyTo("Clipboard") },
	{ key = "v", mods = "CTRL|SHIFT", action = wezterm.action.PasteFrom("Clipboard") },
	-- Font size
	{ key = "+", mods = "CTRL|SHIFT", action = wezterm.action.IncreaseFontSize },
	{ key = "_", mods = "CTRL|SHIFT", action = wezterm.action.DecreaseFontSize },
	{ key = ")", mods = "CTRL|SHIFT", action = wezterm.action.ResetFontSize },
}

return config
