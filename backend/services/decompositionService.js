const {
  PATTERNS,
  IMPLICIT_DEPENDENCIES,
  FEATURE_KEYWORDS,
} = require('../utils/patternLibrary');

class DecompositionService {
  decompose(description, constraints) {
    const safeDescription = description || '';
    const safeConstraints = constraints || {};

    console.log('[DecompositionService] Starting decomposition');
    console.log('[DecompositionService] Description:', safeDescription);
    console.log('[DecompositionService] Constraints:', safeConstraints);

    const features = this.extractFeatures(safeDescription);
    console.log('[DecompositionService] Extracted features:', features);

    let tasks = this.generateTasks(features, safeConstraints, safeDescription);
    console.log('[DecompositionService] Generated tasks (before inference):', tasks);

    // Infer missing tasks based on description analysis
    tasks = this.inferMissingTasks(tasks, safeDescription);
    console.log('[DecompositionService] Tasks after inference:', tasks);

    const tasksWithImplicit = this.addImplicitDependencies(tasks);
    console.log('[DecompositionService] Tasks after implicit dependencies:', tasksWithImplicit);

    const conflicts = this.detectConflicts(safeDescription);
    console.log('[DecompositionService] Detected conflicts:', conflicts);

    const feasibilityScore = this.calculateFeasibility(
      tasksWithImplicit,
      safeConstraints,
      safeDescription
    );
    console.log('[DecompositionService] Feasibility score:', feasibilityScore);

    const warnings = this.generateWarnings(tasksWithImplicit, safeConstraints, safeDescription);
    console.log('[DecompositionService] Warnings:', warnings);

    const tasksWithAmbiguity = this.addAmbiguityFlags(tasksWithImplicit, safeDescription);
    console.log('[DecompositionService] Tasks after ambiguity flags:', tasksWithAmbiguity);

    return {
      tasks: tasksWithAmbiguity,
      conflicts,
      feasibilityScore,
      warnings,
    };
  }

