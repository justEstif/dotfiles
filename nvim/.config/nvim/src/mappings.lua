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
keymap("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- use 'cl' instead of 's'
keymap("n", [[s]], [[<Nop>]])
keymap("x", [[s]], [[<Nop>]])

keymap("n", "z=", ":Pick spellsuggest<cr>", { desc = "Spell suggest" })

keymap("n", "m.", "<Plug>(VesselSetLocalMark)", { desc = "Set local mark" })
keymap("n", "m,", "<Plug>(VesselSetGlobalMark)", { desc = "Set global mark" })
keymap("n", "`", ":Marks<cr>", { desc = "View marks" })
