/**
 * Lightweight debug logger for the learning-tutor extension.
 *
 * Writes to ~/.pi/agent/learning-tutor.log with timestamps.
 * Enabled by default; set LEARNING_TUTOR_LOG=off to disable.
 */

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const LOG_PATH = join(homedir(), ".pi", "agent", "learning-tutor.log");
const MAX_LINES = 2000;

let enabled = true;
if (process.env.LEARNING_TUTOR_LOG === "off") {
  enabled = false;
}

function rotateIfNeeded(): void {
  try {
    if (!existsSync(LOG_PATH)) return;
    const { readFileSync, writeFileSync } = require("node:fs");
    const content = readFileSync(LOG_PATH, "utf-8");
    const lines = content.split("\n");
    if (lines.length > MAX_LINES) {
      writeFileSync(LOG_PATH, lines.slice(-Math.floor(MAX_LINES / 2)).join("\n"));
    }
  } catch {
    // best effort
  }
}

export function log(scope: string, message: string, data?: unknown): void {
  if (!enabled) return;
  try {
    const dir = join(homedir(), ".pi", "agent");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    rotateIfNeeded();

    const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
    let line = `[${ts}] [${scope}] ${message}`;
    if (data !== undefined) {
      line += ` ${typeof data === "string" ? data : JSON.stringify(data)}`;
    }
    appendFileSync(LOG_PATH, line + "\n");
  } catch {
    // never throw from logging
  }
}

/** Clear the log file. */
export function clearLog(): void {
  try {
    const { writeFileSync } = require("node:fs");
    writeFileSync(LOG_PATH, "");
  } catch {
    // best effort
  }
}
