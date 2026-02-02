# APPROACH.md

## Project Overview
The Task Decomposition Engine takes a natural language project description and turns it into a structured execution plan. It decomposes the description into tasks, analyzes dependencies between those tasks, detects contradictions and ambiguities in the requirements, and calculates feasibility based on time and team constraints. The goal is to give an engineering team a realistic, dependency-aware roadmap from a high-level idea.

## How I Approached the Logic Problems

### 1. Dependency Graph Resolution
For dependency analysis, I treated tasks and their dependencies as a directed graph where each node is a task and edges point from a task to the tasks it depends on.

- Depth-First Search (DFS) with a recursion stack was used for circular dependency detection. The recursion stack lets the algorithm detect back-edges, which directly correspond to cycles in a directed graph.
- Topological sorting was used for critical path calculation. By processing tasks in an order that respects dependencies, I can compute earliest start times and determine the longest end-to-end path.
- An adjacency list representation was chosen for the dependency graph because it is memory-efficient and works well with sparse graphs, which is typical for task dependency structures.
- These algorithms are standard for DAG operations and provide good time complexity (O(V + E)) while being straightforward to reason about and debug.

### 2. Contradiction Detection
For contradiction detection, I used a rule-based approach instead of heavy NLP:

- Regex patterns were used to detect conflicting keyword groups in the description (e.g., `simple|basic` vs. `premium|luxury`, tight timeline phrases vs. large scope phrases, budget constraints vs. high-quality expectations).
- I defined explicit rules for common contradictions so that each conflict type is explainable and debuggable, such as “simplicity vs premium,” “timeline vs scope,” and “budget vs quality.”
- I chose regex over NLP libraries to keep the solution fast, dependency-free, and easy to run in a constrained environment. This keeps the behavior deterministic and avoids the overhead of additional language models.

### 3. Ambiguity Scoring
For ambiguity and clarity, I used a heuristic, keyword-based approach:

- Vague terms like “good,” “nice,” “fast,” and “user-friendly” are treated as signals of low clarity in the requirements.
- The presence of more concrete details (numbers, timeframes, explicit metrics) conceptually implies a higher clarity score, even if the current implementation focuses primarily on flagging vague terms.
- The trade-off is intentional: the heuristic is simple, explainable, and effective for common cases, even though it will not capture all nuanced forms of ambiguity that a more advanced semantic model might detect.

### 4. Feasibility Calculator
The feasibility calculator estimates how realistic a plan is given the team and timeline:

- The base formula uses the ratio \((\text{teamSize} \times \text{hoursPerDay} \times \text{deadlineDays}) / \text{totalTaskHours}\) to approximate whether available capacity covers the estimated effort.
- A complexity penalty is applied based on dependency density (average number of dependencies per task). More dependencies imply more coordination overhead, communication, and sequencing constraints.
- This penalty reduces the feasibility score for highly interconnected task graphs, which better reflects real-world execution risk where dense dependency networks slow teams down.

## AI Tool Usage

### What I Used Cursor For
- Project structure scaffolding (backend folders, basic file layout).
- Boilerplate code generation such as Express route setup and Mongoose model definitions.
- Starting points for algorithm implementations (DFS, graph traversal, and service skeletons).
- High-level React component and API wiring structure (where applicable).

### Prompts That Helped
Examples of prompts I used:
- “Create a DFS algorithm for cycle detection with recursion stack tracking.”
- “Build Express API routes for task decomposition with proper error handling.”
- “Generate Mongoose schemas for Task and Pattern models with validation.”
- “Implement a critical path calculation for a task dependency graph.”
- “Design a feasibility scoring function based on team size, hours per day, and deadline.”

### What I Accepted vs. Modified

**Accepted:**
- Express server setup and middleware configuration (CORS, JSON parsing, error handling).
- Mongoose schema definitions for `Task` and `Pattern` models, including timestamps.
- Basic React/API structure where generated.
- API route structure for `/api/decompose`, `/api/validate`, and `/api/clarify`.

**Modified/Verified:**
- DFS algorithm logic for cycle detection was reviewed and verified manually to ensure correct handling of recursion stacks and cycle paths.
- Pattern matching rules in the pattern library were customized to reflect realistic ecommerce, auth, and payment task breakdowns.
- The feasibility calculation formula was adjusted to apply the complexity penalty correctly and cap scores after the penalty.
- Implicit dependency rules were refined to capture domain-specific relationships (e.g., payments depending on auth and cart).