  extractFeatures(description) {
    const text = (description || '').toLowerCase();
    console.log('[DecompositionService.extractFeatures] Raw description:', description);

    const detected = [];

    Object.keys(FEATURE_KEYWORDS).forEach((pattern) => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        const featureName = FEATURE_KEYWORDS[pattern];
        console.log(
          '[DecompositionService.extractFeatures] Matched pattern:',
          pattern,
          '-> feature:',
          featureName
        );
        if (detected.indexOf(featureName) === -1) {
          detected.push(featureName);
        }
      }
    });

    console.log('[DecompositionService.extractFeatures] Detected features:', detected);
    return detected;
  }

  generateTasks(features, constraints, description) {
    const safeConstraints = constraints || {};
    const maxTasks = typeof safeConstraints.maxTasks === 'number' ? safeConstraints.maxTasks : 20;
    console.log('[DecompositionService.generateTasks] Features:', features);
    console.log('[DecompositionService.generateTasks] Max tasks:', maxTasks);

    const tasks = [];
    let taskCounter = 1;
    const idMap = new Map();
    let setupTaskAdded = false;

    function pushTask(sourceTask, patternKey) {
      if (tasks.length >= maxTasks) {
        console.log(
          '[DecompositionService.generateTasks] Reached maxTasks limit, skipping additional tasks'
        );
        return;
      }

      const patternTaskId = sourceTask.id;
      const compositeKey = patternKey + '_' + patternTaskId;
      let taskId;

      if (sourceTask.category === 'setup' && !setupTaskAdded) {
        taskId = 'task-1';
        setupTaskAdded = true;
        if (taskCounter === 1) {
          taskCounter = 2;
        }
      } else {
        taskId = 'task-' + taskCounter;
        taskCounter += 1;
      }

      idMap.set(compositeKey, taskId);

      const newTask = {
        id: taskId,
        title: sourceTask.title,
        description: sourceTask.description || '',
        estimatedHours:
          typeof sourceTask.estimatedHours === 'number' ? sourceTask.estimatedHours : 0,
        category: sourceTask.category || 'general',
        dependencies: [],
        ambiguityFlags: [],
        _patternKey: patternKey,
        _patternTaskId: patternTaskId,
      };

      console.log(
        '[DecompositionService.generateTasks] Pushed task from pattern',
        patternKey,
        'patternTaskId:',
        patternTaskId,
        '-> generatedTaskId:',
        taskId
      );

      if (taskId === 'task-1') {
        tasks.unshift(newTask);
      } else {
        tasks.push(newTask);
      }
    }

    const descriptionText = (description || '').toLowerCase();

    function shouldIncludePattern(patternKey, pattern) {
      const keywordRegex = new RegExp(pattern.keyword, 'i');
      if (keywordRegex.test(descriptionText)) {
        console.log(
          '[DecompositionService.generateTasks] Description matched pattern keyword:',
          patternKey,
          'regex:',
          pattern.keyword
        );
        return true;
      }

      if (patternKey === 'auth' && features.indexOf('authentication') !== -1) {
        return true;
      }

      if (patternKey === 'payment' && features.indexOf('payments') !== -1) {
        return true;
      }

      if (patternKey === 'ecommerce') {
        if (
          features.indexOf('product_catalog') !== -1 ||
          features.indexOf('shopping_cart') !== -1 ||
          features.indexOf('payments') !== -1
        ) {
          return true;
        }
      }

      return false;
    }

    Object.keys(PATTERNS).forEach((patternKey) => {
      const pattern = PATTERNS[patternKey];

      if (!pattern || !pattern.tasks || !pattern.keyword) {
        return;
      }

      if (!shouldIncludePattern(patternKey, pattern)) {
        console.log(
          '[DecompositionService.generateTasks] Skipping pattern (no match):',
          patternKey
        );
        return;
      }

      console.log(
        '[DecompositionService.generateTasks] Including pattern for tasks:',
        patternKey
      );

      pattern.tasks.forEach((taskTemplate) => {
        pushTask(taskTemplate, patternKey);
      });
    });

    const existingSetup = tasks.find(function (t) {
      return t.category === 'setup';
    });

    if (!existingSetup && !setupTaskAdded) {
      if (tasks.length < maxTasks) {
        const setupId = 'task-1';
        if (taskCounter === 1) {
          taskCounter = 2;
        }
        const setupTask = {
          id: setupId,
          title: 'Project setup',
          description: 'Initial project setup and environment configuration.',
          estimatedHours: 2,
          category: 'setup',
          dependencies: [],
          ambiguityFlags: [],
          _patternKey: 'default',
          _patternTaskId: 'setup',
        };
        idMap.set('default_setup', setupId);
        tasks.unshift(setupTask);
        setupTaskAdded = true;
        console.log(
          '[DecompositionService.generateTasks] Added default setup task with id:',
          setupId
        );
      } else {
        console.log(
          '[DecompositionService.generateTasks] Wanted to add setup task, but maxTasks reached'
        );
      }
    } else if (existingSetup && existingSetup.id !== 'task-1') {
      const oldSetupId = existingSetup.id;
      const currentTask1 = tasks.find((t) => t.id === 'task-1');

      if (currentTask1) {
        currentTask1.id = oldSetupId;
        idMap.forEach((value, key) => {
          if (value === 'task-1') {
            idMap.set(key, oldSetupId);
          }
        });
        tasks.forEach((task) => {
          if (task.dependencies) {
            task.dependencies = task.dependencies.map((dep) => {
              return dep === 'task-1' ? oldSetupId : dep;
            });
          }
        });
      }

      existingSetup.id = 'task-1';
      idMap.forEach((value, key) => {
        if (value === oldSetupId && key.indexOf('setup') !== -1) {
          idMap.set(key, 'task-1');
        }
      });
      tasks.forEach((task) => {
        if (task.dependencies) {
          task.dependencies = task.dependencies.map((dep) => {
            return dep === oldSetupId ? 'task-1' : dep;
          });
        }
      });

      const setupIndex = tasks.indexOf(existingSetup);
      if (setupIndex > 0) {
        tasks.splice(setupIndex, 1);
        tasks.unshift(existingSetup);
      }
      console.log(
        '[DecompositionService.generateTasks] Moved existing setup task to task-1'
      );
    } else {
      console.log('[DecompositionService.generateTasks] Setup task already present as task-1');
    }

    tasks.forEach((task) => {
      const patternKey = task._patternKey;
      const patternTaskId = task._patternTaskId;

      if (!patternKey || !patternTaskId) {
        return;
      }

      const pattern = PATTERNS[patternKey];
      if (!pattern || !pattern.tasks) {
        return;
      }

      const patternTask = pattern.tasks.find((pt) => pt.id === patternTaskId);
      if (!patternTask) {
        return;
      }

      const patternDeps = patternTask.dependencies || [];
      const resolvedDeps = [];

      patternDeps.forEach((depPatternId) => {
        const depCompositeKey = patternKey + '_' + depPatternId;
        const resolvedTaskId = idMap.get(depCompositeKey);

        if (resolvedTaskId && resolvedTaskId !== task.id) {
          if (resolvedDeps.indexOf(resolvedTaskId) === -1) {
            resolvedDeps.push(resolvedTaskId);
          }
        } else {
          console.log(
            '[DecompositionService.generateTasks] Warning: Could not resolve dependency',
            depPatternId,
            'for task',
            task.id,
            'in pattern',
            patternKey
          );
        }
      });

      if (resolvedDeps.length > 0) {
        task.dependencies = resolvedDeps;
        console.log(
          '[DecompositionService.generateTasks] Mapped dependencies for',
          task.id,
          ':',
          resolvedDeps
        );
      }

      delete task._patternKey;
      delete task._patternTaskId;
    });

    console.log('[DecompositionService.generateTasks] Final tasks with mapped dependencies:', tasks);

    return tasks;
  }

  addImplicitDependencies(tasks) {
    console.log('[DecompositionService.addImplicitDependencies] Initial tasks:', tasks);

    const tasksByCategory = {};
    const tasksByTitleKeyword = {};

    tasks.forEach((task) => {
      const keyCategory = (task.category || '').toLowerCase();
      const keyTitle = (task.title || '').toLowerCase();

      if (keyCategory) {
        if (!tasksByCategory[keyCategory]) {
          tasksByCategory[keyCategory] = [];
        }
        tasksByCategory[keyCategory].push(task.id);
      }

      const importantKeywords = ['auth', 'login', 'user', 'product', 'catalog', 'cart', 'shopping', 'payment', 'checkout', 'order', 'database', 'setup'];
      importantKeywords.forEach((keyword) => {
        if (keyTitle.indexOf(keyword) !== -1) {
          if (!tasksByTitleKeyword[keyword]) {
            tasksByTitleKeyword[keyword] = [];
          }
          if (tasksByTitleKeyword[keyword].indexOf(task.id) === -1) {
            tasksByTitleKeyword[keyword].push(task.id);
          }
        }
      });
    });

    console.log(
      '[DecompositionService.addImplicitDependencies] tasksByCategory:',
      tasksByCategory
    );
    console.log(
      '[DecompositionService.addImplicitDependencies] tasksByTitleKeyword:',
      tasksByTitleKeyword
    );

    tasks.forEach((task) => {
      const keyCandidates = this.getImplicitKeysForTask(task);
      const currentDeps = task.dependencies || [];
      const newDeps = currentDeps.slice();

      keyCandidates.forEach((key) => {
        const implied = IMPLICIT_DEPENDENCIES[key];
        if (!implied) {
          return;
        }

        console.log(
          '[DecompositionService.addImplicitDependencies] Task',
          task.id,
          'matched implicit key:',
          key,
          '-> implied:',
          implied
        );

        implied.forEach((depKey) => {
          let candidateTasks = [];

          if (tasksByCategory[depKey] && tasksByCategory[depKey].length > 0) {
            candidateTasks = tasksByCategory[depKey];
          } else if (tasksByTitleKeyword[depKey] && tasksByTitleKeyword[depKey].length > 0) {
            candidateTasks = tasksByTitleKeyword[depKey];
          }

          if (candidateTasks.length > 0) {
            const primaryTask = candidateTasks[0];
            if (primaryTask !== task.id && newDeps.indexOf(primaryTask) === -1) {
              newDeps.push(primaryTask);
              console.log(
                '[DecompositionService.addImplicitDependencies] Added implicit dependency:',
                primaryTask,
                'for',
                task.id,
                '(matched key:',
                depKey,
                ')'
              );
            }
          }
        });
      });

      task.dependencies = newDeps;
    });

    console.log('[DecompositionService.addImplicitDependencies] Updated tasks:', tasks);

    return tasks;
  }

  getImplicitKeysForTask(task) {
    const keys = [];
    const title = (task.title || '').toLowerCase();
    const category = (task.category || '').toLowerCase();

    Object.keys(IMPLICIT_DEPENDENCIES).forEach((implicitKey) => {
      if (title.indexOf(implicitKey) !== -1 || category.indexOf(implicitKey) !== -1) {
        keys.push(implicitKey);
      }
    });

    return keys;
  }

  detectConflicts(description) {
    const text = (description || '').toLowerCase();
    const conflicts = [];

    function addConflict(type, desc, suggestion) {
      const conflict = {
        type,
        description: desc,
        suggestion,
      };
      conflicts.push(conflict);
      console.log('[DecompositionService.detectConflicts] Added conflict:', conflict);
    }

    const simpleRegex = /\b(simple|basic)\b/;
    const premiumRegex = /\b(premium|luxury|enterprise)\b/;
    if (simpleRegex.test(text) && premiumRegex.test(text)) {
      addConflict(
        'simplicity_vs_premium',
        'The description mentions both simple/basic and premium/luxury requirements.',
        'Clarify whether the scope should be minimal or full-featured.'
      );
    }

    const tightDeadlineRegex = /(tight deadline|asap|as soon as possible|very short time|couple of days)/;
    const largeScopeRegex = /\b(large|complex|full\s+platform|enterprise|all features)\b/;
    if (tightDeadlineRegex.test(text) && largeScopeRegex.test(text)) {
      addConflict(
        'timeline_vs_scope',
        'The description suggests a very tight deadline with a large or complex scope.',
        'Adjust either the timeline or reduce the scope to something more achievable.'
      );
    }

    const budgetRegex = /\b(low budget|limited budget|cheap|cost-effective)\b/;
    const highQualityRegex = /\b(high quality|best-in-class|pixel perfect|no compromises)\b/;
    if (budgetRegex.test(text) && highQualityRegex.test(text)) {
      addConflict(
        'budget_vs_quality',
        'The description combines strict budget constraints with very high quality expectations.',
        'Clarify which is more important: minimizing cost or maximizing quality.'
      );
    }

    console.log('[DecompositionService.detectConflicts] Final conflicts:', conflicts);
    return conflicts;
  }

  calculateFeasibility(tasks, constraints, description) {
    const safeConstraints = constraints || {};
    const totalHours = tasks.reduce(function (sum, task) {
      const hours = typeof task.estimatedHours === 'number' ? task.estimatedHours : 0;
      return sum + hours;
    }, 0);

    console.log('[DecompositionService.calculateFeasibility] Total task hours:', totalHours);

    const deadlineDays = this.extractDeadlineDays(description) || 14;
    console.log('[DecompositionService.calculateFeasibility] Deadline days:', deadlineDays);

    const teamSize =
      typeof safeConstraints.teamSize === 'number' && safeConstraints.teamSize > 0
        ? safeConstraints.teamSize
        : 3;
    const hoursPerDay =
      typeof safeConstraints.hoursPerDay === 'number' && safeConstraints.hoursPerDay > 0
        ? safeConstraints.hoursPerDay
        : 6;

    const availableHours = teamSize * hoursPerDay * deadlineDays;
    console.log(
      '[DecompositionService.calculateFeasibility] Available hours:',
      availableHours,
      'teamSize:',
      teamSize,
      'hoursPerDay:',
      hoursPerDay
    );

    if (totalHours <= 0) {
      console.log('[DecompositionService.calculateFeasibility] No hours needed, returning 1.0');
      return 1.0;
    }

    // Calculate base feasibility
    let feasibility = availableHours / totalHours;
    console.log(
      '[DecompositionService.calculateFeasibility] Base feasibility (availableHours / totalHours):',
      feasibility
    );

    // Calculate average dependencies for complexity penalty
    const totalDependencies = tasks.reduce((sum, task) => {
      const deps = task.dependencies || [];
      return sum + deps.length;
    }, 0);
    const avgDependencies = tasks.length > 0 ? totalDependencies / tasks.length : 0;

    // Apply complexity penalty (based on dependencies)
    // Penalty ranges from 0.6 (max penalty) to 1.0 (no penalty)
    // More dependencies = lower penalty (more complex = less feasible)
    const complexityPenalty = Math.max(0.6, 1 - avgDependencies * 0.1);
    feasibility *= complexityPenalty;

    console.log(
      '[DecompositionService.calculateFeasibility] Average dependencies:',
      avgDependencies,
      'Complexity penalty:',
      complexityPenalty,
      'Feasibility after penalty:',
      feasibility
    );

    // Cap at 1.0 and ensure not negative
    feasibility = Math.min(feasibility, 1.0);
    feasibility = Math.max(feasibility, 0);

    // Round to 2 decimals
    const rounded = Math.round(feasibility * 100) / 100;

    console.log(
      '[DecompositionService.calculateFeasibility] Final feasibility (capped and rounded):',
      rounded
    );

    return rounded;
  }

  extractDeadlineDays(description) {
    const text = (description || '').toLowerCase();

    const dayMatch = text.match(/(\d+)\s*(day|days)/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1], 10);
      if (!Number.isNaN(days) && days > 0) {
        console.log(
          '[DecompositionService.extractDeadlineDays] Found explicit days:',
          days
        );
        return days;
      }
    }

    const weekMatch = text.match(/(\d+)\s*(week|weeks)/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1], 10);
      if (!Number.isNaN(weeks) && weeks > 0) {
        const daysFromWeeks = weeks * 7;
        console.log(
          '[DecompositionService.extractDeadlineDays] Found explicit weeks:',
          weeks,
          '-> days:',
          daysFromWeeks
        );
        return daysFromWeeks;
      }
    }

    const monthMatch = text.match(/(\d+)\s*(month|months)/);
    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      if (!Number.isNaN(months) && months > 0) {
        const daysFromMonths = months * 30;
        console.log(
          '[DecompositionService.extractDeadlineDays] Found explicit months:',
          months,
          '-> days:',
          daysFromMonths
        );
        return daysFromMonths;
      }
    }

    if (/asap|as soon as possible|immediately|urgent/.test(text)) {
      console.log(
        '[DecompositionService.extractDeadlineDays] Found ASAP-like phrase, using 7 days'
      );
      return 7;
    }

    console.log(
      '[DecompositionService.extractDeadlineDays] No explicit deadline found, returning null'
    );
    return null;
  }

  generateWarnings(tasks, constraints, description) {
    const warnings = [];
    const safeConstraints = constraints || {};

    const totalHours = tasks.reduce(function (sum, task) {
      const hours = typeof task.estimatedHours === 'number' ? task.estimatedHours : 0;
      return sum + hours;
    }, 0);

    if (totalHours > 100) {
      warnings.push(
        'Total estimated effort exceeds 100 hours; consider breaking the project into phases.'
      );
    }

    const deadlineDays = this.extractDeadlineDays(description) || 14;
    const teamSize =
      typeof safeConstraints.teamSize === 'number' && safeConstraints.teamSize > 0
        ? safeConstraints.teamSize
        : 3;
    const hoursPerDay =
      typeof safeConstraints.hoursPerDay === 'number' && safeConstraints.hoursPerDay > 0
        ? safeConstraints.hoursPerDay
        : 6;

    const availableHours = teamSize * hoursPerDay * deadlineDays;

    if (availableHours < totalHours) {
      warnings.push(
        'Given the current team size and timeline, the available hours may be insufficient for the estimated scope.'
      );
    }

    const vagueTerms = [
      'good',
      'nice',
      'well',
      'better',
      'fast',
      'quick',
      'user-friendly',
      'modern',
      'clean',
      'robust',
      'scalable',
      'secure',
    ];
    const text = (description || '').toLowerCase();
    const foundVague = [];

    vagueTerms.forEach((term) => {
      const regex = new RegExp('\\b' + term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
      if (regex.test(text)) {
        foundVague.push(term);
      }
    });

    if (foundVague.length > 0) {
      warnings.push(
        'The description contains vague terms (' +
          foundVague.join(', ') +
          '); consider clarifying measurable requirements.'
      );
    }

    console.log('[DecompositionService.generateWarnings] Warnings:', warnings);
    return warnings;
  }

  addAmbiguityFlags(tasks, description) {
    const text = (description || '').toLowerCase();
    const vagueTerms = [
      'good',
      'nice',
      'well',
      'better',
      'fast',
      'quick',
      'user-friendly',
      'modern',
      'clean',
      'robust',
      'scalable',
      'secure',
      'intuitive',
      'simple',
      'easy',
    ];

    const presentFlags = [];

    vagueTerms.forEach((term) => {
      const regex = new RegExp('\\b' + term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
      if (regex.test(text) && presentFlags.indexOf(term) === -1) {
        presentFlags.push(term);
      }
    });

    console.log(
      '[DecompositionService.addAmbiguityFlags] Present ambiguity terms in description:',
      presentFlags
    );

    if (presentFlags.length === 0) {
      return tasks;
    }

    tasks.forEach((task) => {
      if (!task.ambiguityFlags) {
        task.ambiguityFlags = [];
      }

      presentFlags.forEach((flag) => {
        if (task.ambiguityFlags.indexOf(flag) === -1) {
          task.ambiguityFlags.push(flag);
        }
      });
    });

    console.log(
      '[DecompositionService.addAmbiguityFlags] Tasks with ambiguity flags:',
      tasks
    );

    return tasks;
  }

  inferMissingTasks(tasks, description) {
    const taskTitles = tasks.map((t) => t.title.toLowerCase()).join(' ');
    const lower = (description || '').toLowerCase();
    const inferredTasks = [];
    let taskCounter = tasks.length + 1;

    console.log('[DecompositionService.inferMissingTasks] Analyzing description for missing tasks');
    console.log('[DecompositionService.inferMissingTasks] Current task titles:', taskTitles);

    // Rule 1: Payment requires auth
    const hasPayment = /payment|checkout|stripe|paypal/i.test(lower);
    const hasAuth = /auth|login|user/i.test(taskTitles);

    if (hasPayment && !hasAuth) {
      const inferredTask = {
        id: 'task-' + taskCounter,
        title: 'User authentication (inferred)',
        description: 'Required for payment processing - users need accounts',
        estimatedHours: 8,
        priority: 1,
        dependencies: [],
        category: 'auth',
        ambiguityFlags: ['Inferred dependency - confirm requirement'],
      };
      inferredTasks.push(inferredTask);
      taskCounter += 1;
      console.log(
        '[DecompositionService.inferMissingTasks] Inferred auth task (payment requires auth)'
      );
    }

    // Rule 2: Order history requires database and order model
    const hasOrders = /order|purchase|transaction history/i.test(lower);
    const hasDatabase = /database|setup|mongodb/i.test(taskTitles);

    if (hasOrders && !hasDatabase) {
      const inferredTask = {
        id: 'task-' + taskCounter,
        title: 'Database setup (inferred)',
        description: 'Database schema for orders and user data',
        estimatedHours: 3,
        priority: 1,
        dependencies: [],
        category: 'setup',
        ambiguityFlags: ['Inferred dependency - confirm database choice'],
      };
      inferredTasks.push(inferredTask);
      taskCounter += 1;
      console.log(
        '[DecompositionService.inferMissingTasks] Inferred database setup (orders require database)'
      );
    }

    const hasOrderModel = /order.*model/i.test(taskTitles);
    if (hasOrders && !hasOrderModel) {
      const inferredTask = {
        id: 'task-' + taskCounter,
        title: 'Order data model (inferred)',
        description: 'Define order schema with status, items, totals',
        estimatedHours: 4,
        priority: 2,
        dependencies: [],
        category: 'backend',
        ambiguityFlags: ['Inferred dependency - confirm order fields'],
      };
      inferredTasks.push(inferredTask);
      taskCounter += 1;
      console.log(
        '[DecompositionService.inferMissingTasks] Inferred order model (orders require data model)'
      );
    }

    // Rule 3: Cart requires products
    const hasCart = /cart|shopping.*cart|basket/i.test(lower);
    const hasProducts = /product|catalog|inventory/i.test(taskTitles);

    if (hasCart && !hasProducts) {
      const inferredTask = {
        id: 'task-' + taskCounter,
        title: 'Product catalog (inferred)',
        description: 'Product listing required for shopping cart',
        estimatedHours: 10,
        priority: 2,
        dependencies: [],
        category: 'features',
        ambiguityFlags: ['Inferred dependency - confirm product requirements'],
      };
      inferredTasks.push(inferredTask);
      taskCounter += 1;
      console.log(
        '[DecompositionService.inferMissingTasks] Inferred product catalog (cart requires products)'
      );
    }

    if (inferredTasks.length > 0) {
      console.log(
        '[DecompositionService.inferMissingTasks] Inferred',
        inferredTasks.length,
        'missing tasks'
      );
    } else {
      console.log('[DecompositionService.inferMissingTasks] No missing tasks inferred');
    }

    return tasks.concat(inferredTasks);
  }
}

module.exports = DecompositionService;

