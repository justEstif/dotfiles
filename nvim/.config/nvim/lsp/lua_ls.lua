return {
	cmd = { "lua-language-server" },
	filetypes = { "lua" },
	root_markers = { ".luarc.json", ".luarc.jsonc", ".git" },
	settings = {
		Lua = {
			diagnostics = {
				globals = {
					"vim",
					"MiniExtra",
					"MiniIcons",
					"MiniNotify",
					"MiniCompletion",
					"MiniPick",
				},
				disable = { "need-check-nil" },
				workspaceDelay = -1,
			},
		},
	},
}
