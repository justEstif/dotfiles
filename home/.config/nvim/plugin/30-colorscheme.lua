local add = vim.pack.add
local now = Config.now

-- Loads before first render; its boot-order position matters (hence its own file).
add({ "https://github.com/navarasu/onedark.nvim" })
now(function()
	require("onedark").setup({
		style = "dark", -- deep | warm | darker | cool | warm
		transparent = false,
	})
	vim.cmd("colorscheme onedark")
end)
