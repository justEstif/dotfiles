local M = {}

-- Function for creating global keymaps
M.map = function(mode, lhs, rhs, opts)
	local options = { silent = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.keymap.set(mode, lhs, rhs, options)
end

-- Function for creating buffer keymaps
M.buf_map = function(mode, lhs, rhs, opts)
	local options = { silent = true, buffer = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.keymap.set(mode, lhs, rhs, options)
end

-- Function to close buffer
-- - If no buffer open, close neovim
-- - Else close buffer
M.smart_qq = function()
	local no_open_buffer = #vim.fn.filter(vim.fn.range(1, vim.fn.bufnr("$")), "buflisted(v:val)") == 1
	local empty_buffer = vim.fn.expand("%") == ""

	if empty_buffer and no_open_buffer then
		if not pcall(vim.api.nvim_command, "quit") then
			print("Unsaved changes")
		end
	else
		if not pcall(vim.api.nvim_command, "bdelete") then
			print("Unsaved changes")
		end
	end
end

return M
