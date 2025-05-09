return {
	cmd = { "vscode-css-language-server", "--stdio" },
	filetypes = { "css", "scss", "less" },
	root_dir = function(fname)
		return require("lspconfig.util").root_pattern("package.json", ".git")(fname)
	end,
	init_options = {
		provideFormatter = true,
	},
	settings = {
		css = {
			validate = true,
			lint = {
				unknownAtRules = "ignore",
			},
		},
		scss = {
			validate = true,
		},
		less = {
			validate = true,
		},
	},
}
