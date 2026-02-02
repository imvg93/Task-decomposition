class DependencyService {
  /**
   * Detects circular dependencies in a task graph using DFS
   * @param {Array} tasks - Array of task objects with id and dependencies
   * @returns {Object} - {hasCycle: boolean, cycle: array, suggestion: string}
   */
  detectCircularDependencies(tasks) {
    console.log('[DependencyService.detectCircularDependencies] Analyzing tasks:', tasks);

    if (!tasks || tasks.length === 0) {
      console.log('[DependencyService.detectCircularDependencies] No tasks provided');
      return {
        hasCycle: false,
        cycle: [],
        suggestion: 'No tasks to analyze',
      };
    }

    const graph = this.buildGraph(tasks);
    console.log('[DependencyService.detectCircularDependencies] Built graph:', graph);

    const visited = new Set();
    const recStack = new Set();
    const path = [];

    // Check each task for cycles
    for (let i = 0; i < tasks.length; i += 1) {
      const taskId = tasks[i].id;
      if (!visited.has(taskId)) {
        const cycleResult = this.hasCycle(taskId, graph, visited, recStack, path);
        if (cycleResult.found) {
          console.log(
            '[DependencyService.detectCircularDependencies] Cycle detected:',
            cycleResult.cycle
          );
          return {
            hasCycle: true,
            cycle: cycleResult.cycle,
            suggestion:
              'Circular dependency detected. Review task dependencies and break the cycle by removing or restructuring dependencies.',
          };
        }
      }
    }

    console.log('[DependencyService.detectCircularDependencies] No cycles detected');
    return {
      hasCycle: false,
      cycle: [],
      suggestion: 'No circular dependencies found',
    };
  }

  /**
   * Builds an adjacency list graph from tasks
   * @param {Array} tasks - Array of task objects
   * @returns {Map} - Map where key is task.id, value is array of dependency IDs
   */
  buildGraph(tasks) {
    const graph = new Map();

    console.log('[DependencyService.buildGraph] Building graph from', tasks.length, 'tasks');

    // Create a Set of all valid task IDs
    const validTaskIds = new Set(tasks.map((t) => t.id));
    console.log(
      '[DependencyService.buildGraph] Valid task IDs:',
      Array.from(validTaskIds)
    );

    tasks.forEach((task) => {
      const taskId = task.id;
      const dependencies = task.dependencies || [];

      // Filter out invalid dependencies (dependencies that don't exist in tasks)
      const validDeps = dependencies.filter((depId) => {
        const isValid = validTaskIds.has(depId);
        if (!isValid) {
          console.log(
            '[DependencyService.buildGraph] Warning: Task',
            taskId,
            'has invalid dependency reference:',
            depId,
            '(task does not exist)'
          );
        }
        return isValid;
      });

      // Remove duplicates
      const uniqueValidDeps = [];
      validDeps.forEach((depId) => {
        if (uniqueValidDeps.indexOf(depId) === -1) {
          uniqueValidDeps.push(depId);
        }
      });

      graph.set(taskId, uniqueValidDeps);

      console.log(
        '[DependencyService.buildGraph] Task',
        taskId,
        'has dependencies:',
        uniqueValidDeps,
        '(filtered from',
        dependencies.length,
        'total)'
      );
    });

    return graph;
  }

  /**
   * DFS algorithm to detect cycles using recursion stack
   * @param {String} taskId - Current task ID being visited
   * @param {Map} graph - Adjacency list graph
   * @param {Set} visited - Set of visited nodes
   * @param {Set} recStack - Set of nodes in current recursion stack
   * @param {Array} path - Current path being traversed
   * @returns {Object} - {found: boolean, cycle: array}
   */
  hasCycle(taskId, graph, visited, recStack, path) {
    // Mark current node as visited and add to recursion stack
    visited.add(taskId);
    recStack.add(taskId);
    path.push(taskId);

    console.log(
      '[DependencyService.hasCycle] Visiting task:',
      taskId,
      'Current path:',
      path,
      'RecStack:',
      Array.from(recStack)
    );

    // Get dependencies for current task
    const dependencies = graph.get(taskId) || [];

    // Check all dependencies
    for (let i = 0; i < dependencies.length; i += 1) {
      const depId = dependencies[i];

      // If dependency is in recursion stack, we found a cycle
      if (recStack.has(depId)) {
        // Find the cycle path
        const cycleStartIndex = path.indexOf(depId);
        const cycle = path.slice(cycleStartIndex);
        cycle.push(depId); // Complete the cycle

        console.log('[DependencyService.hasCycle] Cycle found at dependency:', depId, 'Cycle:', cycle);
        return {
          found: true,
          cycle,
        };
      }

      // If dependency not visited, recurse
      if (!visited.has(depId)) {
        const result = this.hasCycle(depId, graph, visited, recStack, path);
        if (result.found) {
          return result;
        }
      }
    }

    // Remove from recursion stack (backtrack)
    recStack.delete(taskId);
    path.pop();

    console.log(
      '[DependencyService.hasCycle] No cycle found from',
      taskId,
      'Backtracking, path:',
      path
    );

    return {
      found: false,
      cycle: [],
    };
  }

  /**
   * Calculates the critical path (longest path) through the task graph using CPM algorithm
   * @param {Array} tasks - Array of task objects
   * @returns {Object} - {path: array of task IDs, totalHours: number}
   */
  calculateCriticalPath(tasks) {
    console.log('[DependencyService.calculateCriticalPath] Calculating critical path for', tasks.length, 'tasks');

    if (!tasks || tasks.length === 0) {
      console.log('[DependencyService.calculateCriticalPath] No tasks provided');
      return {
        path: [],
        totalHours: 0,
      };
    }

    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    // Build reverse graph: task -> tasks that depend on it
    const reverseGraph = new Map();
    const inDegree = new Map();

    // Initialize
    for (const task of tasks) {
      reverseGraph.set(task.id, []);
      inDegree.set(task.id, 0);
    }

    // Build reverse edges
    for (const task of tasks) {
      for (const depId of task.dependencies || []) {
        if (reverseGraph.has(depId)) {
          reverseGraph.get(depId).push(task.id);
        }
      }
      inDegree.set(task.id, (task.dependencies || []).length);
    }

    console.log(
      '[DependencyService.calculateCriticalPath] Reverse graph built, in-degrees:',
      Array.from(inDegree.entries())
    );

    // Calculate earliest start times using topological sort
    const earliestStart = new Map();
    const queue = [];

    // Start with tasks that have no dependencies
    for (const [taskId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(taskId);
        earliestStart.set(taskId, 0);
      }
    }

    console.log(
      '[DependencyService.calculateCriticalPath] Starting tasks (no dependencies):',
      Array.from(queue)
    );

    let maxEndTime = 0;
    let criticalEndTask = null;

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentTask = taskMap.get(currentId);
      const startTime = earliestStart.get(currentId);
      const taskHours = currentTask && typeof currentTask.estimatedHours === 'number' ? currentTask.estimatedHours : 0;
      const endTime = startTime + taskHours;

      console.log(
        '[DependencyService.calculateCriticalPath] Processing task',
        currentId,
        'start:',
        startTime,
        'hours:',
        taskHours,
        'end:',
        endTime
      );

      if (endTime > maxEndTime) {
        maxEndTime = endTime;
        criticalEndTask = currentId;
      }

      // Process tasks that depend on current task
      for (const nextId of reverseGraph.get(currentId) || []) {
        const nextStartTime = Math.max(earliestStart.get(nextId) || 0, endTime);
        earliestStart.set(nextId, nextStartTime);

        inDegree.set(nextId, inDegree.get(nextId) - 1);
        if (inDegree.get(nextId) === 0) {
          queue.push(nextId);
        }
      }
    }

    console.log(
      '[DependencyService.calculateCriticalPath] Max end time:',
      maxEndTime,
      'Critical end task:',
      criticalEndTask
    );

    // Backtrack to find critical path
    const criticalPath = [];
    let currentTask = criticalEndTask;

    while (currentTask) {
      criticalPath.unshift(currentTask);
      const task = taskMap.get(currentTask);
      const taskStart = earliestStart.get(currentTask);

      // Find the dependency that forced this start time
      let foundPredecessor = false;
      for (const depId of task.dependencies || []) {
        const depTask = taskMap.get(depId);
        if (depTask) {
          const depEnd = earliestStart.get(depId) + (depTask.estimatedHours || 0);
          if (Math.abs(depEnd - taskStart) < 0.001) {
            currentTask = depId;
            foundPredecessor = true;
            break;
          }
        }
      }

      if (!foundPredecessor) {
        currentTask = null;
      }
    }

    console.log(
      '[DependencyService.calculateCriticalPath] Critical path:',
      criticalPath,
      'Total hours:',
      maxEndTime
    );

    return {
      path: criticalPath,
      totalHours: maxEndTime,
    };
  }

  /**
   * Recursive DFS to find the longest path from a starting task
   * @param {String} taskId - Current task ID
   * @param {Map} graph - Adjacency list graph
   * @param {Map} taskMap - Map of task ID to task object
   * @param {Set} visited - Set of visited nodes (to avoid cycles)
   * @returns {Array} - Array of task IDs representing longest path
   */
  findLongestPath(taskId, graph, taskMap, visited) {
    // Avoid cycles
    if (visited.has(taskId)) {
      console.log('[DependencyService.findLongestPath] Already visited:', taskId, 'returning empty');
      return [];
    }

    visited.add(taskId);
    const task = taskMap.get(taskId);

    if (!task) {
      console.log('[DependencyService.findLongestPath] Task not found:', taskId);
      visited.delete(taskId);
      return [];
    }

    const dependencies = graph.get(taskId) || [];

    console.log(
      '[DependencyService.findLongestPath] Finding longest path from',
      taskId,
      'dependencies:',
      dependencies
    );

    // If no dependencies, this is a leaf node
    if (dependencies.length === 0) {
      visited.delete(taskId);
      console.log('[DependencyService.findLongestPath] Leaf node:', taskId);
      return [taskId];
    }

    // Find longest path among all dependencies
    let longestDepPath = [];
    let maxDepHours = 0;

    dependencies.forEach((depId) => {
      const depVisited = new Set(visited);
      const depPath = this.findLongestPath(depId, graph, taskMap, depVisited);

      const depPathHours = depPath.reduce((sum, pathTaskId) => {
        const pathTask = taskMap.get(pathTaskId);
        const hours =
          pathTask && typeof pathTask.estimatedHours === 'number' ? pathTask.estimatedHours : 0;
        return sum + hours;
      }, 0);

      if (depPathHours > maxDepHours) {
        maxDepHours = depPathHours;
        longestDepPath = depPath;
      }
    });

    // Current path = longest dependency path + current task
    const currentPath = longestDepPath.concat([taskId]);

    visited.delete(taskId);

    console.log(
      '[DependencyService.findLongestPath] Longest path from',
      taskId,
      ':',
      currentPath
    );

    return currentPath;
  }

  /**
   * Groups tasks by dependency levels to identify parallel execution opportunities
   * @param {Array} tasks - Array of task objects
   * @returns {Array} - Array of arrays, each inner array contains tasks that can run in parallel
   */
  findParallelTasks(tasks) {
    console.log('[DependencyService.findParallelTasks] Finding parallel tasks for', tasks.length, 'tasks');

    if (!tasks || tasks.length === 0) {
      console.log('[DependencyService.findParallelTasks] No tasks provided');
      return [];
    }

    const graph = this.buildGraph(tasks);
    const taskMap = new Map();

    tasks.forEach((task) => {
      taskMap.set(task.id, task);
    });

    const levels = [];
    const processed = new Set();
    const remainingTasks = new Set(tasks.map((t) => t.id));

    console.log('[DependencyService.findParallelTasks] Starting level assignment');

    // Continue until all tasks are assigned to levels
    while (remainingTasks.size > 0) {
      const currentLevel = [];

      // Find all tasks that can be executed at this level
      // (tasks whose dependencies are all in previous levels)
      remainingTasks.forEach((taskId) => {
        const dependencies = graph.get(taskId) || [];
        const allDepsProcessed = dependencies.every((depId) => processed.has(depId));

        if (allDepsProcessed || dependencies.length === 0) {
          currentLevel.push(taskId);
        }
      });

      // If no tasks found for this level, there might be a cycle or orphaned task
      if (currentLevel.length === 0) {
        console.log(
          '[DependencyService.findParallelTasks] Warning: No tasks found for level',
          levels.length,
          'Remaining tasks:',
          Array.from(remainingTasks)
        );
        // Force add remaining tasks to break potential deadlock
        const remainingArray = Array.from(remainingTasks);
        currentLevel.push(...remainingArray);
      }

      // Add current level
      levels.push(currentLevel);
      console.log(
        '[DependencyService.findParallelTasks] Level',
        levels.length - 1,
        'tasks:',
        currentLevel
      );

      // Mark tasks as processed
      currentLevel.forEach((taskId) => {
        processed.add(taskId);
        remainingTasks.delete(taskId);
      });
    }

    console.log('[DependencyService.findParallelTasks] Total levels:', levels.length);
    console.log('[DependencyService.findParallelTasks] Parallel task groups:', levels);

    return levels;
  }
}

module.exports = DependencyService;
