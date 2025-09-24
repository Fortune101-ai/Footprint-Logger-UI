const Leaderboard = ({ leaderboard = [] }) => (
  <>
    <h2>
      <i
        className="fa-solid fa-trophy"
        style={{ color: "#d97706", marginRight: "0.5rem" }}
      ></i>
      Eco Champions - Lowest Carbon Footprint
    </h2>
    <div className="leaderboard-list">
      {leaderboard.length === 0 ? (
        <p className="no-data">No leaderboard data yet.</p>
      ) : (
        leaderboard.slice(0, 10).map((entry, idx) => (
          <div
            key={entry.username}
            className={`leaderboard-item ${idx < 3 ? "top-three" : ""}`}
          >
            <span className="rank">{idx + 1}.</span>
            <span className="username">{entry.username}</span>
            <span className="emission">
              {(entry.totalEmissions || 0).toFixed(1)} kg CO₂
            </span>
            {idx === 0 && <span className="badge gold">🏆</span>}
            {idx === 1 && <span className="badge silver">🥈</span>}
            {idx === 2 && <span className="badge bronze">🥉</span>}
          </div>
        ))
      )}
    </div>
  </>
);

export default Leaderboard;
