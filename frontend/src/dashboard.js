class CarbonFootprintTracker {
  constructor() {
    this.activities = [];
    this.chart = null;
    this.token = localStorage.getItem("token");
    this.userId = localStorage.getItem("userId");
    this.username = "";

    this.init();
  }

  async init() {
    await this.fetchUserProfile();
    this.setupEventListeners();
    await this.fetchActivities();
    this.initChart();
    this.render();
  }

  async fetchUserProfile() {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");

      const user = await res.json();
      this.username = user.username;
      document.getElementById("usernameDisplay").textContent = this.username;
    } catch (err) {
      console.error(err);
    }
  }

  setupEventListeners() {
    document
      .getElementById("category")
      .addEventListener("change", () => this.updateActivityOptions());
    document
      .getElementById("activity-form")
      .addEventListener("submit", (e) => this.addActivity(e));
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn));
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
      });
    }
  }

  async updateActivityOptions() {
    const category = document.getElementById("category").value;
    const activitySelect = document.getElementById("activity");
    const unitLabel = document.getElementById("unit-label");

    activitySelect.innerHTML = '<option value="">Loading...</option>';

    if (!category) {
      activitySelect.innerHTML = '<option value="">Select activity</option>';
      unitLabel.textContent = "unit";
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/activities/options?category=${category}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch activity options");

      const activities = await res.json();
      activitySelect.innerHTML = '<option value="">Select activity</option>';
      activities.forEach((act) => {
        activitySelect.innerHTML += `<option value="${act}">${act}</option>`;
      });

      activitySelect.onchange = () => {
        const act = activitySelect.value;
        const unitMap = {
          transport: "km",
          food: "kg",
          energy: "kWh",
          waste: "kg",
        };
        unitLabel.textContent = act ? unitMap[category] || "unit" : "unit";
      };
    } catch (err) {
      console.error(err);
      activitySelect.innerHTML =
        '<option value="">Error loading activities</option>';
      unitLabel.textContent = "unit";
    }
  }

  async addActivity(e) {
    e.preventDefault();
    const category = document.getElementById("category").value;
    const activity = document.getElementById("activity").value;
    const quantity = parseFloat(document.getElementById("quantity").value);

    if (!category || !activity || !quantity) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ category, activity, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error adding activity");
        return;
      }

      const newActivity = await res.json();
      this.activities.unshift(newActivity);
      this.resetForm();
      this.render();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
  }

  resetForm() {
    document.getElementById("activity-form").reset();
    document.getElementById("unit-label").textContent = "unit";
    document.getElementById("activity").innerHTML =
      '<option value="">Select activity</option>';
  }

  async fetchActivities() {
    try {
      const res = await fetch("http://localhost:5000/api/activities", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch activities");

      this.activities = await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  async deleteActivity(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/activities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete activity");

      this.activities = this.activities.filter((act) => act._id !== id);
      this.render();
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity");
    }
  }

  setFilter(clickedBtn) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    clickedBtn.classList.add("active");

    const category = clickedBtn.dataset.category;
    document.querySelectorAll(".activity-item").forEach((item) => {
      const shouldShow =
        category === "all" || item.dataset.category === category;
      item.classList.toggle("hidden", !shouldShow);
    });
  }

  getTodayActivities() {
    const today = new Date().toDateString();
    return this.activities.filter(
      (act) => new Date(act.timestamp).toDateString() === today
    );
  }

  getTotalEmissions() {
    return this.getTodayActivities().reduce(
      (sum, act) => sum + act.co2Emissions,
      0
    );
  }

  getCategoryTotals() {
    const totals = { transport: 0, food: 0, energy: 0, waste: 0 };
    this.getTodayActivities().forEach((act) => {
      totals[act.category] += act.co2Emissions;
    });
    return totals;
  }

  render() {
    this.renderTotal();
    this.renderActivities();
    this.renderChart();
  }

  renderTotal() {
    document.getElementById("total-co2").textContent =
      this.getTotalEmissions().toFixed(1);
  }

  renderActivities() {
    const activitiesList = document.getElementById("activities-list");
    const todayActivities = this.getTodayActivities();

    if (todayActivities.length === 0) {
      activitiesList.innerHTML = `
        <div class="no-activities">
          <p>No activities logged yet.</p>
          <p>Start your eco-journey by adding your first activity above!</p>
        </div>
      `;
      return;
    }

    activitiesList.innerHTML = todayActivities
      .map(
        (act) => `
        <div class="activity-item ${act.category}" data-category="${act.category}">
          <div class="activity-info">
            <div class="activity-name">${act.activity}</div>
            <div class="activity-details">${act.quantity} ${act.unit} • ${act.category}</div>
          </div>
          <div class="activity-emissions">
            ${act.co2Emissions} kg CO₂
            <button class="delete-btn" onclick="tracker.deleteActivity('${act._id}')">Remove</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  initChart() {
    if (typeof Chart === "undefined") return;

    const ctx = document.getElementById("emissions-chart").getContext("2d");
    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ["#3182ce", "#38a169", "#d69e2e", "#e53e3e"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 20, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const perc = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${value.toFixed(1)} kg CO₂ (${perc}%)`;
              },
            },
          },
        },
      },
    });
  }

  renderChart() {
    if (!this.chart) return;

    const totals = this.getCategoryTotals();
    const colorMap = {
      transport: "#3182ce",
      food: "#38a169",
      energy: "#d69e2e",
      waste: "#e53e3e",
    };

    const chartData = Object.entries(totals)
      .filter(([_, total]) => total > 0)
      .reduce(
        (acc, [cat, total]) => {
          acc.labels.push(cat.charAt(0).toUpperCase() + cat.slice(1));
          acc.data.push(total);
          acc.colors.push(colorMap[cat]);
          return acc;
        },
        { labels: [], data: [], colors: [] }
      );

    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.data;
    this.chart.data.datasets[0].backgroundColor = chartData.colors;
    this.chart.update();
  }
}

let tracker;
document.addEventListener("DOMContentLoaded", () => {
  tracker = new CarbonFootprintTracker();
});
