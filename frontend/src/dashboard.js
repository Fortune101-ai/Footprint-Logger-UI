
class CarbonFootprintTracker {
  constructor() {
    this.activities = [];
    this.chart = null;
    this.token = localStorage.getItem("token");
    this.userId = localStorage.getItem("userId");
    this.username = "";
    this.leaderboard = [];
    this.summary = { daily: 0, weekly: 0, monthly: 0 };
    this.streak = { currentStreak: 0, longestStreak: 0 };
    this.averageEmissions = 0;
    this.personalizedAnalysis = {
      highestCategory: null,
      tip: "",
      categoryEmissions: 0,
    };
    this.socket = null
    this.weeklyProgress = {
      currentEmissions: 0,
      targetReduction: 0,
      actualReduction:0,
      progressPercentage:0,
      tip:0,

    }

    this.init();
  }

  async init() {
    await this.fetchUserProfile();
    this.initWebSocket()
    this.setupEventListeners();
    await this.fetchActivities();
    await this.fetchSummary();
    await this.fetchLeaderboard();
    await this.fetchStreak();
    await this.fetchPersonalizedAnalysis();
    this.initChart();
    this.render();
  }

  initWebSocket() {
    try {
      this.socket = socket

      this.socket.on("connect", ()=>{
        console.log("Connected to server")
        if (this.userId) {
          this.socket.emit("join-user", this.userId)
        }
      })

      this.socket.on("activity-added", (data) => {
        this.showRealTimeTip(`Activity logged: ${data.message}`)
        this.fetchSummary()
        this.fetchWeeklyProgress()
      })

      this.socket.on("goal-updated", (data) => {
        this.showRealTimeTip(`Weekly goal updated: ${data.targetReduction}kg CO2 reduction target`)
        this.fetchWeeklyProgress()
      })

      this.socket.on("progress-updated", (data) => {
        this.weeklyProgress = data
        this.renderWeeklyProgress()
        this.showRealTimeTip(data.tip)
      })

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server")
      })
    } catch(error){
      console.error("WebSocket connection failed:", error)
    }
  }

  showRealTimeTip(message) {
    const tipContainer = document.getElementById("real-time-tip")
    if (tipContainer) {
      tipContainer.textContent = message
      tipContainer.classList.add("show")

      setTimeout(() => {
        tipContainer.classList.remove("show")
      }, 5000)
    }
  }


  async fetchWeeklyProgress() {
    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/activities/weekly-progress`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch weekly progress")

      this.weeklyProgress = await res.json()
      this.renderWeeklyProgress()
    } catch (err) {
      console.error(err)
    }
  }


  async fetchUserProfile() {
    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/auth/profile`, {
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
    document.getElementById("weekly-goal-form").addEventListener("submit", (e) => this.setWeeklyGoal(e))
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

  async setWeeklyGoal(e) {
    e.preventDefault()
    const targetReduction = Number.parseFloat(document.getElementById("target-reduction").value)

    if (!targetReduction || targetReduction <= 0) {
      alert("Please enter a valid reduction target")
      return
    }

    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/activities/weekly-goal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ targetReduction }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.message || "Error setting weekly goal")
        return
      }

      document.getElementById("weekly-goal-form").reset()
      await this.fetchWeeklyProgress()
      this.showRealTimeTip(`Weekly goal set: ${targetReduction}kg CO2 reduction target`)
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Try again.")
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
        `${window.ENV.BACKEND_URL}/api/activities/options?category=${category}`,
        { headers: { Authorization: `Bearer ${this.token}` } }
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
    const quantity = Number.parseFloat(
      document.getElementById("quantity").value
    );

    if (!category || !activity || !quantity) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/activities`, {
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
      await this.fetchSummary();
      await this.fetchLeaderboard();
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

  updateTotalEmissions() {
    const total = this.getTotalEmissions();
    const totalCo2El = document.getElementById("total-co2");
    if (totalCo2El) {
      totalCo2El.textContent = total.toFixed(1);
    }
  }

  async fetchActivities() {
    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      this.activities = data.map((act) => ({
        _id: act._id,
        category: act.category || "unknown",
        activity: act.activity,
        quantity: act.quantity || 1,
        unit: act.unit || "unit",
        co2Emissions: act.co2Emissions,
        timestamp: act.timestamp,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async deleteActivity(id) {
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/activities/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete activity");

      this.activities = this.activities.filter((act) => act._id !== id);
      this.render();
      await this.fetchSummary();
      await this.fetchLeaderboard();
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
      const show = category === "all" || item.dataset.category === category;
      item.classList.toggle("hidden", !show);
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

  async fetchSummary() {
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/activities/summary`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch summary");

      this.summary = await res.json();
      this.renderSummary();
    } catch (err) {
      console.error(err);
    }
  }

  async fetchLeaderboard() {
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/activities/leaderboard`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const summary = await res.json();
      this.leaderboard = summary.leaderboard;
      this.averageEmissions = summary.averageEmissions || 0;
      this.renderLeaderboard();
      this.renderAverageEmissions();
    } catch (err) {
      console.error(err);
    }
  }

  async fetchStreak() {
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/activities/streak`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch streak data");

      this.streak = await response.json();
      this.renderStreak();
    } catch (error) {
      console.error(error);
    }
  }

  async fetchPersonalizedAnalysis() {
    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/activities/analysis`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch personalized analysis")

      this.personalizedAnalysis = await res.json()
      this.renderPersonalizedTip()
    } catch (err) {
      console.error(err)
    }
  }

  renderSummary() {
    document.getElementById("daily-emission").textContent =
      this.summary.daily.toFixed(1);
    document.getElementById("weekly-emission").textContent =
      this.summary.weekly.toFixed(1);
    document.getElementById("monthly-emission").textContent =
      this.summary.monthly.toFixed(1);
  }

  renderWeeklyProgress() {
    const progressBar = document.getElementById("progress-bar")
    const progressText = document.getElementById("progress-text")
    const currentEmissionsEl = document.getElementById("current-week-emissions")
    const targetReductionEl = document.getElementById("target-reduction-display")
    const actualReductionEl = document.getElementById("actual-reduction")

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, this.weeklyProgress.progressPercentage)}%`
    }

    if (progressText) {
      progressText.textContent = `${this.weeklyProgress.progressPercentage}% of goal achieved`
    }

    if (currentEmissionsEl) {
      currentEmissionsEl.textContent = this.weeklyProgress.currentEmissions.toFixed(1)
    }

    if (targetReductionEl) {
      targetReductionEl.textContent = this.weeklyProgress.targetReduction.toFixed(1)
    }

    if (actualReductionEl) {
      actualReductionEl.textContent = this.weeklyProgress.actualReduction.toFixed(1)
    }
  }

  renderStreak() {
    const currentStreakEl = document.getElementById("current-streak");
    const longestStreakEl = document.getElementById("longest-streak");

    if (currentStreakEl) {
      currentStreakEl.textContent = this.streak.currentStreak || 0;
    }
    if (longestStreakEl) {
      longestStreakEl.textContent = this.streak.longestStreak || 0;
    }
  }

  renderAverageEmissions() {
    const avgEmissionsEl = document.getElementById("average-emissions");
    if (avgEmissionsEl) {
      avgEmissionsEl.textContent = this.averageEmissions.toFixed(1);
    }
  }

  renderLeaderboard() {
    const leaderboardContainer = document.getElementById("leaderboard-list");
    if (!this.leaderboard.length) {
      leaderboardContainer.innerHTML = `<p class="no-data">No leaderboard data yet.</p>`;
      return;
    }

    leaderboardContainer.innerHTML = this.leaderboard
      .slice(0, 10)
      .map(
        (entry, idx) => `
        <div class="leaderboard-item ${idx < 3 ? "top-three" : ""}">
          <span class="rank">${idx + 1}.</span>
          <span class="username">${entry.username}</span>
          <span class="emission">${entry.totalEmissions.toFixed(
            1
          )} kg CO<sub>2</sub></span>
          ${idx === 0 ? '<span class="badge gold">🏆</span>' : ""}
          ${idx === 1 ? '<span class="badge silver">🥈</span>' : ""}
          ${idx === 2 ? '<span class="badge bronze">🥉</span>' : ""}
        </div>
      `
      )
      .join("");
  }

  renderPersonalizedTip() {
    const tipContainer = document.getElementById("personalized-tip");
    const categoryContainer = document.getElementById("highest-category");

    if (tipContainer) {
      tipContainer.textContent = this.personalizedAnalysis.tip;
    }

    if (categoryContainer && this.personalizedAnalysis.highestCategory) {
      categoryContainer.innerHTML = `
        <strong>${
          this.personalizedAnalysis.highestCategory.charAt(0).toUpperCase() +
          this.personalizedAnalysis.highestCategory.slice(1)
        }</strong>
        <span class="category-emissions">${this.personalizedAnalysis.categoryEmissions.toFixed(
          1
        )} kg CO<sub>2</sub></span>
      `;
    }
  }

  initChart() {
    const ctx = document.getElementById("emissions-chart").getContext("2d");
    this.chart = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
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
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${value.toFixed(
                  1
                )} kg CO<sub>2</sub> (${percentage}%)`;
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

  render() {
    this.renderActivities();
    this.renderChart();
    this.renderSummary();
    this.renderLeaderboard();
    this.renderStreak();
    this.renderAverageEmissions();
    this.renderPersonalizedTip();
    this.updateTotalEmissions();
    this.renderWeeklyProgress();
  }

  renderActivities() {
    const container = document.getElementById("activities-list");
    if (!this.activities.length) {
      container.innerHTML = `<p>No activities yet.</p>`;
      return;
    }

    container.innerHTML = this.activities
      .map(
        (act) => `
      <div class="activity-item" data-category="${act.category}">
        <span>${act.activity}</span>
        <span>${act.co2Emissions} kg CO<sub>2</sub></span>
        <button class='delete-btn' onclick="tracker.deleteActivity('${act._id}')">Delete</button>
      </div>
    `
      )
      .join("");
  }
}

const tracker = new CarbonFootprintTracker();
