-- Markdown: glow split reader + markdown-oxide PKM extras.
-- (render-markdown.nvim removed 2026-09: replaced by split-screen glow.)

local add = vim.pack.add
local later = Config.later

-- glow split ---------------------------------------------------------------
-- Vertical split running glow on the current file. Editor left, rendered
-- reader right; cursor always native in nvim. Rerun to close/reopen.
local glow = vim.fn.exepath("glow") ~= "" and vim.fn.exepath("glow")
	or vim.fn.expand("~/.local/share/mise/installs/glow/latest/glow_3.0.0_Linux_x86_64/glow")

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

vim.api.nvim_create_user_command("Glow", glow_split, {})
vim.keymap.set("n", "<Leader>mg", glow_split, { desc = "Toggle glow split reader" })

-- markdown-oxide extras ------------------------------------------------------
-- :Daily [today|tomorrow|yesterday|next monday|prev|next|+7|-3] — opens or
-- creates the daily note via the language server's jump command.
later(function()
	vim.api.nvim_create_autocmd("LspAttach", {
		callback = function(args)
			local client = vim.lsp.get_client_by_id(args.data.client_id)
			if client and client.name == "markdown_oxide" then
				vim.api.nvim_create_user_command("Daily", function(opts)
					vim.lsp.buf.execute_command({ command = "jump", arguments = { opts.args } })
				end, { desc = "Open daily note (natural language)", nargs = "*" })
			end
		end,
	})
end)
