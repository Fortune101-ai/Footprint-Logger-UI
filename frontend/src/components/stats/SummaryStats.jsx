const SummaryStats = ({ summary, averageEmissions }) => (
  <section className="detailed-summary-section">
    <h2 className="summary-header">
      <i
        className="fa-solid fa-calculator"
        style={{ color: "#d97706", marginRight: "0.5rem" }}
      ></i>{" "}
      Summary Statistics
    </h2>
    <div className="detailed-summary">
      <div className="summary-card">
        <h3>
          <i className="fa-solid fa-calendar-day"></i> Daily Average
        </h3>
        <p>{(summary.daily || 0).toFixed(1)}</p>
        <span>kg CO₂</span>
      </div>
      <div className="summary-card">
        <h3>
          <i className="fa-solid fa-calendar-week"></i> Weekly Average
        </h3>
        <p>{(summary.weekly || 0).toFixed(1)}</p>
        <span>kg CO₂</span>
      </div>
      <div className="summary-card">
        <h3>
          <i className="fa-solid fa-calendar-alt"></i> Monthly Average
        </h3>
        <p>{(summary.monthly || 0).toFixed(1)}</p>
        <span>kg CO₂</span>
      </div>
      <div className="summary-card highlight">
        <h3>
          <i className="fa-solid fa-globe"></i> Global Average
        </h3>
        <p>{(averageEmissions || 0).toFixed(1)}</p>
        <span>kg CO₂</span>
      </div>
    </div>
  </section>
);

export default SummaryStats;
