local clue = require("mini.clue")

clue.setup({
	triggers = { -- Leader triggers
		{ mode = "n", keys = "<Leader>" },
		{ mode = "x", keys = "<Leader>" }, -- Built-in completion
		{ mode = "n", keys = [[\]] }, -- mini.basics
		{ mode = "n", keys = "[" }, -- mini.bracketed
		{ mode = "n", keys = "]" },
		{ mode = "x", keys = "[" },
		{ mode = "x", keys = "]" },
		{ mode = "i", keys = "<C-x>" },
		{ mode = "n", keys = "g" }, -- `g` key
		{ mode = "x", keys = "g" },
		{ mode = "n", keys = "'" }, -- Marks
		{ mode = "n", keys = "`" },
		{ mode = "x", keys = "'" },
		{ mode = "x", keys = "`" },
		{ mode = "n", keys = '"' }, -- Registers
		{ mode = "x", keys = '"' },
		{ mode = "i", keys = "<C-r>" },
		{ mode = "c", keys = "<C-r>" },
		{ mode = "n", keys = "<C-w>" }, -- Window commands
		{ mode = "n", keys = "z" }, -- `z` key
		{ mode = "x", keys = "z" },
	},
	window = {
		delay = 0,
		config = { width = "auto" },
	},

	clues = {
		Config.leader_group_clues,
		clue.gen_clues.builtin_completion(),
		clue.gen_clues.g(),
		clue.gen_clues.marks(),
		clue.gen_clues.registers(),
		clue.gen_clues.windows(),
		clue.gen_clues.z(),
	},
})
