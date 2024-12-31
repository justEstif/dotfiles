local surround = require("mini.surround")

surround.setup({
	search_method = "cover_or_nearest",
})

-- Disable `s` shortcut (use `cl` instead) for safer usage of 'mini.surround'
vim.keymap.set({ "n", "x" }, "s", "<Nop>")
