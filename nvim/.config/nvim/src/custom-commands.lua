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

--- Function to create new mark
local function load_last_mark()
	local file = io.open(vim.fn.stdpath("data") .. "/last_mark.txt", "r")
	if file then
		local mark = file:read("*l")
		file:close()
		return mark
	end
	return nil
end

local function save_last_mark(mark)
	local file = io.open(vim.fn.stdpath("data") .. "/last_mark.txt", "w")
	file:write(mark)
	file:close()
end

local function NewMark()
	if not vim.g.last_mark then
		vim.g.last_mark = load_last_mark() or "Z"
	end

	-- Increment the last mark
	if vim.g.last_mark == "Z" then
		vim.g.last_mark = "A"
	else
		vim.g.last_mark = string.char(string.byte(vim.g.last_mark) + 1)
	end

	-- Set the global mark at the current cursor position
	vim.cmd("mark " .. vim.g.last_mark)

	-- Save the last mark
	save_last_mark(vim.g.last_mark)

	-- Notify the user
	local id = MiniNotify.add("Mark set: " .. vim.g.last_mark)
	vim.defer_fn(function()
		MiniNotify.remove(id)
	end, 1000)
end
vim.api.nvim_create_user_command("NewMark", NewMark, { desc = "Create new global mark" })
