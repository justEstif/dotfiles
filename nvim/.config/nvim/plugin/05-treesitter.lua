local later = MiniDeps.later

later(function()
	vim.api.nvim_create_autocmd("FileType", {
		callback = function(ev)
			pcall(vim.treesitter.start, ev.buf)
		end,
	})

	vim.treesitter.query.set("lua", "injections", "")
end)
