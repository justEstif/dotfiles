-- Disable the default 'K' vim.keymap.set
vim.keymap.set("n", "K", "<nop>")

vim.keymap.set("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- use 'cl' instead of 's'
vim.keymap.set("n", [[s]], [[<Nop>]])
vim.keymap.set("x", [[s]], [[<Nop>]])

-- use MiniPick spell suggest
vim.keymap.set("n", "z=", "<Cmd>lua MiniExtra.pickers.spellsuggest()<CR>", { desc = "Spelling suggest" })

-- Leader mappings ============================================================
_G.Config.leader_group_clues = {
	{ mode = "n", keys = "<Leader>f", desc = "+Files" },
	{ mode = "n", keys = "<Leader>l", desc = "+Lsp" },
	{ mode = "n", keys = "<Leader>p", desc = "+Packages" },
}

-- Create `<Leader>` mappings
local nmap_leader = function(suffix, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set("n", "<Leader>" .. suffix, rhs, opts)
end
local xmap_leader = function(suffix, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set("x", "<Leader>" .. suffix, rhs, opts)
end

-- f is for 'explore' and 'edit'
nmap_leader("fd", "<Cmd>lua require('nvim-tree.api').tree.toggle({ focus = true, path = vim.fn.getcwd() })<CR>", "Directory (nvim-tree)")
nmap_leader("ff", "<Cmd>lua require('nvim-tree.api').tree.toggle({ focus = true, find_file = true })<CR>", "File directory (nvim-tree)")
nmap_leader("fh", "<Cmd>Pick help<CR>", "Help")
nmap_leader("f*", "<cmd>Pick grep pattern='<cword>'<cr>", "Grep under cursor")
nmap_leader("fv", "<Cmd>Pick visit_paths<CR>", "Frecency")

-- p is for 'packages'
nmap_leader("pu", "<Cmd>packupdate<CR>", "Update plugins (vim.pack)")

-- 0.13: structural Treesitter selection. In Visual mode, expand/adjust the
-- selection to syntax-tree nodes; repeat to grow to sibling nodes.
vim.keymap.set("v", "gs", function()
	vim.treesitter.select()
end, { desc = "Treesitter structural select" })
xmap_leader("f*", "<cmd>Pick grep pattern='<cword>'<cr>", "Grep under cursor")

-- l is for 'LSP' (Language Server Protocol)
nmap_leader("la", "<Cmd>lua vim.lsp.buf.code_action()<CR>", "Actions")
nmap_leader("lD", '<Cmd>Pick diagnostic scope="all"<CR>', "Diagnostic workspace")
nmap_leader("lr", "<Cmd>lua vim.lsp.buf.rename()<CR>", "Rename")
nmap_leader("lR", "<Cmd>lua MiniExtra.pickers.lsp({ scope = 'references' })<CR>", "References")
nmap_leader("ls", "<Cmd>lua MiniExtra.pickers.lsp({ scope = 'definition' })<CR>", "Source Definition")
nmap_leader("lf", '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>', "Format")
xmap_leader("lf", '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>', "Format selection")

vim.keymap.set("n", "K", "<Cmd>lua vim.lsp.buf.hover()<CR>", { desc = "Hover" })
