import React, { useState } from 'react';
import axios from 'axios';
import TaskCard from './components/TaskCard';
import ConflictCard from './components/ConflictCard';
import './App.css';

function App() {
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState({
    teamSize: 2,
    hoursPerDay: 6,
    maxTasks: 20,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDecompose = async () => {
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/decompose', {
        description,
        constraints,
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to decompose project. Please check if the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDescription('');
    setConstraints({
      teamSize: 2,
      hoursPerDay: 6,
      maxTasks: 20,
    });
    setResult(null);
    setError('');
  };

  const handleLoadExample = () => {
    setDescription(
      'Build an e-commerce site with user authentication, product catalog, shopping cart, and payment processing. Mobile-first design but needs to work on desktop. Launch in 2 weeks. Budget is tight so keep it simple, but the CEO wants it to look premium.'
    );
    setConstraints({
      teamSize: 2,
      hoursPerDay: 6,
      maxTasks: 20,
    });
    setError('');
  };

  const getFeasibilityColor = (score) => {
    if (score < 0.5) return '#ef4444';
    if (score < 0.7) return '#f59e0b';
    return '#10b981';
  };

  const getFeasibilityLabel = (score) => {
    if (score < 0.5) return 'Low';
    if (score < 0.7) return 'Medium';
    return 'High';
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Decomposition Engine</h1>
        <p>Transform project descriptions into actionable task lists</p>
      </header>

      <div className="app-container">
        {/* LEFT SIDE: Input Form */}
        <div className="input-section">
          <div className="card">
            <div className="card-header-row">
              <h2>Project Description</h2>
              <button className="btn btn-example" onClick={handleLoadExample}>
                Load Example 📋
              </button>
            </div>
            <textarea
              className="description-input"
              placeholder="Describe your project in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />

            <div className="constraints-row">
              <div className="constraint-input">
                <label>Team Size</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={constraints.teamSize}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      teamSize: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div className="constraint-input">
                <label>Hours Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={constraints.hoursPerDay}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      hoursPerDay: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div className="constraint-input">
                <label>Max Tasks</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={constraints.maxTasks}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      maxTasks: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleDecompose}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Processing...
                  </>
                ) : (
                  'Decompose Project'
                )}
              </button>
              <button className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* RIGHT SIDE: Results Display */}
        <div className="results-section">
          {result ? (
            <>
              {/* Feasibility Score Card */}
              <div className="card">
                <h2>Feasibility Score</h2>
                <div
                  className="feasibility-card"
                  style={{ backgroundColor: getFeasibilityColor(result.feasibilityScore) }}
                >
                  <div className="feasibility-score">
                    {(result.feasibilityScore * 100).toFixed(0)}%
                  </div>
                  <div className="feasibility-label">
                    {getFeasibilityLabel(result.feasibilityScore)} Feasibility
                  </div>
                </div>
              </div>

              {/* Conflicts Section */}
              {result.conflicts && result.conflicts.length > 0 && (
                <div className="card">
                  <h2>⚠️ Conflicts Detected</h2>
                  <div className="conflicts-section">
                    {result.conflicts.map((conflict, index) => (
                      <ConflictCard key={index} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings Section */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="card">
                  <h2>Warnings</h2>
                  <div className="warnings-list">
                    {result.warnings.map((warning, index) => (
                      <div key={index} className="warning-item">
                        ⚠️ {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks List */}
              {result.tasks && result.tasks.length > 0 && (
                <div className="card">
                  <h2>Generated Tasks ({result.tasks.length})</h2>
                  <div className="tasks-grid">
                    {(() => {
                      // Create taskMap once for all tasks
                      const taskMap = new Map(result.tasks.map(t => [t.id, t]));
                      return result.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          taskMap={taskMap}
                        />
                      ));
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card empty-state">
              <p>Enter a project description and click "Decompose Project" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
