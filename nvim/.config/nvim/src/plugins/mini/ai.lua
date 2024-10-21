local ai = require("mini.ai")
local gen_ai_spec = require("mini.extra").gen_ai_spec

ai.setup({
	n_lines = 100,
	custom_textobjects = {
		F = ai.gen_spec.treesitter({ a = "@function.outer", i = "@function.inner" }),
		B = gen_ai_spec.buffer(),
		D = gen_ai_spec.diagnostic(),
		I = gen_ai_spec.indent(),
		L = gen_ai_spec.line(),
		N = gen_ai_spec.number(),
	},
})
