const PersonalizedTips = ({ personalizedAnalysis }) => (
  <section className="personalized-tips-section">
    <h2>
      <i
        className="fa-solid fa-lightbulb"
        style={{ color: "#d97706", marginRight: "0.5rem" }}
      ></i>
      Personalized Insights
    </h2>
    <div className="tips-container">
      <div className="highest-category-card">
        <h3>
          <i className="fa-solid fa-chart-bar"></i> Your Highest Impact Category
        </h3>
        <div className="category-display">
          {personalizedAnalysis.highestCategory ? (
            <>
              <strong>
                {personalizedAnalysis.highestCategory.charAt(0).toUpperCase() +
                  personalizedAnalysis.highestCategory.slice(1)}
              </strong>
              <span className="category-emissions">
                {(personalizedAnalysis.categoryEmissions || 0).toFixed(2)} kg
                CO₂
              </span>
            </>
          ) : (
            <span className="loading-text">Analyzing your activities...</span>
          )}
        </div>
      </div>
      <div className="tip-card">
        <h3>
          <i className="fa-solid fa-star"></i> Personalized Tip
        </h3>
        <p className="tip-text">
          {personalizedAnalysis.tip ||
            "Start logging activities to get personalized tips!"}
        </p>
      </div>
    </div>
  </section>
);

export default PersonalizedTips;
