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

lspconfig.ts_ls.setup({ on_attach = on_attach_custom })
lspconfig.cssls.setup({ on_attach = on_attach_custom })
lspconfig.gopls.setup({ on_attach = on_attach_custom })
lspconfig.tailwindcss.setup({ on_attach = on_attach_custom })
