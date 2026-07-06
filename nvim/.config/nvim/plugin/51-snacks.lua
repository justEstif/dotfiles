-- folke/snacks.nvim: a collection of small QoL modules. We enable only the
-- modules we actually use: picker (replaces mini.pick), statuscolumn, terminal,
-- and zen. Picking modules explicitly avoids surprising autocommands.
local add = vim.pack.add
local now = Config.now

now(function()
	add({ "https://github.com/folke/snacks.nvim" })

	require("snacks").setup({
		-- Fuzzy finder. ui_select defaults to true, so vim.ui.select uses it too.
		picker = {
			ui_select = true,
			-- Match mini.pick-ish ergonomics: filename-first, frecency weighting.
			matcher = { frecency = true, cwd_bonus = true },
			formatters = { file = { filename_first = true } },
			sources = {
				files = { hidden = true },
				explorer = { hidden = true },
			},
		},

		explorer = { replace_netrw = false, trash = true },

		-- Sign + fold column. `sign` renders our project marks (15-marks.lua)
		-- and any other placed signs; we omit `mark` to avoid duplicate letters.
		statuscolumn = {
			left = { "sign" },
			right = { "fold", "git" },
			folds = { open = false },
		},

		-- Distraction-free writing. Toggled on for markdown buffers below.
		zen = {
			center = true,
			toggles = {
				dim = true,
				git_signs = false,
				mini_diff_signs = false,
			},
			show = { statusline = false, tabline = false },
		},
	})

	vim.keymap.set("n", "<Leader>z", function()
		Snacks.zen()
	end, { desc = "Toggle zen mode" })
end)
