const StreakSection = ({ streak }) => (
  <section className="streak-section">
    <h2>
      <i
        className="fa-solid fa-fire"
        style={{ color: "#d97706", marginRight: "0.5rem" }}
      ></i>
      Activity Streak
    </h2>
    <div className="streak-cards">
      <div className="streak-card">
        <h3>
          <i className="fa-solid fa-calendar-check"></i> Current Streak
        </h3>
        <div className="streak-number">
          <span>{streak.currentStreak}</span>
          <span className="streak-unit">days</span>
        </div>
        <p className="streak-message">Keep logging daily!</p>
      </div>
      <div className="streak-card">
        <h3>
          <i className="fa-solid fa-trophy"></i> Longest Streak
        </h3>
        <div className="streak-number">
          <span>{streak.longestStreak}</span>
          <span className="streak-unit">days</span>
        </div>
        <p className="streak-message">Personal best!</p>
      </div>
    </div>
  </section>
);

export default StreakSection;
