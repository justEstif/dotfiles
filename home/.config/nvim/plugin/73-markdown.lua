-- Nicer markdown viewing: render-markdown.nvim (minimal) + <mark> highlighting
local add = vim.pack.add
local later = Config.later

later(function()
	add({ "https://github.com/MeanderingProgrammer/render-markdown.nvim" })

	require("render-markdown").setup({
		render_modes = { "n", "c", "t" },
		anti_conceal = { enabled = true },

		-- Minimal: quiet everything down
		heading = {
			icons = {}, -- no 󰲡 icons, just styled text
			signs = { enabled = false },
			position = "inline",
			width = "full",
			backgrounds = {}, -- no colored heading background
			foregrounds = {
				"MarkdownH1",
				"MarkdownH2",
				"MarkdownH3",
				"MarkdownH4",
				"MarkdownH5",
				"MarkdownH6",
			},
		},
		dash = { icon = "─" }, -- thin thematic break
		bullet = {
			icons = {}, -- keep plain -, 1. markers
			right_pad = 1,
		},
		checkbox = {
			position = "inline",
			unchecked = { icon = "◯ " },
			checked = { icon = "◉ " },
			custom = { todo = { raw = "[-]", rendered = "◐ " } },
		},
		code = {
			sign = false,
			style = "language", -- just the language label, no background blocks
			position = "left",
		},
		table = { style = "none" }, -- keep raw pipes
		link = {
			image = "󰇞 ", -- tiny image marker
		},
		quote = { icon = "" }, -- no big quote bar replacement
		sign = { enabled = false },
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
