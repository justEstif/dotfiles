local add = vim.pack.add
local later = Config.later

-- must exist before the vim.pack.add below so it fires on first install too
vim.api.nvim_create_autocmd("PackChanged", {
	callback = function(ev)
		local d = ev.data
		if d.spec.name == "nvim-treesitter" and d.kind == "update" then
			if not d.active then
				vim.cmd.packadd("nvim-treesitter")
			end
			vim.cmd("TSUpdate")
		end
	end,
})

later(function()
	add({ "https://github.com/nvim-treesitter/nvim-treesitter" })
	require("nvim-treesitter").install({ "rust" })
end)

later(function()
	vim.api.nvim_create_autocmd("FileType", {
		callback = function(ev)
			pcall(vim.treesitter.start, ev.buf)
		end,
	})

	vim.treesitter.query.set("lua", "injections", "")
end)
