local later = MiniDeps.later

-- jump
later(function()
	local jump = require("mini.jump")
	jump.setup({
		mappings = {
			repeat_jump = "",
		},
	})
end)

later(function()
	require("mini.bracketed").setup({
		diagnostic = {
			options = {
				float = false,
			},
		},
	})
end)

later(function()
	require("mini.move").setup()
	require("mini.operators").setup()
	require("mini.align").setup()
	require("mini.splitjoin").setup()
	require("mini.git").setup()
	require("mini.diff").setup()
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
