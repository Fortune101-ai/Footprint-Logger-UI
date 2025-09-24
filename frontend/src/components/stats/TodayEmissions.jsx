const TodayEmissions = ({ getTotalEmissions }) => {
  const total = getTotalEmissions();
  return (
    <section className="summary-section">
      <div className="total-emissions">
        <h2>
          <i
            className="fa-solid fa-gauge-high"
            style={{ color: "#d97706", marginRight: "0.5rem" }}
          ></i>
          Today's Emissions
        </h2>
        <div className="emissions-display">
          <span>{total.toFixed(1)}</span>
          <span className="unit">kg CO₂</span>
        </div>
        <p className="impact-message">
          <i className="fa-solid fa-heart" style={{ color: "#059669" }}></i>
          Every small action counts towards a greener planet!
        </p>
      </div>
    </section>
  );
};

export default TodayEmissions;
