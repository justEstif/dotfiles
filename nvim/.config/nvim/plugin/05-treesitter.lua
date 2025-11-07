local add, later = MiniDeps.add, MiniDeps.later

local ensure_installed = {
	"comment",
	"css",
	"diff",
	"fish",
	"gitcommit",
	"gitignore",
	"html",
	"javascript",
	"json",
	"lua",
	"markdown",
	"markdown_inline",
	"prisma",
	"python",
	"sql",
	"svelte",
	"tsx",
	"typescript",
}

local ts_spec = {
	source = "nvim-treesitter/nvim-treesitter",
	checkout = "master",
	hooks = {
		post_checkout = function()
			vim.cmd("TSUpdate")
		end,
	},
}

later(function()
	add({
		source = "nvim-treesitter/nvim-treesitter-textobjects",
		depends = { ts_spec },
	})
	require("nvim-treesitter.configs").setup({
		ensure_installed = ensure_installed,
		auto_install = true,
		highlight = { enable = true },
		incremental_selection = { enable = false },
		textobjects = { enable = false },
		indent = { enable = false },
	})

	-- Disable injections in 'lua' language. In Neovim<0.9 it is
	-- `vim.treesitter.query.set_query()`; in Neovim>=0.9 it is
	-- `vim.treesitter.query.set()`.
	local ts_query = require("vim.treesitter.query")
	local ts_query_set = ts_query.set or ts_query.set_query
	ts_query_set("lua", "injections", "")
end)
