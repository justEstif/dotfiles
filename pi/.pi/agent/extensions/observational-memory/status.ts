import type { OmConfig, OmRuntimeState } from "./types";

export function updateStatus(
  ctx: any,
  config: OmConfig,
  runtime: OmRuntimeState,
  tokens: number,
  note?: string,
) {
  const k = (tokens / 1000).toFixed(1);
  const tk = (config.observationThreshold / 1000).toFixed(1);
  const effectiveNote = note ?? runtime.lastStatusNote;
  const state = runtime.isReflecting
    ? "Reflecting..."
    : runtime.isObserving
      ? "Observing..."
      : `msg ${k}k/${tk}k`;
  const text = effectiveNote ? `${state} · ${effectiveNote}` : state;
  const formattedText =
    tokens >= config.observationThreshold || runtime.isObserving || runtime.isReflecting
      ? ctx.ui.theme.fg("warning", text)
      : ctx.ui.theme.fg("dim", text);
  ctx.ui.setStatus("00-om-status", formattedText);
}
