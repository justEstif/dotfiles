import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface SearxConfig {
  baseUrl: string;
}

function readBaseUrl(path: string): string | undefined {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    return parsed.searxng?.baseUrl ?? parsed.baseUrl;
  } catch {
    return undefined;
  }
}

/** Resolution order: WEB_SEARX_BASE_URL env, WEB_CONFIG file, ~/.config/web/config.json, legacy ~/.pi/agent/auth.json. */
export function loadConfig(): SearxConfig {
  const fromEnv = process.env.WEB_SEARX_BASE_URL;
  if (fromEnv) return { baseUrl: fromEnv.replace(/\/+$/, "") };

  const files = [
    process.env.WEB_CONFIG,
    join(homedir(), ".config/web/config.json"),
    join(homedir(), ".pi/agent/auth.json"),
  ].filter(( p): p is string => Boolean(p));
  for (const p of files) {
    const baseUrl = readBaseUrl(p);
    if (baseUrl) return { baseUrl };
  }

  console.error(
    "No SearXNG config found. Set WEB_SEARX_BASE_URL, or add " +
      '{"searxng": {"baseUrl": "https://your-searxng"}} to ~/.config/web/config.json ' +
      "(a bare " + '{"baseUrl": "..."} object works too).',
  );
  process.exit(1);
}
