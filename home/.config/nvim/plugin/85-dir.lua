-- nvim-tree.lua file explorer, replacing the built-in dir.lua setup.
-- <Leader>ft toggles the tree; it follows the current file and is the
-- replacement for the old dir.lua sidebar.

Config.now(function()
	-- netrw is already disabled in 10-settings.lua (nvim-tree handles browsing).
	require("nvim-tree").setup({
		sort = {
			folders_first = true,
		},
		filters = {
			dotfiles = false, -- toggle with `.` inside the tree (see on_attach)
		},
		view = {
			width = 32,
			side = "left",
		},
		renderer = {
			group_empty = true,
		},
		-- Files open in the main window; cursor returns to the tree only for dirs.
		actions = {
			open_file = {
				quit_on_open = false,
				window_picker = {
					enable = true,
					chars = "asdfghjkl",
				},
			},
		},
		on_attach = function(bufnr)
			local api = require("nvim-tree.api")
			api.config.mappings.default_on_attach(bufnr)

			local opts = { buffer = bufnr, silent = true }
			vim.keymap.set("n", ".", function()
				require("nvim-tree.api").tree.toggle_hidden_filter()
			end, vim.tbl_extend("force", opts, { desc = "nvim-tree: toggle dotfiles" }))
			-- yank mappings removed: nvim-tree defaults already cover them
			-- (`y` name, `Y` relative path, `gy` absolute path)
			vim.keymap.set("n", "g~", api.tree.change_root_to_node, vim.tbl_extend("force", opts, { desc = "Set cwd here" }))
			vim.keymap.set("n", "gX", function()
				local node = api.tree.get_node_under_cursor()
				if node then
					vim.ui.open(node.absolute_path)
				end
			end, vim.tbl_extend("force", opts, { desc = "OS open" }))
		end,
	})
end)

vim.keymap.set("n", "<Leader>ft", function()
	require("nvim-tree.api").tree.toggle({ focus = true, find_file = true })
end, { desc = "Toggle file tree (nvim-tree)" })

-- Replace directory-style habits from the dir.lua days: `-` opens the tree on
-- the current file's parent instead of a netrw listing.
vim.keymap.set("n", "-", function()
	require("nvim-tree.api").tree.toggle({ focus = true, find_file = true, path = vim.fn.getcwd() })
end, { desc = "File tree (cwd)" })
