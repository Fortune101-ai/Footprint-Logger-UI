const WeeklyGoalForm = ({ formData, setFormData, setWeeklyGoal }) => {
  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, targetReduction: value }));
  };

  return (
    <div className="goal-setting-card">
      <h3>
        <i className="fa-solid fa-bullseye"></i> Set Weekly Target
      </h3>
      <form onSubmit={setWeeklyGoal}>
        <div className="goal-input-group">
          <input
            id="target-reduction"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="5.0"
            value={formData.targetReduction}
            onChange={handleInputChange}
            required
          />
          <span className="goal-unit">kg CO₂ reduction</span>
          <button type="submit" className="goal-btn">
            Set Goal
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeeklyGoalForm;
