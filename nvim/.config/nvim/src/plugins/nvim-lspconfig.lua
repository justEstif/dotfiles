local lspconfig = require("lspconfig")

-- Preconfiguration ===========================================================
local on_attach_custom = function(client, buf_id)
	vim.bo[buf_id].omnifunc = "v:lua.MiniCompletion.completefunc_lsp"

	-- Mappings are created globally for simplicity

	-- Currently all formatting is handled with 'null-ls' plugin
	if vim.fn.has("nvim-0.8") == 1 then
		client.server_capabilities.documentFormattingProvider = false
		client.server_capabilities.documentRangeFormattingProvider = false
	else
		client.resolved_capabilities.document_formatting = false
		client.resolved_capabilities.document_range_formatting = false
	end
end

local diagnostic_opts = {
	float = { border = "rounded" },
	-- Show gutter sings
	signs = {
		-- With highest priority
		priority = 9999,
		-- Only for warnings and errors
		severity = { min = "WARN", max = "ERROR" },
	},
	-- Show virtual text only for errors
	virtual_text = { severity = { min = "ERROR", max = "ERROR" } },
	-- Don't update diagnostics when typing
	update_in_insert = false,
}

vim.diagnostic.config(diagnostic_opts)

-- Lua (sumneko_lua) ==========================================================
local luals_root = vim.fn.stdpath("data") .. "/mason"
if vim.fn.isdirectory(luals_root) == 1 then
	-- if false then
	local sumneko_binary = luals_root .. "/bin/lua-language-server"

	lspconfig.lua_ls.setup({
		handlers = {
			-- Show only one definition to be usable with `a = function()` style.
			-- Because LuaLS treats both `a` and `function()` as definitions of `a`.
			["textDocument/definition"] = function(err, result, ctx, config)
				if type(result) == "table" then
					result = { result[1] }
				end
				vim.lsp.handlers["textDocument/definition"](err, result, ctx, config)
			end,
		},
		cmd = { sumneko_binary },
		on_attach = function(client, bufnr)
			on_attach_custom(client, bufnr)
			-- Reduce unnecessarily long list of completion triggers for better
			-- `MiniCompletion` experience
			client.server_capabilities.completionProvider.triggerCharacters = { ".", ":" }
		end,
		root_dir = function(fname)
			return lspconfig.util.root_pattern(".git")(fname) or lspconfig.util.path.dirname(fname)
		end,
		settings = {
			Lua = {
				runtime = {
					-- Tell the language server which version of Lua you're using (most likely LuaJIT in the case of Neovim)
					version = "LuaJIT",
					-- Setup your lua path
					path = vim.split(package.path, ";"),
				},
				diagnostics = {
					-- Get the language server to recognize common globals
					globals = { "vim", "describe", "it", "before_each", "after_each" },
					disable = { "need-check-nil", "lowercase-global", "undefined-global" },
					-- Don't make workspace diagnostic, as it consumes too much CPU and RAM
					workspaceDelay = -1,
				},
				workspace = {
					-- Don't analyze code from submodules
					ignoreSubmodules = true,
				},
				-- Do not send telemetry data containing a randomized but unique identifier
				telemetry = {
					enable = false,
				},
			},
		},
	})
end

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

-- Use make to add project errors to quickfix for TS/TSX projects
local augroup = vim.api.nvim_create_augroup("strdr4605", { clear = true })
vim.api.nvim_create_autocmd("FileType", {
	pattern = "typescript,typescriptreact",
	group = augroup,
	command = "compiler tsc | setlocal makeprg=npx\\ tsc",
})
