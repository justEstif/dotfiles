local trailspace = require("mini.trailspace")

trailspace.setup()

local augroup = vim.api.nvim_create_augroup("TrimWhitespace", { clear = true })

vim.api.nvim_create_autocmd("BufWritePre", {
	group = augroup,
	callback = function()
		trailspace.trim()
		trailspace.trim_last_lines()
	end,
	desc = [[Trim trailing whitespace and empty lines on save]],
})
