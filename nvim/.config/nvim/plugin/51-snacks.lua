-- folke/snacks.nvim: a collection of small QoL modules. We enable only the
-- modules we actually use: picker (replaces mini.pick), statuscolumn, terminal,
-- and zen. Picking modules explicitly avoids surprising autocommands.
local add = vim.pack.add
local later = Config.later

later(function()
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
			},
		},

		-- Sign + fold column. `sign` renders our project marks (15-marks.lua)
		-- and any other placed signs; we omit `mark` to avoid duplicate letters.
		statuscolumn = {
			left = { "sign" },
			right = { "fold", "git" },
			folds = { open = false },
		},

		-- Bottom split terminal. See plugin/75-terminal.lua for the keymaps.
		terminal = {
			win = {
				style = "terminal",
				position = "bottom",
				height = 0.30,
				border = "rounded",
			},
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

	-- Zen for markdown: auto-enter on .md buffers, and `<Leader>z` toggles anytime.
	vim.api.nvim_create_autocmd("FileType", {
		pattern = "markdown",
		callback = function()
			-- Defer so the buffer is fully open before entering zen.
			vim.schedule(function()
				if vim.bo.filetype == "markdown" then
					Snacks.zen()
				end
			end)
		end,
	})

	vim.keymap.set("n", "<Leader>z", function()
		Snacks.zen()
	end, { desc = "Toggle zen mode" })
end)
