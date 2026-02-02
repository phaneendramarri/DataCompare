// ProgressBar.js
// Simple progress bar for showing comparison progress
import React from 'react';

function ProgressBar({ progress }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <span className="progress-label">{progress}%</span>
    </div>
  );
}

export default ProgressBar;
