local add = vim.pack.add
local later = Config.later

later(function()
	local notebook_dir = vim.env.ZK_NOTEBOOK_DIR
	if not notebook_dir or notebook_dir == "" then
		error("todotxt.nvim requires the ZK_NOTEBOOK_DIR environment variable")
	end

	vim.filetype.add({
		filename = {
			["todo.txt"] = "todotxt",
			["done.txt"] = "todotxt",
		},
	})

	add({ "https://github.com/phrmendes/todotxt.nvim" })
	require("todotxt").setup({
		todotxt = notebook_dir .. "/todo.txt",
		donetxt = notebook_dir .. "/done.txt",
	})

	local opts = { desc = "todotxt" }
	vim.keymap.set("n", "<Leader>x", "<cmd>TodoTxt<cr>", { desc = "Toggle todo.txt" })
	vim.keymap.set("n", "<Leader>tn", "<cmd>TodoTxt new<cr>", { desc = "New todo entry" })
	vim.keymap.set("n", "<Leader>td", "<cmd>DoneTxt<cr>", opts)
	vim.keymap.set("n", "<Leader>tg", "<cmd>TodoTxt ghost<cr>", opts)
end)
