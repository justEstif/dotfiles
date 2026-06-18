-- Bootstrap 'mini.nvim' manually in a way that it gets managed by 'mini.deps'
local mini_path = vim.fn.stdpath("data") .. "/site/pack/deps/start/mini.nvim"
if not vim.loop.fs_stat(mini_path) then
	vim.cmd('echo "Installing `mini.nvim`" | redraw')
	local clone_cmd = { "git", "clone", "--filter=blob:none", "https://github.com/nvim-mini/mini.nvim", mini_path }
	vim.fn.system(clone_cmd)
	vim.cmd("packadd mini.nvim | helptags ALL")
	vim.cmd('echo "Installed `mini.nvim`" | redraw')
end

-- Set up 'mini.deps' immediately to have its `now()` and `later()` helpers
require("mini.deps").setup()
MiniDeps.add({ name = "mini.nvim", checkout = "main" })

-- Shared state + helpers consumed across plugin/*.lua. init.lua runs first,
-- so everything here is available before any plugin/ file sources.
_G.Config = {}

-- Loader helpers backed by mini.misc.safely(): errors surface as a visible
-- WARN notification. (MiniDeps.now silently pcalls into a private cache,
-- which hid real ordering bugs in the past.)
local safely = require("mini.misc").safely
_G.Config.now = function(f) safely("now", f) end
_G.Config.later = function(f) safely("later", f) end

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
