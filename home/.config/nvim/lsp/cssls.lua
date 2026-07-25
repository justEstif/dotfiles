local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities.textDocument.completion.completionItem.snippetSupport = true

return {
	cmd = { "vscode-css-language-server", "--stdio" },
	filetypes = { "css", "scss", "less" },
	capabilities = capabilities,
	root_markers = { ".git", "package.json" },
	init_options = { provideFormatter = true },
	settings = {
		css = { validate = true },
		scss = { validate = true },
		less = { validate = true },
	},
}
