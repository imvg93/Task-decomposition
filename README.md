# Task Decomposition Engine

A **rule-based** engine that turns project descriptions into structured task plans with dependencies, conflict detection, and feasibility scoring. No AI APIs—deterministic, explainable logic.

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Backend** | Node.js, Express 5, Mongoose (optional) |
| **Frontend** | React 19, Create React App, Axios |
| **Deploy** | Backend: Render · Frontend: Vercel or Render |

---

## Prerequisites

- **Node.js** 18+
- **npm** (or yarn)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd task-decomposition-engine
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Environment

**Backend** (optional for local run):

- Copy `backend/env.example` to `backend/.env`.
- Set `MONGODB_URI` only if you want persistence; the API works without it.
- `PORT` defaults to 5000.

**Frontend** (optional for local run):

- For local dev, create `frontend/.env` with:
  - `REACT_APP_API_URL=http://localhost:5000`
- Omit for production; the app defaults to the deployed backend URL.

### 3. Run backend

```bash
npm start
# Or: cd backend && npm run dev   (with nodemon)
```

Server runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/health-check`.

### 4. Run frontend

```bash
cd frontend
npm start
```

App runs at `http://localhost:3000`.

---

## Testing

**Backend API tests** (expect backend running on port 5000):

```bash
npm test
# Or: cd backend && npm test
```

Runs `backend/tests/testCases.js` against `POST /api/decompose` for:

- Circular dependency detection  
- Impossible timeline / feasibility  
- Vague requirements and ambiguity  
- Hidden dependency inference  

**Frontend:**

```bash
cd frontend
npm test
```

Runs React test suite (e.g. App render).

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health-check` | Health check (JSON) |
| POST | `/api/decompose` | Decompose description → tasks, conflicts, feasibility |
| POST | `/api/validate` | Validate task list (cycles, critical path) |
| POST | `/api/clarify` | Generate clarifying questions from description |

Request/response shapes and validation rules are documented in code and in [APPROACH.md](./APPROACH.md).

---

## Deployment

- **Backend (Render):** Root directory blank or `backend`, Build: `npm install`, Start: `npm start` (or `node server.js`). Set `PORT` and optionally `MONGODB_URI` in Render env.
- **Frontend (Vercel):** Set Root Directory to `frontend`. Add env `REACT_APP_API_URL=https://<your-backend>.onrender.com` if backend is on another domain. SPA routing is handled by `frontend/vercel.json`.
- **Frontend (Render):** Build: `npm install && npm run build`, Publish: `build`. Set `REACT_APP_API_URL` to your backend URL if different origin.

---

## Project Structure

```
task-decomposition-engine/
├── backend/           # Express API
│   ├── server.js      # Entry, middleware, health check
│   ├── routes/api.js  # /api/decompose, /validate, /clarify
│   ├── services/      # decompositionService, dependencyService
│   ├── utils/         # patternLibrary (templates, keywords)
│   ├── models/        # Mongoose models (optional)
│   └── tests/         # testCases.js (API tests)
├── frontend/         # React app (CRA)
│   ├── src/App.js     # Main UI, API client
│   ├── src/components/
│   └── public/
├── api/              # Vercel serverless adapter (if using Vercel for API)
├── APPROACH.md       # Design, algorithms, trade-offs
└── README.md         # This file
```

---

## Design and trade-offs

See **[APPROACH.md](./APPROACH.md)** for:

- Pattern-driven task generation and implicit dependencies  
- Dependency graph (DFS cycle detection, critical path, parallelization)  
- Contradiction and ambiguity handling  
- Feasibility calculation  
- API design and testing strategy  
- Use of tooling vs hand-written logic  

---

## For reviewers / submission

- **Live backend:** `https://task-decomposition-1.onrender.com`  
  - Health: `GET https://task-decomposition-1.onrender.com/health-check`
- **Live frontend:** (your deployed frontend URL; backend URL is configurable via `REACT_APP_API_URL`)

**Run locally and test:**

1. `npm install` (root + backend + frontend as above).  
2. Backend: `npm start` (root) or `cd backend && npm run dev`.  
3. Frontend: `cd frontend && npm start`. Set `REACT_APP_API_URL=http://localhost:5000` in `frontend/.env` to use local API.  
4. Backend tests: `npm test` (with backend running).  
5. Decompose a project description in the UI or call `POST /api/decompose` with `{ "description": "...", "constraints": { ... } }`.

**Production notes:**

- CORS is permissive for demo; restrict origins in production.  
- No secrets in repo; use environment variables (see `.env.example`).  
- Backend logging is verbose; for production, consider log level or structured logging.

---

## License

ISC (or as specified in package.json).
