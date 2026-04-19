import type { Model } from "@mariozechner/pi-ai";

export type OmScope = "thread" | "resource";

export interface OmConfig {
  enabled: boolean;
  debug: boolean;
  scope: OmScope;
  observationThreshold: number;
  reflectionThreshold: number;
  retryBackoffTurns: number;
  observerModel: string | null;
  reflectorModel: string | null;
  resourceMemoryFile: string;
}

export interface OmRuntimeState {
  observerModel: Model<any> | null;
  reflectorModel: Model<any> | null;
  isObserving: boolean;
  isReflecting: boolean;
  lastStatusNote?: string;
  lastObservationError?: string;
  lastReflectionError?: string;
}

export interface ObservationRecord {
  summary: string;
  currentTask?: string;
  suggestedResponse?: string;
  sourceMessageCount?: number;
  estimatedTokens?: number;
  model?: string;
  createdAt?: number;
}

export interface ObservationAttemptRecord {
  status: "success" | "empty" | "error";
  estimatedTokens: number;
  messageCount: number;
  model?: string;
  createdAt: number;
  error?: string;
}

export interface ObserverResult {
  summary: string;
  currentTask?: string;
  suggestedResponse?: string;
  rawText: string;
}

export interface ReflectorResult {
  resourceSummary: string;
  threadSummary: string;
  rawText: string;
}
