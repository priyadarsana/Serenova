# ⚡ HOW TO START AURORA MIND

## ⚠️ IMPORTANT: Do NOT use VS Code terminal!

### ✅ CORRECT Way to Start:

**1. Open Windows Terminal or CMD (NOT VS Code)**
   - Press `Win + R`
   - Type: `cmd`
   - Press Enter

**2. Start Backend:**
```cmd
cd C:\Users\pdars\serenova
backend\.venv\Scripts\python.exe run_backend.py
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

**3. Open ANOTHER Terminal/CMD window**

**4. Start Frontend:**
```cmd
cd C:\Users\pdars\serenova\frontend
npm run dev
```
Wait for: `Local: http://localhost:3000/`

**5. Open Browser:**
http://localhost:3000

---

## 🎯 Alternative: Use Batch File

Double-click: `C:\Users\pdars\serenova\START-SERVERS.bat`

Keep both CMD windows open!

---

## 🛑 To Stop:
- Press `CTRL+C` in each window
- Or close the windows

---

## ✅ Verify Servers Running:

Run in any terminal:
```powershell
netstat -ano | findstr "8000 3000"
```

You should see both ports LISTENING.

---

**Problem?** Make sure you're NOT running in VS Code terminal!
