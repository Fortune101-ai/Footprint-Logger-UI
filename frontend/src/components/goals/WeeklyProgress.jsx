const WeeklyProgress = ({ weeklyProgress }) => {
  const pct = Math.min(100, weeklyProgress.progressPercentage || 0);
  return (
    <div className="progress-card">
      <h3>
        <i className="fa-solid fa-chart-line"></i> Weekly Progress
      </h3>
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Current Week:</span>
          <span className="stat-value">
            {(weeklyProgress.currentEmissions || 0).toFixed(1)}
          </span>
          <span className="stat-unit">kg CO₂</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Target Reduction:</span>
          <span className="stat-value">
            {(weeklyProgress.targetReduction || 0).toFixed(1)}
          </span>
          <span className="stat-unit">kg CO₂</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Actual Reduction:</span>
          <span className="stat-value">
            {(weeklyProgress.actualReduction || 0).toFixed(1)}
          </span>
          <span className="stat-unit">kg CO₂</span>
        </div>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-text">{pct}% of goal achieved</p>
    </div>
  );
};

export default WeeklyProgress;
