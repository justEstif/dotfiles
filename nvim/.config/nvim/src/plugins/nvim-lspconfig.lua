local lspconfig = require("lspconfig")

local on_attach_custom = function(client, buf_id)
	vim.bo[buf_id].omnifunc = "v:lua.MiniCompletion.completefunc_lsp"
end

lspconfig.lua_ls.setup({
	on_attach = on_attach_custom,
	settings = {
		Lua = {
			diagnostics = {
				globals = { "vim" },
				disable = { "need-check-nil" },
				-- Don't make workspace diagnostic, as it consumes too much CPU and RAM
				workspaceDelay = -1,
			},
		},
	},
})

lspconfig.denols.setup({
	on_attach = on_attach_custom,
	root_dir = lspconfig.util.root_pattern("deno.json", "deno.jsonc"),
})

lspconfig.ts_ls.setup({
	on_attach = on_attach_custom,
	root_dir = lspconfig.util.root_pattern("package.json"),
	single_file_support = false,
})
lspconfig.cssls.setup({ on_attach = on_attach_custom })
lspconfig.gopls.setup({ on_attach = on_attach_custom })
lspconfig.tailwindcss.setup({ on_attach = on_attach_custom })
