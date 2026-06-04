/**
 * Resource detection utilities for identifying primary learning resources
 * (tutorials, books, PDFs, etc.) in /learn context.
 *
 * Extracted from prompts because this is computation logic, not template text.
 */

export type ObviousLearningResource = {
  resources: string[];
  reason: string;
};

const RESOURCE_URL_RE = /\bhttps?:\/\/[^\s<>"'`\])]+/gi;
const FILE_RESOURCE_RE =
  /(?:^|[\s"'(])(@?[^\s"'()<>`]+?\.(?:pdf|epub|md|markdown|ipynb|html?|docx?|pptx?))(?:$|[\s"').,;!?])/gi;
const RESOURCE_HINT_RE =
  /\b(book|chapter|pdf|tutorial|lesson|course|workbook|notebook|guide|walkthrough|documentation|docs|article|paper|paperback|textbook)\b/i;
const RESOURCE_URL_HINT_RE =
  /(?:\/|%2f)(?:tutorial|learn|lesson|chapter|course|guide|docs?|book|article|paper)(?:[\/?#._-]|$)|\.(?:pdf|epub|docx?|pptx?)(?:[?#]|$)/i;

function cleanResourceToken(token: string): string {
  return token.trim().replace(/^@/, "").replace(/[\])}>,.;!?]+$/g, "");
}

function uniqueResources(resources: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const resource of resources) {
    const cleaned = cleanResourceToken(resource);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    result.push(cleaned);
  }
  return result;
}

function extractResourceCandidates(context: string): string[] {
  const urls = Array.from(context.matchAll(RESOURCE_URL_RE), (match) => match[0]);
  const files = Array.from(
    context.matchAll(FILE_RESOURCE_RE),
    (match) => match[1] ?? match[0],
  );
  return uniqueResources([...urls, ...files]);
}

export function detectObviousLearningResource(
  context: string,
): ObviousLearningResource | undefined {
  const resources = extractResourceCandidates(context);
  if (resources.length === 0) return undefined;

  const compact = context.trim();
  const hasOnlyOneBareResource =
    resources.length === 1 &&
    (compact === resources[0] || compact === `@${resources[0]}`);
  const hasExplicitResourceWords = RESOURCE_HINT_RE.test(context);
  const hasResourceLikeUrlOrDocument = resources.some((resource) =>
    RESOURCE_URL_HINT_RE.test(resource),
  );

  if (!hasOnlyOneBareResource && !hasExplicitResourceWords && !hasResourceLikeUrlOrDocument) {
    return undefined;
  }

  const reason = hasOnlyOneBareResource
    ? "bare resource/link"
    : hasResourceLikeUrlOrDocument
      ? "tutorial/document-like resource"
      : "resource words in /learn context";
  return { resources, reason };
}
