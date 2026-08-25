---
description: UI/UX design implementation or review with the designer agent
argument-hint: "<design task or review target>"
---
Use the subagent tool with the "designer" agent to handle: $@

The designer is token-first: it reads existing components, theme files, and primitives before writing any UI code, composes with the design system (never around it), implements all states (loading, empty, error, hover, focus), checks accessibility, and avoids AI-slop patterns.

If the task is large, use a chain: scout (gather UI context) → designer (implement using {previous}).
