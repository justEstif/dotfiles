_G.Config.is_dark_mode = function()
	local os_name = vim.loop.os_uname().sysname

	if os_name == "Darwin" then
		-- macOS detection
		local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
		if handle then
			local result = handle:read("*a")
			handle:close()
			return result:match("Dark") ~= nil
		end
	elseif os_name == "Linux" then
		-- Ubuntu/Linux detection
		local handle = io.popen("gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null")
		if handle then
			local result = handle:read("*a")
			handle:close()
			return result:match("prefer%-dark") ~= nil
		end
	end

	-- Default to dark if detection fails
	return true
end
