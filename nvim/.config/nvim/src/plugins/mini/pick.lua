-- add all to quickfix list
local choose_all = function()
	local mappings = MiniPick.get_picker_opts().mappings
	vim.api.nvim_input(mappings.mark_all .. mappings.choose_marked)
end

local pick = require("mini.pick")
pick.setup({
	mappings = {
		choose_all = { char = "<C-q>", func = choose_all },
	},
})
vim.ui.select = pick.ui_select
