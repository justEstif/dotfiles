local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later

later(function()
	add("stevearc/quicker.nvim")
	local quicker = require("quicker")
	quicker.setup({
		keys = {
			{
				">",
				function()
					quicker.expand({ before = 2, after = 2, add_to_existing = true })
				end,
				desc = "Expand quickfix context",
			},
			{
				"<",
				function()
					quicker.collapse()
				end,
				desc = "Collapse quickfix context",
			},
		},
	})
end)

later(function()
	add("tiagovla/scope.nvim")
	require("scope").setup()
end)

now(function()
	add("catppuccin/nvim")
	local theme = require("catppuccin")

	theme.setup({
		background = {
			dark = "macchiato",
			light = "latte",
		},
	})

	vim.cmd.colorscheme("catppuccin")
	-- vim.o.background = "dark"
end)

now(function()
	local icons = require("mini.icons")
	icons.setup()

	icons.mock_nvim_web_devicons()
	later(MiniIcons.tweak_lsp_kind)
end)

later(function()
	require("mini.extra").setup()
end)

later(function()
	require("mini.hipatterns").setup()
end)

now(function()
	require("mini.tabline").setup()
end)

local filterout_lua_diagnosing = function(notif_arr)
	local not_diagnosing = function(notif)
		return not vim.startswith(notif.msg, "lua_ls: Diagnosing")
	end
	notif_arr = vim.tbl_filter(not_diagnosing, notif_arr)
	return MiniNotify.default_sort(notif_arr)
end

now(function()
	local notify = require("mini.notify")

	notify.setup({
		content = {
			sort = filterout_lua_diagnosing,
		},
		window = {
			config = {
				border = "rounded",
			},
		},
	})

	vim.notify = notify.make_notify()
end)

now(function()
	local statusline = require("mini.statusline")
	statusline.setup({
		use_icons = false,
		set_vim_settings = false,
		content = {
			active = function()
				local mode, mode_hl = MiniStatusline.section_mode({ trunc_width = 50 })
				local filename = MiniStatusline.section_filename({ trunc_width = 140 })
				local git = MiniStatusline.section_git({ trunc_width = 75, icon = "" })
				local diff = MiniStatusline.section_diff({ trunc_width = 75, icon = "" })
				local diagnostics = MiniStatusline.section_diagnostics({
					trunc_width = 75,
					icon = "",
					signs = { ERROR = "!", WARN = "?", INFO = "@", HINT = "*" },
				})

				local devinfo
				if git == "" then
					devinfo = diff == " -" and "" or diff
				else
					devinfo = git .. (diff == " -" and " " or (" │" .. diff))
				end

				return MiniStatusline.combine_groups({
					{ hl = mode_hl, strings = { mode:upper() } },
					{ hl = "MiniStatuslineDevinfo", strings = { diagnostics } },
					"%<", -- Mark general truncate point
					{ hl = "MiniStatuslineFilename", strings = { filename } },
					"%=", -- End left alignment
					{ hl = "MiniStatuslineDevinfo", strings = { devinfo } },
					{ hl = mode_hl, strings = { "%-2l,%-2v" } },
				})
			end,
		},
	})
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
			move_with_alt = true,
		},
	})
end)
