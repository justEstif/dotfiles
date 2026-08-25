---
description: Research an external library, framework, or API with source-verified answers
argument-hint: "<question or library>"
---
Use the subagent tool with the "librarian" agent to research: $@

The librarian reads source code and official docs and returns source-verified answers (exact signatures, version, caveats). If the question is broad, split it into specific sub-questions and run multiple librarian tasks in parallel, then synthesize.
