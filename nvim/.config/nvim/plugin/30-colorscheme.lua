local add = vim.pack.add
local now = Config.now

-- Loads before first render; its boot-order position matters (hence its own file).
now(function()
	add({ "https://github.com/folke/tokyonight.nvim" })
	vim.cmd([[colorscheme tokyonight-night]])
	vim.o.background = _G.Config.is_dark_mode() and "dark" or "light"
end)
