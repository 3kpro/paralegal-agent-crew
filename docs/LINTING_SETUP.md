# Linting Setup & Pre-commit Hooks

## Overview
Automated linting is now configured to run before every git commit, preventing code quality issues from being committed.

## Tools Installed

### 1. **Husky** (v9.1.7)
- Git hooks manager
- Runs scripts automatically on git events (commit, push, etc.)
- Configuration: `.husky/` directory

### 2. **lint-staged** (v16.2.6)
- Runs linters only on staged files (fast!)
- Configuration: `package.json` > `lint-staged` section

## How It Works

1. **Before Commit**: When you run `git commit`, Husky triggers the pre-commit hook
2. **Lint Staged Files**: lint-staged runs ESLint on only the files you're committing
3. **Auto-fix**: ESLint automatically fixes issues it can (formatting, simple errors)
4. **Fail on Errors**: If critical errors remain, the commit is blocked

## Configuration

### package.json
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  },
  "scripts": {
    "prepare": "husky"
  }
}
```

### .husky/pre-commit
```bash
npx lint-staged
```

## Usage

### Normal Workflow (Automatic)
```bash
git add .
git commit -m "Your commit message"  # Linting runs automatically!
```

### Manual Linting
```bash
# Lint entire codebase
npm run lint

# Lint and auto-fix
npx eslint . --fix
```

### Skip Pre-commit Hook (Not Recommended)
```bash
git commit -m "message" --no-verify
```

## Error History

### Critical Errors Fixed (Nov 4, 2025)

1. **hasOwnProperty** - `app/api/contentflow/stats/route.ts`
   - Issue: Direct call to `hasOwnProperty` on object
   - Fix: Used `Object.prototype.hasOwnProperty.call()`

2. **Lexical Declarations** - `app/api/generate/route.ts`
   - Issue: 7 case blocks without curly braces
   - Fix: Wrapped case blocks in `{ }`

3. **prefer-const** - `app/api/health/route.ts`
   - Issue: `let serviceStartTime` never reassigned
   - Fix: Changed to `const`

### Current Status
- ✅ **0 Critical Errors**
- ⚠️ ~239 Warnings (mostly TypeScript `any` types - low priority)
- 📊 Clean build passing

## Benefits

1. **Prevents Bugs**: Catches errors before they reach production
2. **Consistent Code**: Enforces style guidelines automatically
3. **Faster Reviews**: Less time spent on style feedback
4. **Auto-fixes**: Many issues fixed automatically
5. **CI/CD Ready**: Same linting runs in deployment pipeline

## Troubleshooting

### Hook Not Running?
```bash
# Re-initialize Husky
npm run prepare
```

### Too Slow?
lint-staged only checks staged files, so it should be fast. If slow:
- Check for large files in commit
- Reduce ESLint rules complexity

### Need to Disable Temporarily?
```bash
git commit --no-verify
```

## Future Improvements

- [ ] Add TypeScript type checking to pre-commit
- [ ] Add test runner for affected tests
- [ ] Configure ESLint to fail on warnings (after fixing all)
- [ ] Add commit message linting (commitlint)
- [ ] Add pre-push hook for full test suite

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
