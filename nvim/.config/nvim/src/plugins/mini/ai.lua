local ai = require("mini.ai")

ai.setup({
	n_lines = 500,
	search_method = "cover_or_nearest",
	custom_textobjects = {
		g = MiniExtra.gen_ai_spec.buffer(),
		F = ai.gen_spec.treesitter({ a = "@function.outer", i = "@function.inner" }),
	},
})
