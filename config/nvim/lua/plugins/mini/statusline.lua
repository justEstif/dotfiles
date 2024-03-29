return {
	"echasnovski/mini.statusline",
	opts = {
		content = {
			active = function()
				local statusline = require("mini.statusline")

				local diagnostics = statusline.section_diagnostics({ trunc_width = 75 })
				local filename = statusline.section_filename({ trunc_width = 140 })
				local fileinfo = statusline.section_fileinfo({ trunc_width = 1200 })
				local location = statusline.section_location({ trunc_width = 1000 })

				return statusline.combine_groups({
					{ hl = "MiniStatuslineDevinfo", strings = { diagnostics } },
					"%<", -- Mark general truncate point
					{ hl = "MiniStatuslineFilename", strings = { filename } },
					"%=", -- End left alignment
					{ hl = "MiniStatuslineFileinfo", strings = { fileinfo } },
					{ hl = "MiniStatuslineModeNormal", strings = { location } },
				})
			end,
		},
	},
	config = true,
}
