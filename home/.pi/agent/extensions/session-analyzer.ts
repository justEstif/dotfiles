// Session Analyzer — point a model at a session, surface behavioral patterns,
// and propose skills + prompt templates that encode the lessons so you stop
// re-teaching the agent the same things.
//
// Usage:
//   /analyze-session            analyze the CURRENT session
//   /analyze-session pick       pick any past session from a list
//   /analyze-session <id|path>  analyze a specific session (partial UUID or file path)
//
// Flow: extract conversation -> call the currently-selected model for structured
// JSON analysis -> render a concise Markdown report -> offer to scaffold the
// suggested skills (into ~/.agents/skills or ~/.pi/agent/skills) and prompts
// (into ~/.pi/agent/prompts). Existing files are skipped, never overwritten.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

import { complete } from "@earendil-works/pi-ai/compat";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { DynamicBorder, getMarkdownTheme, SessionManager } from "@earendil-works/pi-coding-agent";
import { Container, Markdown, matchesKey, Text } from "@earendil-works/pi-tui";

// --- Limits ----------------------------------------------------------------

// Cap transcript size sent to the model. Keeps us inside context windows and
// avoids runaway cost on very long sessions.
const MAX_CONVERSATION_CHARS = 45_000;
const KEEP_HEAD_CHARS = 4_000;

// --- Types -----------------------------------------------------------------

// Loose view of a session entry. We parse entries generically (mirrors the
// summarize.ts example) rather than importing pi's strict SessionEntry union,
// which would force per-role narrowing just to read .content.
type ContentBlock = {
	type?: string;
	text?: string;
	name?: string;
	arguments?: Record<string, unknown>;
};

interface SessionEntryLike {
	type: string;
	timestamp: string;
	message?: { role?: string; content?: unknown };
	summary?: string;
}

interface AnalysisResult {
	patterns: { title: string; detail: string; evidence: string }[];
	preferences: { preference: string; evidence: string }[];
	skills: {
		name: string;
		description: string;
		body: string;
		reason: string;
	}[];
	prompts: {
		name: string;
		description: string;
		body: string;
		reason: string;
	}[];
}

interface ConversationExtract {
	text: string;
	userMessages: number;
	assistantMessages: number;
	toolCalls: Record<string, number>;
	truncated: boolean;
}

// --- Conversation extraction (mirrors the summarize.ts example) ------------

function extractTextParts(content: unknown): string[] {
	if (typeof content === "string") return [content];
	if (!Array.isArray(content)) return [];
	const parts: string[] = [];
	for (const block of content as ContentBlock[]) {
		if (block && block.type === "text" && typeof block.text === "string") {
			parts.push(block.text);
		}
	}
	return parts;
}

function extractToolCalls(content: unknown): string[] {
	if (!Array.isArray(content)) return [];
	const calls: string[] = [];
	for (const block of content as ContentBlock[]) {
		if (block && block.type === "toolCall" && typeof block.name === "string") {
			calls.push(block.name);
		}
	}
	return calls;
}

function summarizeArgs(args: Record<string, unknown>): string {
	// Compact one-line preview of tool args (path/command/text), capped.
	const bits: string[] = [];
	for (const [key, value] of Object.entries(args)) {
		if (value == null) continue;
		const str = typeof value === "string" ? value : JSON.stringify(value);
		if (!str) continue;
		bits.push(`${key}=${str.length > 60 ? str.slice(0, 60) + "…" : str}`);
		if (bits.length >= 2) break;
	}
	return bits.join(", ");
}

