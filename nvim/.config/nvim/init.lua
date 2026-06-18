-- Plugin manager: vim.pack (built into Neovim 0.12+). Clones on first run;
-- state is pinned in nvim-pack-lock.json. Update with :lua vim.pack.update().
vim.pack.add({ "https://github.com/nvim-mini/mini.nvim" })

-- Shared state + helpers. init.lua runs first, so these are ready for every
-- plugin/ file.
_G.Config = {}

-- now/later wrap mini.misc.safely(): errors surface as a WARN notification
-- instead of being swallowed.
local safely = require("mini.misc").safely
_G.Config.now = function(f)
	safely("now", f)
end
_G.Config.later = function(f)
	safely("later", f)
end

