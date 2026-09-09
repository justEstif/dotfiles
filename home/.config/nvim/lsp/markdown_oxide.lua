-- PKM language server for the nb vault: wikilink completion, go-to-def,
-- backlinks, "create unresolved file" code action.
-- Requires didChangeWatchedFiles dynamicRegistration (see capabilities).
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities.workspace = capabilities.workspace or {}
capabilities.workspace.didChangeWatchedFiles = { dynamicRegistration = true }

return {
	cmd = { vim.fn.stdpath("data") .. "/mason/bin/markdown-oxide" },
	filetypes = { "markdown" },
	root_markers = { ".moxide.toml", ".git" },
	capabilities = capabilities,
}
