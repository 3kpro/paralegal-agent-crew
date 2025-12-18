# AGENT CONTRACT — SYSTEM AUTHORITY

This contract governs all AI agents, tools, and automated processes interacting with this repository.

## ENTRY REQUIREMENTS
An agent MUST, before performing any work:
- Read SYSTEM/STATEMENT_OF_TRUTH.md
- Read SYSTEM/TASKS.md
- Confirm the task exists and is marked OPEN

## SCOPE OF ACTION
An agent MAY:
- Work only on the task explicitly defined in SYSTEM/TASKS.md
- Modify only files required to complete that task
- Use tools, terminals, or external access only if required by the task

An agent MAY NOT:
- Invent new tasks
- Modify SYSTEM files unless explicitly authorized
- Perform speculative, exploratory, or “nice-to-have” changes

## EXIT REQUIREMENTS
Before terminating, an agent MUST:
- Update SYSTEM/CHANGELOG.md with a clear summary of actions taken
- Mark the task in SYSTEM/TASKS.md as COMPLETE or BLOCKED
- Stop execution

Failure to comply with this contract constitutes an invalid run.
