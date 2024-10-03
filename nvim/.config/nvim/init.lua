pcall(function()
	vim.loader.enable()
end)

_G.Config = {
	path_package = vim.fn.stdpath("data") .. "/site/",
	path_source = vim.fn.stdpath("config") .. "/src/",
}

-- Ensure 'mini.nvim' is set up
local mini_path = Config.path_package .. "pack/deps/start/mini.nvim"
if not vim.loop.fs_stat(mini_path) then
	vim.cmd([[echo "Installing 'mini.nvim'" | redraw]])
	local clone_cmd = { "git", "clone", "--filter=blob:none", "https://github.com/echasnovski/mini.nvim", mini_path }
	vim.fn.system(clone_cmd)
end
require("mini.deps").setup({
	path = {
		package = Config.path_package,
	},
})

local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later
local source = function(path)
	dofile(Config.path_source .. path)
end

now(function()
	source("settings.lua")
end)
now(function()
	source("mappings.lua")
end)
now(function()
	source("mappings-leader.lua")
end)
later(function()
	source("custom-commands.lua")
end)

add({ name = "mini.nvim" })

now(function()
	require("mini.tabline").setup()
end)
now(function()
	require("mini.statusline").setup()
end)
later(function()
	require("mini.bracketed").setup()
end)
later(function()
	require("mini.move").setup()
end)
later(function()
	require("mini.pairs").setup()
end)

now(function()
	source("plugins/mini/icons.lua")
end)
later(function()
	require("mini.align").setup()
end)
later(function()
	require("mini.bufremove").setup()
end)
later(function()
	source("plugins/mini/trailspace.lua")
end)
now(function()
	require("mini.diff").setup()
end)
now(function()
	require("mini.splitjoin").setup()
end)
now(function()
	require("mini.extra").setup()
end)
later(function()
	require("mini.git").setup()
end)
later(function()
	require("mini.operators").setup()
end)


later(function()
	add({ source = "folke/ts-comments.nvim" })
	require("ts-comments").setup()
end)
later(function()
	source("plugins/mini/basics.lua")
end)
later(function()
	source("plugins/mini/clue.lua")
end)
later(function()
	source("plugins/mini/completion.lua")
end)
now(function()
	source("plugins/mini/files.lua")
end)
later(function()
	source("plugins/mini/jump.lua")
end)
now(function()
	source("plugins/mini/notify.lua")
end)
later(function()
	source("plugins/mini/surround.lua")
end)
later(function()
	source("plugins/mini/hipatterns.lua")
end)
later(function()
	source("plugins/mini/pick.lua")
end)
later(function()
	source("plugins/mini/ai.lua")
end)

-- Theme
now(function()
	add("folke/tokyonight.nvim")
	source("theme.lua")
end)

-- Tree-sitter: advanced syntax parsing, highlighting, and text objects
later(function()
	local ts_spec = {
		source = "nvim-treesitter/nvim-treesitter",
		checkout = "master",
		hooks = {
			post_checkout = function()
				vim.cmd("TSUpdate")
			end,
		},
	}
	add({ source = "nvim-treesitter/nvim-treesitter-textobjects", depends = { ts_spec } })
	source("plugins/nvim-treesitter.lua")
end)

-- Install LSP/formatting/linter executables
later(function()
	add("williamboman/mason.nvim")
	require("mason").setup()
end)

-- Formatting
later(function()
	add("stevearc/conform.nvim")
	source("plugins/conform.lua")
end)

-- Language server configurations
later(function()
	add("neovim/nvim-lspconfig")
	source("plugins/nvim-lspconfig.lua")
end)

-- Scope tabs
later(function()
	add("tiagovla/scope.nvim")
	require("scope").setup()
end)

-- Quickfix
later(function()
	add("stevearc/quicker.nvim")
	require("quicker").setup()
end)

-- Marks
later(function()
	add("gcmt/vessel.nvim")
  source("plugins/vessel.lua")
end)
