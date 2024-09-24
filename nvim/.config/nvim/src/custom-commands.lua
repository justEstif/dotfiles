vim.api.nvim_create_user_command("ClearAllRegisters", function()
	local regs = vim.fn.split('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-"*', "\\zs")
	for _, r in ipairs(regs) do
		vim.fn.setreg(r, {})
	end
end, { desc = "Clear all registers" })
