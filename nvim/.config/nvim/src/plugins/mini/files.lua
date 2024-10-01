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
		map_split(buf_id, "<C-v>", "vertical", false)
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
