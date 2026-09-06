-- Vault workspace. Activates only when nvim starts inside ~/.nb/nb-vault.
--
-- Layout (VimEnter):
--   left:  mini.files explorer (go_in targets the note window)
--   right: today's daily note (fallback: README.md)
--
-- Preview: <localleader>p toggles a glow terminal split for the current
-- note; it re-renders on every save (glow 3.x has no --watch).
local uv = vim.uv or vim.loop

local vault = uv.fs_realpath(vim.fn.expand("~/.nb/nb-vault"))
if vault == nil or vim.fn.getcwd(0):sub(1, #vault) ~= vault then
	return
end

local preview = { win = nil, buf = nil }

local close_preview = function()
	if preview.win ~= nil and vim.api.nvim_win_is_valid(preview.win) then
		vim.api.nvim_win_close(preview.win, true)
	end
	preview.win = nil
	preview.buf = nil
end

local render_preview = function(path)
	if preview.win == nil or not vim.api.nvim_win_is_valid(preview.win) then
		return
	end
	vim.api.nvim_win_call(preview.win, function()
		if preview.buf ~= nil and vim.api.nvim_buf_is_valid(preview.buf) then
			vim.api.nvim_buf_delete(preview.buf, { force = true })
		end
		vim.cmd("enew")
		preview.buf = vim.api.nvim_get_current_buf()
		vim.fn.termopen({ "glow", "-s", "auto", "-w", "78", path }, {
			on_exit = function()
				vim.cmd("stopinsert")
			end,
		})
		vim.bo[preview.buf].filetype = "glowpreview"
	end)
end

local toggle_preview = function()
	if preview.win ~= nil and vim.api.nvim_win_is_valid(preview.win) then
		return close_preview()
	end
	local note_win = vim.api.nvim_get_current_win()
	vim.cmd("rightbelow vsplit")
	preview.win = vim.api.nvim_get_current_win()
	render_preview(vim.api.nvim_buf_get_name(0))
	vim.api.nvim_set_current_win(note_win)
end

-- Vault-scoped buffer mappings + save re-render
local vault_group = vim.api.nvim_create_augroup("vault", { clear = true })

local map_preview = function(buf)
	vim.keymap.set("n", "<localleader>p", toggle_preview, {
		buffer = buf,
		desc = "Glow preview (toggle)",
	})
end

vim.api.nvim_create_autocmd({ "BufReadPost", "BufNewFile" }, {
	group = vault_group,
	pattern = { vault .. "/**.md" },
	callback = function(args)
		map_preview(args.buf)
	end,
})

vim.api.nvim_create_autocmd("BufWritePost", {
	group = vault_group,
	pattern = { vault .. "/**.md" },
	callback = function(args)
		render_preview(args.file)
	end,
})

vim.api.nvim_create_autocmd("VimEnter", {
	group = vault_group,
	once = true,
	callback = function()
		-- right pane: today's daily note, falling back to the README
		local daily = ("%s/daily/%s.md"):format(vault, os.date("%Y-%m-%d"))
		local target = vim.fn.filereadable(daily) == 1 and daily
			or (vault .. "/README.md")
		vim.cmd.edit(vim.fn.fnameescape(target))
		map_preview(vim.api.nvim_get_current_buf())

		-- left pane: mini.files explorer targeting the note window
		local note_win = vim.api.nvim_get_current_win()
		local files_ok, files = pcall(require, "mini.files")
		if files_ok then
			files.open(vault, true) -- keep focus on the note
			files.set_target_window(note_win)
			vim.api.nvim_set_current_win(note_win)
		end
	end,
})
