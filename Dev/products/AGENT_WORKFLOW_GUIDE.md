# AGENT WORKFLOW AND PROTOCOLS

This guide defines the two distinct modes of operation for Agents in this workspace.

---

## MODE A: Global Maintenance & System Support
**Use this for:** Global changes (Logo, Nav, Deployment), Infrastructure, or non-development tasks.

**Protocol:**
1.  **Enter Task:** User adds the task to `C:\DEV\3K-Pro-Services\landing-page\docs\SYSTEM\TASKS.md`.
2.  **Launch Agent:** User provides the standard System Context prompt:
    ```text
    1. Read C:\DEV\3K-Pro-Services\landing-page\docs\SYSTEM for system context.
    2. Check TASKS.md to see if there is a task awaiting for you.
    3. After completing a task, follow EXIT REQUIREMENTS in C:\DEV\3K-Pro-Services\Dev\products\AGENT_CONTRACT.md when done.
    ```
3.  **Execution:** The Agent works globally but respects product boundaries. Update `SYSTEM/CHANGELOG.md` upon completion.

---

## MODE B: Product Development (Federated Agents)
**Use this for:** Building specific products (n8n Marketplace, Azure Analyzer) without blocking the main system.

**The Golden Rule:** **ONE AGENT = ONE FOLDER**
*   Agent 1 -> `Idea _01_N8N`
*   Agent 2 -> `idea_02_AZURE_ANALYZER`

### Launch Instructions (Copy-Paste)

**Standard Template (Use for any product):**
```text
Working directory: C:\DEV\3K-Pro-Services\Dev\products\[FOLDER_NAME]

Instructions:
1. Read TRUTH.md for product vision
2. Read TASKS.md - work on the task in ## NOW section
3. When done, follow AGENT_CONTRACT.md exit requirements

Important: Stay in your folder. Do not touch files outside this directory.
```

**Examples:**

**For Idea 01 (n8n Marketplace):**
```text
Working directory: C:\DEV\3K-Pro-Services\Dev\products\Idea _01_N8N

Instructions:
1. Read TRUTH.md for product vision
2. Read TASKS.md - work on the task in ## NOW section
3. When done, follow AGENT_CONTRACT.md exit requirements

Important: Stay in your folder. Do not touch files outside this directory.
```

**For Idea 06 (Trial Recovery Engine):**
```text
Working directory: C:\DEV\3K-Pro-Services\Dev\products\Idea_06_Trial_Recovery_Engine

Instructions:
1. Read TRUTH.md for product vision
2. Read TASKS.md - work on the task in ## NOW section
3. When done, follow AGENT_CONTRACT.md exit requirements

Important: Stay in your folder. Do not touch files outside this directory.
```

### Monitoring & Reporting
- **No Global Sync Required:** You do NOT need to update the Global `TASKS.md` for every feature.
- **Local Truth:** The Agent maintains its own `CHANGELOG.md` inside the product folder.
- **Manager Review:** To check progress, simply read the `CHANGELOG.md` inside the specific product folder.

---

## Emergency Stop
If a Product Agent starts editing files outside its folder (e.g., trying to change `landing-page/app/layout.tsx`), tell it:
> "STOP. You are breaking the context boundary. Return to your Context Root and stay there."
