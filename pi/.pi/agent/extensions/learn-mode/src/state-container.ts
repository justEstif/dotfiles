/**
 * Shared state container for cross-module access.
 *
 * All modules receive a reference to this container and read/write through it.
 * This avoids circular imports and keeps state ownership clear.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SelectionSupport } from "./definition.js";
import {
  DEFAULT_STATE,
  cloneState,
  persist as persistState,
  restoreState,
  updateStatus as updateStatusWidget,
} from "./state.js";
import type { LearningState } from "./types.js";

export class StateContainer {
  state: LearningState = cloneState(DEFAULT_STATE);
  selectionSupport: SelectionSupport | undefined;
  /** @internal exposed for modules that need pi (sendAsUser, etc.) */
  readonly pi: ExtensionAPI;

  constructor(pi: ExtensionAPI) {
    this.pi = pi;
  }

  /** Persist current state to session entries. */
  persist(): void {
    persistState(this.pi, this.state);
  }

  /** Update status bar + widget from current state. */
  updateStatus(ctx: ExtensionContext): void {
    updateStatusWidget(ctx, this.state);
  }

  /** Restore state from session entries. */
  restore(ctx: ExtensionContext): void {
    this.state = restoreState(ctx);
  }
}
