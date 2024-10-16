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
