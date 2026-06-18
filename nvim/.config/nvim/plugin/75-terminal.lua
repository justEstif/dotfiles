local function alive(buf)
	return buf ~= nil
		and vim.api.nvim_buf_is_valid(buf)
		and vim.b[buf].terminal_job_id ~= nil
		and vim.fn.jobwait({ vim.b[buf].terminal_job_id }, 0)[1] == -1
end

-- ,tt  full-screen tab terminal (flip-flops back to where you were)
local tab = { buf = nil, page = nil, prev = nil }
local function tab_toggle()
	if tab.page and vim.api.nvim_tabpage_is_valid(tab.page)
		and vim.api.nvim_get_current_tabpage() == tab.page
	then
		if tab.prev and vim.api.nvim_tabpage_is_valid(tab.prev) then
			vim.api.nvim_set_current_tabpage(tab.prev)
		end
		return
	end
	if alive(tab.buf) and tab.page and vim.api.nvim_tabpage_is_valid(tab.page) then
		tab.prev = vim.api.nvim_get_current_tabpage()
		vim.api.nvim_set_current_tabpage(tab.page)
		vim.cmd("startinsert")
		return
	end
	if tab.buf and vim.api.nvim_buf_is_valid(tab.buf) then
		vim.api.nvim_buf_delete(tab.buf, { force = true })
	end
	tab.prev = vim.api.nvim_get_current_tabpage()
	vim.cmd("tabnew")
	local win = vim.api.nvim_get_current_win()
	local empty = vim.api.nvim_get_current_buf()
	tab.buf = vim.api.nvim_create_buf(false, true)
	vim.api.nvim_win_set_buf(win, tab.buf)
	vim.api.nvim_buf_delete(empty, { force = true })
	vim.bo[tab.buf].bufhidden = "hide"
	vim.api.nvim_buf_call(tab.buf, function()
		vim.fn.termopen(vim.o.shell)
	end)
	tab.page = vim.api.nvim_get_current_tabpage()
	vim.cmd("startinsert")
end

-- ,tf  centered floating terminal
local flt = { buf = nil, win = nil }
local function float_toggle()
	if flt.win and vim.api.nvim_win_is_valid(flt.win) then
		vim.api.nvim_win_hide(flt.win)
		flt.win = nil
		return
	end
	if not alive(flt.buf) then
		if flt.buf and vim.api.nvim_buf_is_valid(flt.buf) then
			vim.api.nvim_buf_delete(flt.buf, { force = true })
		end
		flt.buf = vim.api.nvim_create_buf(false, true)
		vim.bo[flt.buf].bufhidden = "hide"
		vim.api.nvim_buf_call(flt.buf, function()
			vim.fn.termopen(vim.o.shell)
		end)
	end
	local width = math.floor(vim.o.columns * 0.8)
	local height = math.floor(vim.o.lines * 0.7)
	flt.win = vim.api.nvim_open_win(flt.buf, true, {
		relative = "editor",
		width = width,
		height = height,
		row = math.floor((vim.o.lines - height) / 2),
		col = math.floor((vim.o.columns - width) / 2),
		border = "rounded",
	})
	vim.cmd("startinsert")
end

vim.keymap.set("n", "<leader>tt", tab_toggle, { desc = "Terminal tab" })
vim.keymap.set("n", "<leader>tf", float_toggle, { desc = "Terminal float" })
vim.keymap.set("t", "<esc><esc>", "<C-\\><C-n>", { desc = "Exit terminal mode" })
