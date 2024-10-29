local theme = require("catppuccin")

theme.setup({
	background = {
		dark = "macchiato",
		light = "latte",
	},
})

vim.cmd.colorscheme("catppuccin")
