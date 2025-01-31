-- Enable exrc for project-specific settings
vim.opt.exrc = true
vim.opt.secure = true -- Security for exrc

-- Function to get current git branch
local function get_git_branch()
	local branch = vim.fn.system("git rev-parse --abbrev-ref HEAD")
	if vim.v.shell_error ~= 0 then
		return nil
	end
	return vim.trim(branch)
end

-- Setup project and branch specific paths
local workspace_path = vim.fn.getcwd()
local cache_dir = vim.fn.stdpath("data")
local project_name = vim.fn.fnamemodify(workspace_path, ":t")
local git_branch = get_git_branch()

-- Construct the project directory path
local project_dir = cache_dir .. "/marks/" .. project_name
if git_branch then
	-- Add branch name to path if in a git repository
	project_dir = project_dir .. "/" .. git_branch
end

-- Create project directory if it doesn't exist
if vim.fn.isdirectory(project_dir) == 0 then
	vim.fn.mkdir(project_dir, "p")
end

-- Set project and branch specific shada file
local shadafile = project_dir .. "/" .. vim.fn.sha256(workspace_path):sub(1, 8)
if git_branch then
	-- Append branch name to shada file
	shadafile = shadafile .. "_" .. git_branch
end
shadafile = shadafile .. ".shada"

-- Set the shada file path
vim.opt.shadafile = shadafile

-- Configure marks to be saved in shada file
vim.opt.shada:append("f1") -- Save global marks (capital letters)

-- Optional: Add autocmd to update shada file on branch change
vim.api.nvim_create_autocmd("VimEnter", {
	pattern = "*",
	callback = function()
		-- Check if we're in a git repository
		local current_branch = get_git_branch()
		if current_branch then
			-- Update shadafile path if branch changes
			local new_shadafile = project_dir
				.. "/"
				.. vim.fn.sha256(workspace_path):sub(1, 8)
				.. "_"
				.. current_branch
				.. ".shada"
			vim.opt.shadafile = new_shadafile
		end
	end,
})

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

function M.remove_current_line_mark()
	local current_line = vim.api.nvim_win_get_cursor(0)[1]

	-- Check all marks for a match on the current line
	for mark, is_set in pairs(file_marks) do
		if is_set then
			local pos = vim.api.nvim_get_mark(mark, {})
			if pos[1] == current_line then
				M.release_mark(mark)
				vim.notify(string.format("Mark '%s' removed", mark))
				return
			end
		end
	end

	vim.notify("No mark found on current line", vim.log.levels.WARN)
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

	vim.api.nvim_create_user_command("MarkRemove", function()
		M.remove_current_line_mark()
	end, {})

	if opts.keymaps then
		vim.keymap.set("n", opts.keymaps.mark or "<Leader>m", ":Mark<CR>", { silent = true, desc = "Set project mark" })
		vim.keymap.set(
			"n",
			opts.keymaps.remove_mark or "<Leader>dm",
			":MarkRemove<CR>",
			{ silent = true, desc = "Remove mark on current line" }
		)
	end
end

later(function()
	M.setup({
		keymaps = {
			mark = "mm",
			remove_mark = "mM",
		},
	})
end)