**Rejected:**
- Initial suggestions to integrate external AI APIs were not used, in line with the assessment requirements.
- Overly complex NLP or ML libraries were avoided in favor of regex-based approaches for simplicity and transparency.
- External graph libraries were not used; graph algorithms (DFS, topological reasoning, CPM-style critical path) were implemented directly for full control and clearer evaluation.

## Trade-offs Made

1. **Regex vs. NLP**  
   - **Pro:** Faster, no heavy dependencies, easy to deploy and reason about, sufficient for straightforward keyword-based contradiction and ambiguity detection.  
   - **Con:** Less flexible for nuanced natural language or phrases that imply contradictions without explicit keywords.

2. **Hardcoded patterns vs. Machine Learning**  
   - **Pro:** Predictable behavior, highly debuggable, and immediately useful for known project types like ecommerce, auth, and payments.  
   - **Con:** Requires manual updates when new domains or project types are introduced; does not generalize automatically.

3. **Simple ambiguity detection**  
   - **Pro:** Uses basic keyword scanning, which is fast and easy to understand; fits well with the rest of the rule-based design.  
   - **Con:** May miss subtler forms of ambiguity and context-dependent issues that a more advanced semantic model could detect.

4. **In-memory pattern matching**  
   - **Pro:** Keeping patterns in code gives very fast access and makes iteration during development straightforward.  
   - **Con:** For production scalability and multi-tenant systems, these patterns would ideally live in a database with tooling for non-developers to manage them.

## What I'd Improve With More Time

1. **Machine Learning Integration**  
   Train a model on real project descriptions to improve pattern matching, task suggestions, and dependency inference beyond hardcoded rules.

2. **Advanced NLP**  
   Use NLP libraries to extract entities, relationships, and intent from descriptions, improving both ambiguity detection and contradiction detection.

3. **Graph Visualization**  
   Add a visual representation of the task graph and critical path to help users understand sequencing, bottlenecks, and parallelization opportunities.

4. **Database-Driven Patterns**  
   Move the pattern library to MongoDB with an admin UI so product owners or tech leads can curate and extend patterns without code changes.

5. **More Test Coverage**  
   Add comprehensive unit tests for each service (decomposition, dependency, feasibility, clarification) and systematic edge case testing.

6. **Deadline Parsing**  
   Implement more robust date/time and phrase parsing (e.g., “next Friday,” “end of month,” “Q3”) for more accurate timeline interpretation.

7. **Real-time Validation**  
   Introduce WebSocket-based validation so users get live feedback on feasibility, dependencies, and ambiguities as they type.

8. **Priority Scoring**  
   Add ML-based or rule-based priority scoring to rank tasks based on impact, risk, and constraints for better roadmap planning.

## Challenges Faced

1. **Dependency ID Mapping**  
   The initial implementation struggled to map pattern-level task IDs to generated runtime task IDs, which affected dependency resolution. This was corrected by introducing a dedicated ID mapping layer that translates pattern IDs into generated IDs before dependency linking.

2. **Critical Path Algorithm**  
   The first version used DFS in the dependency direction, which did not accurately reflect execution order. It was refactored to a proper Critical Path Method implementation using a reverse graph and earliest start time calculation.

3. **Feasibility Edge Cases**  
   Handling scenarios where available hours greatly exceeded or fell short of required hours required careful capping and penalty application to keep the score between 0 and 1 while still being meaningful.

## Testing Strategy

I validated the behavior primarily through focused scenarios rather than a full automated test suite:

1. **Circular Dependency Detection**  
   Created task sets with known cycles to verify that the DFS with recursion stack correctly identifies cycles and returns the cycle path.

2. **Impossible Timeline Scenarios**  
   Used descriptions and constraints where total estimated hours far exceeded available capacity to ensure the feasibility score dropped appropriately and warnings were generated.

3. **Vague Requirements Handling**  
   Tested descriptions containing multiple vague terms to verify that ambiguity flags and clarifying questions were generated as expected.

4. **Hidden Dependency Inference**  
   Crafted ecommerce and payment scenarios to confirm that implicit dependencies (e.g., payments → auth + cart) were added correctly on top of explicit ones.

In addition, I manually exercised each API endpoint (decompose, validate, clarify) with `curl`-style HTTP requests to confirm request validation, error handling, and response structure. This combination of scenario-based testing and manual verification was sufficient to gain confidence in the core logic within the constraints of the assessment.

