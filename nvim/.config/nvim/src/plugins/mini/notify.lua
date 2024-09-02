local filterout_lua_diagnosing = function(notif_arr)
	local not_diagnosing = function(notif)
		return not vim.startswith(notif.msg, "lua_ls: Diagnosing")
	end
	notif_arr = vim.tbl_filter(not_diagnosing, notif_arr)
	return MiniNotify.default_sort(notif_arr)
end

local notify = require("mini.notify")

notify.setup({
	content = {
		sort = filterout_lua_diagnosing,
	},
	window = {
		config = {
			border = "rounded",
		},
	},
})

vim.notify = notify.make_notify()
