local conform = require("conform")

conform.setup({
	formatters_by_ft = {
		html = { "prettier" },
		css = { "prettier" },
		javascript = { "prettier" },
		markdown = { "prettier" },
		json = { "prettier" },
		typescriptreact = { "prettier" },
		typescript = function(bufnr)
			local clients = vim.lsp.get_active_clients({ bufnr = bufnr })
			for _, client in ipairs(clients) do
				if client.name == "denols" then
					return { "deno_fmt" }
				end
			end
			return { "prettier" }
		end,
		lua = { "stylua" },
		go = { "gofmt" },
	},
})
