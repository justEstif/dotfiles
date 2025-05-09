return {
	cmd = { "lua-language-server" },
	filetypes = { "lua" },
	root_markers = { ".luarc.json", ".luarc.jsonc", ".git" },
	settings = {
		Lua = {
			diagnostics = {
				globals = { "vim", "MiniDeps", "MiniExtra", "MiniIcons", "MiniNotify" },
				disable = { "need-check-nil" },
				workspaceDelay = -1,
			},
		},
	},
}
