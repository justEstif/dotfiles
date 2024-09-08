-- Path to your notes directory
local notes_dir = "~/Documents/notes/"
local daily_dir = notes_dir .. "daily/"
local zettel_dir = notes_dir .. "zettel/"

-- Function to create a new note with a timestamp
function CreateNewNote()
	-- Format the current time as a timestamp
	local timestamp = os.date("%Y%m%d%H%M")
	local filename = zettel_dir .. timestamp .. ".md"

	-- Create and open the file in a new buffer
	vim.cmd("edit " .. filename)
end

-- Function to open today's note
function OpenTodaysNote()
	-- Get today's date
	local today = os.date("%Y-%m-%d")
	local filename = daily_dir .. today .. ".md"

	-- Open the file in a new buffer, or create it if it doesn't exist
	vim.cmd("edit " .. filename)
end

_G.Note = {
	CreateNewNote = CreateNewNote,
	OpenTodaysNote = OpenTodaysNote,
}
