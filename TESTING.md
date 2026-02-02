# Testing Guide - Task Decomposition Engine

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd backend
   npm run dev
   ```
   Server should be running on `http://localhost:5000`

2. **Frontend Server Running:**
   ```bash
   cd frontend/frontend
   npm start
   ```
   Frontend should be running on `http://localhost:3000`

---

## Method 1: Automated Test Cases (Recommended)

### Run All Test Cases

```bash
cd backend
npm test
```

This will run 4 test cases:
- ✅ Test 1: Circular Dependency Detection
- ✅ Test 2: Impossible Timeline Detection
- ✅ Test 3: Vague Requirements Handling
- ✅ Test 4: Hidden Dependency Inference

### Expected Output:
```
🧪 Running Test Cases...

📝 Test 1: Circular Dependency
   Detects circular dependencies and suggests resolution
   ✅ PASSED
   Feasibility: 0.65
   Tasks: 3
   Warnings: 1

📝 Test 2: Impossible Timeline
   Identifies unrealistic project constraints
   ✅ PASSED
   Feasibility: 0.15
   Tasks: 8
   Warnings: 2
...
```

---

## Method 2: Manual API Testing with cURL

### Test 1: Decompose Endpoint

```bash
curl -X POST http://localhost:5000/api/decompose \
  -H "Content-Type: application/json" \
  -d "{\"description\": \"Build an e-commerce site with user authentication and payment processing\", \"constraints\": {\"teamSize\": 2, \"hoursPerDay\": 6, \"maxTasks\": 20}}"
```

### Test 2: Validate Endpoint

```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"tasks\": [{\"id\": \"task-1\", \"title\": \"Setup\", \"dependencies\": []}, {\"id\": \"task-2\", \"title\": \"Auth\", \"dependencies\": [\"task-1\"]}, {\"id\": \"task-3\", \"title\": \"Payment\", \"dependencies\": [\"task-2\"]}]}"
```

### Test 3: Clarify Endpoint

```bash
curl -X POST http://localhost:5000/api/clarify \
  -H "Content-Type: application/json" \
  -d "{\"description\": \"Make it fast and good looking\"}"
```

---

## Method 3: Frontend UI Testing

### Step 1: Open Frontend
Navigate to `http://localhost:3000` in your browser

### Step 2: Test with Example Data
1. Click **"Load Example 📋"** button
2. This will pre-fill the form with sample project description
3. Click **"Decompose Project"** button
4. Wait for results to load

### Step 3: Verify Results Display
Check that you see:
- ✅ **Feasibility Score** (color-coded card)
- ✅ **Conflicts** (if any detected)
- ✅ **Warnings** (if any)
- ✅ **Generated Tasks** (list of task cards)

### Step 4: Test Custom Input
1. Clear the form
2. Enter your own project description
3. Adjust constraints (Team Size, Hours Per Day, Max Tasks)
4. Click "Decompose Project"
5. Verify results

---

## Method 4: Test Specific Scenarios

### Scenario 1: E-commerce Project
**Input:**
```
Description: "Build an online store with shopping cart, user accounts, and payment processing"
Constraints: teamSize: 2, hoursPerDay: 6, maxTasks: 20
```

**Expected:**
- Tasks include: Setup, Auth, Product Catalog, Shopping Cart, Payment
- Feasibility score calculated
- Dependencies mapped correctly

### Scenario 2: Auth-Only Project
**Input:**
```
Description: "Create user authentication system with login and signup"
Constraints: teamSize: 1, hoursPerDay: 4, maxTasks: 10
```

**Expected:**
- Tasks include: Setup, Backend Auth, Frontend Auth, Integration
- Lower task count
- Simpler dependency graph

### Scenario 3: Vague Requirements
**Input:**
```
Description: "Make it fast, good looking, and user-friendly"
Constraints: teamSize: 2, hoursPerDay: 6, maxTasks: 15
```

**Expected:**
- Ambiguity flags on tasks
- Warnings about vague terms
- Clarifying questions generated

### Scenario 4: Impossible Timeline
**Input:**
```
Description: "Build a full-featured social media platform"
Constraints: teamSize: 1, hoursPerDay: 4, deadline: "3 days"
```

