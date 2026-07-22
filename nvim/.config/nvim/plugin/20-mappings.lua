-- Disable the default 'K' vim.keymap.set
vim.keymap.set("n", "K", "<nop>")

vim.keymap.set("v", "p", [["_dP]], { desc = "Keep the yanked text when pasting in visual  mode" })

-- use 'cl' instead of 's'
vim.keymap.set("n", [[s]], [[<Nop>]])
vim.keymap.set("x", [[s]], [[<Nop>]])

-- use MiniPick spell suggest (snacks has no spelling picker)
vim.keymap.set("n", "z=", "<Cmd>lua MiniExtra.pickers.spellsuggest()<CR>", { desc = "Spelling suggest" })

-- Leader mappings ============================================================
_G.Config.leader_group_clues = {
	{ mode = "n", keys = "<Leader>a", desc = "+Agent" },
	{ mode = "x", keys = "<Leader>a", desc = "+Agent" },
	{ mode = "v", keys = "<Leader>a", desc = "+Agent" },
	{ mode = "n", keys = "<Leader>f", desc = "+Files" },
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

-- a is for 'agent' (copy context to clipboard)
nmap_leader("ac", function()
	local loc = vim.fn.expand("%:p") .. ":" .. vim.api.nvim_win_get_cursor(0)[1]
	vim.fn.setreg("+", loc)
	vim.notify("Copied " .. loc)
end, "Copy location")
xmap_leader("ac", function()
	vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "x", false)
	vim.schedule(function()
		local file = vim.fn.expand("%:p")
		local start_l, end_l = vim.fn.line("'<"), vim.fn.line("'>")
		local lines = vim.api.nvim_buf_get_lines(0, start_l - 1, end_l, false)
		local loc = file .. ":" .. start_l .. (end_l ~= start_l and ("-" .. end_l) or "")
		vim.fn.setreg("+", loc .. "\n" .. table.concat(lines, "\n"))
		vim.notify("Copied " .. loc)
	end)
end, "Copy selection")

-- f is for 'explore' and 'edit'
nmap_leader("fd", "<Cmd>lua MiniFiles.open()<CR>", "Directory")
nmap_leader("ff", "<Cmd>lua MiniFiles.open(vim.api.nvim_buf_get_name(0))<CR>", "File directory")
nmap_leader("fh", function() Snacks.picker.help() end, "Help")
nmap_leader("f*", function() Snacks.picker.grep_word() end, "Grep under cursor")
nmap_leader("fv", function() Snacks.picker.recent() end, "Frecency")
xmap_leader("f*", function() Snacks.picker.grep_word() end, "Grep under cursor")

-- l is for 'LSP' (Language Server Protocol)
nmap_leader("la", "<Cmd>lua vim.lsp.buf.code_action()<CR>", "Actions")
nmap_leader("lD", function() Snacks.picker.diagnostics() end, "Diagnostic workspace")
nmap_leader("lr", "<Cmd>lua vim.lsp.buf.rename()<CR>", "Rename")
nmap_leader("lR", function() Snacks.picker.lsp_references() end, "References")
nmap_leader("ls", function() Snacks.picker.lsp_definitions() end, "Source Definition")
nmap_leader("lf", '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>', "Format")
xmap_leader("lf", '<Cmd>lua require("conform").format({ lsp_fallback = true })<CR><Cmd>w<CR>', "Format selection")

vim.keymap.set("n", "K", "<Cmd>lua vim.lsp.buf.hover()<CR>", { desc = "Hover" })
