vim.keymap.set("n", "<leader>u", function()
  -- Load the built-in undotree plugin
  vim.cmd("packadd nvim.undotree")
  -- Toggle or open it
  vim.cmd("Undotree")
end, { desc = "Toggle UndoTree" })
