local add = vim.pack.add
local now = Config.now

-- Loads before first render; its boot-order position matters (hence its own file).
add({ "https://github.com/olimorris/onedarkpro.nvim" })
now(function()
	require("onedarkpro").setup({
		colors = {
			onedark = { bg = "#282c34" }, -- match ghostty's One Dark (omarchy ghostty.conf & macOS Atom One Dark)
		},
	})
	vim.cmd("colorscheme onedark")
end)
