-- Nicer markdown viewing: render-markdown.nvim + <mark> highlighting
local add = vim.pack.add
local later = Config.later

later(function()
	add({ "https://github.com/MeanderingProgrammer/render-markdown.nvim" })

	require("render-markdown").setup({
		-- Keep syntax visible while typing on a line, render when idle
		render_modes = { "n", "c", "t" },
		anti_conceal = { enabled = true },
		heading = {
			icons = { "󰲡 ", "󰲣 ", "󰲥 ", "󰲧 ", "󰲩 ", "󰲫 " },
		},
	})

	-- <mark>...</mark> and ==text==: paint the inner text like browser <mark>
	local group = vim.api.nvim_create_augroup("markdown_mark_hl", { clear = true })
	vim.api.nvim_create_autocmd({ "BufWinEnter", "FileType" }, {
		group = group,
		pattern = "*.md",
		callback = function()
			vim.api.nvim_set_hl(0, "MarkedText", { bg = "#e5c07b", fg = "#1c1c26" })
			vim.fn.clearmatches()
			vim.fn.matchadd("MarkedText", [[<mark>.\{-}</mark>]])
			vim.fn.matchadd("MarkedText", [[==\zs.\{-}\ze==]])
		end,
	})
end)
