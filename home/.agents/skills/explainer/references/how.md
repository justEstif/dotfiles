# How

Answer "how does X work?" at the level of a senior engineer onboarding onto the subsystem: enough for a working mental model, not annotated source.

- **Simple scope** (one module, one function): explore and explain in one pass. When in doubt, take this path.
- **Complex scope** (a subsystem across files or services): split the question into 2 to 4 angles and send each to a read-only pi subagent in one message (or one fresh inline pass per angle). Each returns the components it found with paths, the flow and the data between steps, the files it read, where the subsystem connects to the rest, anything non-obvious, and open questions. Then write one explanation from all of them.

Name real symbols and paths. Output sections, dropping any that don't apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
