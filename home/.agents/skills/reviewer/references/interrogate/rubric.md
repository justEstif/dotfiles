# Rubric

Standard correctness, security, and complexity review is assumed. These are the checks reviewers skip unless told:

- **Idempotency.** What happens if this runs twice, or a previous run crashed halfway? "It depends on what state was left behind" means a reconciliation step is missing.
- **Shared state.** If several actors can touch the same file, branch, or data, is access serialized by structure (locks, ownership, sequential phases) or by a convention that won't hold?
- **Structure over instructions.** A fix that is a comment saying "don't do X" should usually be a type, lint, or runtime check that makes X impossible.
- **Fix in the right place.** A workaround in module A that should be a contract change in module B.
- **Bolted on.** If the requirement had been known from the start, would the code look like this?
- **Legacy dual-paths.** A new API alongside the old one with no external consumers: migrate callers and delete the old path in the same change.
- **Real thing, not a proxy.** Liveness via file mtime or cache instead of the actual value; delegated work trusted on its self-report instead of its output.
- **Size.** A file past about 1,000 lines, or ad-hoc conditionals threaded through unrelated code, is a structure finding.
