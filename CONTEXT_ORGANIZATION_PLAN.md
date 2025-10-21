# CONTEXT ORGANIZATION PLAN
## Consolidating AI Agent Documentation

**Date:** 2025-10-20
**Goal:** Create single source of truth for all AI agents

---

## ✅ COMPLETED

### 1. Created Master Statement of Truth
**File:** `STATEMENT_OF_TRUTH.md`
**Status:** ✅ DONE

**Contains:**
- Project mission and strategy
- Current status and phase
- Complete project structure
- Agent workflow and responsibilities
- Design system (Tron theme)
- Document hierarchy
- Critical known issues
- Acceptance criteria
- Recovery procedures
- Version history

**Purpose:** First document all agents must read when starting work

---

## 📋 NEXT ACTIONS

### 2. Archive Handoff Files
**Status:** 🔄 READY TO EXECUTE

**Files to Move to `docs/handoffs/`:**
```bash
mv HAIKU_HANDOFF_OCT19.md docs/handoffs/
mv EVENING_HANDOFF_OCT20.md docs/handoffs/
mv ZEN_HANDOFF_DATABASE_FIX.md docs/handoffs/
mv HANDOFF_READY.md docs/handoffs/
mv CURRENT_STATUS_OCT19_EVENING.md docs/handoffs/
mv SONNET_HANDOFF_TRON_DEBUG.md docs/handoffs/
mv URGENT_TRON_THEME_DEBUG.md docs/handoffs/
mv SESSION_HANDOFF.md docs/handoffs/
mv AI_TOOLS_HANDOFF_CLAUDE.md docs/handoffs/
mv PHASE1_IMPLEMENTATION_HANDOFF.md docs/handoffs/
mv VERCEL_CONFIGURATION_HANDOFF.md docs/handoffs/
mv ZENCODER_HANDOFF_PORTAL.md docs/handoffs/ # Keep copy in docs/ too
```

**Why Archive:**
- Historical reference only
- Superseded by STATEMENT_OF_TRUTH.md
- Cluttering root directory
- Context now in master SoT

**Keep Accessible:**
- In `docs/handoffs/` for reference
- Not deleted (useful for history)
- Indexed in SoT under "Supporting Documentation"

---

### 3. Consolidate Task Documents
**Status:** 🔄 NEEDS REVIEW

