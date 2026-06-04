/**
 * Concept dependency tracking and connection management.
 *
 * Tracks which concepts have been introduced, their encoding depth,
 * prerequisite chains, and connections between concepts.
 *
 * Key changes from v1:
 *   - EncodingDepth replaces MasteryLevel
 *   - Connection tracking: bidirectional links between concepts
 *   - Connection density: measures relational learning quality
 *   - Concept graph display instead of flat ladder
 */

import type { ConceptConnection, ConceptMastery, EncodingDepth } from "./types.js";
import { ENCODING_DEPTH_ORDER, ENCODING_DEPTH_WEIGHT } from "./types.js";

/** A node in the concept graph, for display purposes. */
export interface ConceptGraphNode {
  id: string;
  label: string;
  encodingDepth: EncodingDepth;
  depth: number;
  prerequisites: string[];
  connections: string[];
}

// ── Prerequisite logic ──────────────────────────────────────────

/**
 * Check if all prerequisites of a concept have been introduced
 * (encoding depth > surface).
 */
export function arePrerequisitesMet(
  conceptId: string,
  concepts: Record<string, ConceptMastery>,
): boolean {
  const concept = concepts[conceptId];
  if (!concept) return false;
  if (concept.prerequisites.length === 0) return true;

  return concept.prerequisites.every((preReqId) => {
    const preReq = concepts[preReqId];
    return preReq && preReq.encodingDepth !== "surface";
  });
}

/**
 * Get concepts that are ready to be introduced next.
 * A concept is "ready" if its prerequisites are met but it hasn't been introduced yet.
 */
export function getNextConcepts(
  concepts: Record<string, ConceptMastery>,
): ConceptMastery[] {
  return Object.values(concepts).filter(
    (c) =>
      c.encodingDepth === "surface" &&
      c.repetitions === 0 &&
      arePrerequisitesMet(c.id, concepts),
  );
}

// ── Connection management ───────────────────────────────────────

/**
 * Add a bidirectional connection between two concepts.
 * Returns updated concept records and a new ConceptConnection.
 */
export function addConnection(
  concepts: Record<string, ConceptMastery>,
  connections: ConceptConnection[],
  fromId: string,
  toId: string,
  reason?: string,
): {
  concepts: Record<string, ConceptMastery>;
  connection: ConceptConnection;
} {
  const now = Date.now();
  const connection: ConceptConnection = {
    from: fromId,
    to: toId,
    reason,
    createdAt: now,
  };

  const updated = { ...concepts };

  // Add bidirectional link
  if (updated[fromId] && !updated[fromId].connections.includes(toId)) {
    updated[fromId] = {
      ...updated[fromId],
      connections: [...updated[fromId].connections, toId],
    };
  }
  if (updated[toId] && !updated[toId].connections.includes(fromId)) {
    updated[toId] = {
      ...updated[toId],
      connections: [...updated[toId].connections, fromId],
    };
  }

  return { concepts: updated, connection };
}

/**
 * Compute connection density: ratio of actual connections to possible connections.
 * A concept graph with N concepts has N*(N-1)/2 possible connections.
 * Returns 0 for graphs with fewer than 2 concepts.
 */
export function getConnectionDensity(
  concepts: Record<string, ConceptMastery>,
  connections: ConceptConnection[],
): number {
  const introduced = Object.values(concepts).filter(
    (c) => c.encodingDepth !== "surface" || c.repetitions > 0,
  );
  if (introduced.length < 2) return 0;

  const possibleConnections = (introduced.length * (introduced.length - 1)) / 2;
  // Deduplicate connections (each pair appears once in the array)
  const uniquePairs = new Set(
    connections.map((c) => [c.from, c.to].sort().join("::")),
  );

  return uniquePairs.size / possibleConnections;
}

/**
 * Compute average encoding depth across all introduced concepts.
 * Returns a weighted score from 0 to 1.
 */
export function getAverageEncodingDepth(
  concepts: Record<string, ConceptMastery>,
): number {
  const introduced = Object.values(concepts).filter(
    (c) => c.encodingDepth !== "surface" || c.repetitions > 0,
  );
  if (introduced.length === 0) return 0;

  const totalWeight = introduced.reduce(
    (sum, c) => sum + ENCODING_DEPTH_WEIGHT[c.encodingDepth],
    0,
  );
  return totalWeight / introduced.length;
}

/**
 * Get concepts that could be connected but aren't yet.
 * Used to suggest "connect A and B" prompts.
 */
