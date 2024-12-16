local conform = require("conform")

local linux_conform = {
	css = { "deno_fmt" },
	fish = { "fish_indent" },
	go = { "gofmt" },
	html = { "deno_fmt" },
	javascript = { "deno_fmt" },
	json = { "deno_fmt" },
	lua = { "stylua" },
	markdown = { "deno_fmt" },
	typescript = { "deno_fmt" },
	typescriptreact = { "deno_fmt" },
}

local darwin_conform = {
	astro = { "prettier" },
	css = { "prettier" },
	fish = { "fish_indent" },
	go = { "gofmt" },
	html = { "prettier" },
	javascript = { "prettier" },
	json = { "prettier" },
	lua = { "stylua" },
	markdown = { "prettier" },
	template = { "djlint" },
	typescript = { "prettier" },
	typescriptreact = { "prettier" },
}

local formatters_by_ft

if sysname ~= "Linux" then
	formatters_by_ft = linux_conform
else
	formatters_by_ft = darwin_conform
end

conform.setup({
	formatters_by_ft = formatters_by_ft,
})