function buildConversationExtract(entries: SessionEntryLike[]): ConversationExtract {
	const sections: string[] = [];
	let userMessages = 0;
	let assistantMessages = 0;
	const toolCalls: Record<string, number> = {};
	let truncated = false;

	for (const entry of entries) {
		if (entry.type === "compaction" && typeof entry.summary === "string") {
			sections.push(`[earlier context summarized] ${entry.summary}`);
			continue;
		}
		if (entry.type === "branch_summary" && typeof entry.summary === "string") {
			sections.push(`[branch context] ${entry.summary}`);
			continue;
		}
		if (entry.type !== "message" || !entry.message?.role) continue;

		const role = entry.message.role;
		const isUser = role === "user";
		const isAssistant = role === "assistant";
		if (!isUser && !isAssistant) continue;
		if (isUser) userMessages++;
		if (isAssistant) assistantMessages++;

		const lines: string[] = [];
		const text = extractTextParts(entry.message.content).join("\n").trim();
		if (text) lines.push(`${isUser ? "User" : "Assistant"}: ${text}`);

		if (isAssistant) {
			for (const tool of extractToolCalls(entry.message.content)) {
				toolCalls[tool] = (toolCalls[tool] ?? 0) + 1;
			}
			// Re-scan for arg previews (kept separate for readability).
			const content = entry.message.content;
			if (Array.isArray(content)) {
				for (const block of content as ContentBlock[]) {
					if (block?.type === "toolCall" && typeof block.name === "string") {
						lines.push(`  [tool] ${block.name}(${summarizeArgs(block.arguments ?? {})})`);
					}
				}
			}
		}

		if (lines.length) sections.push(lines.join("\n"));
	}

	let text = sections.join("\n\n");
	if (text.length > MAX_CONVERSATION_CHARS) {
		const tail = text.slice(text.length - (MAX_CONVERSATION_CHARS - KEEP_HEAD_CHARS));
		const head = text.slice(0, KEEP_HEAD_CHARS);
		text = `${head}\n\n[…middle of session truncated for length…]\n\n${tail}`;
		truncated = true;
	}

	return { text, userMessages, assistantMessages, toolCalls, truncated };
}

// --- JSON extraction & validation -----------------------------------------

function extractJson(text: string): unknown {
	const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fence?.[1] ?? text;
	const start = candidate.indexOf("{");
	const end = candidate.lastIndexOf("}");
	if (start === -1 || end === -1 || end <= start) {
		throw new Error("No JSON object found in model response.");
	}
	return JSON.parse(candidate.slice(start, end + 1));
}

function asStringArray(value: unknown): { title: string; detail: string; evidence: string }[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((v) => (v && typeof v === "object" ? v : {}) as Record<string, unknown>)
		.map((v) => ({
			title: String(v.title ?? v.pattern ?? "").trim(),
			detail: String(v.detail ?? v.description ?? "").trim(),
			evidence: String(v.evidence ?? "").trim(),
		}))
		.filter((v) => v.title || v.detail);
}

function asPropArray(value: unknown): { preference: string; evidence: string }[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((v) => (v && typeof v === "object" ? v : {}) as Record<string, unknown>)
		.map((v) => ({
			preference: String(v.preference ?? v.rule ?? "").trim(),
			evidence: String(v.evidence ?? "").trim(),
		}))
		.filter((v) => v.preference);
}

function asArtifactArray(
	value: unknown,
): { name: string; description: string; body: string; reason: string }[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((v) => (v && typeof v === "object" ? v : {}) as Record<string, unknown>)
		.map((v) => ({
			name: String(v.name ?? "").trim(),
			description: String(v.description ?? "").trim(),
			body: String(v.body ?? "").trim(),
			reason: String(v.reason ?? v.why ?? "").trim(),
		}))
		.filter((v) => v.name && v.body);
}

function coerceResult(raw: unknown): AnalysisResult {
	const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
	return {
		patterns: asStringArray(obj.patterns),
		preferences: asPropArray(obj.preferences),
		skills: asArtifactArray(obj.skills),
		prompts: asArtifactArray(obj.prompts),
	};
}

// --- Scaffolding helpers ---------------------------------------------------

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-")
		.slice(0, 64);
}

function skillsTargetDir(): string {
	const home = homedir();
	const agentsSkills = join(home, ".agents", "skills");
	return existsSync(agentsSkills) ? agentsSkills : join(home, ".pi", "agent", "skills");
}

function promptsTargetDir(): string {
	return join(homedir(), ".pi", "agent", "prompts");
}

interface ScaffoldOutcome {
	kind: "skill" | "prompt";
	name: string;
	path: string;
	skipped: boolean;
}

function scaffoldSkill(
	dir: string,
	skill: { name: string; description: string; body: string },
): ScaffoldOutcome | undefined {
	const name = slugify(skill.name);
	if (!name) return undefined;
	const skillDir = join(dir, name);
	const file = join(skillDir, "SKILL.md");
	if (existsSync(file)) return { kind: "skill", name, path: file, skipped: true };
	mkdirSync(skillDir, { recursive: true });
	// Frontmatter is generated to guarantee a valid, well-formed header.
	const content = `---\nname: ${name}\ndescription: ${skill.description.slice(0, 1024)}\n---\n\n${skill.body.trim()}\n`;
	writeFileSync(file, content, "utf8");
	return { kind: "skill", name, path: file, skipped: false };
}

