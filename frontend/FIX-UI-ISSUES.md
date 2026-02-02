# Fix Frontend UI Issues

## Quick Fix Steps:

### Option 1: Use the Cleanup Script (Recommended)
1. **Stop any running dev servers** (Press Ctrl+C in terminal)
2. **Close file explorer/IDE** that might have the nested folder open
3. **Run the cleanup script:**
   ```bash
   cd frontend
   .\clean-and-start.bat
   ```
4. **Start the dev server:**
   ```bash
   npm start
   ```

### Option 2: Manual Cleanup
1. **Stop all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Navigate to frontend folder:**
   ```powershell
   cd C:\Users\giris\task-decomposition-engine\frontend
   ```

3. **Remove nested folder (if exists):**
   ```powershell
   Remove-Item -Path "frontend" -Recurse -Force -ErrorAction SilentlyContinue
   ```

4. **Clear all caches:**
   ```powershell
   Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item -Path ".cache" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue
   ```

5. **Reinstall dependencies:**
   ```powershell
   npm install
   ```

6. **Start dev server:**
   ```powershell
   npm start
   ```

## Verify Setup:

Make sure you're running from:
- ✅ `C:\Users\giris\task-decomposition-engine\frontend`
- ❌ NOT from `C:\Users\giris\task-decomposition-engine\frontend\frontend`

## Expected UI:

Once working, you should see:
- Purple gradient background
- Header with "Task Decomposition Engine" title
- Left side: Input form with textarea and constraints
- Right side: Results area (empty initially)
- "Load Example" button next to "Project Description" heading
- "Decompose Project" and "Clear" buttons

## If Still Not Working:

1. Check browser console (F12) for errors
2. Verify backend is running on `http://localhost:5000`
3. Make sure you're accessing `http://localhost:3000` (not 5000)
4. Try clearing browser cache (Ctrl+Shift+Delete)
