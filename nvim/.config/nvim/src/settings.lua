vim.g.mapleader = ","

local opt = vim.opt -- set options (global/buffer/windows-scoped)
local g = vim.g

-- general
local sysname = vim.loop.os_uname().sysname
if sysname ~= "Linux" then
	opt.clipboard = "unnamed"
else
	opt.clipboard = "unnamedplus"
end

opt.swapfile = false -- don't use swapfile
opt.completeopt = "menuone,noinsert,noselect" -- customize completions
vim.opt.foldtext = "v:lua.vim.treesitter.foldtext()" -- treesitter fold

-- ui
opt.number = false -- Show line number
opt.relativenumber = true -- Show relative line number
opt.showmatch = true -- Highlight matching parenthesis
opt.splitright = true -- Vertical split to the right
opt.splitbelow = true -- Horizontal split to the bottom
opt.ignorecase = true -- Ignore case letters when search
opt.smartcase = true -- Ignore lowercase for the whole pattern
opt.linebreak = true -- Wrap on word boundary
opt.termguicolors = true -- Enable 24-bit RGB colors
opt.signcolumn = "yes:1" -- sign column default size
opt.list = false

-- tabs, indent
opt.expandtab = true -- Use spaces instead of tabs
opt.shiftwidth = 2 -- Shift 2 spaces when tab
opt.tabstop = 2 -- 1 tab == 2 spaces
opt.smartindent = true -- Autoindent new lines

-- memory, cpu
opt.hidden = true -- Enable background buffers
opt.history = 100 -- Remember N lines in history
opt.lazyredraw = true -- Faster scrolling
opt.synmaxcol = 240 -- Max column for syntax highlight
opt.updatetime = 250 -- ms to wait for trigger an event
opt.autoread = true -- enable auto reload of files

vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function()
		vim.opt_local.formatoptions:remove({ "r", "o" })
	end,
})

-- Disable builtin plugins
local disabled_built_ins = {
	"getscript",
	"getscriptPlugin",
	"gzip",
	"logipat",
	"netrw",
	"netrwPlugin",
	"netrwSettings",
	"netrwFileHandlers",
	"tar",
	"tarPlugin",
	"rrhelper",
	"spellfile_plugin",
	"vimball",
	"vimballPlugin",
	"zip",
	"zipPlugin",
	"tutor",
	"rplugin",
	"synmenu",
	"optwin",
	"compiler",
	"bugreport",
	"ftplugin",
	"man",
}

for _, plugin in pairs(disabled_built_ins) do
	g["loaded_" .. plugin] = 1
end
