# Backend - API Deprecation Watchdog

## Setup

1. Create a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   playwright install
   ```

## Running the API

```powershell
uvicorn main:app --reload
```
