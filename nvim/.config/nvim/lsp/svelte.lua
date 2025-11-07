local util = require("lspconfig.util")

return {
	default_config = {
		cmd = { "svelteserver", "--stdio" },
		filetypes = { "svelte" },
		root_dir = util.root_pattern("package.json", ".git"),
	},
}
