local hipatterns = require("mini.hipatterns")
local hi_words = MiniExtra.gen_highlighter.words

hipatterns.setup({
	highlighters = {
		fixme = hi_words({ "FIXME", "BUG" }, "MiniHipatternsFixme"),
		hack = hi_words({ "HACK" }, "MiniHipatternsHack"),
		todo = hi_words({ "TODO", "CHECK" }, "MiniHipatternsTodo"),
		note = hi_words({ "NOTE" }, "MiniHipatternsNote"),

		hex_color = hipatterns.gen_highlighter.hex_color(),
	},
})
