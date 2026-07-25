-- zk-nvim: thin Neovim client for the `zk` CLI note-taking tool (Zettelkasten).
-- Replaces obsidian.nvim. The notebook is discovered via $ZK_NOTEBOOK_DIR
-- (~/notes); the `zk` LSP server (shipped with the CLI — do NOT install it via
-- Mason) provides completion, hover, go-to-definition and backlink references.
-- Pickers use snacks.picker to match the rest of the config.
local add = vim.pack.add
local later = Config.later

later(function()
	add({
		{
			src = "https://github.com/zk-org/zk-nvim",
			version = vim.version.range("*"), -- latest release; drop to track `main`
		},
	})

	require("zk").setup({
		-- "snacks_picker" | "telescope" | "fzf" | "fzf_lua" | "minipick" | "select"
		picker = "snacks_picker",
		lsp = {
			config = {
				name = "zk",
				cmd = { "zk", "lsp" },
				filetypes = { "markdown" },
			},
			-- Auto-attach the zk LSP to markdown buffers inside a notebook.
			auto_attach = { enabled = true },
		},
		tags = { multi_select_strategy = "AND" },
	})

	-- `<Leader>o` was "+Obsidian"; repurposed as "+Notes" so muscle memory carries
	-- over (the <Leader>z prefix is already taken by snacks zen mode).
	table.insert(Config.leader_group_clues, { mode = "n", keys = "<Leader>o", desc = "+Notes" })

	local zk_cmds = require("zk.commands")

	-- Run a built-in Zk command, passing a Lua options table.
	local zk_cmd = function(name, opts)
		zk_cmds.get(name)(opts)
	end

	-- `<Leader>o` mappings (normal mode) ---------------------------------------
	local nmap = function(suffix, rhs, desc)
		vim.keymap.set("n", "<Leader>o" .. suffix, rhs, { desc = desc })
	end

	nmap("n", function()
		zk_cmd("ZkNew", { title = vim.fn.input("Title: ") })
	end, "New note")
	nmap("o", function()
		zk_cmd("ZkNotes", { sort = { "modified" } })
	end, "Open / switch note")
	nmap("/", function()
		zk_cmd("ZkNotes", { sort = { "modified" }, match = { vim.fn.input("Search: ") } })
	end, "Search notes")
	nmap("b", function()
		zk_cmd("ZkBacklinks")
	end, "Backlinks")
	nmap("l", function()
		zk_cmd("ZkLinks")
	end, "Links in note")
	nmap("g", function()
		zk_cmd("ZkTags")
	end, "Tags")
	nmap("i", function()
		zk_cmd("ZkInsertLink")
	end, "Insert link")

	-- Daily notes (the [group.daily] in ~/.config/zk/config.toml names them by date).
	nmap("d", function()
		zk_cmd("ZkNew", { dir = "daily" })
	end, "Today's daily")
	nmap("D", function()
		zk_cmd("ZkNotes", { tags = { "daily" }, sort = { "created-" } })
	end, "Daily notes")
	nmap("y", function()
		zk_cmd("ZkNew", { dir = "daily", date = "yesterday" })
	end, "Yesterday's daily")
	nmap("m", function()
		zk_cmd("ZkNew", { dir = "daily", date = "tomorrow" })
	end, "Tomorrow's daily")

	-- Rename the note + rewrite inbound links, via the zk LSP.
	nmap("r", vim.lsp.buf.rename, "Rename note")

	-- Visual-mode: act on the selection ----------------------------------------
	local xmap = function(suffix, rhs, desc)
		vim.keymap.set("x", "<Leader>o" .. suffix, rhs, { desc = desc })
	end
	xmap("n", "<Cmd>'<,'>ZkNewFromContentSelection<CR>", "New note from selection")
	xmap("m", "<Cmd>'<,'>ZkMatch<CR>", "Find notes matching selection")
	xmap("i", "<Cmd>'<,'>ZkInsertLinkAtSelection<CR>", "Link selection")

	-- Per-buffer mappings, only in markdown files that live in a zk notebook.
	-- `<CR>` follows the link under the cursor via the LSP (Obsidian's smart_action
	-- had no direct equivalent; checkbox toggling / TOC were dropped on purpose).
	local notebook_root = require("zk.util").notebook_root
	vim.api.nvim_create_autocmd("FileType", {
		pattern = "markdown",
		group = vim.api.nvim_create_augroup("zk-notebook-keys", { clear = true }),
		callback = function(args)
			if notebook_root(vim.api.nvim_buf_get_name(args.buf)) == nil then
				return
			end
			vim.keymap.set("n", "<CR>", vim.lsp.buf.definition, {
				buffer = args.buf,
				desc = "Follow link",
			})
		end,
	})
end)
