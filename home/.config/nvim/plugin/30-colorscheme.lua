local add = vim.pack.add
local now = Config.now

-- Loads before first render; its boot-order position matters (hence its own file).
add({ "https://github.com/olimorris/onedarkpro.nvim" })
now(function()
	require("onedarkpro").setup({
		colors = {
			onedark = { bg = "#21252b" },
		},
	})
	vim.cmd("colorscheme onedark")
end)
