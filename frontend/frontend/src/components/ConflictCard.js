import React from 'react';
import './ConflictCard.css';

function ConflictCard({ conflict }) {
  return (
    <div className="conflict-card">
      <div className="conflict-header">
        <span className="conflict-icon">⚠️</span>
        <span className="conflict-type">{conflict.type || 'Conflict'}</span>
      </div>

      <div className="conflict-description">
        {conflict.description}
      </div>

      {conflict.suggestion && (
        <div className="conflict-suggestion">
          <span className="suggestion-icon">💡</span>
          <span className="suggestion-text">{conflict.suggestion}</span>
        </div>
      )}
    </div>
  );
}

export default ConflictCard;
