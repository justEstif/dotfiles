-- NOTE Most of the settings are from set using mini.basics
-- Leader key =================================================================
vim.g.mapleader = ","

-- General ====================================================================
vim.o.mousescroll = "ver:25,hor:6" -- Customize mouse scroll
vim.o.switchbuf = "usetab" -- Use already opened buffers when switching
vim.o.shada = "'100,<50,s10,:1000,/100,@100,h" -- Limit what is stored in ShaDa file
vim.cmd("filetype plugin indent on") -- Enable all filetype plugins

-- Clipboard ====================================================================
local sysname = vim.loop.os_uname().sysname
if sysname ~= "Linux" then
	vim.o.clipboard = "unnamed"
else
	vim.o.clipboard = "unnamedplus"
end

-- UI =========================================================================
vim.o.relativenumber = true -- Show relative line number
vim.o.cursorlineopt = "screenline,number" -- Show cursor line only screen line when wrapped
vim.o.breakindentopt = "list:-1" -- Add padding for lists when 'wrap' is on

vim.o.autoindent = true -- Use auto indent
vim.o.expandtab = true -- Convert tabs to spaces
vim.o.shiftwidth = 2 -- Use this number of spaces for indentation
vim.o.tabstop = 2 -- Insert 2 spaces for a tab

vim.o.iskeyword = "@,48-57,_,192-255,-" -- Treat dash separated words as a word text object
vim.o.formatlistpat = [[^\s*[0-9\-\+\*]\+[\.\)]*\s\+]]

-- Spelling ===================================================================
vim.o.spelllang = "en" -- Define spelling dictionaries
vim.o.spelloptions = "camel" -- Treat parts of camelCase words as seprate words
vim.o.complete = ".,w,b,u,kspell" -- Use spell check and don't use tags for completion

-- Folds ======================================================================
vim.o.foldmethod = "indent" -- Set 'indent' folding method
vim.o.foldlevel = 99 -- Don't fold by default
vim.o.foldnestmax = 10 -- Create folds only for some number of nested levels
vim.g.markdown_folding = 1 -- Use folding by heading in markdown files
vim.o.foldtext = "" -- Use underlying text with its highlighting

-- -- Custom autocommands ========================================================
vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function()
		vim.opt_local.formatoptions:remove({ "r", "o" })
	end,
})
--
-- Disable builtin ========================================================
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
}

for _, plugin in pairs(disabled_built_ins) do
	vim.g["loaded_" .. plugin] = 1
end
