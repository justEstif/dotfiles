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
			return
		end
	end

	vim.cmd.vsplit()
	vim.cmd.wincmd("l")
	local width = math.floor(vim.api.nvim_win_get_width(0) * 0.9)
	local file = vim.fn.shellescape(vim.api.nvim_buf_get_name(0))
	vim.g.__glow_buf = vim.api.nvim_create_buf(false, true)
	vim.api.nvim_set_current_buf(vim.g.__glow_buf)
	vim.cmd("terminal " .. glow .. " -w " .. width .. " " .. file)
	vim.bo[vim.g.__glow_buf].filetype = "glow"
	vim.keymap.set({ "n", "t" }, "q", function()
		local w = vim.fn.win_findbuf(vim.g.__glow_buf)[1]
		if w then
			vim.api.nvim_win_close(w, true)
		end
	end, { buffer = vim.g.__glow_buf, desc = "Close glow split" })
	vim.cmd.wincmd("h")
end

if vim.fn.exists(":Glow") == 0 then
	vim.api.nvim_create_user_command("Glow", glow_split, {})
end
