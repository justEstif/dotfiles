-- Built-in directory viewer (dir.lua, Neovim 0.13).
--
-- `:edit <dir>` (or `-` for parent) opens a listing buffer. Customization happens
-- in the `User DirReadPost` event: the buffer is temporarily modifiable there, so
-- handlers can filter (hide dotfiles), sort (dirs first), and decorate (icons).
-- https://github.com/neovim/neovim/blob/master/runtime/lua/nvim/dir.lua

local ns = vim.api.nvim_create_namespace("nvim-dir-decorate")

-- Is the dotfile filter on? Toggled with `.` inside a listing.
vim.g.dir_hide_dotfiles = true

-- Decorate + sort + filter every (re)render. Runs before the cursor is placed.
vim.api.nvim_create_autocmd("User", {
	pattern = "DirReadPost",
	callback = function(args)
		local buf = args.buf
		local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
		vim.api.nvim_buf_clear_namespace(buf, ns, 0, -1)

		-- Split dirs/files (dirs sort first), drop dotfiles when filtering.
		local dirs, files = {}, {}
		for _, line in ipairs(lines) do
			local name = (line:gsub("/$", ""))
			if not (vim.g.dir_hide_dotfiles and name:find("^%.") and name ~= "../") then
				local target = line:find("/$") and dirs or files
				target[#target + 1] = { line = line, name = name }
			end
		end
		table.sort(dirs, function(a, b)
			return a.name < b.name
		end)
		table.sort(files, function(a, b)
			return a.name < b.name
		end)

		local out = {}
		for _, e in ipairs(dirs) do
			out[#out + 1] = e
		end
		for _, e in ipairs(files) do
			out[#out + 1] = e
		end

		-- Lines keep just the filename; icons/decoration go on extmarks, so
		-- text (completion, <CR>, grep) stays clean.
		local rendered = {}
		for i, e in ipairs(out) do
			rendered[i] = e.line
			local is_dir = e.line:find("/$") ~= nil
			local icon, hl
			if is_dir then
				icon, hl = require("mini.icons").get("directory", e.name)
			else
				icon, hl = require("mini.icons").get("file", e.name)
			end
			vim.api.nvim_buf_set_extmark(buf, ns, i - 1, 0, {
				virt_text = { { icon .. "  ", hl } },
				virt_text_pos = "inline",
			})
		end
		vim.api.nvim_buf_set_lines(buf, 0, -1, false, rendered)
	end,
	desc = "dir.lua: sort dirs-first, hide dotfiles, add icons",
})

-- Toggle dotfile visibility from within a listing.
-- Extra mappings inside listings (tree or full-window): path utilities.
local function entry_path()
	local line = vim.api.nvim_get_current_line()
	if line == "" then
		return nil
	end
	return vim.fs.joinpath(vim.fn.expand("%:p"), (line:gsub("/$", "")))
end

vim.api.nvim_create_autocmd("FileType", {
	pattern = "directory",
	callback = function(args)
		local opts = { buffer = args.buf, silent = true }
	vim.keymap.set("n", "<CR>", "<Plug>(nvim-dir-open)", vim.tbl_extend("force", opts, { remap = true, desc = "Open entry" }))
		vim.keymap.set("n", "gy", function()
			local p = entry_path()
			if p then
				vim.fn.setreg(vim.v.register, p)
				vim.notify("Yanked " .. p)
			end
		end, vim.tbl_extend("force", opts, { desc = "Yank path" }))
		vim.keymap.set("n", "g~", function()
			local p = entry_path()
			if p then
				vim.fn.chdir(vim.fn.isdirectory(p) == 1 and p or vim.fs.dirname(p))
				vim.notify("cwd: " .. vim.fn.getcwd())
			end
		end, vim.tbl_extend("force", opts, { desc = "Set cwd here" }))
		vim.keymap.set("n", "gX", function()
			local p = entry_path()
			if p then
				vim.ui.open(p)
			end
		end, vim.tbl_extend("force", opts, { desc = "OS open" }))
	end,
	desc = "dir listing: path utilities",
})

vim.keymap.set("n", ".", function()
	if vim.b.nvim_dir ~= nil then
		vim.g.dir_hide_dotfiles = not vim.g.dir_hide_dotfiles
		require("nvim.dir")._reload()
	end
end, { desc = "dir: toggle dotfiles" })

-- Persistent file-tree sidebar =================================================
-- dir.lua is buffer-based, so "persistence" = a dedicated pinned split (0.13
-- 'winpinned' keeps it from being closed by <C-w>o/quit-all). The listing follows
-- the file opened from it.

local function is_tree_open()
	for _, win in ipairs(vim.api.nvim_list_wins()) do
		local buf = vim.api.nvim_win_get_buf(win)
		if vim.b[buf].nvim_dir ~= nil and vim.w[win].dir_tree then
			return win
		end
	end
	return nil
end

local function open_tree()
	local main_win = vim.api.nvim_get_current_win()
	vim.cmd("leftabove vertical 32split")
	local tree_win = vim.api.nvim_get_current_win()
	vim.w[tree_win].dir_tree = true
	vim.w[tree_win].dir_main = main_win
	vim.wo[tree_win].winpinned = true
	vim.cmd("edit " .. vim.fn.fnameescape(vim.fn.getcwd()))

	vim.api.nvim_set_current_win(tree_win)
end

-- dir.lua's default <CR> edits the entry in the listing's own window, which
-- would replace the tree. Map the <Plug> globally (dir.lua only installs its
-- own buffer-local <CR> when the <Plug> is unmapped, and its hasmapto() check
-- ignores buffer-local maps, so a buffer-local override gets clobbered).
-- In tree windows files open in the recorded main window (a fresh split if it
-- died); directories navigate in place. Outside trees this is plain dir.lua.
local function open_entry_tree_aware()
	local tree_win = vim.api.nvim_get_current_win()
	if not vim.w[tree_win].dir_tree then
		require("nvim.dir")._open_entry()
		return
	end
	do
			local line = vim.api.nvim_get_current_line()
			if line == "" then
				return
			end
			local path = vim.fs.joinpath(vim.api.nvim_buf_get_name(0), (line:gsub("/$", "")))
			if vim.fn.isdirectory(path) == 1 then
				vim.cmd.edit(vim.fn.fnameescape(path))
				return
			end
			-- Target: the recorded main window, else the first non-tree normal
			-- window, else a fresh split created from the tree.
			local target = vim.w[tree_win].dir_main
			if not (target and vim.api.nvim_win_is_valid(target) and vim.w[target].dir_tree ~= true) then
				target = nil
				for _, cand in ipairs(vim.api.nvim_list_wins()) do
					if cand ~= tree_win and vim.w[cand].dir_tree ~= true
						and vim.api.nvim_win_get_config(cand).relative == ""
					then
						target = cand
						break
				end
			end
			end
			if not target then
				vim.cmd("rightbelow vertical new")
				target = vim.api.nvim_get_current_win()
				vim.w[tree_win].dir_main = target
				vim.api.nvim_set_current_win(tree_win)
			end
			vim.api.nvim_win_call(target, function()
				vim.cmd.edit(vim.fn.fnameescape(path))
			end)
			vim.api.nvim_set_current_win(target)
	end
end
-- $VIMRUNTIME sorts after ~/.config/nvim in 'runtimepath', so runtime's
-- plugin/dir.lua re-grabs the <Plug> after this file loads. Claim it once the
-- startup sequence is done.
vim.api.nvim_create_autocmd("VimEnter", {
	once = true,
	callback = function()
		vim.keymap.set("n", "<Plug>(nvim-dir-open)", open_entry_tree_aware, { silent = true, desc = "Open directory entry" })
	end,
})

vim.keymap.set("n", "<Leader>ft", function()
	local tree_win = is_tree_open()
	if tree_win then
		vim.api.nvim_win_close(tree_win, true)
	else
		open_tree()
	end
end, { desc = "Toggle file tree (dir.lua)" })