**Expected:**
- Low feasibility score (< 0.3)
- Warnings about insufficient time
- Many tasks generated

---

## Method 5: Browser Developer Tools Testing

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Decompose Project" in UI
4. Verify:
   - POST request to `http://localhost:5000/api/decompose`
   - Status: 200 OK
   - Response contains: `tasks`, `conflicts`, `feasibilityScore`, `warnings`

### Check Console for Errors
1. Open **Console** tab in DevTools
2. Look for any red error messages
3. Common issues:
   - CORS errors → Check backend CORS settings
   - Connection refused → Backend not running
   - 404 errors → Check API endpoint URLs

---

## Method 6: Postman/Thunder Client Testing

### Setup Collection

**Request 1: Decompose**
- Method: `POST`
- URL: `http://localhost:5000/api/decompose`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "description": "Build a task management app",
  "constraints": {
    "teamSize": 2,
    "hoursPerDay": 6,
    "maxTasks": 20
  }
}
```

**Request 2: Validate**
- Method: `POST`
- URL: `http://localhost:5000/api/validate`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Setup",
      "dependencies": []
    },
    {
      "id": "task-2",
      "title": "Feature A",
      "dependencies": ["task-1"]
    }
  ]
}
```

**Request 3: Clarify**
- Method: `POST`
- URL: `http://localhost:5000/api/clarify`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "description": "Make it fast and good"
}
```

---

## Expected Results Checklist

### ✅ Decompose Endpoint Should Return:
- `tasks`: Array of task objects with:
  - `id`, `title`, `description`, `estimatedHours`
  - `category`, `priority`, `dependencies`
  - `ambiguityFlags` (if applicable)
- `conflicts`: Array of conflict objects (if any)
- `feasibilityScore`: Number between 0 and 1
- `warnings`: Array of warning strings (if any)

### ✅ Validate Endpoint Should Return:
- `isValid`: Boolean
- `circularDependencies`: Object with `hasCycle`, `cycle`, `suggestion`
- `criticalPath`: Object with `path` (array) and `totalHours`
- `parallelTasks`: Array of arrays (task groups)
- `totalTasks`: Number

### ✅ Clarify Endpoint Should Return:
- `questions`: Array of clarifying question strings

---

## Troubleshooting

### Backend Not Starting?
```bash
cd backend
# Check if MongoDB is running
# Check if port 5000 is available
npm run dev
```

### Frontend Not Starting?
```bash
cd frontend/frontend
# Check if port 3000 is available
# Clear node_modules and reinstall if needed
rm -rf node_modules
npm install
npm start
```

### API Calls Failing?
1. Check backend is running on port 5000
2. Check CORS is enabled in backend
3. Check browser console for errors
4. Verify API endpoint URLs in frontend code

### White Screen in Browser?
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify all components are imported correctly
4. Check network tab for failed requests

---

## Quick Test Commands

### Test Backend Health:
```bash
curl http://localhost:5000/
```

Expected: `{"status":"ok","message":"Task Decomposition API is running"}`

### Test All Endpoints:
```bash
# Decompose
curl -X POST http://localhost:5000/api/decompose -H "Content-Type: application/json" -d "{\"description\":\"test\",\"constraints\":{}}"

# Validate
curl -X POST http://localhost:5000/api/validate -H "Content-Type: application/json" -d "{\"tasks\":[]}"

# Clarify
curl -X POST http://localhost:5000/api/clarify -H "Content-Type: application/json" -d "{\"description\":\"test\"}"
```

---

## Success Criteria

✅ All 4 automated test cases pass  
✅ Frontend UI displays correctly  
✅ API endpoints return expected data  
✅ Tasks are generated with correct dependencies  
✅ Feasibility scores are calculated  
✅ Conflicts and warnings are detected  
✅ No console errors in browser  
✅ No network errors in DevTools  

---

## Next Steps After Testing

1. Review generated tasks for accuracy
2. Check dependency relationships
3. Verify feasibility scores make sense
4. Test edge cases (empty descriptions, invalid constraints)
5. Test with different project types (e-commerce, auth, payment, etc.)
