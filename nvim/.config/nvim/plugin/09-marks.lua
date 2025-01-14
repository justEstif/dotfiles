local later = MiniDeps.later

local M = {}
local file_marks = {}

local function init_marks()
	for i = 65, 90 do
		file_marks[string.char(i)] = false
	end
end

local function scan_existing_marks()
	for mark, _ in pairs(file_marks) do
		local pos = vim.api.nvim_get_mark(mark, {})
		if pos[1] ~= 0 then
			file_marks[mark] = true
		end
	end
end

local function get_next_mark()
	-- Sort keys to ensure alphabetical order
	local marks = {}
	for mark in pairs(file_marks) do
		table.insert(marks, mark)
	end
	table.sort(marks)

	-- Find first unused mark
	for _, mark in ipairs(marks) do
		if not file_marks[mark] then
			return mark
		end
	end
	return nil
end

function M.set_mark()
	local mark = get_next_mark()
	if not mark then
		vim.notify("No available marks!", vim.log.levels.WARN)
		return
	end

	local pos = vim.api.nvim_win_get_cursor(0)
	local bufnr = vim.api.nvim_get_current_buf()
	vim.api.nvim_buf_set_mark(bufnr, mark, pos[1], pos[2], {})
	file_marks[mark] = true
	vim.cmd("wshada!")
	vim.notify(string.format("Mark '%s' set", mark))
end

function M.release_mark(mark)
	if mark:match("[A-Z]") then
		file_marks[mark] = false
		vim.cmd("delmarks " .. mark)
		vim.cmd("wshada!")
	end
end

function M.clear_all_marks()
	for mark, _ in pairs(file_marks) do
		M.release_mark(mark)
	end
	vim.notify("All marks cleared", vim.log.levels.INFO)
end

local function setup_autocommands()
	local augroup = vim.api.nvim_create_augroup("ProjectMarks", { clear = true })
	vim.api.nvim_create_autocmd("VimLeave", {
		group = augroup,
		callback = function()
			vim.cmd("wshada!")
		end,
	})
end

function M.setup(opts)
	opts = opts or {}
	init_marks()
	scan_existing_marks()
	setup_autocommands()

	vim.api.nvim_create_user_command("Mark", function()
		M.set_mark()
	end, {})

	vim.api.nvim_create_user_command("MarkClear", function()
		M.clear_all_marks()
	end, {})

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
