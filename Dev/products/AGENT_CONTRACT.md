# Agent Contract - Exit Requirements

**Last Updated:** 2026-01-11

---

## When You Complete Your Task:

1. **Mark it done** in TASKS.md: Change `[ ]` to `[x]`
2. **Update CHANGELOG.md** with what you built:
   - Add entry with date (YYYY-MM-DD format)
   - List files changed
   - Describe what was accomplished
3. **Move next task** from `## LATER` to `## NOW` (if any remain)
4. **End your response with:**
   - "Next step: [task name from NOW]"
   - OR "All tasks complete" if nothing remains

---

## Rules:

- **Work ONLY in your assigned folder** - Do not touch files outside your Context Root
- **Do NOT create new tasks** unless it's a critical blocker preventing completion
- **Do NOT modify TRUTH.md** - Product vision is human-controlled
- **Stay in scope** - Only do what the current task asks for

---

## If Blocked:

Create `BLOCKED.md` in your folder with:

```markdown
# BLOCKED - [Task Name]

**Date:** YYYY-MM-DD
**Blocked Task:** [Copy task title from TASKS.md]

## What I Tried:
- [List steps attempted]

## Why It Failed:
- [Specific error or obstacle]

## What's Needed to Unblock:
- [Dependencies, decisions, or resources required]
```

Then end your response with: "BLOCKED: [reason] - see BLOCKED.md"

---

## Example Session End:

```
✅ Task completed: "Create user dashboard component"

Changes:
- Created components/Dashboard.tsx
- Added dashboard route to app/dashboard/page.tsx
- Updated CHANGELOG.md

Next step: Add authentication to dashboard
```

---

## Directory Structure You Should Maintain:

```
Your-Product-Folder/
├── TRUTH.md              (Read only - vision)
├── TASKS.md              (You update: mark done, move next task to NOW)
├── CHANGELOG.md          (You append: what you built)
├── BLOCKED.md            (You create if stuck)
└── [your code files]     (You create/modify)
```

---

**Remember:** One task per session. Human reviews between tasks. Clean handoffs.
