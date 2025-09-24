const ActivityForm = ({
  formData,
  setFormData,
  activityOptions,
  addActivity,
}) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const updateActivityOptions = (category) => {
    setFormData((prev) => ({ ...prev, category, activity: "", quantity: "" }));
  };

  return (
    <>
      <h2>
        <i
          className="fa-solid fa-plus-circle"
          style={{ color: "#d97706", marginRight: "0.5rem" }}
        ></i>
        Log Your Activity
      </h2>
      <form onSubmit={addActivity}>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => updateActivityOptions(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="energy">Energy</option>
            <option value="waste">Waste</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="activity">Activity:</label>
          <select
            id="activity"
            value={formData.activity}
            onChange={handleInputChange}
            required
          >
            <option value="">Select activity</option>
            {formData.category &&
              activityOptions[formData.category]?.map((act) => (
                <option key={act.name} value={act.name}>
                  {act.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <div className="quantity-input">
            <input
              id="quantity"
              type="number"
              step="0.1"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
            <span className="unit-label">
              {formData.activity && formData.category
                ? activityOptions[formData.category]?.find(
                    (act) => act.name === formData.activity
                  )?.unit || "unit"
                : "unit"}
            </span>
          </div>
        </div>

        <button type="submit" className="add-btn">
          Add Activity
        </button>
      </form>
    </>
  );
};

export default ActivityForm;
