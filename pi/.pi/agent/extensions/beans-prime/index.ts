import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import * as fs from "node:fs";
import * as path from "node:path";

type PrimeCache = {
  configDir: string;
  generatedAt: string;
  text: string;
};

function findBeansConfigDir(startCwd: string): null | string {
  if (process.env.BEANS_PATH) {
    const candidate = path.join(process.env.BEANS_PATH, ".beans.yml");
    if (fs.existsSync(candidate)) return process.env.BEANS_PATH;
  }

  let dir = path.resolve(startCwd);
  while (true) {
    const candidate = path.join(dir, ".beans.yml");
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export default function (pi: ExtensionAPI) {
  let cache: null | PrimeCache = null;

  const refreshPrime = async (
    cwd: string,
  ): Promise<{ ok: boolean; reason?: string }> => {
    const hasBeans = await pi.exec("which", ["beans"]);
    if (hasBeans.code !== 0) {
      cache = null;
      return { ok: false, reason: "beans CLI not found" };
    }

    let configDir = findBeansConfigDir(cwd);
    if (!configDir) {
      configDir = process.env.BEANS_PATH || cwd;
      const initResult = await pi.exec("beans", ["init"], { cwd: configDir });
      if (initResult.code !== 0) {
        cache = null;
        return { ok: false, reason: "failed to init beans" };
      }
    }

    const prime = await pi.exec("beans", ["prime"], {
      cwd: configDir,
      timeout: 20_000,
    });
    if (prime.code !== 0) {
      cache = null;
      return {
        ok: false,
        reason: (prime.stderr || prime.stdout || "beans prime failed").trim(),
      };
    }

    const text = (prime.stdout || "").trim();
    if (!text) {
      cache = null;
      return { ok: false, reason: "beans prime returned empty output" };
    }

    cache = {
      configDir,
      generatedAt: new Date().toISOString(),
      text,
    };

    return { ok: true };
  };

  pi.on("session_start", async (_event, ctx) => {
    await refreshPrime(ctx.cwd);
  });

  pi.on("before_agent_start", async (event) => {
    if (!cache) return;
    const injected = [
      "\n\n[beans-prime context]",
      `generated_at=${cache.generatedAt}`,
      `config_dir=${cache.configDir}`,
      cache.text,
      "[/beans-prime context]",
    ].join("\n");

    return {
      systemPrompt: event.systemPrompt + injected,
    };
  });

}
