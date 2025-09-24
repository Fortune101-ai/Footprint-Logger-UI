const ActivitiesList = ({ activities, filter, deleteActivity }) => {
  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.category === filter);

  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities">
        <div className="no-activities-icon">
          <i className="fa-solid fa-seedling" style={{ color: "#0e7201" }}></i>
        </div>
        <p>No activities logged yet.</p>
        <p>Start your eco-journey by adding your first activity above!</p>
      </div>
    );
  }

  return (
    <div className="activities-list">
      {filtered.map((act) => (
        <div
          key={act._id}
          className="activity-item"
          data-category={act.category}
        >
          <span>{act.activity}</span>
          <span>{act.co2Emissions} kg CO₂</span>
          <button
            className="delete-btn"
            onClick={() => deleteActivity(act._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActivitiesList;
