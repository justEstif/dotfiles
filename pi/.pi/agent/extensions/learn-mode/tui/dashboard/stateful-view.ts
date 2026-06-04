/**
 * StatefulView<P> — props-driven component contract.
 *
 * Components receive state via setProps(), not by reading canonical state.
 * This decouples rendering from state shape and makes components individually testable.
 *
 * Follows the rpiv-ask-user-question pattern.
 */

export interface StatefulView<P> {
	setProps(props: P): void;
	render(width: number): string[];
	invalidate(): void;
}

/**
 * Cached render base class — tracks props and width for cache invalidation.
 */
export abstract class CachedView<P> implements StatefulView<P> {
	protected props!: P;
	protected cachedWidth?: number;
	protected cachedLines?: string[];

	setProps(props: P): void {
		this.props = props;
		this.invalidate();
	}

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) {
			return this.cachedLines;
		}
		this.cachedWidth = width;
		this.cachedLines = this.buildLines(width);
		return this.cachedLines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	protected abstract buildLines(width: number): string[];
}
