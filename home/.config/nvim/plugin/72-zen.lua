-- Distraction-free writing: zen-mode.nvim (goyo analog)
local add = vim.pack.add
local later = Config.later

later(function()
	add({ "https://github.com/folke/zen-mode.nvim" })

	require("zen-mode").setup({
		window = {
			backdrop = 0.95,
			width = function()
				return math.min(90, math.floor(vim.o.columns * 0.85))
			end,
			options = {
				signcolumn = "no",
				number = false,
				relativenumber = false,
				cursorline = false,
				foldcolumn = "0",
				list = false,
			},
		},
		plugins = {
			options = {
				enabled = true,
				ruler = false,
				showcmd = false,
				laststatus = 0,
			},
		},
	})

	-- Typewriter mode: keep cursor vertically centered (markdown)
	local function typewriter(on)
		if on then
			vim.wo.scrolloff = 999
		else
			vim.wo.scrolloff = vim.g.__tw_saved_scrolloff or 0
		end
	end

	local tw_active = false
	local function toggle_typewriter()
		if vim.bo.filetype ~= "markdown" then
			vim.notify("typewriter mode is for markdown", vim.log.levels.INFO)
			return
		end
		tw_active = not tw_active
		if tw_active then
			vim.g.__tw_saved_scrolloff = vim.o.scrolloff
		end
		typewriter(tw_active)
	end

	vim.api.nvim_create_autocmd("FileType", {
		pattern = "markdown",
		callback = function(args)
			vim.api.nvim_create_autocmd({ "BufEnter", "WinEnter", "FileType" }, {
				buffer = args.buf,
			callback = function()
					if tw_active and vim.bo.filetype == "markdown" then
						typewriter(true)
					end
				end,
			})
		end,
	})

	vim.keymap.set("n", "<Leader>zt", toggle_typewriter, { desc = "Toggle typewriter mode (markdown)" })

	vim.api.nvim_create_user_command("ZenMode", function()
		require("zen-mode").toggle({
			window = { options = { scrolloff = tw_active and 999 or nil } },
		})
	end, {})

	vim.keymap.set("n", "<Leader>zz", "<Cmd>ZenMode<CR>", { desc = "Toggle zen mode" })
end)
