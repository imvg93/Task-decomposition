const express = require('express');
const DecompositionService = require('../services/decompositionService');
const DependencyService = require('../services/dependencyService');

const router = express.Router();

/**
 * Helper function to generate clarifying questions based on vague terms in description
 * @param {String} description - Project description
 * @returns {Array} - Array of clarifying questions
 */
function generateClarifyingQuestions(description) {
  const text = (description || '').toLowerCase();
  const questions = [];
  const vagueTerms = {
    fast: 'What is the specific timeline or deadline for this project?',
    quick: 'What is the specific timeline or deadline for this project?',
    good: 'What specific quality standards or success criteria should be met?',
    nice: 'What specific quality standards or success criteria should be met?',
    premium: 'What specific premium features or quality level are required?',
    luxury: 'What specific premium features or quality level are required?',
    simple: 'What is the minimum viable feature set vs. full feature set?',
    basic: 'What is the minimum viable feature set vs. full feature set?',
    mobile: 'What specific mobile platforms (iOS, Android, both) and device types are targeted?',
    responsive: 'What specific screen sizes and breakpoints need to be supported?',
    budget: 'What is the specific budget range or cost constraints?',
    timeline: 'What is the specific project timeline with milestones?',
  };

  const foundTerms = [];

  Object.keys(vagueTerms).forEach((term) => {
    const regex = new RegExp('\\b' + term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
    if (regex.test(text) && foundTerms.indexOf(term) === -1) {
      foundTerms.push(term);
      const question = vagueTerms[term];
      if (questions.indexOf(question) === -1) {
        questions.push(question);
      }
    }
  });

  // If no vague terms found, return general questions
  if (questions.length === 0) {
    questions.push('What are the must-have features vs. nice-to-have features?');
    questions.push('Who are the target users and what are their primary use cases?');
    questions.push('What are the specific success criteria or KPIs for this project?');
  }

  return questions;
}

/**
 * POST /api/decompose
 * Decomposes a project description into tasks
 */
router.post('/decompose', (req, res) => {
  try {
    const { description, constraints } = req.body;

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.error('[API /decompose] Invalid description provided');
      return res.status(400).json({
        error: {
          message: 'Description is required and must be a non-empty string',
        },
      });
    }

    console.log('[API /decompose] Processing decomposition request');
    console.log('[API /decompose] Description:', description);
    console.log('[API /decompose] Constraints:', constraints);

    let decompositionService;
    try {
      decompositionService = new DecompositionService();
    } catch (serviceError) {
      console.error('[API /decompose] Error creating DecompositionService:', serviceError);
      return res.status(500).json({
        error: {
          message: 'Failed to initialize decomposition service',
          details: serviceError.message,
          stack: process.env.NODE_ENV === 'development' ? serviceError.stack : undefined,
        },
      });
    }

    let result;
    try {
      result = decompositionService.decompose(description, constraints);
    } catch (decomposeError) {
      console.error('[API /decompose] Error during decomposition:', decomposeError);
      console.error('[API /decompose] Error stack:', decomposeError.stack);
      return res.status(500).json({
        error: {
          message: 'Internal server error during task decomposition',
          details: decomposeError.message,
          stack: process.env.NODE_ENV === 'development' ? decomposeError.stack : undefined,
        },
      });
    }

    console.log('[API /decompose] Decomposition completed successfully');
    return res.status(200).json(result);
  } catch (error) {
    console.error('[API /decompose] Unexpected error:', error);
    console.error('[API /decompose] Error stack:', error.stack);
    return res.status(500).json({
      error: {
        message: 'Internal server error during task decomposition',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
});

/**
 * POST /api/validate
 * Validates task dependencies and calculates critical path
 */
router.post('/validate', (req, res) => {
  try {
    const { tasks } = req.body;

    // Validate tasks
    if (!Array.isArray(tasks)) {
      console.error('[API /validate] Invalid tasks provided, expected array');
      return res.status(400).json({
        error: {
          message: 'Tasks is required and must be an array',
        },
      });
    }

    console.log('[API /validate] Processing validation request');
    console.log('[API /validate] Number of tasks:', tasks.length);

    const dependencyService = new DependencyService();

    // Detect circular dependencies
    const circularDependencies = dependencyService.detectCircularDependencies(tasks);
    console.log('[API /validate] Circular dependencies check:', circularDependencies);

    // Calculate critical path
    const criticalPath = dependencyService.calculateCriticalPath(tasks);
    console.log('[API /validate] Critical path:', criticalPath);

    // Find parallel tasks
    const parallelTasks = dependencyService.findParallelTasks(tasks);
    console.log('[API /validate] Parallel tasks:', parallelTasks);

    const isValid = !circularDependencies.hasCycle;

    const result = {
      isValid,
      circularDependencies,
      criticalPath,
      parallelTasks,
      totalTasks: tasks.length,
    };

    console.log('[API /validate] Validation completed successfully');
    return res.status(200).json(result);
  } catch (error) {
    console.error('[API /validate] Error during validation:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error during task validation',
        details: error.message,
      },
    });
  }
});

/**
 * POST /api/clarify
 * Generates clarifying questions based on project description
 */
router.post('/clarify', (req, res) => {
  try {
    const { description } = req.body;

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.error('[API /clarify] Invalid description provided');
      return res.status(400).json({
        error: {
          message: 'Description is required and must be a non-empty string',
        },
      });
    }

    console.log('[API /clarify] Processing clarify request');
    console.log('[API /clarify] Description:', description);

    const questions = generateClarifyingQuestions(description);

    console.log('[API /clarify] Generated questions:', questions);
    console.log('[API /clarify] Clarify completed successfully');

    return res.status(200).json({
      questions,
    });
  } catch (error) {
    console.error('[API /clarify] Error during question generation:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error during question generation',
        details: error.message,
      },
    });
  }
});

module.exports = router;