**Current State:**
- `TASK_QUEUE.md` exists with Phase 1-3 structure
- ZenCoder mentions `docs/ATOMIC_TASKS.md` (doesn't exist)
- Need single task management system

**Proposed Solution:**
Keep `TASK_QUEUE.md` as the single task document.

**Update TASK_QUEUE.md to include:**
- ✅ Current format with Zen prompts (already has this)
- ✅ Agent type assignments (already has this)
- ➕ Add TrendPulse-specific tasks (Week 1 MVP focus)
- ➕ Add acceptance criteria section
- ➕ Link to STATEMENT_OF_TRUTH.md at top

**Remove references to:**
- `docs/ATOMIC_TASKS.md` (doesn't exist)
- `docs/WEEK1_MVP.md` (doesn't exist)

---

### 4. Update README.md
**Status:** 🔄 NEEDS REVIEW

**Current README Issues:**
- Possibly outdated (need to check)
- May contradict SoT
- Used by agents for direction

**Proposed Changes:**
1. Read current README.md
2. Compare with STATEMENT_OF_TRUTH.md
3. Update README to be **Quick Start Guide** only:
   - Installation steps
   - Development commands
   - Environment setup
   - Testing commands
   - Deployment steps
4. Add prominent link at top: "📖 For full project context, see STATEMENT_OF_TRUTH.md"
5. Remove any strategy/architecture details (belongs in SoT)

---

### 5. Update ZenCoder Instructions
**Status:** 🔄 NEEDS REWRITE

**Current ZenCoder instructions reference:**
- `/docs/changelog.md` (incorrect path - should be `/CHANGELOG.md`)
- `/docs/ATOMIC_TASKS.md` (doesn't exist)
- `/docs/WEEK1_MVP.md` (doesn't exist)
- `.zencoder/rules/repo.md` (need to check if exists)

**New ZenCoder Instructions:**
```markdown
## ZenCoder - Instructions for AI

You are an AI agent in the CCAI (Content Cascade AI) repository.

=== CONTEXT RECOVERY ===
EVERY chat start:
1. Read STATEMENT_OF_TRUTH.md (master context - 5 min)
2. Read CHANGELOG.md (last 20 entries - recent work)
3. Read TASK_QUEUE.md (current phase tasks)
4. Check KNOWN_BUGS.md (blocking issues)

=== CURRENT FOCUS ===
Phase: TrendPulse Beta Launch (Week 1 MVP)
Goal: Perfect campaign creation workflow
Tasks: See TASK_QUEUE.md for assigned work

=== WORKFLOW BY AGENT TYPE ===

**ZenCoder - Web Dev / Database Designer**:
- Implement assigned task from TASK_QUEUE.md
- Follow Tron theme patterns (see SoT)
- Make small, safe changes
- Request approval for breaking changes
- After work: Update CHANGELOG.md, mark task complete

**ZenCoder - Testing Agent**:
- Test completed features from CHANGELOG.md
- Use Jest + RTL or Playwright (check __tests__/ for patterns)
- After tests: Update CHANGELOG.md with test results

**3KPRO - DevOps / Performance Engineer**:
- Infrastructure and optimization tasks
- Follow TASK_QUEUE.md assignments
- Document configuration changes
- After work: Update CHANGELOG.md

**Ask Agent**:
- Answer codebase questions
- Reference STATEMENT_OF_TRUTH.md for context
- No file modifications

=== RULES ===
- Read STATEMENT_OF_TRUTH.md FIRST (has everything)
- Small, safe changes only
- Request approval before: schema changes, new deps, breaking changes
- Always update CHANGELOG.md after work
- Test before marking complete

=== FILES TO NEVER MODIFY ===
- package-lock.json (use npm install)
- .env.local (security risk)
- supabase/migrations/*.sql (ask first)

=== RECOVERY ===
If stuck: Add [BLOCKED] entry to KNOWN_BUGS.md, wait for user input

=== COMPLETION ===
Report: "[TaskID] Complete - Files: X, Y, Z - Tests: passing/pending"
```

---

### 6. Create Docs Index
**Status:** 🔄 PROPOSED

**File:** `docs/README.md`

**Purpose:** Navigation guide for docs/ directory

**Content:**
```markdown
# Documentation Index

## 🎯 Start Here (Master References)
1. [STATEMENT_OF_TRUTH.md](../STATEMENT_OF_TRUTH.md) - **READ FIRST** - Master context
2. [CHANGELOG.md](../CHANGELOG.md) - What changed
3. [TASK_QUEUE.md](../TASK_QUEUE.md) - What to do
4. [KNOWN_BUGS.md](../KNOWN_BUGS.md) - What's broken

## 📚 Project Documentation
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture details
- [AI_TOOLS_SETUP_GUIDE.md](AI_TOOLS_SETUP_GUIDE.md) - AI configuration
- [ZENCODER_HANDOFF_PORTAL.md](ZENCODER_HANDOFF_PORTAL.md) - UI/UX specs

## 📁 Archived Documentation
- [handoffs/](handoffs/) - Historical agent handoffs (reference only)

## 🔧 Specialized Guides
- [VERCEL_CONFIGURATION_HANDOFF.md](../VERCEL_CONFIGURATION_HANDOFF.md) - Deployment
- [GIT_WORKFLOW_PROTOCOL.md](../GIT_WORKFLOW_PROTOCOL.md) - Git conventions
- [SOCIAL_ACCOUNTS_BIOS.md](../SOCIAL_ACCOUNTS_BIOS.md) - Marketing strategy
```

---

## 🗂️ FINAL STRUCTURE

```
landing-page/
├── 📖 STATEMENT_OF_TRUTH.md        ⭐ MASTER - Read first
├── 📝 CHANGELOG.md                  Updates and changes
├── ✅ TASK_QUEUE.md                 Tasks with Zen prompts
├── 🐛 KNOWN_BUGS.md                 Bug tracking
├── 🚀 README.md                     Quick start only
├── docs/
│   ├── README.md                    Documentation index
│   ├── PROJECT_STRUCTURE.md         Architecture
│   ├── AI_TOOLS_SETUP_GUIDE.md     AI configuration
│   ├── handoffs/                    📦 Archived handoffs
│   │   ├── HAIKU_HANDOFF_OCT19.md
│   │   ├── EVENING_HANDOFF_OCT20.md
│   │   └── ... (all historical handoffs)
│   └── ... (other specialized docs)
└── ... (code files)
```

---

## 📊 BENEFITS

**Before (Chaos):**
- 15+ handoff files in root
- Multiple sources of truth
- Agents confused about what to read
- Context lost between sessions
- Duplicate information

**After (Organized):**
- 1 master SoT (everything in one place)
- Clear document hierarchy
- Agent workflow standardized
- Easy context recovery
- Archived history preserved

---

## ✅ EXECUTION CHECKLIST

- [x] Create STATEMENT_OF_TRUTH.md
- [x] Create docs/handoffs/ directory
- [ ] Move handoff files to archive
- [ ] Review and update README.md
- [ ] Update ZenCoder instructions
- [ ] Create docs/README.md index
- [ ] Update TASK_QUEUE.md header (link to SoT)
- [ ] Test with fresh agent (verify they can find everything)
- [ ] Update CHANGELOG.md with organization changes

---

## 🎯 SUCCESS CRITERIA

**Agent can start fresh and know:**
1. What is this project? (SoT - Mission section)
2. What's the current status? (SoT - Current Status section)
3. What should I work on? (TASK_QUEUE.md)
4. Are there any blockers? (KNOWN_BUGS.md)
5. What changed recently? (CHANGELOG.md)
6. How do I work here? (SoT - Agent Workflow section)

**All answered in <10 minutes of reading.**

---

## 📞 APPROVAL NEEDED

**User Decision Points:**
1. ✅ Approve archive plan (move handoffs)
2. ✅ Approve README.md changes (quick start only)
3. ✅ Approve new ZenCoder instructions
4. ✅ Approve docs/README.md creation

**Ready to execute pending your approval.**
