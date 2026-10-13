-- Enable spell checking and soft wrap.
vim.opt_local.spell = true
vim.opt_local.wrap = true

-- Pencil-style prose defaults
vim.opt_local.linebreak = true
vim.opt_local.breakindent = true
vim.opt_local.showbreak = "↪ "
vim.opt_local.expandtab = true
vim.opt_local.formatoptions:remove({ "r", "o" }) -- don't auto-continue list markers outside insert

-- Writing mode (\z): toggle of spell, diagnostics, and completion
local writing_mode = false
vim.keymap.set("n", [[\z]], function()
  writing_mode = not writing_mode
  vim.opt_local.spell = not writing_mode
  if writing_mode then
    vim.diagnostic.enable(false, { bufnr = 0 })
  else
    vim.diagnostic.enable(true, { bufnr = 0 })
  end
  vim.b.minicompletion_disable = writing_mode or nil
  vim.opt_local.laststatus = writing_mode and 0 or 2
  vim.opt_local.number = not writing_mode
  vim.opt_local.relativenumber = not writing_mode
  vim.notify(writing_mode and "Writing mode ON" or "Writing mode OFF")
end, {
  buffer = true,
  desc = "Writing mode",
})
