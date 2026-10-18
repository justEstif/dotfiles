import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface SearxConfig {
  baseUrl: string;
}

export function loadConfig(): SearxConfig {
  try {
    const auth = JSON.parse(
      readFileSync(join(homedir(), ".pi/agent/auth.json"), "utf-8"),
    );
    if (auth.searxng?.baseUrl) {
      return { baseUrl: auth.searxng.baseUrl };
    }
  } catch {
    // fallthrough
  }
  console.error(
    'No searxng config found in ~/.pi/agent/auth.json. Add a "searxng" entry with baseUrl.',
  );
  process.exit(1);
}

