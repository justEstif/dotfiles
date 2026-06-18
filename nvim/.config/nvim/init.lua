-- Plugin manager: vim.pack (built into Neovim 0.12+). Clones on first run;
-- state is pinned in nvim-pack-lock.json. Update with :lua vim.pack.update().
vim.pack.add({ "https://github.com/nvim-mini/mini.nvim" })

-- Shared state + helpers. init.lua runs first, so these are ready for every
-- plugin/ file.
_G.Config = {}

-- now/later wrap mini.misc.safely(): errors surface as a WARN notification
-- instead of being swallowed.
local safely = require("mini.misc").safely
_G.Config.now = function(f)
	safely("now", f)
end
_G.Config.later = function(f)
	safely("later", f)
end

-- Defined here, not in a plugin/ file, so colorscheme.lua's now() can read it.
_G.Config.is_dark_mode = function()
	local os_name = vim.loop.os_uname().sysname

	if os_name == "Darwin" then
		local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
		if handle then
			local result = handle:read("*a")
			handle:close()
			return result:match("Dark") ~= nil
		end
	elseif os_name == "Linux" then
		local handle = io.popen("gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null")
		if handle then
			local result = handle:read("*a")
			handle:close()
			return result:match("prefer%-dark") ~= nil
		end
	end

	return true
end
