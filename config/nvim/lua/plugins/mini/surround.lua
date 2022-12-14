local status, surround = pcall(require, "mini.surround")
if not status then
	print("mini.surround error")
	return
end

-- Replace vim-surround:
surround.setup({
	n_lines = 500,
	mappings = {
		add = "ys",
		delete = "ds",
		find = "",
		find_left = "",
		highlight = "",
		replace = "cs",
		update_n_lines = "",
		-- Add this only if you don't want to use extended mappings
		suffix_last = "",
		suffix_next = "",
	},
	search_method = "cover_or_nearest",
})

-- Remap adding surrounding to Visual mode selection
vim.api.nvim_del_keymap("x", "ys")
vim.api.nvim_set_keymap("x", "S", [[:<C-u>lua MiniSurround.add('visual')<CR>]], { noremap = true })

-- Make special mapping for "add surrounding for line"
vim.api.nvim_set_keymap("n", "yss", "ys_", { noremap = false })
