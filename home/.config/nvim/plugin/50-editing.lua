local add = vim.pack.add
local now, later = Config.now, Config.later

-- Editing modules: text objects, completion, snippets, surround, movement, etc.
-- (Formerly split across 07-coding.lua and 08-editor.lua.)

-- completion / snippets / pairs ------------------------------------------------
later(function()
	require("mini.pairs").setup()
end)

later(function()
	local completion = require("mini.completion")
	completion.setup({
		lsp_completion = {
			source_func = "omnifunc",
			auto_setup = false,
		},
	})
	-- Set up LSP part of completion
	local on_attach = function(args)
		vim.bo[args.buf].omnifunc = "v:lua.MiniCompletion.completefunc_lsp"
	end
	vim.api.nvim_create_autocmd("LspAttach", { callback = on_attach })
	vim.api.nvim_create_autocmd("FileType", {
		pattern = "snacks_picker_input",
		callback = function()
			vim.b.minicompletion_disable = true
			vim.bo.omnifunc = ""
			vim.bo.completefunc = ""
		end,
	})
	if vim.fn.has("nvim-0.11") == 1 then
		vim.lsp.config("*", { capabilities = MiniCompletion.get_lsp_capabilities() })
	end
end)

later(function()
	local snippets = require("mini.snippets")
	snippets.setup()
	-- Start LSP server for snippet integration
	snippets.start_lsp_server()
end)

later(function()
	local map_multistep = require("mini.keymap").map_multistep
	map_multistep("i", "<Tab>", { "pmenu_next" })
	map_multistep("i", "<S-Tab>", { "pmenu_prev" })
	map_multistep("i", "<CR>", { "pmenu_accept", "minipairs_cr" })
	map_multistep("i", "<BS>", { "minipairs_bs" })
end)

-- text objects / comments ------------------------------------------------------
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
	add({ "https://github.com/folke/ts-comments.nvim" })
	require("ts-comments").setup()
end)

later(function()
	local surround = require("mini.surround")
	surround.setup({
		search_method = "cover_or_nearest",
	})
	-- Disable `s` shortcut (use `cl` instead) for safer usage of 'mini.surround'
	vim.keymap.set({ "n", "x" }, "s", "<Nop>")
end)

-- movement / manipulation ------------------------------------------------------
later(function()
	local jump = require("mini.jump")
	jump.setup({
		mappings = {
			repeat_jump = "",
		},
	})
end)

later(function()
	require("mini.bracketed").setup({
		diagnostic = {
			options = {
				float = false,
			},
		},
	})
end)

later(function()
	require("mini.move").setup()
	require("mini.operators").setup()
	require("mini.align").setup()
	require("mini.splitjoin").setup()
	require("mini.git").setup()
	require("mini.diff").setup()
end)

later(function()
	local trailspace = require("mini.trailspace")
	trailspace.setup()
	vim.api.nvim_create_autocmd("BufWritePre", {
		group = vim.api.nvim_create_augroup("trim_whitespace", { clear = true }),
		callback = function()
			trailspace.trim()
			trailspace.trim_last_lines()
		end,
		desc = [[Trim trailing whitespace and empty lines on save]],
	})
end)

-- basics: options + mappings applied via a single now() (needs to run early)
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
			-- cursor moves with Alt-<hjkl> in Insert, Command, Terminal mode
			move_with_alt = true,
			-- switch windows: <C-hjkl>
			-- resize windows: <C-Arrow Keys>
			windows = true,
		},
	})
end)

later(function()
	require("mini.extra").setup()
end)

later(function()
	require("mini.misc").setup()
end)
