local add = vim.pack.add
local now, later = Config.now, Config.later

local diagnostic_opts = {
	underline = { severity = { min = "HINT", max = "ERROR" } },
	virtual_text = true,
	update_in_insert = false,
}

later(function()
	vim.diagnostic.config(diagnostic_opts)
end)

local langs = {
	tools = {
		css = { formatter = "prettier", linter = "eslint" },
		go = { formatter = "gofmt" },
		html = { formatter = "prettier", linter = "eslint" },
		javascript = { formatter = "prettier", linter = "eslint" },
		javascriptreact = { formatter = "prettier", linter = "eslint" },
		json = { formatter = "prettier", linter = "eslint" },
		lua = { formatter = "stylua" },
		markdown = { formatter = "prettier" },
		svelte = { formatter = "prettier", linter = "eslint" },
		templ = { formatter = "templ" },
		toml = { formatter = "taplo" },
		typescript = { formatter = "prettier", linter = "eslint" },
		typescriptreact = { formatter = "prettier", linter = "eslint" },
	},

	lsp = {
		"lua_ls",
		"tsgo",
		"cssls",
		"svelte",
		"tailwindcss",
		"gopls",
	},

	ensure_installed = {
		"lua_ls",
		"tsgo",
		"cssls",
		"svelte",
		"tailwindcss",
		"gopls",
		"templ",
		"stylua",
		"eslint",
	},
}

later(function()
	add({
		"https://github.com/mason-org/mason.nvim",
		"https://github.com/mason-org/mason-lspconfig.nvim",
		"https://github.com/neovim/nvim-lspconfig",
	})

	require("mason").setup()
	-- explicit: we enable servers ourselves below
	require("mason-lspconfig").setup({
		automatic_enable = false,
		ensure_installed = langs.ensure_installed,
	})
end)

vim.lsp.enable(langs.lsp)

later(function()
	add({ "https://github.com/stevearc/conform.nvim" })
	local conform = require("conform")

	local formatters_by_ft = {}
	for ft, tools in pairs(langs.tools) do
		if tools.formatter then
			formatters_by_ft[ft] = { tools.formatter }
		end
	end

	conform.setup({ formatters_by_ft = formatters_by_ft })
end)

later(function()
	add({ "https://github.com/mfussenegger/nvim-lint" })
	local lint = require("lint")

	local linters_by_ft = {}
	for ft, tools in pairs(langs.tools) do
		if tools.linter then
			linters_by_ft[ft] = { tools.linter }
		end
	end

	lint.linters_by_ft = linters_by_ft
end)
