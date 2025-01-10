-- Disable the default 'K' vim.keymap.set
vim.keymap.set("n", "K", "<nop>")

vim.keymap.set("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- use 'cl' instead of 's'
vim.keymap.set("n", [[s]], [[<Nop>]])
vim.keymap.set("x", [[s]], [[<Nop>]])

-- use "Pick" spell suggest
vim.keymap.set("n", "z=", "<Cmd>lua MiniExtra.pickers.spellsuggest()<CR>", { desc = "Spelling suggest" })
vim.keymap.set("n", "'", '<Cmd>lua MiniExtra.pickers.marks({ scope = "global" }) <CR>', { desc = "Marks" })

-- Leader mappings ============================================================
_G.Config.leader_group_clues = {
	{ mode = "n", keys = "<Leader>f", desc = "+Files" },
	{ mode = "n", keys = "<Leader>g", desc = "+Git" },
	{ mode = "n", keys = "<Leader>l", desc = "+Lsp" },
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
nmap_leader("fd", "<Cmd>lua MiniFiles.open()<CR>", "Directory")
nmap_leader("ff", "<Cmd>lua MiniFiles.open(vim.api.nvim_buf_get_name(0))<CR>", "File directory")
nmap_leader("fh", "<Cmd>Pick help<CR>", "Help")
nmap_leader("f*", "<cmd>Pick grep pattern='<cword>'<cr>", "Grep under cursor")

-- git is for 'git'
nmap_leader("go", "<Cmd>lua MiniDiff.toggle_overlay()<CR>", "Toggle overlay")
nmap_leader("gs", "<Cmd>lua MiniGit.show_at_cursor()<CR>", "Show at cursor")
xmap_leader("gs", "<Cmd>lua MiniGit.show_at_cursor()<CR>", "Show at cursor")

-- l is for 'LSP' (Language Server Protocol)
nmap_leader("lD", '<Cmd>Pick diagnostic scope="all"<CR>', "Diagnostic workspace")
nmap_leader("lr", "<Cmd>lua vim.lsp.buf.rename()<CR>", "Rename")
nmap_leader("lR", "<Cmd>lua MiniExtra.pickers.lsp({ scope = 'references' })<CR>", "References")
nmap_leader("ls", "<Cmd>lua MiniExtra.pickers.lsp({ scope = 'definition' })<CR>", "Source Definition")
vim.keymap.set("n", "K", "<Cmd>lua vim.lsp.buf.hover()<CR>", { desc = "Hover" })

local formatting_cmd = '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>'
nmap_leader("lf", formatting_cmd, "Format")
xmap_leader("lf", formatting_cmd, "Format selection")
