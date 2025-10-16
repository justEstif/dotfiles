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
			F = ai.gen_spec.treesitter({ a = "@function.outer", i = "@function.inner" }),
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
			-- cursor moves with Alt-<hjkl> in Insert, Command, Terminal mode
			move_with_alt = true,
			-- switch windows: <C-hjkl>
			-- resize windows: <C-Arrow Keys>
			windows = true,
		},
	})
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

later(function()
	require("mini.extra").setup()
end)
