-- Terminal handling, backed by snacks.terminal (configured in 51-snacks.lua).
-- A single toggleable bottom split is all this config needs.

-- `<Leader>tt` toggles the persistent bottom-split terminal.
-- `<count><Leader>tt` opens a distinct terminal with that id (snacks feature).
vim.keymap.set("n", "<Leader>tt", function()
	Snacks.terminal.toggle()
end, { desc = "Terminal (bottom split)" })

-- Open a fresh floating terminal for an ad-hoc command.
vim.keymap.set("n", "<Leader>tf", function()
	Snacks.terminal.open(nil, { win = { position = "float" } })
end, { desc = "Terminal (float)" })

-- `<Esc><Esc>` to leave terminal mode, on top of snacks' double-Esc behavior.
vim.keymap.set("t", "<esc><esc>", "<C-\\><C-n>", { desc = "Exit terminal mode" })