function scaffoldPrompt(
	dir: string,
	prompt: { name: string; description: string; body: string },
): ScaffoldOutcome | undefined {
	const name = slugify(prompt.name);
	if (!name) return undefined;
	const file = join(dir, `${name}.md`);
	if (existsSync(file)) return { kind: "prompt", name, path: file, skipped: true };
	const body = prompt.body.trimStart().startsWith("---")
		? prompt.body.trim()
		: `---\ndescription: ${prompt.description.slice(0, 1024)}\n---\n\n${prompt.body.trim()}\n`;
	writeFileSync(file, body, "utf8");
	return { kind: "prompt", name, path: file, skipped: false };
}

// --- Analysis prompt -------------------------------------------------------

function buildAnalysisPrompt(
	conv: ConversationExtract,
	meta: { cwd: string; modelLabel: string; sessionLabel: string },
): string {
	const topTools = Object.entries(conv.toolCalls)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8)
		.map(([name, count]) => `${name} (${count})`)
		.join(", ");

	return [
		"You are analyzing a developer's coding-agent session to surface reusable knowledge.",
		"",
		`Session metadata:`,
		`- working directory: ${meta.cwd}`,
		`- session: ${meta.sessionLabel}`,
		`- model used: ${meta.modelLabel}`,
		`- ${conv.userMessages} user messages, ${conv.assistantMessages} assistant messages`,
		topTools ? `- most-used tools: ${topTools}` : "- most-used tools: (none)",
		conv.truncated ? "- NOTE: the middle of this long session was truncated." : "",
		"",
		"Your job: identify PATTERNS in how the user works and anything they had to repeatedly",
		"teach, correct, or steer the agent toward. Then propose concrete SKILLS and PROMPT",
		"TEMPLATES that encode those lessons so they don't have to be re-taught.",
		"",
		"Return ONLY a JSON object (no prose outside the JSON) with this EXACT shape:",
		`{`,
		`  "patterns": [ { "title": "short label", "detail": "1-2 sentences", "evidence": "brief quote/paraphrase" } ],`,
		`  "preferences": [ { "preference": "a style/rule the user prefers", "evidence": "..." } ],`,
		`  "skills": [ {`,
		`    "name": "kebab-case-name",`,
		`    "description": "<=200 chars: what it does AND when to use it (this drives auto-loading)",`,
		`    "body": "Full markdown instructions the agent follows. Start with a # heading, then concrete steps. No YAML frontmatter.",`,
		`    "reason": "why this skill is worth creating"`,
		`  } ],`,
		`  "prompts": [ {`,
		`    "name": "short-name",`,
		`    "description": "what this prompt does",`,
		`    "body": "The prompt text. Use {{placeholder}} for variables the user fills in.",`,
		`    "reason": "why this prompt is worth creating"`,
		`  } ]`,
		`}`,
		"",
		"Rules:",
		"- Be specific and grounded in the transcript; quote real examples in 'evidence'.",
		"- Only propose a skill/prompt for a genuinely REPEATED workflow or correction.",
		"  Quality over quantity — 0 to 5 of each is fine. Prefer fewer, sharper artifacts.",
		"- Skill bodies must be immediately usable instructions, not meta-commentary.",
		"- Do NOT include YAML frontmatter in skill bodies (it is added automatically).",
		"- Output valid JSON only.",
		"",
		"<transcript>",
		conv.text,
		"</transcript>",
	].join("\n");
}

// --- Report rendering ------------------------------------------------------

