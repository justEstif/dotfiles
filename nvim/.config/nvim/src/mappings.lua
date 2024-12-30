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
keymap("n", "<C-q>", "<Cmd>lua MiniBufremove.delete()<CR>", {
	desc = "close current buffer",
})

local formatting_cmd = '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>'
keymap("n", "<C-s>", formatting_cmd, { desc = "Format and Save" })
keymap("x", "<C-s>", formatting_cmd, { desc = "Format and Save" })

-- Disable the default 'K' keymap
keymap("n", "K", "<nop>")

keymap("n", [[g/]], "<Cmd>Pick grep_live<cr>", {
	desc = "live grep",
})
keymap("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- use 'cl' instead of 's'
keymap("n", [[s]], [[<Nop>]])
keymap("x", [[s]], [[<Nop>]])

keymap("n", "z=", ":Pick spellsuggest<cr>", { desc = "Spell suggest" })
keymap("n", "`", ":Pick marks<cr>", { desc = "View marks" })
