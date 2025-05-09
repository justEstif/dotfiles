local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later

-- jump
later(function()
	local jump = require("mini.jump")
	jump.setup({
		mappings = {
			repeat_jump = "",
		},
	})
end)

-- mini git and diff
later(function()
	require("mini.git").setup()
end)

later(function()
	require("mini.diff").setup()
end)

later(function()
	require("mini.splitjoin").setup()
end)
later(function()
	require("mini.bracketed").setup()
end)
later(function()
	require("mini.move").setup()
end)
later(function()
	require("mini.operators").setup()
end)
later(function()
	require("mini.bufremove").setup()

	vim.keymap.set("n", "<C-q>", "<Cmd>lua MiniBufremove.delete()<CR>", {
		desc = "close current buffer",
	})
end)
later(function()
	require("mini.align").setup()
end)
later(function()
	local surround = require("mini.surround")
	surround.setup({
		search_method = "cover_or_nearest",
	})
	-- Disable `s` shortcut (use `cl` instead) for safer usage of 'mini.surround'
	vim.keymap.set({ "n", "x" }, "s", "<Nop>")
end)

later(function()
	local completion = require("mini.completion")
	completion.setup({
		lsp_completion = {
			source_func = "omnifunc",
			auto_setup = false,
		},
	})
	-- Set up LSP part of completion
	local on_attach = function(args)
		vim.bo[args.buf].omnifunc = "v:lua.MiniCompletion.completefunc_lsp"
	end
	vim.api.nvim_create_autocmd("LspAttach", { callback = on_attach })
	if vim.fn.has("nvim-0.11") == 1 then
		vim.lsp.config("*", { capabilities = MiniCompletion.get_lsp_capabilities() })
	end
end)

-- later(function()
-- 	require("mini.snippets").setup()
-- end)

later(function()
	local map_multistep = require("mini.keymap").map_multistep
	map_multistep("i", "<Tab>", { "pmenu_next" })
	map_multistep("i", "<S-Tab>", { "pmenu_prev" })
	map_multistep("i", "<CR>", { "pmenu_accept", "minipairs_cr" })
	map_multistep("i", "<BS>", { "minipairs_bs" })

	local notify_many_keys = function(key)
		local lhs = string.rep(key, 5)
		local action = function()
			vim.notify("Too many " .. key)
		end
		require("mini.keymap").map_combo({ "n", "x" }, lhs, action)
	end
	notify_many_keys("h")
	notify_many_keys("j")
	notify_many_keys("k")
	notify_many_keys("l")
end)

-- add all to quickfix list
local choose_all = function()
	local mappings = MiniPick.get_picker_opts().mappings
	vim.api.nvim_input(mappings.mark_all .. mappings.choose_marked)
end

later(function()
	local pick = require("mini.pick")

	pick.setup({
		mappings = {
			choose_all = { char = "<C-q>", func = choose_all },
		},
	})

	vim.ui.select = pick.ui_select
	vim.keymap.set("n", [[g/]], "<Cmd>Pick grep_live<cr>", {
		desc = "live grep",
	})
	vim.keymap.set("n", "<C-p>", "<Cmd>Pick files<CR>", {
		desc = "files",
	})
end)

now(function()
	local files = require("mini.files")
	files.setup({
		mappings = {
			go_in = "L",
			go_in_plus = "l",
			go_out = "H",
			go_out_plus = "h",
		},
	})

	-- Open in split
	local map_split = function(buf_id, lhs, direction, close_on_file)
		local rhs = function()
			local new_target_window
			local cur_target_window = files.get_explorer_state().target_window
			if cur_target_window ~= nil then
				vim.api.nvim_win_call(cur_target_window, function()
					vim.cmd("belowright " .. direction .. " split")
					new_target_window = vim.api.nvim_get_current_win()
				end)

				files.set_target_window(new_target_window)
				files.go_in({ close_on_file = close_on_file })
			end
		end

		local desc = "Open in " .. direction .. " split"
		if close_on_file then
			desc = desc .. " and close"
		end
		vim.keymap.set("n", lhs, rhs, { buffer = buf_id, desc = desc })
	end

	vim.api.nvim_create_autocmd("User", {
		pattern = "MiniFilesBufferCreate",
		callback = function(args)
			local buf_id = args.data.buf_id
			-- Tweak keys to your liking
			map_split(buf_id, "<C-s>", "horizontal", false)
			-- map_split(buf_id, "<C-v>", "vertical", false)
		end,
	})

	-- Show/hide dot-files
	local show_dotfiles = true

	local filter_show = function(fs_entry)
		return true
	end

	local filter_hide = function(fs_entry)
		return not vim.startswith(fs_entry.name, ".")
	end

	local toggle_dotfiles = function()
		show_dotfiles = not show_dotfiles
		local new_filter = show_dotfiles and filter_show or filter_hide
		files.refresh({ content = { filter = new_filter } })
	end

	vim.api.nvim_create_autocmd("User", {
		pattern = "MiniFilesBufferCreate",
		callback = function(args)
			local buf_id = args.data.buf_id
			-- Tweak left-hand side of mapping to your liking
			vim.keymap.set("n", "g.", toggle_dotfiles, { buffer = buf_id })
		end,
	})

	--- Set CWD
	local files_set_cwd = function(path)
		-- Works only if cursor is on the valid file system entry
		local cur_entry_path = MiniFiles.get_fs_entry().path
		local cur_directory = vim.fs.dirname(cur_entry_path)
		vim.fn.chdir(cur_directory)
	end

	vim.api.nvim_create_autocmd("User", {
		pattern = "MiniFilesBufferCreate",
		callback = function(args)
			vim.keymap.set("n", "g~", files_set_cwd, { buffer = args.data.buf_id })
		end,
	})

	local set_mark = function(id, path, desc)
		files.set_bookmark(id, path, { desc = desc })
	end
	vim.api.nvim_create_autocmd("User", {
		pattern = "MiniFilesExplorerOpen",
		callback = function()
			set_mark("w", vim.fn.getcwd, "Working directory") -- callable
		end,
	})
end)

later(function()
	add("tiagovla/scope.nvim")
	require("scope").setup()
end)

later(function()
	require("mini.extra").setup()
end)

later(function()
	local trailspace = require("mini.trailspace")
	trailspace.setup()
	vim.api.nvim_create_autocmd("BufWritePre", {
		group = vim.api.nvim_create_augroup("trim_whitespace", { clear = true }),
		callback = function()
			trailspace.trim()
			trailspace.trim_last_lines()
		end,
		desc = [[Trim trailing whitespace and empty lines on save]],
	})
end)
