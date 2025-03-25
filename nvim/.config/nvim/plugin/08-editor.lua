local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later

-- jump
later(function()
  local jump = require("mini.jump")
  jump.setup({
    mappings = {
      repeat_jump = "",
    },
  })
end)

-- jump2d
local safe_getcharstr = function(msg)
  vim.cmd("echon " .. vim.inspect(msg))
  local ok, res = pcall(vim.fn.getcharstr) -- Allow `<C-c>` to end input
  vim.cmd([[echo '' | redraw]])            -- Clean command line

  -- Treat `<Esc>` or `<CR>` as cancel
  if not ok or (res == "\27" or res == "\r") then
    return nil
  end

  return res
end

local make_ignorecase_pattern = function(word)
  local parts = {}
  for i = 1, word:len() do
    local char = word:sub(i, i)

    if char:find("^%a$") then
      -- Convert letter to a match both lower and upper case
      char = "[" .. char:lower() .. char:upper() .. "]"
    else
      char = vim.pesc(char) -- Escape non-letter characters
    end

    table.insert(parts, char)
  end

  return table.concat(parts)
end

local dummy_spotter = function()
  return {}
end

later(function()
  local jump2d = require("mini.jump2d")
  jump2d.setup({
    spotter = dummy_spotter,
    allowed_lines = {
      blank = false,
      fold = false,
    },
    hooks = {
      before_start = function()
        local first = safe_getcharstr("(mini.jump2d) Enter first character: ")
        if first == nil then
          jump2d.config.spotter = dummy_spotter
          return
        end

        local second = safe_getcharstr("(mini.jump2d) Enter second character: ")
        if second == nil then
          jump2d.config.spotter = dummy_spotter
          return
        end

        local pattern = make_ignorecase_pattern(first .. second)
        jump2d.config.spotter = jump2d.gen_pattern_spotter(pattern)
      end,
    },
    mappings = {
      start_jumping = " ",
    },
    labels = "etovxqpdygfblzhckisuran",
  })
end)

-- mini git and diff
later(function()
  require("mini.git").setup()
  vim.api.nvim_create_autocmd("User", {
    pattern = "MiniGitCommandDone",
    callback = function(data)
      if data.data.git_subcommand == "commit" then
        if data.data.exit_code == 0 then
          vim.notify("Git commit: Success", vim.log.levels.INFO)
        else
          vim.notify("Git commit: Failed", vim.log.levels.ERROR)
        end
      end
    end,
  })
end)
later(function()
  require("mini.diff").setup()
end)

later(function()
  require("mini.splitjoin").setup()
end)
later(function()
  require("mini.bracketed").setup()
end)
later(function()
  require("mini.move").setup()
end)
later(function()
  require("mini.operators").setup()
end)
later(function()
  require("mini.bufremove").setup()

  vim.keymap.set("n", "<C-q>", "<Cmd>lua MiniBufremove.delete()<CR>", {
    desc = "close current buffer",
  })
end)
later(function()
  require("mini.align").setup()
end)
later(function()
  local surround = require("mini.surround")
  surround.setup({
    search_method = "cover_or_nearest",
  })
  -- Disable `s` shortcut (use `cl` instead) for safer usage of 'mini.surround'
  vim.keymap.set({ "n", "x" }, "s", "<Nop>")
end)

later(function()
  require("mini.snippets").setup()
  local completion = require("mini.completion")
  completion.setup({
    lsp_completion = {
      source_func = "omnifunc",
      auto_setup = false,
    },
  })
  if vim.fn.has("nvim-0.11") == 1 then
    vim.opt.completeopt:append("fuzzy") -- Use fuzzy matching for built-in completion
  end

  _G.cr_action = function()
    if vim.fn.pumvisible() ~= 0 then
      local item_selected = vim.fn.complete_info()["selected"] ~= -1
      return item_selected and "\25" or "\25\r"
    else
      return require("mini.pairs").cr()
    end
  end

  vim.keymap.set("i", "<CR>", "v:lua._G.cr_action()", { expr = true })
end)

