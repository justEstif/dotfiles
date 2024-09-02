_G.Config.leader_group_clues = {
	{
		mode = "n",
		keys = "<Leader>f",
		desc = "+Files",
	},
	{
		mode = "n",
		keys = "<Leader>b",
		desc = "+Buffers",
	},
	{
		mode = "n",
		keys = "<Leader>l",
		desc = "+Lsp",
	},
	{
		mode = "n",
		keys = "<Leader>v",
		desc = "+Visits",
	},
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

-- b is for 'buffer'
nmap_leader("bd", "<Cmd>lua MiniBufremove.delete()<CR>", "Delete")
nmap_leader("bl", "<Cmd>Pick buffers<CR>", "List")

-- l is for 'LSP' (Language Server Protocol)
nmap_leader("ld", "<Cmd>lua vim.diagnostic.open_float()<CR>", "Diagnostics popup")
nmap_leader("li", "<Cmd>lua vim.lsp.buf.hover()<CR>", "Information")
nmap_leader("lr", "<Cmd>lua vim.lsp.buf.rename()<CR>", "Rename")
nmap_leader("lR", '<Cmd>Pick lsp scope="references"<CR>', "References")
nmap_leader("ls", '<Cmd>Pick lsp scope="definition"<CR>', "Source Definition")

local formatting_cmd = '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR>'
nmap_leader("lf", formatting_cmd, "Format")
xmap_leader("lf", formatting_cmd, "Format selection")

-- v is for 'visits'
nmap_leader("vl", "<Cmd>lua MiniVisits.add_label()<CR>", "Add label")
nmap_leader("vL", "<Cmd>lua MiniVisits.remove_label()<CR>", "Remove label")
nmap_leader("vv", "<Cmd>Pick visit_labels<CR>", "Select label (cwd)")
