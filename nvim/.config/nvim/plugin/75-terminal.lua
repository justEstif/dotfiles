local term_buf, term_win

local function toggle()
	if term_win and vim.api.nvim_win_is_valid(term_win) then
		vim.api.nvim_win_hide(term_win)
		term_win = nil
		return
	end

	vim.cmd("botright 15split")

	local alive = false
	if term_buf and vim.api.nvim_buf_is_valid(term_buf) then
		local job = vim.b[term_buf].terminal_job_id
		alive = job ~= nil and vim.fn.jobwait({ job }, 0)[1] == -1
		if alive then
			vim.api.nvim_set_current_buf(term_buf)
		end
	end
	if not alive then
		vim.cmd("terminal")
		term_buf = vim.api.nvim_get_current_buf()
		vim.bo[term_buf].bufhidden = "hide"
	end

	term_win = vim.api.nvim_get_current_win()
	vim.cmd("startinsert")
end

vim.keymap.set("n", "<leader>t", toggle, { desc = "Terminal (toggle)" })
vim.keymap.set("t", "<esc><esc>", "<C-\\><C-n>", { desc = "Exit terminal mode" })
