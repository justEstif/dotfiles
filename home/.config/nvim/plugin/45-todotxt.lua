local add = vim.pack.add
local later = Config.later

later(function()
	local notebook_dir = vim.env.ZK_NOTEBOOK_DIR
	if not notebook_dir or notebook_dir == "" then
		error("nvim-orgmode requires the ZK_NOTEBOOK_DIR environment variable")
	end

	local tasks_file = notebook_dir .. "/tasks.org"

	add({ "https://github.com/nvim-orgmode/orgmode" })
	require("orgmode").setup({
		org_agenda_files = { tasks_file },
		mappings = {
			global = {
				org_agenda = false,
				org_capture = false,
			},
			org = {
				org_refile = false,
				org_timestamp_up_day = false,
				org_timestamp_down_day = false,
				org_timestamp_up = false,
				org_timestamp_down = false,
				org_change_date = false,
				org_priority = false,
				org_priority_up = false,
				org_priority_down = false,
				org_todo = "<Leader>x",
				org_todo_prev = false,
				org_toggle_checkbox = false,
				org_toggle_heading = false,
				org_open_at_point = false,
				org_edit_special = false,
				org_add_note = false,
				org_cycle = false,
				org_global_cycle = false,
				org_archive_subtree = false,
				org_set_tags_command = "<Leader>t",
				org_toggle_archive_tag = false,
				org_do_promote = false,
				org_do_demote = false,
				org_promote_subtree = false,
				org_demote_subtree = false,
				org_meta_return = false,
				org_return = false,
				org_insert_heading_respect_content = false,
				org_insert_todo_heading = false,
				org_insert_todo_heading_respect_content = "<Leader>i",
				org_move_subtree_up = false,
				org_move_subtree_down = false,
				org_export = false,
				org_next_visible_heading = false,
				org_previous_visible_heading = false,
				org_forward_heading_same_level = false,
				org_backward_heading_same_level = false,
				outline_up_heading = false,
				org_deadline = "<Leader>d",
				org_schedule = "<Leader>s",
				org_time_stamp = false,
				org_time_stamp_inactive = false,
				org_toggle_timestamp_type = false,
				org_insert_link = false,
				org_store_link = false,
				org_clock_in = false,
				org_clock_out = false,
				org_clock_cancel = false,
				org_clock_goto = false,
				org_set_effort = false,
				org_show_help = false,
				org_babel_tangle = false,
			},
			text_objects = {
				inner_heading = false,
				around_heading = false,
				inner_subtree = false,
				around_subtree = false,
				inner_heading_from_root = false,
				around_heading_from_root = false,
				inner_subtree_from_root = false,
				around_subtree_from_root = false,
			},
		},
	})
end)