function renderReport(
	result: AnalysisResult,
	meta: { sessionLabel: string; modelLabel: string; conv: ConversationExtract },
): string {
	const lines: string[] = [`# Session Analysis — ${meta.sessionLabel}`, ""];

	lines.push(`_analyzed with ${meta.modelLabel} · ${meta.conv.userMessages} user / ${meta.conv.assistantMessages} assistant msgs_`, "");

	if (result.patterns.length) {
		lines.push("## Recurring patterns", "");
		for (const p of result.patterns) {
			lines.push(`- **${p.title}** — ${p.detail}`);
			if (p.evidence) lines.push(`  - _evidence: ${p.evidence}_`);
		}
		lines.push("");
	}

	if (result.preferences.length) {
		lines.push("## Learned preferences", "");
		for (const p of result.preferences) {
			lines.push(`- ${p.preference}`);
			if (p.evidence) lines.push(`  - _evidence: ${p.evidence}_`);
		}
		lines.push("");
	}

	if (result.skills.length) {
		lines.push("## Suggested skills", "");
		for (const s of result.skills) lines.push(`- **${slugify(s.name) || s.name}** — ${s.reason}`);
		lines.push("");
	}

	if (result.prompts.length) {
		lines.push("## Suggested prompts", "");
		for (const p of result.prompts) lines.push(`- **${slugify(p.name) || p.name}** — ${p.reason}`);
		lines.push("");
	}

	if (!result.patterns.length && !result.preferences.length && !result.skills.length && !result.prompts.length) {
		lines.push("_No strong reusable patterns found in this session._", "");
	}

	const total = result.skills.length + result.prompts.length;
	if (total > 0) {
		lines.push(`---`, "", `${total} artifact${total === 1 ? "" : "s"} ready to scaffold. Choose to write them after closing this.`, "");
	}

	return lines.join("\n");
}

async function showReport(report: string, ctx: ExtensionCommandContext): Promise<void> {
	if (ctx.mode !== "tui") return;
	await ctx.ui.custom((_tui, theme, _kb, done) => {
		const container = new Container();
		const border = new DynamicBorder((s: string) => theme.fg("accent", s));
		container.addChild(border);
		container.addChild(new Text(theme.fg("accent", theme.bold("Session Analyzer")), 1, 0));
		container.addChild(new Markdown(report, 1, 1, getMarkdownTheme()));
		container.addChild(new Text(theme.fg("dim", "Enter or Esc to close"), 1, 0));
		container.addChild(border);
		return {
			render: (width: number) => container.render(width),
			invalidate: () => container.invalidate(),
			handleInput: (data: string) => {
				if (matchesKey(data, "enter") || matchesKey(data, "escape")) done(undefined);
			},
		};
	});
}

// --- Scaffolding flow ------------------------------------------------------

async function offerScaffold(
	result: AnalysisResult,
	ctx: ExtensionCommandContext,
): Promise<void> {
	const total = result.skills.length + result.prompts.length;
	if (total === 0) return;

	const ok = await ctx.ui.confirm(
		"Scaffold artifacts?",
		`Write ${result.skills.length} skill(s) and ${result.prompts.length} prompt(s)? Existing files are skipped.`,
	);
	if (!ok) {
		ctx.ui.notify("Skipped scaffolding. Re-run /analyze-session anytime.", "info");
		return;
	}

	const skillsDir = skillsTargetDir();
	const promptsDir = promptsTargetDir();
	const outcomes: ScaffoldOutcome[] = [];
	for (const skill of result.skills) {
		const o = scaffoldSkill(skillsDir, skill);
		if (o) outcomes.push(o);
	}
	for (const prompt of result.prompts) {
		const o = scaffoldPrompt(promptsDir, prompt);
		if (o) outcomes.push(o);
	}

	const created = outcomes.filter((o) => !o.skipped);
	const skipped = outcomes.filter((o) => o.skipped);
	const parts: string[] = [];
	if (created.length) parts.push(`created ${created.length}`);
	if (skipped.length) parts.push(`skipped ${skipped.length} (already exist)`);
	ctx.ui.notify(`Scaffold complete — ${parts.join(", ")}. Run /reload to activate.`, "info");
}

// --- Session resolution ----------------------------------------------------

function labelFor(info: { name?: string; firstMessage?: string; path?: string }): string {
	if (info.name) return info.name;
	if (info.firstMessage) return info.firstMessage.slice(0, 60);
	return info.path ? basename(info.path) : "session";
}

async function pickSessionPath(ctx: ExtensionCommandContext): Promise<string | undefined> {
	const sessions = await SessionManager.listAll();
	if (sessions.length === 0) {
		ctx.ui.notify("No past sessions found.", "warning");
		return undefined;
	}
	// Newest first.
	sessions.sort((a, b) => b.modified.getTime() - a.modified.getTime());
	const options = sessions.map((s) => {
		const label = labelFor(s);
		const date = s.modified.toLocaleDateString();
		return `${label}  ·  ${s.messageCount} msgs  ·  ${date}${s.cwd ? `  ·  ${s.cwd}` : ""}`;
	});
	const choice = await ctx.ui.select("Analyze which session?", options);
	if (!choice) return undefined;
	const idx = options.indexOf(choice);
	return sessions[idx]?.path;
}

