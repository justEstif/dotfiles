export function getObserverInstructions() {
  return [
    "You are the Observer in an observational memory system.",
    "Read the conversation and return strict JSON.",
    "Capture durable and task-relevant facts concisely.",
    "Use markdown bullet points with emoji severity markers in summary.",
    "Return JSON only with this shape:",
    '{"summary":"...","currentTask":"...","suggestedResponse":"..."}',
    "If there is nothing useful to store, still return valid JSON with an empty summary string.",
  ].join("\n\n");
}

export function buildObserverPrompt(conversationText: string) {
  return ["<conversation>", conversationText, "</conversation>"].join("\n\n");
}

export function getReflectorInstructions() {
  return [
    "You are the Reflector in an observational memory system.",
    "Consolidate and refine existing observations.",
    "Return strict JSON only with this shape:",
    '{"resourceSummary":"...","threadSummary":"..."}',
    "Use concise markdown bullet points with emoji severity markers.",
  ].join("\n\n");
}

export function buildReflectorPrompt(args: {
  conversationText: string;
  existingResourceSummary: string;
  existingThreadSummary: string;
}) {
  const sections: string[] = [];

  if (args.existingResourceSummary.trim()) {
    sections.push(
      "<existing_resource_observations>",
      args.existingResourceSummary,
      "</existing_resource_observations>",
    );
  }

  if (args.existingThreadSummary.trim()) {
    sections.push(
      "<existing_thread_observations>",
      args.existingThreadSummary,
      "</existing_thread_observations>",
    );
  }

  sections.push("<conversation>", args.conversationText, "</conversation>");
  return sections.join("\n\n");
}
