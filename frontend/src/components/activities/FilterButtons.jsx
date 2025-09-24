const FilterButtons = ({ currentFilter, setFilter }) => {
  const categories = ["all", "transport", "food", "energy", "waste"];
  return (
    <div className="filter-controls">
      <div className="filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${currentFilter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
            data-category={cat}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;
