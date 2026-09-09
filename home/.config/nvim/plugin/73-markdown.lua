-- Nicer markdown viewing: render-markdown.nvim (defaults)
local add = vim.pack.add
local later = Config.later

later(function()
	add({ "https://github.com/MeanderingProgrammer/render-markdown.nvim" })

	require("render-markdown").setup({
		render_modes = { "n", "c", "t" },
		anti_conceal = { enabled = true },
		html = {
			tag = {
				mark = { scope_highlight = "MarkedText" },
			},
		},
	})

	vim.api.nvim_set_hl(0, "MarkedText", { bg = "#e5c07b", fg = "#1c1c26" })
end)
