import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import * as fs from "node:fs";
import * as path from "node:path";

type PrimeCache = {
  configDir: string;
  generatedAt: string;
  text: string;
};

const PROJECT_MEMORY_GUIDANCE = `

## Project Memory With Beans

Beans are not only for task tracking. Treat beans as the project's durable, queryable memory layer.

Use beans to capture project information that future agents or contributors should rediscover while working, including:

- Architecture decisions and rationale
- Project conventions and local rules
- Known issues, workarounds, and recurring pitfalls
- Research findings and investigation notes
- Integration details and external constraints
- Deferred ideas or open questions
- Summaries of important completed work

Because the configured issue types may not include a dedicated memory type, use existing types with title prefixes:

- \`Memory:\` durable project fact or context
- \`Decision:\` chosen direction and rationale
- \`Convention:\` local project rule agents should follow
- \`Known Issue:\` recurring problem plus workaround
- \`Research:\` investigation findings and evidence
- \`Question:\` unresolved uncertainty needing follow-up

Recommended status semantics for memory beans:

- \`todo\` = needs investigation or verification
- \`in-progress\` = currently being researched or refined
- \`completed\` = captured and usable as project memory
- \`scrapped\` = obsolete, superseded, or found to be wrong

When storing memory, prefer this body shape:

~~~md
## Summary

One short paragraph.

## Details

Important context.

## Evidence

Files, commands, links, observations, or related bean IDs.

## Implications

How future agents should act differently because of this.

## Related

- bean IDs
- file paths
- docs
~~~

Before starting significant work, search beans for relevant memory as well as existing tasks, for example:

~~~bash
beans list --json -S "keyword"
beans query --json '{ beans(filter: { search: "keyword" }) { id title status type body } }'
~~~

Create or update memory beans when work reveals durable context worth preserving. Do not dump every transient thought into beans; capture information that is likely to matter in future sessions.
`;

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
      text: text + PROJECT_MEMORY_GUIDANCE,
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
