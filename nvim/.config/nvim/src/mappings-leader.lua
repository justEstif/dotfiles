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
nmap_leader("gs", "<Cmd>lua MiniGit.show_at_cursor()<CR>", "Show at cursor")
xmap_leader("gs", "<Cmd>lua MiniGit.show_at_cursor()<CR>", "Show at cursor")

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

-- v is for 'visits'
local get_branch_name = function()
	local branch = vim.fn.system("git rev-parse --abbrev-ref HEAD")
	if vim.v.shell_error ~= 0 then
		return nil
	end
	return vim.trim(branch)
end

local select_label = function(label)
	local sort_latest = MiniVisits.gen_sort.default({ recency_weight = 1 })
	MiniExtra.pickers.visit_paths({
		cwd = nil,
		filter = label,
		sort = sort_latest,
	}, { source = { name = desc } })
end

nmap_leader("vv", function()
	MiniVisits.add_label("core")
end, 'Add "core" label')
nmap_leader("vV", function()
	MiniVisits.remove_label("core")
end, 'Remove "core" label')
nmap_leader("vc", function()
	select_label("core")
end, "Core visits (cwd)")

nmap_leader("vb", function()
	local branch = get_branch_name()
	MiniVisits.add_label(branch)
end, "Add branch label")
nmap_leader("vB", function()
	local branch = get_branch_name()
	MiniVisits.remove_label(branch)
end, "Remove branch label")
nmap_leader("v<space>", function()
	local branch = get_branch_name()
	select_label(branch)
end, "Branch visits (cwd)")
