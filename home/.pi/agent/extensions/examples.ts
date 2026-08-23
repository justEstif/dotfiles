/**
 * /examples — install/uninstall pi's bundled example extensions.
 *
 * Usage:
 *   /examples            interactive browser (install/remove)
 *   /examples list       show available + installed examples
 *   /examples install <name> [name...]
 *   /examples remove <name> [name...]
 *
 * Handles four install shapes:
 *   1. single .ts file               -> copy to extensions dir
 *   2. plain folder                  -> copy folder to extensions dir
 *   3. folder with package.json deps -> copy + bun/npm install inside it
 *   4. folder with agents// prompts/ -> also install those to
 *                                        ~/.pi/agent/agents and prompts
 *
 * Everything is copied, never symlinked, because the pi install path is
 * version-pinned (mise) and would break on upgrade.
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const EXTENSIONS_DIR = path.dirname(fileURLToPath(import.meta.url)); // ~/.pi/agent/extensions (this file lives there)
const AGENT_DIR = path.resolve(EXTENSIONS_DIR, ".."); // ~/.pi/agent

function findExamplesDir(): string | null {
	// Resolve via the running pi binary: <install>/pi -> ../examples/extensions
	const candidates: string[] = [];
	try {
		const bin = execFileSync("which", ["pi"], { encoding: "utf8" }).trim();
		if (bin) {
			const real = fs.realpathSync(bin);
			// mise shims resolve to the versioned install; walk up to find pi/
			let dir = path.dirname(real);
			for (let i = 0; i < 6; i++) {
				const cand = path.join(dir, "examples", "extensions");
				if (fs.existsSync(cand)) return cand;
				const parent = path.dirname(dir);
				if (parent === dir) break;
				dir = parent;
			}
		}
	} catch {
		/* fall through */
	}
	for (const root of ["/usr/local/lib/pi", "/usr/lib/pi"]) {
		const cand = path.join(root, "examples", "extensions");
		if (fs.existsSync(cand)) return cand;
	}
	return null;
}

interface Example {
	name: string;
	dir: string; // absolute path of source
	isDir: boolean;
	hasDeps: boolean;
	hasAgents: boolean;
	hasPrompts: boolean;
	installed: boolean;
}

function scanExamples(examplesDir: string): Example[] {
	const out: Example[] = [];
	for (const entry of fs.readdirSync(examplesDir, { withFileTypes: true })) {
		if (entry.name === "README.md" || entry.name.startsWith(".")) continue;
		const abs = path.join(examplesDir, entry.name);
		if (entry.isDirectory()) {
			const pkgPath = path.join(abs, "package.json");
			let hasDeps = false;
			if (fs.existsSync(pkgPath)) {
				try {
					const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
					hasDeps = Object.keys(pkg.dependencies ?? {}).length > 0;
				} catch {
					hasDeps = true; // unreadable pkg: install deps to be safe
				}
			}
			out.push({
				name: entry.name,
				dir: abs,
				isDir: true,
				hasDeps,
				hasAgents: fs.existsSync(path.join(abs, "agents")),
				hasPrompts: fs.existsSync(path.join(abs, "prompts")),
				installed: fs.existsSync(path.join(EXTENSIONS_DIR, entry.name)),
			});
		} else if (entry.name.endsWith(".ts")) {
			out.push({
				name: entry.name.replace(/\.ts$/, ""),
				dir: abs,
				isDir: false,
				hasDeps: false,
				hasAgents: false,
				hasPrompts: false,
				installed: fs.existsSync(path.join(EXTENSIONS_DIR, entry.name)),
			});
		}
	}
	out.sort((a, b) => a.name.localeCompare(b.name));
	return out;
}

function copyRecursive(src: string, dest: string) {
	fs.cpSync(src, dest, { recursive: true });
}

function labelFor(e: Example): string {
	const tags: string[] = [];
	if (e.installed) tags.push("installed");
	if (e.hasDeps) tags.push("deps");
	if (e.hasAgents) tags.push("agents");
	if (e.hasPrompts) tags.push("prompts");
	return `${e.name}${tags.length ? "  [" + tags.join(", ") + "]" : ""}`;
}

function destFor(e: Example): string {
	return path.join(EXTENSIONS_DIR, e.isDir ? e.name : `${e.name}.ts`);
}

