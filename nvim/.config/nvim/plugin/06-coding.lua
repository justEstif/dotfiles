local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later

later(function()
	require("mini.pairs").setup()
end)

later(function()
	local ai = require("mini.ai")
	local gen_ai_spec = require("mini.extra").gen_ai_spec

	ai.setup({
		n_lines = 100,
		custom_textobjects = {
			B = gen_ai_spec.buffer(),
		},
	})
end)

later(function()
	add("folke/ts-comments.nvim")
	require("ts-comments").setup()
end)

now(function()
	local basics = require("mini.basics")

	basics.setup({
		options = {
			basic = true,
			extra_ui = true,
			win_borders = "double",
		},
		mappings = {
			basic = true,
			move_with_alt = true,
		},
	})
end)
