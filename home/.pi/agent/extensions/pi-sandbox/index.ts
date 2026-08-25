import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

type Decision =
  | { action: "allow" }
  | { action: "ask" }
  | { action: "deny"; reason: string };

function rules(name: string): Set<string> {
  const value = process.env[name];
  return new Set(value ? value.split("\n").map(rule => rule.trim()).filter(Boolean) : []);
}

// Keep v1 deliberately small: only one simple shell command can be granted.
// Composition, expansion, redirection, and escaping remain denied even when a
// rule accidentally contains them.
const opaqueShellSyntax = /[\n\r;&|`$<>\\(){}]/;

export function classifyCommand(
  command: string,
  allow: ReadonlySet<string>,
  ask: ReadonlySet<string>,
): Decision {
  const normalized = command.trim();
  if (!normalized) return { action: "deny", reason: "Empty Bash command" };
  if (opaqueShellSyntax.test(normalized)) {
    return {
      action: "deny",
      reason: "Shell composition, expansion, redirection, and escaping are not grantable",
    };
  }
  if (ask.has(normalized)) return { action: "ask" };
  if (allow.has(normalized)) return { action: "allow" };
  return { action: "deny", reason: "Command is not in the sandbox allowlist" };
}

export default function piSandboxPermissionGate(pi: ExtensionAPI) {
  const allow = rules("PI_SANDBOX_ALLOW_COMMANDS");
  const ask = rules("PI_SANDBOX_ASK_COMMANDS");

  pi.on("tool_call", async (event, ctx) => {
    if (!isToolCallEventType("bash", event)) return;

    const command = event.input.command;
    const decision = classifyCommand(command, allow, ask);
    if (decision.action === "allow") return;
    if (decision.action === "deny") {
      return { block: true, reason: decision.reason };
    }

    if (ctx.mode !== "tui" || !ctx.hasUI) {
      return {
        block: true,
        reason: "Command requires approval, but this run is non-interactive",
      };
    }

    try {
      const approved = await ctx.ui.confirm(
        "Allow sandboxed Bash command?",
        `${command}\n\nApproval applies to this tool call only.`,
      );
      if (approved) return;
      return { block: true, reason: "Command was not approved" };
    } catch {
      return { block: true, reason: "Command approval failed closed" };
    }
  });
}
