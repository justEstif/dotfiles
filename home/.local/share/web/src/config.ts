import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface SearxConfig {
  baseUrl: string;
  user?: string;
  pass?: string;
  engines?: string[];
}

export function loadConfig(): SearxConfig {
  try {
    const auth = JSON.parse(
      readFileSync(join(homedir(), ".pi/agent/auth.json"), "utf-8"),
    );
    const entry = auth.searxng;
    if (entry?.baseUrl) {
      return {
        baseUrl: entry.baseUrl,
        user: entry.user,
        pass: entry.pass,
        engines: Array.isArray(entry.engines)
          ? entry.engines.filter((e: unknown): e is string => typeof e === "string" && e.length > 0)
          : undefined,
      };
    }
  } catch {
    // fallthrough
  }
  console.error(
    'No searxng config found in ~/.pi/agent/auth.json. Add a "searxng" entry with baseUrl (and optional user/pass/engines).',
  );
  process.exit(1);
}

export function authHeader(cfg: SearxConfig): Record<string, string> {
  if (cfg.user && cfg.pass) {
    const encoded = Buffer.from(`${cfg.user}:${cfg.pass}`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

export interface XConfig {
  authToken?: string;
  ct0?: string;
  bearer?: string;
  searchQueryId?: string;
}

export function loadXConfig(): XConfig {
  try {
    const auth = JSON.parse(readFileSync(join(homedir(), ".pi/agent/auth.json"), "utf-8"));
    return auth.x ?? {};
  } catch {
    return {};
  }
}
