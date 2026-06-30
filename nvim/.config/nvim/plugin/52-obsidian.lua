-- obsidian.nvim: note-taking inside Obsidian vaults. Completion + navigation
-- come from its in-process LSP (triggered by `[[`, `#`, `[^`); pickers use
-- snacks.picker to match the rest of the config. Vault: ~/Documents/obsidian-vault.
local add = vim.pack.add
local later = Config.later

later(function()
	add({
		{
			src = "https://github.com/obsidian-nvim/obsidian.nvim",
			version = vim.version.range("*"), -- latest release; drop to track `main`
		},
	})

	-- In this dotfiles/stow setup, Darwin is the work laptop; Linux is personal.
	local is_work_machine = vim.loop.os_uname().sysname == "Darwin"
	local workspaces = is_work_machine
			and {
				{
					name = "work",
					path = "~/vaults/work",
				},
				{
					name = "personal",
					path = "~/vaults/personal",
				},
			}
		or {
			{
				name = "personal",
				path = "~/vaults/personal",
			},
			{
				name = "work",
				path = "~/vaults/work",
			},
		}

	require("obsidian").setup({
		legacy_commands = false, -- removed in 4.0.0; command-only API
		workspaces = workspaces,
		picker = {
			name = "snacks.picker",
		},
		-- Daily notes land here; override if you keep them elsewhere.
		daily_notes = {
			folder = "daily",
			date_format = "%Y-%m-%d",
		},
	})

	-- mini.clue group so `<Leader>o` shows a which-key-style popup.
	table.insert(Config.leader_group_clues, { mode = "n", keys = "<Leader>o", desc = "+Obsidian" })

	local actions = require("obsidian.actions")

	-- Invoke `:Obsidian <name>` — structured command args must be a list.
	local obs_cmd = function(name)
		vim.cmd.Obsidian({ args = { name } })
	end

	-- Smart keys (work in any markdown buffer inside the vault) ----------------
	-- <CR>: follow link / toggle checkbox / cycle heading fold, depending on cursor.
	vim.keymap.set("n", "<CR>", actions.smart_action, { desc = "Obsidian smart action" })

	-- Jump to previous / next link in the buffer.
	vim.keymap.set("n", "[o", function()
		actions.nav_link(-1)
	end, { desc = "Obsidian prev link" })
	vim.keymap.set("n", "]o", function()
		actions.nav_link(1)
	end, { desc = "Obsidian next link" })

	-- `<Leader>o` command group -------------------------------------------------
	local nmap = function(suffix, rhs, desc)
		vim.keymap.set("n", "<Leader>o" .. suffix, rhs, { desc = desc })
	end

	nmap("n", function()
		obs_cmd("new")
	end, "New note")
	nmap("u", function()
		obs_cmd("unique_note")
	end, "New unique note")
	nmap("d", function()
		obs_cmd("today")
	end, "Today's daily note")
	nmap("D", function()
		obs_cmd("dailies")
	end, "Daily notes")
	nmap("y", function()
		obs_cmd("yesterday")
	end, "Yesterday's daily")
	nmap("t", function()
		obs_cmd("tomorrow")
	end, "Tomorrow's daily")
	nmap("s", function()
		obs_cmd("quick_switch")
	end, "Switch note")
	nmap("/", function()
		obs_cmd("search")
	end, "Search notes")
	nmap("g", function()
		obs_cmd("tags")
	end, "Tags")
	nmap("b", function()
		obs_cmd("backlinks")
	end, "Backlinks")
	nmap("l", function()
		obs_cmd("links")
	end, "Links in note")
	nmap("c", function()
		obs_cmd("toc")
	end, "Table of contents")
	nmap("f", function()
		obs_cmd("footnotes")
	end, "Footnotes")
	nmap("r", function()
		obs_cmd("rename")
	end, "Rename note")
	nmap("m", function()
		obs_cmd("template")
	end, "Insert template")
	nmap("p", function()
		obs_cmd("paste_img")
	end, "Paste image")
	nmap("w", function()
		obs_cmd("workspace")
	end, "Switch workspace")
	nmap("x", actions.toggle_checkbox, "Toggle checkbox")
end)
