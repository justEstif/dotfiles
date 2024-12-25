local conform = require("conform")

conform.setup({
	formatters_by_ft = {
		astro = { "biome" },
		css = { "biome" },
		fish = { "fish_indent" },
		go = { "gofmt" },
		html = { "biome" },
		javascript = { "biome" },
		json = { "biome" },
		lua = { "stylua" },
		markdown = { "biome" },
		template = { "djlint" },
		typescript = { "biome" },
		typescriptreact = { "biome" },
	},
})
