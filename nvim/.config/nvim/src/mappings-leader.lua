_G.Config.leader_group_clues = {
	{ mode = "n", keys = "<Leader>b", desc = "+Buffers" },
	{ mode = "n", keys = "<Leader>f", desc = "+Files" },
	{ mode = "n", keys = "<Leader>g", desc = "+Git" },
	{ mode = "n", keys = "<Leader>l", desc = "+Lsp" },
	{ mode = "n", keys = "<Leader>v", desc = "+Visits" },
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
nmap_leader("f*", "<cmd>Pick grep pattern='<cword>'<cr>", "Grep string under cursor")
nmap_leader("fv", "<Cmd>Pick visit_paths<CR>", "Visit paths (cwd)")
nmap_leader("fV", '<Cmd>Pick visit_paths cwd=""<CR>', "Visit paths (all)")

-- b is for 'buffer'
nmap_leader("bd", "<Cmd>lua MiniBufremove.delete()<CR>", "Delete")
nmap_leader("bl", "<Plug>(VesselViewBuffers)", "List")

-- git is for 'git'
nmap_leader("go", "<Cmd>lua MiniDiff.toggle_overlay()<CR>", "Toggle overlay")

-- l is for 'LSP' (Language Server Protocol)
nmap_leader("ld", "<Cmd>lua vim.diagnostic.open_float()<CR>", "Diagnostics popup")
nmap_leader("lD", '<Cmd>Pick diagnostic scope="all"<CR>', "Diagnostic workspace")
nmap_leader("li", "<Cmd>lua vim.lsp.buf.hover()<CR>", "Information")
nmap_leader("lr", "<Cmd>lua vim.lsp.buf.rename()<CR>", "Rename")
nmap_leader("lR", '<Cmd>Pick lsp scope="references"<CR>', "References")
nmap_leader("ls", '<Cmd>Pick lsp scope="definition"<CR>', "Source Definition")

local formatting_cmd = '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR>'
nmap_leader("lf", formatting_cmd, "Format")
xmap_leader("lf", formatting_cmd, "Format selection")

-- 'v' stands for 'visits'
local map_vis = function(keys, call, desc)
	local rhs = "<Cmd>lua MiniVisits." .. call .. "<CR>"
	vim.keymap.set("n", "<Leader>" .. keys, rhs, { desc = desc })
end

-- General label operations
map_vis("vl", "add_label()", "Add label")
map_vis("vL", "remove_label()", "Remove label")

-- Core visit operations
map_vis("vc", 'select_path("", { filter = "core" })', "Select core visits (all)")
map_vis("vC", 'select_path(nil, { filter = "core" })', "Select core visits (cwd)")
map_vis("vv", 'add_label("core")', 'Add "core" label')
map_vis("vV", 'remove_label("core")', 'Remove "core" label')

-- Function to get the current Git branch name
local get_branch_name = function()
	local branch = vim.fn.system("git rev-parse --abbrev-ref HEAD")
	if vim.v.shell_error ~= 0 then
		return nil
	end
	return vim.trim(branch)
end

-- Branch-specific label operations
map_vis("vb", 'add_label("' .. get_branch_name() .. '")', "Add current branch label")
map_vis("vB", 'remove_label("' .. get_branch_name() .. '")', "Remove current branch label")
map_vis("v<Space>", 'select_path(nil, { filter = "' .. get_branch_name() .. '" })', "Select branch visits (cwd)")
