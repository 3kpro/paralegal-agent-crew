# AGENT CONTRACT — SYSTEM AUTHORITY

This contract governs all AI agents, tools, and automated processes interacting with this repository.

## ENTRY REQUIREMENTS
An agent MUST, before performing any work:
- Read SYSTEM/VISION.md (canonical source of truth)
- Read SYSTEM/TASKS.md
- Confirm there is at least ONE task in the NOW section
- **Work on ONLY the FIRST task listed in the NOW section**
- **STOP after completing ONE task - do NOT process multiple tasks**

## DEVELOPMENT ENVIRONMENT
When running the dev server or testing:
- **Port:** Always use port 3000 (run `restart-dev.bat` to start/restart)
- **Test Credentials:** Username and password are saved in Chrome browser (no need to ask)
- **Dev Server:** `restart-dev.bat` kills existing processes and starts fresh on port 3000

## DEPLOYMENT PROTOCOL
An agent working on implementation tasks:
- **MUST** commit changes to local git repository
- **MUST** test changes locally using `npm run dev` on localhost:3000
- **MUST NOT** push changes to remote repository unless explicitly instructed
- **MUST NOT** deploy to production (Vercel) unless explicitly instructed
- **Default assumption:** All work stays local for human review before deployment

## SCOPE OF ACTION
An agent MAY:
- Work only on **ONE task** - the first task listed in NOW section
- Modify only files required to complete **that single task**
- Use tools, terminals, or external access only if required by the task

An agent MAY NOT:
- Process multiple tasks in a single session
- Work on tasks outside the NOW section
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

## TASK WORKFLOW

**Task Organization:**
- **NOW Section**: Contains tasks ready to be worked on
- **COMPLETED Section**: Contains finished tasks with ✅ checkmark

**Single-Task Rule:**
An agent MUST work on ONLY ONE task per session. This is non-negotiable.

**Task Selection Process:**
1. Read TASKS.md and locate the NOW section
2. Select the FIRST task listed under NOW
3. Confirm you understand the task requirements
4. Complete ONLY that task - do NOT continue to the next task
5. Follow EXIT REQUIREMENTS to mark complete and queue next task

**Example Workflow:**
```
Session Start → Read NOW section → Work on FIRST task → Complete task →
Update CHANGELOG → Mark task complete → Move to COMPLETED →
Add next task to NOW → STOP (do not begin next task)
```

**Why One Task Per Session:**
- Ensures predictable, manageable scope
- Allows human review between tasks
- Prevents agents from running indefinitely
- Maintains clear progress tracking

## EXIT REQUIREMENTS (MANDATORY)
**Before ending your session, you MUST complete ALL of these steps:**

1. **Update CHANGELOG.md** - Add entry in SYSTEM/CHANGELOG.md summarizing what was done
2. **Mark task COMPLETE** - Change `- [ ]` to `- [x]` in SYSTEM/TASKS.md and add ✅
3. **Move to COMPLETED section** - Move the task from NOW to COMPLETED section
4. **Queue next task** - Add the next logical task to the NOW section (if applicable)
5. **Verify** - Confirm both CHANGELOG.md and TASKS.md are updated before stopping

**CRITICAL: Do not end session without completing steps 1-5.**

**IMPORTANT:** You must complete ONLY ONE task per session. After completing exit requirements, STOP immediately. Do NOT begin work on the next task.
