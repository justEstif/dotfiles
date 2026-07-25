local now = Config.now

-- Loads before first render; its boot-order position matters (hence its own file).
now(function()
	vim.o.background = "dark"
	vim.cmd("colorscheme minihues")
end)
