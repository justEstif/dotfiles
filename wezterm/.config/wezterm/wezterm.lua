local wezterm = require("wezterm")
local utils = require("utils")

local config = {}

if utils.is_dark() then
	config.color_scheme = "Tokyo Night Moon"
else
	config.color_scheme = "Tokyo Night Day"
end

local platform = utils.platform()

config.font = wezterm.font("Comic Code Ligatures")
if platform.is_mac then
	config.font_size = 14
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
