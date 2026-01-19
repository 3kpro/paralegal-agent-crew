# GitHub Token Safety Protocol

**Version:** 1.0
**Date:** 2026-01-18
**Audience:** Developers, AI Agents, Code Reviewers

---

## Quick Reference: Safe GitHub URLs

### ❌ NEVER Share URLs Like This
```
https://raw.githubusercontent.com/owner/repo/main/config.json?token=GHSAT0AAAA...
https://github.com/owner/repo/blob/main/file.ts?token=ghp_abc123...
```

**Why?** Query parameters contain authentication tokens that grant repository access to anyone with the URL.

### ✅ ALWAYS Use Clean URLs
```
https://raw.githubusercontent.com/owner/repo/main/config.json
https://github.com/owner/repo/blob/main/file.ts
```

**Format:**
```
https://raw.githubusercontent.com/<OWNER>/<REPO>/<BRANCH>/<PATH>
```

---

## For AI Agents: System Prompt Addition

Add this to any agent that generates GitHub URLs:

```markdown
SECURITY RULE: When providing GitHub raw file URLs, you MUST:
1. Strip ALL query parameters (especially ?token=)
2. Output ONLY the base raw.githubusercontent.com path
3. Format: https://raw.githubusercontent.com/<OWNER>/<REPO>/<BRANCH>/<PATH>
4. Never include authentication tokens in shared URLs
```

---

## Token Types & Security Levels

### Fine-Grained Personal Access Tokens (Recommended)
- **Pattern:** `ghp_` or `github_pat_`
- **Security:** Scoped to specific repositories and permissions
- **Expiration:** Set maximum 90 days
- **Use Case:** Automated scripts, CI/CD pipelines

### Classic Personal Access Tokens (Legacy)
- **Pattern:** `ghp_` followed by 36 characters
- **Security:** Broad access across all repositories
- **Expiration:** Optional (recommend enabling)
- **Use Case:** Legacy integrations only

### OAuth Tokens
- **Pattern:** `gho_`
- **Security:** Scoped by OAuth app permissions
- **Expiration:** Varies by OAuth app configuration
- **Use Case:** Third-party integrations

### Temporary Session Tokens
- **Pattern:** Various, often in query parameters
- **Security:** Time-limited browser session tokens
- **Expiration:** Automatic on session end
- **Use Case:** GitHub web interface (never share)

---

## Safe Practices Checklist

### ✅ Before Sharing Any GitHub Content

- [ ] Remove all query parameters from URLs
- [ ] Verify no `?token=` in the URL
- [ ] Use public raw URL format for public repos
- [ ] For private repos, share repository path only (not direct file URL)
- [ ] Never screenshot GitHub pages showing tokens in URL bar

### ✅ When Creating Tokens

- [ ] Use fine-grained tokens with minimum necessary permissions
- [ ] Set expiration date (max 90 days for production)
- [ ] Name tokens clearly (e.g., "CI-Pipeline-ReadOnly-2026-01")
- [ ] Document token purpose in your password manager
- [ ] Never commit tokens to version control

### ✅ When Accessing Private Repos

- [ ] Use SSH keys instead of HTTPS with tokens when possible
- [ ] Store tokens in environment variables, never hardcode
- [ ] Use GitHub CLI (`gh`) for authenticated operations
- [ ] Revoke tokens immediately after one-time use

### ✅ Regular Maintenance

- [ ] Audit active tokens monthly
- [ ] Revoke unused or expired tokens
- [ ] Rotate long-lived tokens every 90 days
- [ ] Review token permissions quarterly
- [ ] Update team on token security practices

---

## Common Scenarios

### Scenario 1: Sharing File Content with CTO/Team

**Wrong:**
1. Open file on GitHub while logged in
2. Click "Raw"
3. Copy URL from address bar: `https://raw.githubusercontent.com/.../file.json?token=GHSAT...`
4. Share URL ❌

**Right:**
1. Open file on GitHub
2. Manually construct URL: `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`
3. Or use GitHub CLI: `gh api repos/<owner>/<repo>/contents/<path> --jq '.content' | base64 -d`
4. Share clean URL ✅

### Scenario 2: Agent Needs to Access Repository Files

**Wrong:**
```python
url = "https://raw.githubusercontent.com/owner/repo/main/config.json?token=" + os.getenv("GITHUB_TOKEN")
```

**Right:**
```python
# Use GitHub API with token in header
headers = {"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"}
response = requests.get("https://api.github.com/repos/owner/repo/contents/config.json", headers=headers)
```

### Scenario 3: CI/CD Pipeline Authentication

**Wrong:**
```yaml
- run: git clone https://github.com/owner/repo.git?token=${{ secrets.GITHUB_TOKEN }}
```

**Right:**
```yaml
- run: |
    git config --global url."https://oauth2:${{ secrets.GITHUB_TOKEN }}@github.com/".insteadOf "https://github.com/"
    git clone https://github.com/owner/repo.git
```

---

## Token Leak Response Protocol

### If You Discover a Token Leak:

1. **Immediate (within 5 minutes):**
   - Revoke the exposed token at github.com/settings/tokens
   - Document incident timestamp and exposure scope

2. **Short-term (within 1 hour):**
   - Scan git history: `git log --all -S "token_pattern"`
   - Check if token was committed: `git grep "GHSAT"`
   - Search codebase for token usage

3. **Medium-term (within 24 hours):**
   - Generate new token with minimum required permissions
   - Update all systems using the old token
   - Review access logs for unauthorized usage
   - Update SECURITY_HARDENING.md incident log

4. **Long-term (within 1 week):**
   - Conduct security review of token management practices
   - Update team training materials
   - Implement automated token scanning (e.g., GitGuardian)
   - Schedule follow-up security audit

---

## Automated Detection

### Pre-commit Hook (Recommended)

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for GitHub tokens
if git diff --cached | grep -E 'ghp_|gho_|ghu_|ghs_|ghr_|github_pat_|GHSAT'; then
    echo "❌ ERROR: GitHub token detected in staged changes!"
    echo "Remove tokens before committing."
    exit 1
fi
```

Make executable: `chmod +x .git/hooks/pre-commit`

### GitHub Secret Scanning

- Enable GitHub's built-in secret scanning
- Configure push protection for repositories
- Set up email alerts for detected secrets

### Third-Party Tools

- **GitGuardian:** Real-time secret detection
- **TruffleHog:** Git history secret scanner
- **Gitleaks:** Lightweight secret scanner for CI/CD

---

## Education & Training

### For Developers

1. Complete GitHub Security Best Practices course
2. Review this protocol monthly
3. Participate in quarterly security audits
4. Report suspicious activity immediately

### For AI Agents

1. Include token safety rules in system prompts
2. Validate URL generation before output
3. Log all token access attempts
4. Flag suspicious patterns for human review

---

## References

- [GitHub Token Security Best Practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) - Incident log and security policies

---

**Questions or Concerns?**
Contact: security@3kpro.services

**Report Security Issues:**
- Email: security@3kpro.services
- GitHub: Use security advisory feature
- Urgent: Directly contact CTO

---

**Last Reviewed:** 2026-01-18
**Next Review:** 2026-02-18
**Owner:** Security Team
