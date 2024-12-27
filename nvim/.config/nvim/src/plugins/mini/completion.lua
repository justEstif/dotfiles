local completion = require("mini.completion")
completion.setup({
	lsp_completion = {
		source_func = "omnifunc",
		auto_setup = false,
		process_items = function(items, base)
			-- Don't show 'Text' and 'Snippet' suggestions
			items = vim.tbl_filter(function(x)
				return x.kind ~= 1 and x.kind ~= 15
			end, items)
			return MiniCompletion.default_process_items(items, base)
		end,
	},
})
if vim.fn.has("nvim-0.11") == 1 then
	vim.opt.completeopt:append("fuzzy") -- Use fuzzy matching for built-in completion
end

local keycode = vim.keycode or function(x)
	return vim.api.nvim_replace_termcodes(x, true, true, true)
end
local keys = {
	["cr"] = keycode("<CR>"),
	["ctrl-y"] = keycode("<C-y>"),
	["ctrl-y_cr"] = keycode("<C-y><CR>"),
}

_G.cr_action = function()
	if vim.fn.pumvisible() ~= 0 then
		-- If popup is visible, confirm selected item or add new line otherwise
		local item_selected = vim.fn.complete_info()["selected"] ~= -1
		return item_selected and keys["ctrl-y"] or keys["ctrl-y_cr"]
	else
		return require("mini.pairs").cr()
	end
end

vim.keymap.set("i", "<CR>", "v:lua._G.cr_action()", { expr = true })
