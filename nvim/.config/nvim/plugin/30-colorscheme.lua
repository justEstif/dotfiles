local add = MiniDeps.add
local now = Config.now

-- Must load before first render — extracted from ui.lua so this is the only
-- file whose position in the boot order actually matters.
now(function()
	add("folke/tokyonight.nvim")
	vim.cmd([[colorscheme tokyonight-night]])
	vim.o.background = _G.Config.is_dark_mode() and "dark" or "light"
end)
