local wezterm = require("wezterm")
local act = wezterm.action

local utils = {}

local function is_found(str, pattern)
	return string.find(str, pattern) ~= nil
end

utils.platform = function()
	local is_win = is_found(wezterm.target_triple, "windows")
	local is_linux = is_found(wezterm.target_triple, "linux")
	local is_mac = is_found(wezterm.target_triple, "apple")
	local os = is_win and "windows" or is_linux and "linux" or is_mac and "mac" or "unknown"
	return {
		os = os,
		is_win = is_win,
		is_linux = is_linux,
		is_mac = is_mac,
	}
end

utils.is_dark = function()
	if wezterm.gui then
		return wezterm.gui.get_appearance():find("Dark")
	end
	return true
end

utils.rename_tab = function()
	return act.PromptInputLine({
		description = "Enter new name for tab",
		action = wezterm.action_callback(function(window, _, line)
			if line then
				window:active_tab():set_title(line)
			end
		end),
	})
end

return utils
