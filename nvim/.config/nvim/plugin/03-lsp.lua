local add, later = MiniDeps.add, MiniDeps.later

later(function()
	add("williamboman/mason.nvim")
	require("mason").setup()
end)

later(function()
	add("neovim/nvim-lspconfig")
	local lspconfig = require("lspconfig")

	local on_attach_custom = function(_, buf_id)
		vim.bo[buf_id].omnifunc = "v:lua.MiniCompletion.completefunc_lsp"
	end

	lspconfig.lua_ls.setup({
		on_attach = on_attach_custom,
		settings = {
			Lua = {
				diagnostics = {
					globals = { "vim", "MiniDeps", "MiniExtra" },
					disable = { "need-check-nil" },
					-- Don't make workspace diagnostic, as it consumes too much CPU and RAM
					workspaceDelay = -1,
				},
			},
		},
	})

	lspconfig.ts_ls.setup({ on_attach = on_attach_custom })
	lspconfig.cssls.setup({ on_attach = on_attach_custom })
	lspconfig.ruby_lsp.setup({ on_attach = on_attach_custom })
	-- lspconfig.tailwindcss.setup({ on_attach = on_attach_custom })
	-- lspconfig.gopls.setup({ on_attach = on_attach_custom })
end)

later(function()
	add("stevearc/conform.nvim")
	local conform = require("conform")
	conform.setup({
		formatters_by_ft = {
			css = { "prettier" },
			eruby = { "erb_format" },
			fish = { "fish_indent" },
			html = { "prettier" },
			javascript = { "prettier" },
			json = { "prettier" },
			lua = { "stylua" },
			markdown = { "prettier" },
			ruby = { "rubyfmt" },
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
		css = { "biome" },
		eruby = { "erb_lint" },
		typescript = { "biome" },
		javascript = { "biome" },
		json = { "biome" },
		typescriptreact = { "biome" },
	}
end)
