local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later

later(function()
	add("stevearc/quicker.nvim")
	local quicker = require("quicker")
	quicker.setup({
		keys = {
			{
				">",
				function()
					quicker.expand({ before = 2, after = 2, add_to_existing = true })
				end,
				desc = "Expand quickfix context",
			},
			{
				"<",
				function()
					quicker.collapse()
				end,
				desc = "Collapse quickfix context",
			},
		},
	})
end)

now(function()
	add("catppuccin/nvim")
	local theme = require("catppuccin")

	theme.setup({
		background = {
			dark = "macchiato",
			light = "latte",
		},
	})

	vim.cmd.colorscheme("catppuccin")
	vim.o.background = _G.Config.is_dark_mode() and "dark" or "light"
end)

now(function()
	local icons = require("mini.icons")
	icons.setup()

	icons.mock_nvim_web_devicons()
	later(MiniIcons.tweak_lsp_kind)
end)

later(function()
	require("mini.hipatterns").setup({
		highlighters = {
			fixme = { pattern = "FIXME", group = "MiniHipatternsFixme" },
			hack = { pattern = "HACK", group = "MiniHipatternsHack" },
			todo = { pattern = "TODO", group = "MiniHipatternsTodo" },
			note = { pattern = "NOTE", group = "MiniHipatternsNote" },
		},
	})
end)

now(function()
	require("mini.tabline").setup()
end)

local filterout_lua_diagnosing = function(notif_arr)
	local not_diagnosing = function(notif)
		return not vim.startswith(notif.msg, "lua_ls: Diagnosing")
	end
	notif_arr = vim.tbl_filter(not_diagnosing, notif_arr)
	return MiniNotify.default_sort(notif_arr)
end

now(function()
	local notify = require("mini.notify")

	notify.setup({
		content = {
			sort = filterout_lua_diagnosing,
		},
		window = {
			config = {
				border = "rounded",
			},
		},
	})

	vim.notify = notify.make_notify()
end)

now(function()
	require("mini.statusline").setup()
end)

later(function()
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
			{ mode = "n", keys = "m" }, -- Marks
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
end)