function install(e: Example, log: (m: string) => void): string | null {
	const dest = destFor(e);
	try {
		if (e.isDir) {
			if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
			fs.cpSync(e.dir, dest, { recursive: true });
		} else {
			fs.copyFileSync(e.dir, dest);
		}
		// agents/ + prompts/ that ship with the example go to their homes
		if (e.hasAgents) {
			const agentsDir = path.join(AGENT_DIR, "agents");
			fs.mkdirSync(agentsDir, { recursive: true });
			for (const f of fs.readdirSync(path.join(dest, "agents"))) {
				fs.copyFileSync(path.join(dest, "agents", f), path.join(agentsDir, f));
			}
		}
		if (e.hasPrompts) {
			const promptsDir = path.join(AGENT_DIR, "prompts");
			fs.mkdirSync(promptsDir, { recursive: true });
			for (const f of fs.readdirSync(path.join(dest, "prompts"))) {
				fs.copyFileSync(path.join(dest, "prompts", f), path.join(promptsDir, f));
			}
		}
		// npm dependencies
		if (e.hasDeps) {
			log(`installing dependencies for ${e.name}...`);
			const cmd = which("bun") ? "bun" : "npm";
			execFileSync(cmd, ["install"], { cwd: dest, stdio: "pipe" });
		}
		return null;
	} catch (err: any) {
		return err?.message ?? String(err);
	}
}

function which(bin: string): boolean {
	try {
		execFileSync("which", [bin], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

function remove(e: Example, log: (m: string) => void): string | null {
	const dest = destFor(e);
	try {
		if (fs.existsSync(dest)) {
			fs.rmSync(dest, { recursive: true, force: true });
			log(`removed ${path.relative(AGENT_DIR, dest)}`);
		} else {
			return `${e.name} is not installed`;
		}
		return null;
	} catch (err: any) {
		return err?.message ?? String(err);
	}
}

export default function examplesExtension(pi: ExtensionAPI) {
	pi.registerCommand("examples", {
		description: "Install/uninstall pi example extensions",
		getArgumentCompletions: (prefix) => {
			const examplesDir = findExamplesDir();
			if (!examplesDir) return null;
			const words = prefix.split(/\s+/);
			if (words.length > 2) return null;
			const verb = words[0] ?? "";
			const partial = words[1] ?? "";
			if (verb !== "install" && verb !== "remove") return null;
			return scanExamples(examplesDir)
				.filter((e) => e.name.startsWith(partial))
				.map((e) => ({ value: e.name, label: labelFor(e) }));
		},
		handler: async (args, ctx) => {
			const examplesDir = findExamplesDir();
			if (!examplesDir) {
				ctx.ui.notify("Could not locate pi's examples/extensions directory", "error");
				return;
			}
			const examples = scanExamples(examplesDir);
			const log = (m: string) => ctx.ui.notify(m, "info");
			const [verb, ...names] = args.trim().split(/\s+/).filter(Boolean);

			const find = (n: string) => examples.find((e) => e.name === n || e.name === n.replace(/\.ts$/, ""));

			if (verb === "install" || verb === "remove") {
				if (names.length === 0) {
					ctx.ui.notify(`Usage: /examples ${verb} <name...>`, "error");
					return;
				}
				const errors: string[] = [];
				for (const n of names) {
					const e = find(n);
					if (!e) {
						errors.push(`unknown example: ${n}`);
						continue;
					}
					const err = verb === "install" ? install(e, log) : remove(e, log);
					if (err) errors.push(`${n}: ${err}`);
					else if (verb === "install") log(`installed ${n}${e.hasDeps ? " (with deps)" : ""}`);
				}
				if (errors.length) ctx.ui.notify(errors.join("\n"), "error");
				ctx.ui.notify("Restart pi (or /reload if available) for changes to take effect", "info");
				return;
			}

			// Interactive browser (also handles "list")
			const items = examples.map(labelFor);
			const selected = await ctx.ui.select(
				`Examples (${examples.filter((e) => e.installed).length}/${examples.length} installed) — pick one to toggle, esc to quit`,
				items,
			);
			if (!selected) return;
			const name = selected.split("  [")[0].trim();
			const e = find(name);
			if (!e) return;
			const action = e.installed ? "Remove" : "Install";
			const confirm = await ctx.ui.confirm(action, `${action} ${name}?`);
			if (!confirm) return;
			const err = e.installed ? remove(e, log) : install(e, log);
			if (err) ctx.ui.notify(err, "error");
			else log(`${e.installed ? "installed" : "removed"} ${name}`);
			ctx.ui.notify("Restart pi for changes to take effect", "info");
		},
	});
}
