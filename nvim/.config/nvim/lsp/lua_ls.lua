return {
	cmd = { "lua-language-server" },
	filetypes = { "lua" },
	root_markers = { ".luarc.json", ".luarc.jsonc", ".git" },
	settings = {
		Lua = {
			diagnostics = {
				globals = {
					"vim",
					"MiniIcons",
					"MiniNotify",
					"MiniCompletion",
					"MiniFiles",
					"Snacks",
				},
				disable = { "need-check-nil" },
				workspaceDelay = -1,
			},
		},
	},
}
