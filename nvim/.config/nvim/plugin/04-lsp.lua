local add, later = MiniDeps.add, MiniDeps.later

local diagnostic_opts = {
	underline = { severity = { min = "HINT", max = "ERROR" } },
	virtual_text = true,
	update_in_insert = false,
}

MiniDeps.later(function()
	vim.diagnostic.config(diagnostic_opts)
end)

later(function()
	add("mason-org/mason.nvim")
	add("mason-org/mason-lspconfig.nvim")
	add("neovim/nvim-lspconfig")

	require("mason").setup()
	require("mason-lspconfig").setup({
		ensure_installed = { "lua_ls", "ts_ls", "cssls", "gopls" },
	})
end)

later(function()
	add("stevearc/conform.nvim")
	local conform = require("conform")
	conform.setup({
		formatters_by_ft = {
			css = { "prettier" },
			fish = { "fish_indent" },
			html = { "prettier" },
			javascript = { "prettier" },
			json = { "prettier" },
			lua = { "stylua" },
			markdown = { "prettier" },
			toml = { "taplo" },
			typescript = { "prettier" },
			typescriptreact = { "prettier" },
		},
	})
end)

later(function()
	add("mfussenegger/nvim-lint")
	local lint = require("lint")
	lint.linters_by_ft = {
		css = { "eslint" },
		javascript = { "eslint" },
		json = { "eslint" },
		typescript = { "eslint" },
		typescriptreact = { "eslint" },
	}
end)