async function resolveSession(
	arg: string,
	ctx: ExtensionCommandContext,
): Promise<{ entries: SessionEntryLike[]; label: string } | undefined> {
	const trimmed = arg.trim();

	// Default: current session.
	if (!trimmed) {
		const entries: SessionEntryLike[] = ctx.sessionManager.getBranch();
		const file = ctx.sessionManager.getSessionFile();
		const name = ctx.sessionManager.getSessionName?.();
		return { entries, label: name || (file ? basename(file) : "current session") };
	}

	// Explicit picker.
	if (trimmed === "pick" || trimmed === "list") {
		const path = await pickSessionPath(ctx);
		if (!path) return undefined;
		const sm = SessionManager.open(path);
		return { entries: sm.getBranch(), label: labelFor({ path, name: sm.getSessionName?.() }) };
	}

	// Path on disk.
	if (existsSync(trimmed)) {
		const sm = SessionManager.open(trimmed);
		return { entries: sm.getBranch(), label: labelFor({ path: trimmed, name: sm.getSessionName?.() }) };
	}

	// Partial UUID / id match across all sessions.
	const sessions = await SessionManager.listAll();
	const match = sessions.find((s) => s.id.startsWith(trimmed) || s.path.includes(trimmed));
	if (!match) {
		ctx.ui.notify(`No session matches "${trimmed}". Try /analyze-session pick.`, "error");
		return undefined;
	}
	const sm = SessionManager.open(match.path);
	return { entries: sm.getBranch(), label: labelFor(match) };
}

// --- Extension entry point -------------------------------------------------

export default function sessionAnalyzer(pi: ExtensionAPI) {
	pi.registerCommand("analyze-session", {
		description: "Analyze a session for patterns and suggest skills/prompts to create",
		handler: async (args, ctx) => {
			const resolved = await resolveSession(args ?? "", ctx);
			if (!resolved) return;
			const { entries, label } = resolved;

			// Chronological order (getBranch walks leaf->root on some versions).
			const ordered = [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
			const conv = buildConversationExtract(ordered);

			if (!conv.text.trim()) {
				ctx.ui.notify("No conversation text found in that session.", "warning");
				return;
			}

			const model = ctx.model;
			if (!model) {
				ctx.ui.notify("Select a model first (Ctrl+L), then re-run /analyze-session.", "error");
				return;
			}

			const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
			if (!auth.ok || !auth.apiKey) {
				ctx.ui.notify(auth.ok ? `No API key for ${model.provider}/${model.id}` : auth.error, "error");
				return;
			}

			const modelLabel = `${model.provider}/${model.id}`;
			ctx.ui.notify(`Analyzing "${label}" with ${modelLabel}…`, "info");

			const messages = [
				{
					role: "user" as const,
					content: [{ type: "text" as const, text: buildAnalysisPrompt(conv, { cwd: ctx.cwd, modelLabel, sessionLabel: label }) }],
					timestamp: Date.now(),
				},
			];

			let result: AnalysisResult;
			try {
				const response = await complete(
					model,
					{ messages },
					{
						apiKey: auth.apiKey,
						headers: auth.headers,
						env: auth.env,
						signal: ctx.signal,
						...(model.reasoning ? { reasoning: "medium" } : {}),
					},
				);
				const text = response.content
					.filter((c): c is { type: "text"; text: string } => c.type === "text")
					.map((c) => c.text)
					.join("\n");
				result = coerceResult(extractJson(text));
			} catch (err) {
				ctx.ui.notify(`Analysis failed: ${err instanceof Error ? err.message : String(err)}`, "error");
				return;
			}

			if (
				result.patterns.length === 0 &&
				result.preferences.length === 0 &&
				result.skills.length === 0 &&
				result.prompts.length === 0
			) {
				ctx.ui.notify("Analysis returned nothing usable. Try a different or longer session.", "warning");
				return;
			}

			await showReport(renderReport(result, { sessionLabel: label, modelLabel, conv }), ctx);
			await offerScaffold(result, ctx);
		},
	});
}
