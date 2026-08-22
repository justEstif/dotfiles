/**
 * /cd extension - move the current session to another directory
 *
 * Inspired by OpenCode's /cd: change the session's working directory
 * mid-conversation, without losing history. The session file is copied
 * to the target project's session directory (rewriting the header cwd and
 * linking back to the original via parentSession), the runtime
 * switches onto it, and the original session file is removed.
 *
 * Usage:
 *   /cd ../other-project
 *   /cd ~/Work/some-repo
 *
 * Auto-completion lists subdirectories of the current cwd (or of the
 * typed prefix if it ends with "/").
 */

import { readdirSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function listDirs(dir: string): string[] {
	try {
		return readdirSync(dir, { withFileTypes: true })
			.filter((e) => e.isDirectory() && !e.name.startsWith("."))
			.map((e) => e.name)
			.sort();
	} catch {
		return [];
	}
}

function dirExists(path: string): boolean {
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function expandHome(path: string): string {
	return path === "~" || path.startsWith("~/")
		? path.replace("~", process.env.HOME ?? "~")
		: path;
}

/**
 * Write a copy of the session into the target project's session dir with a
 * rewritten header (new cwd, parentSession back-link). Returns the new file path.
 */
async function moveSession(
	sourceFile: string,
	header: Record<string, unknown>,
	branch: unknown[],
	targetCwd: string,
): Promise<string> {
	const { appendFileSync, mkdirSync, writeFileSync } = await import("node:fs");
	const { join: joinPath } = await import("node:path");

	const { getAgentDir } = await import("@earendil-works/pi-coding-agent");
	const dir = joinPath(getAgentDir(), "sessions", `--${targetCwd.replace(/^[\\/]/, "").replace(/[\\/:]/g, "-")}--`);
	mkdirSync(dir, { recursive: true });

	const id = String(header.id ?? crypto.randomUUID());
	const timestamp = new Date().toISOString();
	const fileTimestamp = timestamp.replace(/[:.]/g, "-");
	const newFile = joinPath(dir, `${fileTimestamp}_${id}.jsonl`);

	const newHeader = {
		...header,
		cwd: targetCwd,
		parentSession: sourceFile,
		timestamp,
	};
	writeFileSync(newFile, `${JSON.stringify(newHeader)}\n`, { flag: "wx" });
	for (const entry of branch) {
		appendFileSync(newFile, `${JSON.stringify(entry)}\n`);
	}
	return newFile;
}

export default function (pi: ExtensionAPI) {
	// Track the session cwd so completions work without a ctx argument.
	let sessionCwd = process.cwd();
	pi.on("session_start", async (_event, ctx) => {
		sessionCwd = ctx.cwd;
	});

	pi.registerCommand("cd", {
		description: "Move this session to another directory",
		getArgumentCompletions: (prefix: string): AutocompleteItem[] | null => {
			// Complete subdirectories of the current cwd, or of the typed
			// prefix when it points into a directory.
			let base: string;
			let displayBase: string;
			const lastSlash = prefix.lastIndexOf("/");
			if (lastSlash === -1) {
				base = sessionCwd;
				displayBase = "";
			} else {
				const typed = prefix.slice(0, lastSlash + 1);
				base = isAbsolute(typed) ? typed : resolve(sessionCwd, expandHome(typed));
				displayBase = typed;
			}
			if (!dirExists(base)) return null;

			const partial = prefix.slice(lastSlash + 1);
			const items = listDirs(base)
				.filter((name) => name.startsWith(partial))
				.map((name) => ({
					value: `${displayBase}${name}/`,
					label: `${displayBase}${name}/`,
				}));
			return items.length > 0 ? items : null;
		},
		handler: async (args, ctx) => {
			const target = args.trim();
			if (!target) {
				ctx.ui.notify("Usage: /cd <directory>", "error");
				return;
			}

			const resolved = resolve(ctx.cwd, expandHome(target));
			if (!dirExists(resolved)) {
				ctx.ui.notify(`Not a directory: ${resolved}`, "error");
				return;
			}
			if (resolved === resolve(ctx.cwd)) {
				ctx.ui.notify(`Already in ${resolved}`, "info");
				return;
			}

			const sourceFile = ctx.sessionManager.getSessionFile();
			if (!sourceFile || !ctx.sessionManager.isPersisted()) {
				ctx.ui.notify("Session is not persisted; cannot move it", "error");
				return;
			}

			// Move the session into the target project's session dir:
			// rebuild the header with the new cwd (and parentSession back-link)
			// and append the in-memory branch entries. forkFrom() reads from
			// disk, which can lag behind unflushed in-memory entries, so the
			// copy is written directly from sessionManager state instead.
			const header = ctx.sessionManager.getHeader();
			const branch = ctx.sessionManager.getBranch();
			const newFile = await moveSession(sourceFile, header, branch, resolved);

			// Switch the runtime onto the moved session. All post-switch work
			// must use the replacement ctx; the original ctx is stale.
			const result = await ctx.switchSession(newFile, {
				withSession: async (newCtx) => {
					// Remove the original session file so the session truly moved.
					try {
						const { rmSync } = await import("node:fs");
						rmSync(sourceFile);
					} catch (err) {
						newCtx.ui.notify(`Moved, but could not remove old session file: ${err}`, "info");
					}
					newCtx.ui.notify(`Session moved to ${resolved}`, "info");
				},
			});

			if (result.cancelled) {
				// An extension cancelled the switch; clean up the copy.
				try {
					const { rmSync } = await import("node:fs");
					rmSync(newFile);
				} catch {
					// ignore
				}
				ctx.ui.notify("Move cancelled", "info");
			}
		},
	});
}
