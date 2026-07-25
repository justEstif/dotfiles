import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";

type Completion = { value: string; label?: string; description?: string };
type CompletionMap = Record<number, Completion[]>;

type EnhancedPrompt = {
	name: string;
	description: string;
	argumentCompletions: CompletionMap;
	body: string;
};

const PROMPTS_DIR = join(homedir(), ".pi/agent/prompts");

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
	if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw };
	const end = raw.indexOf("\n---", 4);
	if (end === -1) return { frontmatter: {}, body: raw };
	const yaml = raw.slice(4, end).split("\n");
	const body = raw.slice(end + "\n---".length).replace(/^\n/, "");
	const frontmatter: Record<string, unknown> = {};

	for (let i = 0; i < yaml.length; i++) {
		const line = yaml[i];
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) continue;
		const [, key, rawValue] = match;

		if (key === "argument-completions") {
			const { completions, nextIndex } = parseArgumentCompletions(yaml, i + 1);
			frontmatter[key] = completions;
			i = nextIndex - 1;
			continue;
		}

		if (rawValue === "") {
			const values: string[] = [];
			while (i + 1 < yaml.length) {
				const next = yaml[i + 1];
				const item = next.match(/^\s*-\s*(.*)$/);
				if (!item) break;
				values.push(unquote(item[1].trim()));
				i++;
			}
			frontmatter[key] = values;
		} else {
			frontmatter[key] = unquote(rawValue.trim());
		}
	}

	return { frontmatter, body };
}

function parseArgumentCompletions(lines: string[], startIndex: number): { completions: CompletionMap; nextIndex: number } {
	const completions: CompletionMap = {};
	let currentArg = 1;
	let currentItem: Completion | undefined;
	let sawPositionalKey = false;
	let i = startIndex;

	for (; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim() === "") continue;
		if (!/^\s/.test(line)) break;

		const positional = line.match(/^\s{2}(?:\$(\d+)|(\d+)):\s*(?:\[(.*)\])?\s*$/);
		if (positional) {
			currentArg = Number(positional[1] ?? positional[2]);
			sawPositionalKey = true;
			completions[currentArg] ??= [];
			currentItem = undefined;
			const inline = positional[3];
			if (inline) {
				completions[currentArg].push(...inline.split(",").map((value) => ({ value: unquote(value.trim()) })).filter((item) => item.value));
			}
			continue;
		}

		const objectItem = line.match(/^\s{4}-\s*value:\s*(.*)$/) ?? (!sawPositionalKey ? line.match(/^\s{2}-\s*value:\s*(.*)$/) : null);
		if (objectItem) {
			currentItem = { value: unquote(objectItem[1].trim()) };
			completions[currentArg] ??= [];
			completions[currentArg].push(currentItem);
			continue;
		}

		const scalarItem = line.match(/^\s{4}-\s*(.*)$/) ?? (!sawPositionalKey ? line.match(/^\s{2}-\s*(.*)$/) : null);
		if (scalarItem && !scalarItem[1].includes(":")) {
			currentItem = { value: unquote(scalarItem[1].trim()) };
			completions[currentArg] ??= [];
			completions[currentArg].push(currentItem);
			continue;
		}

		const prop = line.match(/^\s{6}(label|description):\s*(.*)$/) ?? (!sawPositionalKey ? line.match(/^\s{4}(label|description):\s*(.*)$/) : null);
		if (prop && currentItem) {
			currentItem[prop[1] as "label" | "description"] = unquote(prop[2].trim());
		}
	}

	return { completions, nextIndex: i };
}

function unquote(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
	return value;
}

function parseArgs(argsString: string): string[] {
	const args: string[] = [];
	let current = "";
	let quote: string | null = null;
	for (const char of argsString) {
		if (quote) {
			if (char === quote) quote = null;
			else current += char;
		} else if (char === '"' || char === "'") quote = char;
		else if (/\s/.test(char)) {
			if (current) {
				args.push(current);
				current = "";
			}
		} else current += char;
	}
	if (current) args.push(current);
	return args;
}

function currentArgument(prefix: string): { position: number; token: string } {
	const trimmedStart = prefix.trimStart();
	const endsWithSpace = /\s$/.test(trimmedStart);
	const args = parseArgs(trimmedStart);
	return { position: endsWithSpace ? args.length + 1 : Math.max(1, args.length), token: endsWithSpace ? "" : (args.at(-1) ?? "") };
}

function substituteArgs(content: string, args: string[]): string {
	const allArgs = args.join(" ");
	return content.replace(/\$\{(\d+):-([^}]*)\}|\$\{@:(\d+)(?::(\d+))?\}|\$(ARGUMENTS|@|\d+)/g, (_match, defaultNum, defaultValue, sliceStart, sliceLength, simple) => {
		if (defaultNum) return args[Number(defaultNum) - 1] || defaultValue;
		if (sliceStart) {
			const start = Math.max(0, Number(sliceStart) - 1);
			return sliceLength ? args.slice(start, start + Number(sliceLength)).join(" ") : args.slice(start).join(" ");
		}
		if (simple === "ARGUMENTS" || simple === "@") return allArgs;
		return args[Number(simple) - 1] ?? "";
	});
}

function inferCompletionsFromHint(hint: unknown): CompletionMap {
	if (typeof hint !== "string") return {};
	const firstRequired = hint.match(/<([^>]+)>/);
	if (!firstRequired || !firstRequired[1].includes("|")) return {};
	return { 1: firstRequired[1].split("|").map((value) => ({ value: value.trim() })).filter((item) => item.value) };
}

function loadEnhancedPrompts(): EnhancedPrompt[] {
	if (!existsSync(PROMPTS_DIR)) return [];
	const prompts: EnhancedPrompt[] = [];
	for (const entry of readdirSync(PROMPTS_DIR, { withFileTypes: true })) {
		const path = join(PROMPTS_DIR, entry.name);
		let isFile = entry.isFile();
		if (entry.isSymbolicLink()) {
			try { isFile = statSync(path).isFile(); } catch { continue; }
		}
		if (!isFile || !entry.name.endsWith(".md")) continue;

		const { frontmatter, body } = parseFrontmatter(readFileSync(path, "utf-8"));
		const explicit = frontmatter["argument-completions"] as CompletionMap | undefined;
		const inferred = inferCompletionsFromHint(frontmatter["argument-hint"]);
		const argumentCompletions = explicit && Object.keys(explicit).length > 0 ? explicit : inferred;
		if (Object.keys(argumentCompletions).length === 0) continue;

		prompts.push({
			name: basename(entry.name, ".md"),
			description: String(frontmatter.description ?? body.split("\n").find((line) => line.trim()) ?? ""),
			argumentCompletions,
			body,
		});
	}
	return prompts;
}

export default function promptCompletions(pi: ExtensionAPI) {
	for (const prompt of loadEnhancedPrompts()) {
		pi.registerCommand(prompt.name, {
			description: prompt.description,
			getArgumentCompletions: (prefix: string): AutocompleteItem[] | null => {
				const { position, token } = currentArgument(prefix);
				const completions = prompt.argumentCompletions[position] ?? [];
				const matches = completions
					.filter((item) => item.value.startsWith(token))
					.map((item) => ({ value: item.value, label: item.label ?? item.value, description: item.description }));
				return matches.length > 0 ? matches : null;
			},
			handler: async (args) => {
				pi.sendUserMessage(substituteArgs(prompt.body, parseArgs(args)));
			},
		});
	}
}
