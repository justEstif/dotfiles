return {
	cmd = { vim.fn.stdpath("data") .. "/mason/bin/tsc", "--lsp", "--stdio" },
	filetypes = {
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact",
	},
	root_markers = {
		"package-lock.json",
		"yarn.lock",
		"pnpm-lock.yaml",
		"bun.lockb",
		"tsconfig.json",
		"jsconfig.json",
		".git",
	},
	single_file_support = true,
}
