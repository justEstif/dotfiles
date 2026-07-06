local now, later = Config.now, Config.later
local add = vim.pack.add

-- Picker keymaps (snacks.picker, configured in 51-snacks.lua). ui_select is
-- handled by snacks itself, so no manual vim.ui.select override here.
later(function()
	vim.keymap.set("n", [[g/]], function()
		Snacks.picker.grep()
	end, { desc = "live grep" })
	vim.keymap.set("n", "<C-p>", function()
		Snacks.picker.files()
	end, { desc = "files" })
	vim.keymap.set("n", "gb", function()
		Snacks.picker.buffers()
	end, { desc = "buffers" })
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
