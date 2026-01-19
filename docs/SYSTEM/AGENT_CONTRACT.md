# AGENT CONTRACT — SYSTEM AUTHORITY

This contract governs all AI agents, tools, and automated processes interacting with this repository.

## ENTRY REQUIREMENTS
An agent MUST, before performing any work:
- Read SYSTEM/VISION.md (canonical source of truth)
- Read SYSTEM/TASKS.md
- Confirm the task exists and is marked OPEN

## DEVELOPMENT ENVIRONMENT
When running the dev server or testing:
- **Port:** Always use port 3000 (run `restart-dev.bat` to start/restart)
- **Test Credentials:** Username and password are saved in Chrome browser (no need to ask)
- **Dev Server:** `restart-dev.bat` kills existing processes and starts fresh on port 3000

## SCOPE OF ACTION
An agent MAY:
- Work only on the task explicitly defined in SYSTEM/TASKS.md
- Modify only files required to complete that task
- Use tools, terminals, or external access only if required by the task

An agent MAY NOT:
- Invent new tasks
- Modify SYSTEM files (except TASKS.md and CHANGELOG.md as required below)
- Perform speculative, exploratory, or "nice-to-have" changes

## SECURITY REQUIREMENTS (MANDATORY)

### Credential Protection
An agent MUST NEVER:
- Commit credentials, API keys, tokens, or secrets to version control
- Hardcode API keys in source code
- Share GitHub URLs containing `?token=` query parameters
- Create backup files of `.env` or credential files
- Log or output credentials in plain text

An agent MUST:
- Use environment variables for ALL credentials
- Strip query parameters from GitHub raw URLs
- Verify `.gitignore` covers credential files before creating them
- Reference [GITHUB_TOKEN_PROTOCOL.md](./GITHUB_TOKEN_PROTOCOL.md) for secure URL sharing
- Follow patterns in [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) incident log

### GitHub URL Format
When sharing repository file URLs:
**❌ WRONG:** `https://raw.githubusercontent.com/.../file.json?token=GHSAT0AAAA...`
**✅ CORRECT:** `https://raw.githubusercontent.com/<OWNER>/<REPO>/<BRANCH>/<PATH>`

### Pre-Deployment Security Check
Before committing changes, verify:
- [ ] No hardcoded credentials in modified files
- [ ] No new `.env*` files without gitignore coverage
- [ ] No backup files (`.backup`, `.old`, `.bak`) containing credentials
- [ ] All API keys loaded from environment variables
- [ ] No sensitive data in commit messages or comments

## EXIT REQUIREMENTS (MANDATORY)
**Before ending your session, you MUST complete ALL of these steps:**

1. **Update CHANGELOG.md** - Add entry in SYSTEM/CHANGELOG.md summarizing what was done
2. **Mark task COMPLETE** - Change `- [ ]` to `- [x]` in SYSTEM/TASKS.md and add ✅
3. **Move to COMPLETED section** - Move the task from NOW to COMPLETED section
4. **Verify** - Confirm both files are updated before stopping

**CRITICAL: Do not end session without completing steps 1-4.**

Failure to comply with this contract constitutes an invalid run.
