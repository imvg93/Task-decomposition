# Task Decomposition Engine

An AI-powered (rule-based) system that decomposes ambiguous project descriptions into structured, actionable task lists with dependency analysis, feasibility scoring, and conflict detection.

## 🎯 Overview

This MERN stack application takes messy, real-world project descriptions and transforms them into:
- ✅ Structured task breakdowns with dependencies
- ✅ Feasibility scores based on team size and timeline
- ✅ Conflict detection (contradictory requirements)
- ✅ Ambiguity flags and clarifying questions
- ✅ Critical path calculation
- ✅ Circular dependency detection

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Algorithms:** DFS, Topological Sort, CPM (Critical Path Method)
- **Pattern Matching:** Regex-based feature extraction

### Frontend (React)
- **Framework:** React 19 with Hooks
- **Styling:** CSS Grid/Flexbox
- **HTTP Client:** Axios

## 📁 Project Structure

```
task-decomposition-engine/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Pattern library
│   ├── tests/           # Test cases
│   └── server.js        # Express server
│
├── frontend/
│   └── frontend/        # React application
│       └── src/
│           ├── App.js
│           └── components/
│
├── APPROACH.md          # Development approach
├── TESTING.md           # Testing guide
└── PROJECT_OVERVIEW.md  # Detailed overview
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/task-decomposition
PORT=5000
```

4. **Start server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### 1. POST /api/decompose
Decomposes a project description into tasks.

**Request:**
```json
{
  "description": "Build an e-commerce site with user auth and payments",
  "constraints": {
    "teamSize": 2,
    "hoursPerDay": 6,
    "maxTasks": 20
  }
}
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Setup MERN project",
      "description": "Initialize a MERN stack project...",
      "estimatedHours": 2,
      "priority": 1,
      "dependencies": [],
      "category": "setup",
      "ambiguityFlags": []
    }
  ],
  "conflicts": [
    {
      "type": "simplicity_vs_premium",
      "description": "The description mentions both simple/basic and premium/luxury requirements.",
      "suggestion": "Clarify whether the scope should be minimal or full-featured."
    }
  ],
  "feasibilityScore": 0.65,
  "warnings": ["Total estimated effort exceeds 100 hours..."]
}
```

### 2. POST /api/validate
Validates task dependencies and calculates metrics.

**Request:**
```json
{
  "tasks": [
    {
      "id": "task-1",
      "dependencies": []
    },
    {
      "id": "task-2",
      "dependencies": ["task-1"]
    }
  ]
}
```

**Response:**
```json
{
  "isValid": true,
  "circularDependencies": {
    "hasCycle": false,
    "cycle": [],
    "suggestion": "No circular dependencies found"
  },
  "criticalPath": {
    "path": ["task-1", "task-2"],
    "totalHours": 10
  },
  "parallelTasks": [
    ["task-1"],
    ["task-2"]
  ],
  "totalTasks": 2
}
```

### 3. POST /api/clarify
Generates clarifying questions for ambiguous descriptions.

**Request:**
```json
{
  "description": "Make it fast and good looking"
}
```

**Response:**
```json
{
  "questions": [
    "What is the specific timeline or deadline for this project?",
    "What specific quality standards or success criteria should be met?"
  ]
}
```

## 🧪 Testing

### Run Automated Tests
```bash
cd backend
npm test
```

This runs 4 test cases:
1. ✅ Circular Dependency Detection
2. ✅ Impossible Timeline Detection
3. ✅ Vague Requirements Handling
4. ✅ Hidden Dependency Inference

### Manual Testing
See `TESTING.md` for comprehensive testing guide.

## 🎨 Features

### Core Features
- ✅ **Pattern Matching:** Detects e-commerce, auth, payment patterns
- ✅ **Dependency Resolution:** Maps task dependencies correctly
- ✅ **Conflict Detection:** Finds contradictory requirements
- ✅ **Ambiguity Scoring:** Flags vague terms and generates questions
- ✅ **Feasibility Calculator:** Scores project viability (0-1)
- ✅ **Critical Path:** Calculates longest execution path
- ✅ **Parallel Tasks:** Identifies tasks that can run simultaneously

### Advanced Features
- ✅ **Implicit Dependencies:** Infers missing dependencies (e.g., payments → auth)
- ✅ **Hidden Task Inference:** Adds missing tasks based on context
- ✅ **Circular Dependency Detection:** Finds and suggests fixes for cycles
- ✅ **Resource Validation:** Checks if timeline is realistic

## 🔧 Technologies Used

### Backend
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Node.js** - Runtime environment

### Frontend
- **React 19** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

### Algorithms
- **DFS (Depth-First Search)** - Cycle detection
- **Topological Sort** - Dependency ordering
- **CPM (Critical Path Method)** - Longest path calculation

## 📚 Documentation

- **APPROACH.md** - Development approach and AI tool usage
- **TESTING.md** - Comprehensive testing guide
- **PROJECT_OVERVIEW.md** - Detailed project breakdown

## 🎯 Key Algorithms

### 1. Circular Dependency Detection
Uses DFS with recursion stack to detect cycles in dependency graph.

### 2. Critical Path Calculation
Implements CPM algorithm using topological sort to find longest path.

### 3. Pattern Matching
Regex-based feature extraction from project descriptions.

### 4. Feasibility Scoring
Formula: `(teamSize × hoursPerDay × deadlineDays) / (totalHours × complexityMultiplier)`

## 🐛 Known Limitations

1. **Pattern Library:** Currently has 3 patterns (ecommerce, auth, payment). More can be added.
2. **Ambiguity Detection:** Uses keyword-based heuristics, not semantic analysis.
3. **Deadline Parsing:** Basic date extraction (days, weeks, months). Could be enhanced.

## 🚀 Deployment

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables:
   - `MONGODB_URI`
   - `PORT`
3. Deploy Node.js app

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Build command: `cd frontend/frontend && npm run build`
3. Deploy

### MongoDB
Use MongoDB Atlas (free tier available).

## 📝 License

This project was created for a technical assessment.

## 👤 Author

Created as part of MERN Fullstack Developer Technical Assessment.

---

**Status:** ✅ All requirements fulfilled and ready for submission!
