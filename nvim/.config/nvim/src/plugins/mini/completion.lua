local completion = require("mini.completion")
completion.setup({
	lsp_completion = {
		source_func = "omnifunc",
		auto_setup = false,
	},
})
