local conform = require("conform")

conform.setup({
	formatters_by_ft = {
		html = { "prettier" },
		css = { "prettier" },
		javascript = { "prettier" },
		markdown = { "prettier" },
		json = { "prettier" },
		typescriptreact = { "prettier" },
		typescript = { "prettier" },
		lua = { "stylua" },
	},
})
