version = "0.21.9"
local xplr = xplr

xplr.config.modes.builtin.default.key_bindings.on_key.q = {
	help = "quit and print pwd",
	messages = {
		"PrintPwdAndQuit",
	},
}

xplr.config.modes.builtin.default.key_bindings.on_key.z = {
	help = "zoxide jump",
	messages = {
		{
			BashExec = [===[
          PTH="$(zoxide query -i)"
          if [ -d "$PTH" ]; then
            "$XPLR" -m "ChangeDirectory: %q" "${PTH:?}"
          fi
        ]===],
		},
		"PopMode",
	},
}
