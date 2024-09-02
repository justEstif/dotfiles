require("obsidian").setup({
	workspaces = {
		{
			name = "notes",
			path = "~/Documents/notes",
		},
	},
	daily_notes = { folder = "daily" },
	new_notes_location = "zettel",
	picker = { name = "mini.pick" },
	note_id_func = function(title)
		if title then
			return tostring(os.date("%Y%m%d%H%M")) .. "-" .. title
		else
			return tostring(os.date("%Y%m%d%H%M"))
		end
	end,
})
