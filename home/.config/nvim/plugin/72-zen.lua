-- Distraction-free writing: zen-mode.nvim (goyo analog)
local add = vim.pack.add
local later = Config.later

later(function()
	add({ "https://github.com/folke/zen-mode.nvim" })

	require("zen-mode").setup({
		window = {
			backdrop = 0.95,
			width = function()
				return math.min(90, math.floor(vim.o.columns * 0.85))
			end,
			options = {
				signcolumn = "no",
				number = false,
				relativenumber = false,
				cursorline = false,
				foldcolumn = "0",
				list = false,
			},
		},
		plugins = {
			options = {
				enabled = true,
				ruler = false,
				showcmd = false,
				laststatus = 0,
			},
		},
	})

	vim.keymap.set("n", "<Leader>z", "<Cmd>ZenMode<CR>", { desc = "Toggle zen mode" })
end)
