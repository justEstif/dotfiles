local status, pairs = pcall(require, "mini.pairs")
if not status then
	print("mini.pairs error")
	return
end

pairs.setup({
	modes = { insert = true, command = true, terminal = true },
})
