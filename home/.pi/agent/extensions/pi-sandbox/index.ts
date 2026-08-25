import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { SandboxManager } from "@anthropic-ai/sandbox-runtime";
import {
  createBashTool,
  type BashOperations,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";

function list(name: string): string[] {
  const value = process.env[name];
  return value ? value.split("\n").filter(Boolean) : [];
}

function sandboxedOperations(): BashOperations {
  return {
    async exec(command, cwd, { onData, signal, timeout }) {
      if (!existsSync(cwd)) throw new Error(`Working directory does not exist: ${cwd}`);
      const wrapped = await SandboxManager.wrapWithSandbox(command);

      return new Promise((resolve, reject) => {
        const child = spawn("bash", ["-c", wrapped], {
          cwd,
          detached: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        let timedOut = false;
        let timer: NodeJS.Timeout | undefined;

        const kill = () => {
          if (!child.pid) return;
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {
            child.kill("SIGKILL");
          }
        };
        if (timeout !== undefined && timeout > 0) {
          timer = setTimeout(() => {
            timedOut = true;
            kill();
          }, timeout * 1000);
        }
        const abort = () => kill();
        signal?.addEventListener("abort", abort, { once: true });
        child.stdout?.on("data", onData);
        child.stderr?.on("data", onData);
        child.on("error", reject);
        child.on("close", (code) => {
          if (timer) clearTimeout(timer);
          signal?.removeEventListener("abort", abort);
          if (signal?.aborted) reject(new Error("aborted"));
          else if (timedOut) reject(new Error(`timeout:${timeout}`));
          else resolve({ exitCode: code });
        });
      });
    },
  };
}

export default async function piSandbox(pi: ExtensionAPI) {
  const cwd = process.cwd();
  const reads = list("PI_SANDBOX_READ");
  const writes = list("PI_SANDBOX_WRITE");
  const domains = list("PI_SANDBOX_NET");

  if (reads.length === 0) throw new Error("PI_SANDBOX_READ is empty");

  // Initialization is deliberately awaited. A failure rejects extension startup;
  // there is no unsandboxed Bash fallback.
  if (domains.length > 0) throw new Error("nested network grants are not supported");

  await SandboxManager.initialize({
    // External discard ports avoid opening the runtime's loopback proxy inside
    // Mise's network-denied process. Outer Mise blocks every network socket.
    network: {
      allowedDomains: [],
      deniedDomains: [],
      httpProxyPort: 9,
      socksProxyPort: 9,
    },
    filesystem: {
      denyRead: [],
      allowWrite: writes,
      denyWrite: [".env", ".env.*", "*.pem", "*.key"],
    },
    // Pi itself already runs under Mise. Use the runtime's supported nested mode
    // rather than silently dropping Bash confinement.
    enableWeakerNestedSandbox: true,
  });

  const bash = createBashTool(cwd, { operations: sandboxedOperations() });
  pi.registerTool({ ...bash, label: "bash (sandboxed)" });
  pi.on("user_bash", () => ({ operations: sandboxedOperations() }));
  pi.on("session_start", (_event, ctx) => {
    ctx.ui.setStatus("sandbox", "🔒 Bash sandbox active");
  });
  pi.on("session_shutdown", async () => {
    await SandboxManager.reset();
  });
}
