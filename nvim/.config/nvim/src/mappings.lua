-- Helper function
local keymap = function(mode, keys, cmd, opts)
	opts = opts or {}
	if opts.silent == nil then
		opts.silent = true
	end
	vim.keymap.set(mode, keys, cmd, opts)
end

keymap("n", "<C-p>", "<Cmd>Pick files<CR>", {
	desc = "files",
})
keymap("n", [[g/]], "<Cmd>Pick grep_live<cr>", {
	desc = "live grep",
})
keymap("n", "<C-s>", "<Cmd>Pick buf_lines scope='current'<cr>", {
	desc = "live grep buffer",
})
keymap("n", "<space>", "<Cmd>lua MiniJump2d.start(MiniJump2d.builtin_opts.query)<CR>", {
	desc = "jump",
})
keymap("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- terminal
keymap("n", "<C-t>", ":Term<CR>", { desc = "Open term" })
keymap("t", "<Esc>", "<C-\\><C-n>", { desc = "Exit term" })

-- use 'cl' instead of 's'
keymap("n", [[s]], [[<Nop>]])
keymap("x", [[s]], [[<Nop>]])

keymap("n", "z=", ":Pick spellsuggest<cr>", { desc = "Spell suggest" })
