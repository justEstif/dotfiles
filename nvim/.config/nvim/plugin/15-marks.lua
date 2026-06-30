-- Per-project, per-branch shada scoping. Runs at source time (~18ms),
-- before shada is read (~90ms), so file marks A-Z are isolated per workspace.
local function get_git_branch()
	local branch = vim.fn.system("git rev-parse --abbrev-ref HEAD")
	if vim.v.shell_error ~= 0 then
		return nil
	end
	return vim.trim(branch)
end

local workspace_path = vim.fn.getcwd()
local project_name = vim.fn.fnamemodify(workspace_path, ":t")
local git_branch = get_git_branch()

local project_dir = vim.fn.stdpath("data") .. "/marks/" .. project_name
if git_branch then
	project_dir = project_dir .. "/" .. git_branch
end
if vim.fn.isdirectory(project_dir) == 0 then
	vim.fn.mkdir(project_dir, "p")
end

local shadafile = project_dir .. "/" .. vim.fn.sha256(workspace_path):sub(1, 8)
if git_branch then
	shadafile = shadafile .. "_" .. git_branch
end
vim.opt.shadafile = shadafile .. ".shada"
vim.opt.shada:append("f1")

local mark_signs_ns = vim.api.nvim_create_namespace("project_marks_signs")

local function refresh_mark_signs(bufnr)
	bufnr = bufnr or vim.api.nvim_get_current_buf()
	vim.api.nvim_buf_clear_namespace(bufnr, mark_signs_ns, 0, -1)

	for _, item in ipairs(vim.fn.getmarklist()) do
		local mark = item.mark:match("^'([A-Z])$")
		if mark and item.pos[1] == bufnr and item.pos[2] > 0 then
			vim.api.nvim_buf_set_extmark(bufnr, mark_signs_ns, item.pos[2] - 1, 0, {
				sign_text = mark,
				sign_hl_group = "DiagnosticHint",
				priority = 20,
			})
		end
	end
end

vim.api.nvim_create_autocmd({ "BufEnter", "BufWinEnter" }, {
	callback = function(args)
		refresh_mark_signs(args.buf)
	end,
})

-- Auto-allocate next free A-Z mark; Harpoon-style, no letter-picking.
local used = {}
for i = 65, 90 do
	used[string.char(i)] = false
end
for mark in pairs(used) do
	if vim.api.nvim_get_mark(mark, {})[1] ~= 0 then
		used[mark] = true
	end
end

local function next_mark()
	local free = {}
	for m in pairs(used) do
		free[#free + 1] = m
	end
	table.sort(free)
	for _, m in ipairs(free) do
		if not used[m] then
			return m
		end
	end
end

local function release(mark)
	if mark:match("[A-Z]") then
		used[mark] = false
		vim.cmd("delmarks " .. mark)
		vim.cmd("wshada!")
	end
end

local function set_mark()
	local mark = next_mark()
	if not mark then
		vim.notify("No available marks!", vim.log.levels.WARN)
		return
	end
	local pos = vim.api.nvim_win_get_cursor(0)
	vim.api.nvim_buf_set_mark(0, mark, pos[1], pos[2], {})
	used[mark] = true
	vim.cmd("wshada!")
	refresh_mark_signs()
	vim.notify(string.format("Mark '%s' set", mark))
end

local function remove_line_mark()
	local line = vim.api.nvim_win_get_cursor(0)[1]
	for mark, is_set in pairs(used) do
		if is_set and vim.api.nvim_get_mark(mark, {})[1] == line then
			release(mark)
			refresh_mark_signs()
			vim.notify(string.format("Mark '%s' removed", mark))
			return
		end
	end
	vim.notify("No mark found on current line", vim.log.levels.WARN)
end

local function clear_all()
	for mark in pairs(used) do
		release(mark)
	end
	refresh_mark_signs()
	vim.notify("All marks cleared")
end

vim.api.nvim_create_user_command("Mark", set_mark, {})
vim.api.nvim_create_user_command("MarkRemove", remove_line_mark, {})
vim.api.nvim_create_user_command("MarkClearAll", clear_all, {})

local function list_marks()
	Snacks.picker.marks()
end

vim.keymap.set("n", "mm", set_mark, { desc = "Set project mark" })
vim.keymap.set("n", "ml", list_marks, { desc = "List project marks" })
vim.keymap.set("n", "mM", remove_line_mark, { desc = "Remove mark on current line" })
vim.keymap.set("n", "mC", clear_all, { desc = "Clear all project marks" })
