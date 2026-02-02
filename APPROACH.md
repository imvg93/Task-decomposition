# APPROACH.md

## 1. Overview

This project implements a **rule-based Task Decomposition Engine** that converts messy, human-written project descriptions into structured, executable task plans. The system focuses on *explainability, determinism, and correctness* rather than probabilistic or black-box AI behavior.

The engine:

* Decomposes a project description into atomic tasks
* Resolves explicit and implicit dependencies
* Detects contradictions and ambiguities
* Calculates feasibility under time and team constraints

The primary goal is to simulate how an experienced engineer reasons about unclear requirements in real-world project planning.

---

## 2. Core Design Philosophy

From the beginning, I treated this assessment as a **systems and logic problem**, not an NLP or machine-learning problem. The requirements explicitly disallow AI APIs in production and emphasize dependency graphs, edge cases, and trade-offs.

Key principles guiding the design:

* **Deterministic behavior** over probabilistic guesses
* **Explainable logic** over opaque intelligence
* **Rule-based heuristics** that can be audited and extended
* **Separation of concerns** between parsing, analysis, and validation

---

## 3. Task Decomposition Strategy

### 3.1 Pattern-Driven Task Generation

Task generation is driven by predefined decomposition templates (e.g., ecommerce, authentication, payments). Each template defines:

* Canonical tasks
* Default dependencies
* Estimated effort
* Task category

The project description is scanned using keyword and phrase matching to select applicable templates. This avoids brittle free-text parsing while still supporting common real-world project types.

### 3.2 Implicit Dependency Inference

Certain features imply prerequisite work even when not explicitly stated. For example:

* Payments → authentication, cart, order model
* Order history → database schema and user context

These relationships are encoded as explicit rules and injected automatically into the task graph. This ensures the output reflects realistic execution requirements.

---

## 4. Dependency Graph Resolution

Tasks and dependencies are modeled as a **directed graph**, where:

* Nodes represent tasks
* Directed edges represent dependency relationships

### 4.1 Cycle Detection

* Implemented using **Depth-First Search (DFS)** with a recursion stack
* Back-edges are used to detect circular dependencies
* When a cycle is found, the system reports the cycle path and suggests breaking the weakest or least critical dependency

This approach provides O(V + E) time complexity and clear diagnostics.

### 4.2 Critical Path Calculation

* Tasks are processed in dependency-respecting order
* Earliest start and finish times are computed
* The longest dependency chain is identified as the **critical path**

This allows the system to reason about timeline feasibility and sequencing constraints.

### 4.3 Parallelization Analysis

Tasks without mutual dependencies are identified as parallelizable. This information feeds into feasibility analysis and resource conflict detection.

---

## 5. Contradiction Detection

Contradictions are detected using **explicit, rule-based checks** rather than semantic inference.

Examples include:

* “Simple” vs “Premium”
* “Fast delivery” vs “Large scope”
* “Low budget” vs “High quality”
* “Mobile-first” vs desktop-heavy interaction patterns

Each contradiction:

* Is clearly explained
* Includes a practical resolution suggestion

This mirrors how technical leads communicate trade-offs to stakeholders.

---

## 6. Ambiguity Analysis and Clarification

Ambiguity is handled through a **clarity scoring heuristic**:

* Vague terms (e.g., *fast*, *user-friendly*, *make it pop*) are assigned low clarity scores
* Measurable or explicit requirements imply higher clarity

For each ambiguous signal, the system generates a targeted clarifying question, converting subjective language into actionable requirements.

This keeps the system useful even when input quality is poor.

---

## 7. Feasibility Calculation

Feasibility is computed by comparing estimated effort against available capacity:

```
(teamSize × hoursPerDay × availableDays) / totalEstimatedTaskHours
```

Adjustments are applied for:

* Dependency density (coordination overhead)
* Aggressive timelines
* Small team sizes

The final feasibility score is normalized between 0 and 1 and accompanied by warnings when risk is high.

---

## 8. API Design

The system exposes three focused endpoints:

* **POST /api/decompose** – Generates tasks, dependencies, conflicts, and feasibility
* **POST /api/validate** – Validates an existing task list for cycles, timeline issues, and resource conflicts
* **POST /api/clarify** – Generates clarifying questions for ambiguous descriptions

Each endpoint performs one responsibility and returns structured, predictable responses.

---

## 9. Use of AI Tools

AI tools (Cursor) were used selectively and intentionally:

### Used for:

* Project scaffolding and boilerplate
* Initial algorithm skeletons (DFS, graph traversal)
* Express route and middleware setup

### Not used for:

* Core logic design
* Dependency rules
* Feasibility or contradiction reasoning

All generated logic was manually reviewed, verified, and adapted to meet assessment constraints.

---

## 10. Trade-offs Made

1. **Rule-based logic vs NLP/ML**

   * ✔ Predictable, explainable, fast
   * ✘ Limited semantic flexibility

2. **Hardcoded patterns vs learned models**

   * ✔ Deterministic behavior, easy debugging
   * ✘ Manual expansion required for new domains

3. **Heuristic ambiguity scoring**

   * ✔ Simple and effective for common cases
   * ✘ Does not capture nuanced intent

These trade-offs were intentional and aligned with the problem constraints.

---

## 11. Testing Strategy

Testing focused on high-signal scenarios rather than exhaustive automation:

* Circular dependency detection
* Impossible timelines
* Vague and contradictory requirements
* Hidden dependency inference

Each API was exercised using manual HTTP requests to validate correctness, error handling, and response structure.

---

## 12. Challenges Faced

* Mapping template-level task identifiers to runtime task IDs
* Correctly implementing critical path logic instead of naive DFS depth
* Balancing feasibility scoring to remain meaningful across extremes

These issues were resolved through iterative refinement and focused testing.

---

## 13. Future Improvements

With more time, the system could be extended with:

* Database-managed pattern libraries
* Richer ambiguity scoring
* Visual dependency graphs
* More robust deadline parsing
* Expanded automated test coverage

---

## Final Note

This project is intentionally designed to reflect how engineers reason about incomplete and conflicting requirements: through structure, explicit trade-offs, and transparent logic rather than opaque intelligence.
