import React from 'react';
import './TaskCard.css';

function TaskCard({ task, taskMap }) {
  const getPriorityColor = (priority) => {
    if (priority === 1) return '#ef4444';
    if (priority === 2) return '#f59e0b';
    return '#10b981';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 1) return 'High';
    if (priority === 2) return 'Medium';
    return 'Low';
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-meta">
          <span className="task-id">{task.id}</span>
          <span className="task-category">{task.category || 'general'}</span>
        </div>
        <div className="task-badges">
          <span className="badge badge-hours">{task.estimatedHours || 0}h</span>
          <span
            className="badge badge-priority"
            style={{ backgroundColor: getPriorityColor(task.priority || 3) }}
          >
            {getPriorityLabel(task.priority || 3)}
          </span>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.dependencies && task.dependencies.length > 0 && (
        <div className="task-dependencies">
          <strong>Dependencies ({task.dependencies.length}):</strong>
          <div className="dependencies-list">
            {task.dependencies
              .slice()
              .sort((a, b) => {
                const numA = parseInt(a.replace('task-', ''), 10);
                const numB = parseInt(b.replace('task-', ''), 10);
                if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                  return numA - numB;
                }
                return a.localeCompare(b);
              })
              .map((depId, index) => {
                const depTask = taskMap?.get(depId);
                const displayText = depTask
                  ? `${depId}: ${depTask.title}`
                  : depId;
                return (
                  <span
                    key={index}
                    className="dependency-badge"
                    title={depTask?.description || depId}
                  >
                    {displayText}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {task.ambiguityFlags && task.ambiguityFlags.length > 0 && (
        <div className="task-ambiguity">
          <strong>⚠️ Ambiguity Flags:</strong>
          <div className="ambiguity-flags">
            {task.ambiguityFlags.map((flag, index) => (
              <span key={index} className="ambiguity-badge">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
