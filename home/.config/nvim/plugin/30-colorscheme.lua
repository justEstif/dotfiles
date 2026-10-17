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
	local apply = function()
		vim.cmd("colorscheme " .. (vim.o.background == "light" and "onelight" or "onedark"))
	end
	apply()
	-- Nvim's TUI queries the terminal bg (OSC 11) and flips 'background'; follow it.
	vim.api.nvim_create_autocmd("OptionSet", { pattern = "background", callback = apply })
end)
