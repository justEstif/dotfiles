local now, later = Config.now, Config.later
local add = vim.pack.add

-- Picker keymaps (mini.pick, configured below). ui_select routes through
-- mini.pick via pick.ui_select.
later(function()
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
	vim.keymap.set("n", [[g/]], "<Cmd>Pick grep_live<cr>", {
		desc = "live grep",
	})
	vim.keymap.set("n", "<C-p>", "<Cmd>Pick files<CR>", {
		desc = "files",
	})
	vim.keymap.set("n", "gb", "<Cmd>Pick buffers<CR>", {
		desc = "buffers",
	})
end)


later(function()
	require("mini.bufremove").setup()

	vim.keymap.set("n", "<C-q>", "<Cmd>lua MiniBufremove.delete()<CR>", {
		desc = "close current buffer",
	})
end)

later(function()
	add({ "https://github.com/tiagovla/scope.nvim" })
	require("scope").setup()
end)

later(function()
	require("mini.visits").setup()
end)
