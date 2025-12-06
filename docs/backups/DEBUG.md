# TrendPulse Debug Tools

This document explains the debugging tools available for TrendPulse development.

## 🎯 Quick Reference

| Tool | Use Case | Output |
|------|----------|--------|
| `debug-to-clipboard.bat` | **Quick context sharing** | Clipboard |
| `capture-error.bat` | **Specific errors** | File + Clipboard |
| `debug-logs.bat` | **Deep investigation** | File |
| `debug-live.bat` | **Real-time monitoring** | Console |

---

## 📋 Tool Descriptions

### 1. `debug-to-clipboard.bat` ⭐ **RECOMMENDED**

**When to use:** Before asking Claude/Gemini for help

**What it does:**
- Captures current git status
- Lists modified files
- Shows recent commits
- Gets environment info (Node/NPM versions)
- Checks dev server status
- **Automatically copies to clipboard**

**How to use:**
```bash
# Double-click the file, then paste into chat
debug-to-clipboard.bat
```

**Output includes:**
- Git branch and status
- Last 5 commits
- Modified files
- Dev server status (port 3000)
- Node/NPM versions

---

### 2. `capture-error.bat`

**When to use:** When you encounter a specific error

**What it does:**
- Prompts you to describe the error
- Captures full project context
- Opens notepad for you to paste stack trace
- Combines everything into one report

**How to use:**
```bash
# 1. Run the batch file
capture-error.bat

# 2. Type error description when prompted
# 3. Paste stack trace into notepad
# 4. Save and share with AI
```

**Output location:** `debug-output/error-[timestamp].txt`

---

### 3. `debug-logs.bat`

**When to use:** Deep debugging, comprehensive analysis

**What it does:**
- **Full git analysis** (status, commits, diffs)
- **Dev server check** (port 3000 status)
- **Environment info** (Node, NPM, package scripts)
- **Build cache status** (.next directory)
- **Recent errors** (if error.log exists)
- **Modified files** (last 24 hours)
- **Project structure** (tree view)

**How to use:**
```bash
debug-logs.bat
```

**Output location:** `debug-output/debug-[timestamp].txt`

**What gets captured:**
1. Git status (staged, unstaged, untracked files)
2. Last 10 commits
3. Dev server process (netstat on port 3000)
4. Node/NPM versions
5. Package.json scripts
6. Build cache analysis (.next directory)
7. Recent error logs (if available)
8. Files modified in last 24 hours
9. Project directory tree

---

### 4. `debug-live.bat`

**When to use:** Real-time dev server monitoring

**What it does:**
- Shows live dev server output
- Monitors port 3000
- Displays git status
- Auto-starts dev server if not running

**How to use:**
```bash
debug-live.bat
# Keep window open to see live logs
# Press Ctrl+C to stop
```

---

## 🔧 Workflow Examples

### Example 1: Quick Question
```bash
# You want to ask Claude about a feature
debug-to-clipboard.bat
# Paste into chat: "I'm trying to add X, here's my current state: [Ctrl+V]"
```

### Example 2: Error Investigation
```bash
# You see an error in browser console
capture-error.bat
# Description: "TypeError in Navigation.tsx"
# Paste stack trace in notepad
# Share with AI: "Getting this error: [paste report]"
```

### Example 3: Build Issues
```bash
# Build is failing
debug-logs.bat
# Review the comprehensive report
# Share specific sections with AI
```

### Example 4: Real-time Debugging
```bash
# Making changes and want to watch output
debug-live.bat
# Make your changes
# Watch console for errors
# Copy/paste relevant output to AI
```

---

## 📁 Output Directory

All debug files are saved to: `debug-output/`

**File naming:**
- `debug-[timestamp].txt` - Comprehensive logs
- `error-[timestamp].txt` - Error reports

**Cleanup:**
```bash
# Delete old debug files (optional)
rmdir /s /q debug-output
```

---

## 🤖 AI Debugging Workflow

### Step 1: Reproduce the Issue
Make sure you can consistently reproduce the problem.

### Step 2: Capture Context
```bash
debug-to-clipboard.bat  # For quick issues
# OR
capture-error.bat       # For specific errors
# OR
debug-logs.bat          # For complex issues
```

### Step 3: Share with AI
Paste the output into Claude Code or Gemini with context:
```
"I'm getting [describe issue]. Here's my current state:

[paste debug output]

What I've tried:
- [list what you've tried]

What I expect:
- [describe expected behavior]

What actually happens:
- [describe actual behavior]
"
```

### Step 4: Provide Additional Context
If AI asks for more info:
- Screenshots
- Specific file contents
- Browser console errors
- Network tab errors

---

## 🚨 Common Issues

### Issue: Batch file won't run
**Solution:** Right-click → "Run as Administrator"

### Issue: Output is empty
**Solution:** Make sure you're in the project root directory

### Issue: Git commands fail
**Solution:** Ensure Git is installed and project is a git repository

### Issue: Dev server not detected
**Solution:**
```bash
# Start dev server first
npm run dev
# Then run debug tool
```

---

## 🔒 Security Notes

**What NOT to share:**
- `.env` files (contain secrets)
- `SUPABASE_SERVICE_ROLE_KEY`
- Stripe API keys
- User emails/passwords

**Safe to share:**
- Git status/commits
- File names
- Error messages
- Package versions
- Directory structure

---

## 📝 Customization

### Add Custom Checks

Edit any batch file to add custom debug info:

```batch
REM Add custom section
echo [X/X] Checking custom thing... >> %output%
echo. >> %output%
echo ==================== CUSTOM CHECK ==================== >> %output%
your-command-here >> %output% 2>&1
echo. >> %output%
```

### Modify Output Format

Change the output file location in any batch file:
```batch
REM Default
set output=debug-output\debug-%timestamp%.txt

REM Custom
set output=C:\MyLogs\debug-%timestamp%.txt
```

---

## 💡 Pro Tips

1. **Run before every AI question** - Saves back-and-forth
2. **Include screenshots** - Visual context helps
3. **Describe what changed** - "I modified X file to do Y"
4. **Share expected vs actual** - Clear problem statement
5. **Copy error messages exactly** - Don't paraphrase

---

## 🛠️ Advanced: Log to File During Development

Add to `package.json`:
```json
"scripts": {
  "dev": "next dev",
  "dev:log": "next dev 2>&1 | tee dev.log",
  "dev:debug": "next dev --debug 2>&1 | tee dev-debug.log"
}
```

Then run:
```bash
npm run dev:log
# Logs saved to dev.log in real-time
```

Share with AI:
```
"Check my dev.log file, I'm seeing errors"
```

---

## 📚 Related Documentation

- [CHANGELOG.md](CHANGELOG.md) - Recent changes
- [README.md](../README.md) - Project overview
- [Stripe Setup](../STRIPE_SETUP.md) - Payment configuration

---

## 🆘 Getting Help

If debug tools aren't working:

1. **Check Windows permissions** - Run as Administrator
2. **Verify Git is installed** - `git --version`
3. **Check Node/NPM** - `node --version` and `npm --version`
4. **Ensure you're in project root** - Look for `package.json`
5. **Ask Claude/Gemini** - "My debug tools aren't working, here's the error: [paste error]"

---

**Last Updated:** 2025-11-28
**Maintained By:** Claude Code Assistant
