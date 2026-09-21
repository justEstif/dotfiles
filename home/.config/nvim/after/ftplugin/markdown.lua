-- Enable spell checking and soft wrap.
vim.opt_local.spell = true
vim.opt_local.wrap = true

-- Pencil-style prose defaults
vim.opt_local.linebreak = true
vim.opt_local.breakindent = true
vim.opt_local.showbreak = "↪ "
vim.opt_local.expandtab = true
vim.opt_local.formatoptions:remove({ "r", "o" }) -- don't auto-continue list markers outside insert

-- Vertical split running glow on the current file. Editor left, rendered
-- reader right; cursor always native in nvim. Rerun to close/reopen.
local glow = vim.fn.exepath("glow")

local function glow_split()
	for _, win in ipairs(vim.api.nvim_list_wins()) do
		local buf = vim.api.nvim_win_get_buf(win)
		if vim.bo[buf].buftype == "terminal" and buf == vim.g.__glow_buf then
			vim.api.nvim_win_close(win, true)
			pcall(vim.api.nvim_del_augroup_by_name, "MarkdownGlowSync")
			return
		end
	end

	local markdown_win = vim.api.nvim_get_current_win()
	local markdown_buf = vim.api.nvim_get_current_buf()

	vim.cmd.vsplit()
	vim.cmd.wincmd("l")
	local glow_win = vim.api.nvim_get_current_win()
	local width = math.floor(vim.api.nvim_win_get_width(glow_win) * 0.9)
	local file = vim.fn.shellescape(vim.api.nvim_buf_get_name(markdown_buf))
	vim.g.__glow_buf = vim.api.nvim_create_buf(false, true)
	local glow_buf = vim.g.__glow_buf
	vim.api.nvim_set_current_buf(glow_buf)
	vim.cmd("terminal " .. glow .. " -w " .. width .. " " .. file)
	vim.bo[glow_buf].filetype = "glow"

	local sync_group = vim.api.nvim_create_augroup("MarkdownGlowSync", { clear = true })
	local syncing = false

	local function scroll_percentage(win)
		local line_count = vim.api.nvim_buf_line_count(vim.api.nvim_win_get_buf(win))
		local height = vim.api.nvim_win_get_height(win)
		local max_topline = math.max(line_count - height, 0)
		if max_topline == 0 then
			return 0
		end

		local topline = vim.api.nvim_win_call(win, function()
			return vim.fn.line("w0")
		end)
		return (topline - 1) / max_topline
	end

	local function sync_scroll(source_win, target_win, percentage)
		if syncing or not vim.api.nvim_win_is_valid(source_win) or not vim.api.nvim_win_is_valid(target_win) then
			return
		end

		syncing = true
		percentage = percentage or scroll_percentage(source_win)
		local target_lines = vim.api.nvim_buf_line_count(vim.api.nvim_win_get_buf(target_win))
		local target_height = vim.api.nvim_win_get_height(target_win)
		local target_max_topline = math.max(target_lines - target_height, 0)
		local target_topline = math.floor(percentage * target_max_topline + 0.5) + 1

		vim.api.nvim_win_call(target_win, function()
			local view = vim.fn.winsaveview()
			view.topline = target_topline
			vim.fn.winrestview(view)
		end)
		vim.schedule(function()
			syncing = false
		end)
	end

	vim.api.nvim_create_autocmd("CursorMoved", {
		group = sync_group,
		buffer = markdown_buf,
		callback = function()
			local line_count = vim.api.nvim_buf_line_count(markdown_buf)
			local cursor_line = vim.api.nvim_win_get_cursor(markdown_win)[1]
			local percentage = line_count > 1 and (cursor_line - 1) / (line_count - 1) or 0
			sync_scroll(markdown_win, glow_win, percentage)
		end,
	})
	vim.api.nvim_create_autocmd("WinScrolled", {
		group = sync_group,
		pattern = tostring(markdown_win),
		callback = function()
			sync_scroll(markdown_win, glow_win)
		end,
	})
	vim.api.nvim_create_autocmd("WinScrolled", {
		group = sync_group,
		pattern = tostring(glow_win),
		callback = function()
			sync_scroll(glow_win, markdown_win)
		end,
	})
	vim.api.nvim_create_autocmd("TermClose", {
		group = sync_group,
		buffer = glow_buf,
		once = true,
		callback = function()
			sync_scroll(markdown_win, glow_win)
		end,
	})

	vim.keymap.set({ "n", "t" }, "q", function()
		local w = vim.fn.win_findbuf(glow_buf)[1]
		if w then
			vim.api.nvim_win_close(w, true)
		end
		pcall(vim.api.nvim_del_augroup_by_id, sync_group)
	end, { buffer = glow_buf, desc = "Close glow split" })
	vim.cmd.wincmd("h")
end

if vim.fn.exists(":Glow") == 0 then
	vim.api.nvim_create_user_command("Glow", glow_split, {})
end
