# Coding agent instructions

Apply these rules to code and tests in this project. Prioritize correct behavior,
readability, and maintainability. Use the simplest design that satisfies the
current requirements.

## Before coding

- Read the relevant code, tests, documentation, and project configuration.
- Identify the requested behavior and acceptance criteria, including relevant
  edge cases. Resolve ambiguity that would materially change the implementation.
- Follow the existing architecture, language idioms, and local conventions.
  No architecture is prescribed by this guide. For a new project, start with a
  minimal structure and introduce boundaries as real responsibilities emerge.
- Discover setup, test, formatting, linting, and build commands from repository
  documentation, scripts, configuration, or CI. No commands are prescribed yet;
  do not invent them or claim an unexecuted command succeeded. Document verified
  commands when establishing a new project.
- Keep changes focused on the task and preserve unrelated work.

## Clean code principles

- **Correctness first:** satisfy the required behavior and handle relevant
  invalid inputs and failure paths explicitly. Do not silently swallow errors.
- **Clear names:** name variables, functions, classes, and modules for their
  purpose. Replace unexplained domain values with named constants or configuration.
- **Clarity over cleverness:** prefer straightforward expressions and control
  flow. Reduce unnecessary nesting when it improves readability. Avoid dense
  one-liners that obscure intent.
- **Focused responsibilities:** keep functions cohesive and modules centered
  on one responsibility or reason to change. Separate business logic from I/O
  when this makes it easier to understand and test. Do not split code merely
  to meet arbitrary size limits.
- **Consistency:** follow the project's naming, formatting, and syntax
  conventions. Use configured formatters and linters when available.
- **Reuse with judgment:** reuse existing code and centralize duplicated
  business rules. Abstract when code shares a meaningful concept; avoid generic
  frameworks or speculative features for hypothetical future needs.
- **Single source of truth:** define each shared rule or configuration value
  in one authoritative place. Derive values instead of maintaining redundant
  state. Keep secrets out of source code.
- **Encapsulation:** expose only the interface and data callers need. Keep
  dependencies and side effects explicit; avoid hidden global state.
- **Discoverable structure:** group related code and tests coherently, following
  the repository's layout. Avoid unnecessary files, layers, and reorganizations.
- **Reasonable efficiency:** consider time and memory costs. Optimize measured
  bottlenecks or explicit performance requirements; shorter syntax alone does
  not prove better performance.
- **Useful documentation:** explain intent, constraints, and non-obvious tradeoffs.
  Avoid comments that merely repeat the code. Update affected documentation.

## Test-driven development and design

Use short red–green–refactor cycles for new behavior and bug fixes:

1. **Red:** write a focused unit test for the next required behavior before
   implementing it. Run it and confirm it fails for the intended reason. For a
   bug fix, first write a regression test that reproduces the bug. A setup error
   is not evidence of the expected behavioral failure.
2. **Green:** implement the smallest correct change that passes the test.
3. **Refactor:** improve names, responsibilities, duplication, and structure
   while preserving behavior. Run the tests again.
4. Repeat for remaining acceptance criteria and relevant boundary/error cases.

- Test observable behavior through appropriate interfaces, rather than private
  implementation details. Use clear test names and explicit assertions.
- Keep unit tests fast, deterministic, isolated, and independent of execution
  order. Control time, randomness, and external dependencies where necessary.
- Use mocks or fakes at external boundaries when useful; avoid mocking the
  behavior the test is meant to verify.
- Let difficult-to-test code prompt simpler interfaces and clearer dependencies,
  without adding unnecessary abstractions solely for tests.
- For behavior-preserving refactors, establish passing coverage before changing
  production code. Add characterization tests if relevant behavior lacks coverage.
- Add integration or end-to-end checks when unit tests cannot validate an
  important interaction. These complement the required unit tests.
- Do not delete, skip, or weaken tests to conceal a failure. Change expectations
  only when the required behavior changes, and explain why.

## Verification and definition of done

A feature is **done only when its unit tests pass and its changes are merged
into the `main` branch**.

Before marking it ready to merge:

- Verify the acceptance criteria and review the diff for unnecessary complexity.
- Run the feature's unit tests and the full unit test suite. Run other applicable
  repository checks, including configured formatting, linting, type checking,
  integration tests, and builds.
- Report what changed, the commands actually run, their results, and any blockers.
  If checks cannot run or fail, state that clearly and do not claim completion.

Follow the repository's merge workflow. Verify that `main` contains the feature
changes before reporting it done. If implementation and checks are complete but
the merge is pending, report **ready to merge**, not **done**. If `main` does
not exist, flag the branch mismatch; do not silently substitute another branch.

## Commit attribution

- Use Sergio García Díaz as both the author and committer of every commit,
  with the email sergady987@gmail.com. Configure this identity locally for
  the repository before committing.
- Describe the actual change in commit messages. Do not mention ChatGPT,
  Codex, the model used, or AI assistance in commit subjects, bodies, or trailers.
- Do not add assistant co-author trailers or generated-by attribution.
- Verify the author, committer, and message before pushing. Preserve existing
  history unless rewriting it is explicitly requested.

## Repository skill

- Before committing staged changes, read and run the critique workflow in
  `.agents/skills/critique/SKILL.md`. Re-run it if the staged snapshot changes.
- This is an agent workflow, not an installed Git pre-commit hook.
