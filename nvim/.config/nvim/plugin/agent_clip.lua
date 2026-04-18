-- Helper function to gather context and prompt the user
local function copy_for_agent(is_visual)
	-- 1. Gather file info
	local file = vim.fn.expand("%")
	if file == "" then
		file = "[No Name]"
	end
	local ft = vim.bo.filetype
	local lines = {}
	local range_str = ""

	-- 2. Gather code text
	if is_visual then
		local start_line = vim.fn.line("'<")
		local end_line = vim.fn.line("'>")
		if start_line > end_line then
			start_line, end_line = end_line, start_line
		end
		lines = vim.api.nvim_buf_get_lines(0, start_line - 1, end_line, false)
		range_str = string.format(" (Lines %d-%d)", start_line, end_line)
	else
		lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
	end
	local code_text = table.concat(lines, "\n")

	-- 3. Prompt the user for what they want to ask
	vim.ui.input({ prompt = "Ask Agent: " }, function(input)
		if not input then
			return
		end -- User pressed Esc to cancel

		-- 4. Format everything into a nice Markdown block
		local clipboard_text =
			string.format("%s\n\nContext from file: `%s`%s\n```%s\n%s\n```", input, file, range_str, ft, code_text)

		-- 5. Copy to system clipboard ('+' register)
		vim.fn.setreg("+", clipboard_text)

		-- 6. Notify using mini.notify if available, else fallback
		local msg = "Copied prompt + context to clipboard!"
		if _G.MiniNotify ~= nil then
			MiniNotify.add(msg, "INFO")
		else
			vim.notify(msg, vim.log.levels.INFO)
		end
	end)
end

-- Normal mode mapping: Grabs the entire current file/buffer
vim.keymap.set("n", "<leader>ac", function()
	copy_for_agent(false)
end, { desc = "Copy Context" })

-- Visual mode mapping: Grabs only the visually selected lines
vim.keymap.set({ "v", "x" }, "<leader>ac", function()
	-- Exit visual mode first so Neovim updates the '< and '> marks
	vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "x", false)

	-- Schedule the copy to run immediately after visual mode exits
	vim.schedule(function()
		copy_for_agent(true)
	end)
end, { desc = "Copy Context" })
