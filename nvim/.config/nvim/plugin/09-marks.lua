local later = MiniDeps.later

-- Project-specific marks manager
local M = {}

-- Available marks: A-Z for global/file marks only
local file_marks = {}

-- Initialize available marks (only uppercase/file marks)
local function init_marks()
	for i = 65, 90 do -- ASCII for A-Z
		file_marks[string.char(i)] = false
	end
end

-- Scan existing marks and mark them as used
local function scan_existing_marks()
	for mark, _ in pairs(file_marks) do
		local pos = vim.api.nvim_get_mark(mark, {})
		if pos[1] ~= 0 then -- Mark exists
			file_marks[mark] = true
		end
	end
end

-- Find next available mark
local function get_next_mark()
	for mark, used in pairs(file_marks) do
		if not used then
			return mark
		end
	end
	return nil -- No available marks
end

-- Set a mark at current position
function M.set_mark()
	local mark = get_next_mark()
	if not mark then
		vim.notify("No available marks!", vim.log.levels.WARN)
		return
	end

	local pos = vim.api.nvim_win_get_cursor(0)
	local bufnr = vim.api.nvim_get_current_buf()

	-- Set the mark (will be automatically global since it's uppercase)
	vim.api.nvim_buf_set_mark(bufnr, mark, pos[1], pos[2], {})
	file_marks[mark] = true

	-- Write to shada file to persist mark
	vim.cmd("wshada!")

	vim.notify(string.format("Mark '%s' set", mark))
end

-- Release a mark when no longer needed
function M.release_mark(mark)
	if mark:match("[A-Z]") then
		file_marks[mark] = false
		-- Update shada file to remove the mark
		vim.cmd("delmarks " .. mark)
		vim.cmd("wshada!")
	end
end

-- Clear all marks
function M.clear_all_marks()
	-- Clear all uppercase marks A-Z
	for mark, _ in pairs(file_marks) do
		M.release_mark(mark)
	end
	vim.notify("All marks cleared", vim.log.levels.INFO)
end

-- Auto-release marks when leaving Neovim
local function setup_autocommands()
	local augroup = vim.api.nvim_create_augroup("ProjectMarks", { clear = true })

	-- Save marks to shada file when leaving Neovim
	vim.api.nvim_create_autocmd("VimLeave", {
		group = augroup,
		callback = function()
			vim.cmd("wshada!")
		end,
	})
end

-- Initialize the module
function M.setup(opts)
	opts = opts or {}

	-- Initialize marks tracking
	init_marks()

	-- Scan for existing marks
	scan_existing_marks()

	-- Setup autocommands
	setup_autocommands()

	-- Create command for easy usage
	vim.api.nvim_create_user_command("Mark", function()
		M.set_mark()
	end, {})

	vim.api.nvim_create_user_command("MarkClear", function()
		M.clear_all_marks()
	end, {})

	-- Optional keymap setup
	if opts.keymaps then
		vim.keymap.set("n", opts.keymaps.mark or "<Leader>m", ":Mark<CR>", { silent = true, desc = "Set project mark" })
	end
end

later(function()
	M.setup({
		keymaps = {
			mark = "mm",
		},
	})
end)
