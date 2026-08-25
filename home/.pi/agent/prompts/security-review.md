---
description: Security review of the current diff or a given path with the security-reviewer agent
argument-hint: "[path or scope]"
---
Use the subagent tool with the "security-reviewer" agent to review: ${@:-the current changes (git diff)}

The security-reviewer is read-only and evidence-backed: it traces attacker-controlled sources to dangerous sinks, rejects speculative findings, and reports severity, confidence, CWE, verbatim evidence, and concrete remediation.
