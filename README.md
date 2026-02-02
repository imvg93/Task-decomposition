# Task Decomposition Engine

A rule-based **Task Decomposition Engine** that converts messy, human-written project descriptions into structured, executable task plans. The system is designed to handle **ambiguous, contradictory, and incomplete requirements**, mirroring real-world project planning challenges.

This project was built as part of a **MERN Fullstack Developer technical assessment**, with a strong emphasis on logic correctness, explainability, and edge‑case handling rather than black-box AI behavior.

---

## 🚀 Live Deployment

* **Backend (Express API)**: Deployed on **Render**
* **Frontend (React – CRA)**: Deployed as a static site (Render / Vercel)

> The frontend communicates with the backend via REST APIs using environment-based configuration.

---

## ✨ Key Features

* **Task Decomposition**: Breaks complex project descriptions into atomic, actionable tasks
* **Dependency Resolution**: Handles explicit and implicit task dependencies
* **Cycle Detection**: Identifies circular dependencies and suggests resolutions
* **Contradiction Detection**: Flags conflicting requirements with practical suggestions
* **Ambiguity Analysis**: Scores requirement clarity and generates clarifying questions
* **Feasibility Calculation**: Estimates whether the project is realistic given team and time constraints

---

## 🧠 Design Philosophy

This system is intentionally **rule-based and deterministic**:

* No external AI or LLM APIs are used in production code
* All logic is explainable and debuggable
* Heuristics and patterns are preferred over opaque intelligence

The goal is to demonstrate **engineering reasoning under ambiguity**, not language-model mimicry.

---

## 🧩 API Endpoints

### 1️⃣ POST `/api/decompose`

Decomposes a project description into structured tasks.

**Input**

```json
{
  "description": "Build an e-commerce site with user auth, product catalog, cart, and payments.",
  "constraints": {
    "maxTasks": 20,
    "teamSize": 2,
    "hoursPerDay": 6
  }
}
```

**Output (example)**

```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "User Authentication",
      "estimatedHours": 6,
      "priority": 1,
      "dependencies": [],
      "category": "backend",
      "ambiguityFlags": []
    }
  ],
  "conflicts": [
    {
      "type": "contradiction",
      "description": "'Simple' conflicts with 'Premium'",
      "suggestion": "Focus on clean UI and limited features"
    }
  ],
  "feasibilityScore": 0.65,
  "warnings": ["Timeline is aggressive for scope"]
}
```

---

### 2️⃣ POST `/api/validate`

Validates a task list for logical consistency.

Checks include:

* Circular dependency detection
* Timeline feasibility
* Resource and parallelization conflicts

---

### 3️⃣ POST `/api/clarify`

Generates clarifying questions for ambiguous requirements.

**Example input**

```json
{
  "description": "Make it pop. Needs to be fast."
}
```

**Example output**

```json
{
  "questions": [
    "What does 'pop' mean in measurable terms?",
    "What performance target defines 'fast'?"
  ]
}
```

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (pattern and template storage)

### Frontend

* React (Create React App)
* Axios
* Plain CSS

### Tooling

* ESLint (react-app config)
* GitHub for version control
* Render & Vercel for deployment

---

## 🧪 Testing Strategy

The system was validated using targeted, high-signal test cases:

* Circular dependency scenarios
* Impossible timelines (e.g., Netflix clone in 3 days)
* Highly ambiguous requirements
* Hidden dependency inference (e.g., payments → auth + orders)

Manual API testing was performed using HTTP clients to verify correctness, error handling, and response structure.

---

## ⚖️ Trade-offs

* **Rule-based logic over ML** for predictability and explainability
* **Heuristic ambiguity detection** instead of deep NLP
* **Hardcoded patterns** for common domains to keep the system simple and transparent

These decisions were intentional and aligned with the assessment constraints.

---

## 📈 Future Improvements

With more time, the system could be extended with:

* Database-managed pattern libraries
* Visual dependency graph rendering
* More robust deadline and date parsing
* Expanded automated test coverage
* Configurable organization-specific rules

---

## 📄 Additional Documentation

* [`APPROACH.md`](./APPROACH.md) — detailed explanation of design decisions, logic, AI tool usage, and trade-offs

---

## 🧑‍💻 Author

Developed as part of a technical assessment to demonstrate problem decomposition, graph-based reasoning, and practical backend system design.

---

> **Note:** This project prioritizes clarity, correctness, and reasoning over AI hype or over-engineering.
