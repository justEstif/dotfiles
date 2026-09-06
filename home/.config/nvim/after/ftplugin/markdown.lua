-- Enable spell checking, soft wrap, and Markdown conceal UI.
vim.opt_local.spell = true
vim.opt_local.wrap = true
vim.opt_local.conceallevel = 2

-- Set textwidth for manual formatting and visual guide
vim.opt_local.textwidth = 100

-- Pencil-style prose defaults
vim.opt_local.linebreak = true
vim.opt_local.breakindent = true
vim.opt_local.showbreak = "↪ "
vim.opt_local.expandtab = true
vim.opt_local.formatoptions:remove({ "r", "o" }) -- don't auto-continue list markers outside insert
