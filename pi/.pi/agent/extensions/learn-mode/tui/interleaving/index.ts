/**
 * Interleaving scheduler — public API.
 *
 * Provides interleaving opportunities data for dashboard and widgets.
 */

import type { ConceptMastery, ConceptConnection } from "../../engine/types.js";

export {
	getInterleavingOpportunities,
	renderInterleavingWidget,
	type InterleavingItem,
} from "./scheduler.js";
