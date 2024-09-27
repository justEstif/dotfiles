vim.api.nvim_create_user_command("ClearAllRegisters", function()
	local regs = vim.fn.split('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-"*', "\\zs")
	for _, r in ipairs(regs) do
		vim.fn.setreg(r, {})
	end
end, { desc = "Clear all registers" })

--- Path to your notes directory
local notes_dir = "~/Documents/notes/"
local daily_dir = notes_dir .. "daily/"
local zettel_dir = notes_dir .. "zettel/"

--- Function to create a new note with a timestamp
function CreateNewNote()
	local timestamp = os.date("%Y%m%d%H%M")
	local filename = zettel_dir .. timestamp .. ".md"
	vim.cmd("edit " .. filename)
end

-- Function to open today's note
function OpenTodaysNote()
	local today = os.date("%Y-%m-%d")
	local filename = daily_dir .. today .. ".md"
	vim.cmd("edit " .. filename)
end

vim.api.nvim_create_user_command("CreateNewNote", CreateNewNote, { desc = "Create New Note" })
vim.api.nvim_create_user_command("OpenTodaysNote", OpenTodaysNote, { desc = "Open Today's Note" })
