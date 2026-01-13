# OpenCode Setup & Environment Guide

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_13_Prompt_Injection_Firewall\`
- **Primary Stack:** Rust/Go, PostgreSQL, React

## 🚀 Setup
```powershell
# Rust setup
cargo new promptarmor
cd promptarmor
cargo add regex tokio serde actix-web

# Or Go setup
go mod init promptarmor
go get github.com/gin-gonic/gin
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md`
- **Tasks:** Check `TASKS.md`
