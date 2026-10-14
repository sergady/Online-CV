---
name: critique
description: Review staged Git changes before committing as a senior programmer, identifying concrete defects and proposing simpler, maintainable solutions using SOLID principles. Use when preparing a commit or requesting a critique of staged changes.
---

# Critique

Act as a senior programmer with expert code review and SOLID design judgment.
Assess whether the staged changes are correct, maintainable, and ready to commit.
Be candid, constructive, and specific. Review the implementation independently
of its author's explanation; do not manufacture findings to fill a quota.

## When to run

Run after the intended changes are staged and before committing them. Re-run
when the staged content changes. This skill provides a review workflow; storing
it in a repository does not install a Git hook or enforce execution by itself.

Review by default. Do not edit files, stage or unstage changes, commit, or push
as part of the critique unless the user has separately authorized those actions.
If invoked during an authorized commit task, complete this review first. Resolve
blocking findings within the authorized scope and review the resulting staged
snapshot again before proceeding. Do not treat a clean review as new permission
to commit or push.

## Establish the review scope

- Read applicable `AGENTS.md` files, the relevant project documentation, and
  existing architectural and testing conventions.
- Confirm the Git repository and inspect `git status --short` and
  `git diff --name-only --diff-filter=U`. If there are unresolved conflicts,
  report them and stop the pre-commit review until they are resolved.
- Inspect `git diff --cached --name-status`, `git diff --cached --stat`, and
  `git diff --cached --no-ext-diff --no-textconv --find-renames`. If there are
  no staged changes, say so and stop; do not substitute unstaged changes.
- Record the staged tree identity with `git write-tree`. It does not change
  staged content. Compare it again at the end and immediately before any
  authorized commit; if it changed, review the new snapshot.
- Review the index, not merely the working tree. For partially staged files,
  read staged content with `git show ':path/to/file'`; use `git show
  'HEAD:path/to/file'` for the previous version when HEAD exists. An initial
  commit has no HEAD: assess its staged files as new files.
- Follow affected callers, interfaces, tests, configuration, and dependencies
  far enough to establish consequences. Prefer their staged versions where
  available. Keep unstaged and untracked work outside the proposed commit.
- Include additions, deletions, renames, configuration, and dependency changes.
  Disclose binary, generated, or inaccessible content that cannot be assessed.

## Review for concrete problems

Prioritize behavior over appearance:

- Correctness: broken assumptions, boundary inputs, error paths, regressions,
  state transitions, concurrency, resource cleanup, and data integrity.
- Security: authorization and trust boundaries, injection, unsafe input handling,
  exposed credentials, and sensitive data disclosure. Never repeat secret values.
- Compatibility: changed public contracts, affected callers, serialization,
  migrations, deployment configuration, and dependency compatibility.
- Tests: whether meaningful behavior and likely regressions are covered, including
  failure cases. Flag weakened assertions or tests that only mirror implementation.
  Do not claim a test-first process can be proven from a diff.
- Maintainability: unclear responsibilities, hidden side effects, duplicated
  business rules, unnecessary coupling, and complexity that obscures behavior.
- Performance: plausible costs in actual usage, such as unbounded work, repeated
  queries, or excessive allocations. Explain the workload; do not speculate
  about micro-optimizations without evidence.

Report issues introduced or made worse by this change. Mention an existing issue
only when it directly affects the change, and label it as pre-existing.
Distinguish demonstrated defects from assumptions and unanswered questions.

## Apply SOLID with judgment

Use SOLID as a diagnostic lens appropriate to the project's language and style:

- **Single responsibility:** identify unrelated reasons to change that make a
  unit difficult to understand, test, or maintain. Suggest cohesive boundaries.
- **Open/closed:** identify repeated edits across unrelated code when a current
  variation deserves a stable extension point. Avoid speculative frameworks.
- **Liskov substitution:** check that implementations preserve their contract,
  including accepted inputs, results, invariants, errors, and side effects.
- **Interface segregation:** identify clients forced to depend on unused
  operations; suggest smaller interfaces when this reduces actual coupling.
- **Dependency inversion:** check whether policy depends directly on volatile
  I/O details. Recommend explicit dependencies and useful boundaries where they
  improve isolation, testing, or replacement.

Do not demand classes, interfaces, dependency injection containers, design
patterns, or new layers simply to satisfy a principle. Prefer the smallest
change that solves the demonstrated problem and fits existing conventions.
For a better solution, explain its benefit, cost, and relevant tradeoff; a focused
snippet is useful when it makes the recommendation concrete.

## Verify proportionally

Discover check commands from repository scripts, configuration, documentation,
or CI. Run relevant tests, linting, type checks, or builds when feasible and safe.
Avoid auto-fix commands during a review and do not execute destructive operations
or checks against live services merely to validate a proposal.

Checks run against a working tree with unstaged changes do not validate the
staged snapshot. Where practical, materialize the index in an isolated temporary
location and run checks there without altering the user's files or index.
Otherwise state exactly which content was tested and what remains unverified.
Report commands actually run, results, and unavailable checks. Passing tests do
not replace review, and unrun tests are not evidence of failure.

## Deliver the critique

Lead with one verdict: **Ready to commit**, **Changes required**, or
**Review incomplete**. Use Changes required for substantiated blocking issues;
use Review incomplete when conflicts, missing context, changed staged content,
or unavailable essential validation prevent a reliable verdict. Ready to commit
means no blocking issue was found within the stated review scope, not a guarantee
of correctness or completion of the project's merge requirements.

List findings by severity, using staged file paths and tight line references:

- **P0 — Critical:** immediate severe harm, such as data loss or a security breach.
- **P1 — High:** a demonstrated defect that must be fixed before committing.
- **P2 — Medium:** a meaningful localized problem; state whether it blocks this
  commit and explain why.
- **P3 — Low:** an optional improvement, with a concrete benefit.

For each finding provide the location, triggering scenario, evidence, practical
impact, and smallest useful fix. Cite a deleted line in the previous version
explicitly when appropriate. Keep speculative questions separate from findings.

Separate optional design alternatives from required fixes, and omit empty
sections. Finish with the checks performed and any material limits on the review.
When there are no findings, say so plainly. Keep the output proportional to the
change; do not fill it with generic advice or formatting preferences already
handled by project tooling.
