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
