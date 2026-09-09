-- Enable spell checking and soft wrap.
-- (conceallevel is managed by render-markdown.nvim)
vim.opt_local.spell = true
vim.opt_local.wrap = true

-- Pencil-style prose defaults
vim.opt_local.linebreak = true
vim.opt_local.breakindent = true
vim.opt_local.showbreak = "↪ "
vim.opt_local.expandtab = true
vim.opt_local.formatoptions:remove({ "r", "o" }) -- don't auto-continue list markers outside insert