export function getSuggestedConnections(
  concepts: Record<string, ConceptMastery>,
  connections: ConceptConnection[],
  maxSuggestions: number = 3,
): Array<{ from: string; to: string; fromLabel: string; toLabel: string }> {
  const introduced = Object.values(concepts).filter(
    (c) => c.encodingDepth !== "surface" || c.repetitions > 0,
  );
  if (introduced.length < 2) return [];

  // Build set of existing connections
  const existing = new Set(
    connections.map((c) => [c.from, c.to].sort().join("::")),
  );

  // Find pairs not yet connected
  const suggestions: Array<{
    from: string;
    to: string;
    fromLabel: string;
    toLabel: string;
  }> = [];

  for (let i = 0; i < introduced.length && suggestions.length < maxSuggestions * 2; i++) {
    for (let j = i + 1; j < introduced.length && suggestions.length < maxSuggestions * 2; j++) {
      const key = [introduced[i].id, introduced[j].id].sort().join("::");
      if (!existing.has(key)) {
        suggestions.push({
          from: introduced[i].id,
          to: introduced[j].id,
          fromLabel: introduced[i].label,
          toLabel: introduced[j].label,
        });
      }
    }
  }

  // Prefer suggestions involving recently reviewed concepts
  suggestions.sort((a, b) => {
    const aConcept = concepts[a.from];
    const bConcept = concepts[b.from];
    return (bConcept?.lastReview ?? 0) - (aConcept?.lastReview ?? 0);
  });

  return suggestions.slice(0, maxSuggestions);
}

// ── Display ─────────────────────────────────────────────────────

/**
 * Build a concept graph — ordered nodes with depth, connections.
 */
export function buildConceptGraph(
  concepts: Record<string, ConceptMastery>,
): ConceptGraphNode[] {
  const introduced = Object.values(concepts).filter(
    (c) => c.encodingDepth !== "surface" || c.repetitions > 0,
  );
  if (introduced.length === 0) return [];

  const depths = new Map<string, number>();
  function getDepth(id: string): number {
    if (depths.has(id)) return depths.get(id)!;
    const c = concepts[id];
    if (!c || c.prerequisites.length === 0) {
      depths.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...c.prerequisites.map(getDepth));
    depths.set(id, d);
    return d;
  }

  return introduced
    .map((c) => ({
      id: c.id,
      label: c.label,
      encodingDepth: c.encodingDepth,
      depth: getDepth(c.id),
      prerequisites: c.prerequisites,
      connections: c.connections,
    }))
    .sort((a, b) => a.depth - b.depth || a.label.localeCompare(b.label));
}

/**
 * Generate a concept graph text summary for the system prompt.
 * Shows concepts with encoding depth indicators and connections.
 */
export function conceptGraphPrompt(
  concepts: Record<string, ConceptMastery>,
  connections: ConceptConnection[],
): string {
  const graph = buildConceptGraph(concepts);
  if (graph.length === 0) return "";

  const depthSymbol: Record<EncodingDepth, string> = {
    surface: "○",
    relational: "◐",
    deep: "◑",
    transferable: "●",
  };

  const lines = graph.map((node) => {
    const symbol = depthSymbol[node.encodingDepth];
    const connStr =
      node.connections.length > 0
        ? ` → ${node.connections
            .map((cId) => concepts[cId]?.label ?? cId)
            .join(", ")}`
        : "";
    return `${"  ".repeat(node.depth)}${symbol} ${node.label}${connStr}`;
  });

  const density = getConnectionDensity(concepts, connections);
  const avgDepth = getAverageEncodingDepth(concepts);

  return [
    "Concept graph (encoding depth + connections):",
    ...lines,
    "",
    `Connection density: ${Math.round(density * 100)}% | Avg encoding depth: ${Math.round(avgDepth * 100)}%`,
  ].join("\n");
}

/**
 * Check if a concept's terminology can be used — i.e., it has been introduced
 * (encoding depth > surface or has been reviewed).
 */
export function canUseTerm(
  conceptId: string,
  concepts: Record<string, ConceptMastery>,
): boolean {
  const concept = concepts[conceptId];
  return !!concept && (concept.encodingDepth !== "surface" || concept.repetitions > 0);
}

/**
 * Register a newly introduced concept during a session.
 * If it doesn't exist, creates it at surface depth.
 * If it exists at surface, upgrades to surface (ready for first encoding check).
 */
export function introduceConcept(
  concepts: Record<string, ConceptMastery>,
  id: string,
  label: string,
  prerequisites: string[] = [],
  tags: string[] = [],
): Record<string, ConceptMastery> {
  const existing = concepts[id];
  if (existing) {
    // Already exists — just mark as introduced if it was surface-only
    if (existing.encodingDepth === "surface" && existing.repetitions === 0) {
      return {
        ...concepts,
        [id]: {
          ...existing,
          nextReview: Date.now() + 24 * 60 * 60 * 1000,
          lastReview: Date.now(),
        },
      };
    }
    return concepts;
  }

  const updated = { ...concepts };
  updated[id] = {
    id,
    label,
    encodingDepth: "surface",
    connections: [],
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: Date.now() + 24 * 60 * 60 * 1000,
    lastReview: Date.now(),
    avgConfidence: 0,
    prerequisites,
    tags,
  };
  return updated;
}
