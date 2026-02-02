// Test cases from the assignment requirements

/* eslint-disable no-console */

const testCases = [
  {
    name: 'Test 1: Circular Dependency',
    description: 'Detects circular dependencies and suggests resolution',
    input: {
      description:
        'Feature A needs Feature B. Feature B needs Feature C. Feature C needs Feature A.',
      constraints: { maxTasks: 10, teamSize: 2, hoursPerDay: 6 },
    },
    expectedBehavior: 'Should detect cycle and provide suggestion to break it',
    validate: (result) => {
      // Check if conflicts or warnings mention circular dependency
      const hasCycleWarning =
        (result.warnings &&
          result.warnings.some(function (w) {
            return /circular|cycle/i.test(w);
          })) ||
        (result.conflicts &&
          result.conflicts.some(function (c) {
            return /circular|cycle/i.test(c.description);
          }));
      return !!hasCycleWarning;
    },
  },

  {
    name: 'Test 2: Impossible Timeline',
    description: 'Identifies unrealistic project constraints',
    input: {
      description: 'Build Netflix clone',
      constraints: { maxTasks: 10, teamSize: 1, hoursPerDay: 4, deadline: '3 days' },
    },
    expectedBehavior: 'feasibilityScore should be < 0.3 with clear warnings',
    validate: (result) => {
      return result.feasibilityScore < 0.3 && result.warnings && result.warnings.length > 0;
    },
  },

  {
    name: 'Test 3: Vague Requirements',
    description: 'Generates clarifying questions for ambiguous descriptions',
    input: {
      description: 'Make it pop. Users should love it. Needs to be fast.',
      constraints: { maxTasks: 15, teamSize: 2, hoursPerDay: 6 },
    },
    expectedBehavior: 'Should have high ambiguity flags and generate clarifying questions',
    validate: (result) => {
      const hasAmbiguityFlags =
        result.tasks &&
        result.tasks.some(function (t) {
          return t.ambiguityFlags && t.ambiguityFlags.length > 0;
        });
      const hasWarnings =
        result.warnings &&
        result.warnings.some(function (w) {
          return /vague|ambiguous|clarification/i.test(w);
        });
      return !!(hasAmbiguityFlags || hasWarnings);
    },
  },

  {
    name: 'Test 4: Hidden Dependencies',
    description: 'Infers implicit dependencies from feature combinations',
    input: {
      description: 'Add payment processing and order history',
      constraints: { maxTasks: 15, teamSize: 2, hoursPerDay: 6 },
    },
    expectedBehavior: 'Should infer need for user auth, database setup, order model',
    validate: (result) => {
      const titlesJoined =
        (result.tasks || [])
          .map(function (t) {
            return t.title.toLowerCase();
          })
          .join(' ') || '';
      const hasAuth = /auth|login|user/i.test(titlesJoined);
      const hasDatabase = /database|setup|model/i.test(titlesJoined);
      return hasAuth && hasDatabase;
    },
  },
];

// Helper function to run tests
async function runTests(apiUrl = 'http://localhost:5000/api') {
  console.log('🧪 Running Test Cases...\n');

  // Node 18+ has global fetch; for older versions, user would need to polyfill
  if (typeof fetch !== 'function') {
    throw new Error('fetch is not available in this Node runtime. Please use Node 18+ or add a fetch polyfill.');
  }

  for (let i = 0; i < testCases.length; i += 1) {
    const testCase = testCases[i];

    console.log('📝 ' + testCase.name);
    console.log('   ' + testCase.description);

    try {
      const response = await fetch(apiUrl + '/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input),
      });

      const result = await response.json();
      const passed = testCase.validate(result);

      console.log('   ' + (passed ? '✅ PASSED' : '❌ FAILED'));
      console.log('   Feasibility: ' + result.feasibilityScore);
      console.log('   Tasks: ' + (result.tasks ? result.tasks.length : 0));
      console.log('   Warnings: ' + (result.warnings ? result.warnings.length : 0));
      console.log('');
    } catch (error) {
      console.log('   ❌ ERROR: ' + error.message + '\n');
    }
  }
}

// Export for use
module.exports = { testCases, runTests };

// If run directly
if (require.main === module) {
  runTests().catch(function (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  });
}