-- add all to quickfix list
local choose_all = function()
  local mappings = MiniPick.get_picker_opts().mappings
  vim.api.nvim_input(mappings.mark_all .. mappings.choose_marked)
end

later(function()
  local pick = require("mini.pick")

  pick.setup({
    mappings = {
      choose_all = { char = "<C-q>", func = choose_all },
    },
  })

  vim.ui.select = pick.ui_select
  vim.keymap.set("n", [[g/]], "<Cmd>Pick grep_live<cr>", {
    desc = "live grep",
  })
  vim.keymap.set("n", "<C-p>", "<Cmd>Pick files<CR>", {
    desc = "files",
  })
end)

now(function()
  local files = require("mini.files")
  files.setup({
    mappings = {
      go_in = "L",
      go_in_plus = "l",
      go_out = "H",
      go_out_plus = "h",
    },
  })

  -- Open in split
  local map_split = function(buf_id, lhs, direction, close_on_file)
    local rhs = function()
      local new_target_window
      local cur_target_window = files.get_explorer_state().target_window
      if cur_target_window ~= nil then
        vim.api.nvim_win_call(cur_target_window, function()
          vim.cmd("belowright " .. direction .. " split")
          new_target_window = vim.api.nvim_get_current_win()
        end)

        files.set_target_window(new_target_window)
        files.go_in({ close_on_file = close_on_file })
      end
    end

    local desc = "Open in " .. direction .. " split"
    if close_on_file then
      desc = desc .. " and close"
    end
    vim.keymap.set("n", lhs, rhs, { buffer = buf_id, desc = desc })
  end

  vim.api.nvim_create_autocmd("User", {
    pattern = "MiniFilesBufferCreate",
    callback = function(args)
      local buf_id = args.data.buf_id
      -- Tweak keys to your liking
      map_split(buf_id, "<C-s>", "horizontal", false)
      -- map_split(buf_id, "<C-v>", "vertical", false)
    end,
  })

  -- Show/hide dot-files
  local show_dotfiles = true

  local filter_show = function(fs_entry)
    return true
  end

  local filter_hide = function(fs_entry)
    return not vim.startswith(fs_entry.name, ".")
  end

  local toggle_dotfiles = function()
    show_dotfiles = not show_dotfiles
    local new_filter = show_dotfiles and filter_show or filter_hide
    files.refresh({ content = { filter = new_filter } })
  end

  vim.api.nvim_create_autocmd("User", {
    pattern = "MiniFilesBufferCreate",
    callback = function(args)
      local buf_id = args.data.buf_id
      -- Tweak left-hand side of mapping to your liking
      vim.keymap.set("n", "g.", toggle_dotfiles, { buffer = buf_id })
    end,
  })

  --- Set CWD
  local files_set_cwd = function(path)
    -- Works only if cursor is on the valid file system entry
    local cur_entry_path = MiniFiles.get_fs_entry().path
    local cur_directory = vim.fs.dirname(cur_entry_path)
    vim.fn.chdir(cur_directory)
  end

  vim.api.nvim_create_autocmd("User", {
    pattern = "MiniFilesBufferCreate",
    callback = function(args)
      vim.keymap.set("n", "g~", files_set_cwd, { buffer = args.data.buf_id })
    end,
  })

  local set_mark = function(id, path, desc)
    files.set_bookmark(id, path, { desc = desc })
  end
  vim.api.nvim_create_autocmd("User", {
    pattern = "MiniFilesExplorerOpen",
    callback = function()
      set_mark("w", vim.fn.getcwd, "Working directory") -- callable
    end,
  })
end)

later(function()
  add("tiagovla/scope.nvim")
  require("scope").setup()
end)

later(function()
  require("mini.extra").setup()
end)

later(function()
  local trailspace = require("mini.trailspace")
  trailspace.setup()
  vim.api.nvim_create_autocmd("BufWritePre", {
    group = vim.api.nvim_create_augroup("trim_whitespace", { clear = true }),
    callback = function()
      trailspace.trim()
      trailspace.trim_last_lines()
    end,
    desc = [[Trim trailing whitespace and empty lines on save]],
  })
end)
