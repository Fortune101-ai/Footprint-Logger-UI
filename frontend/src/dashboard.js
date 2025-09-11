
class CarbonFootprintTracker {
    constructor() {
        this.activities = this.loadFromStorage();
        this.chart = null;
        this.emissionFactors = this.getEmissionFactors();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initChart();
        this.render();
    }

    getEmissionFactors() {
        return {
            transport: {
                'Car (petrol)': { factor: 0.148, unit: 'km' },
                'Car (diesel)': { factor: 0.18, unit: 'km' },
                'Bus': { factor: 0.068, unit: 'km' },
                'Train': { factor: 0.014, unit: 'km' },
                'Plane (domestic)': { factor: 0.18, unit: 'km' },
                'Plane (international)': { factor: 0.15, unit: 'km' },
                'Motorcycle': { factor: 0.072, unit: 'km' },
                'Bicycle': { factor: 0, unit: 'km' }
            },
            energy: {
                'Electricity': { factor: 0.87, unit: 'kWh' },
                'Natural gas': { factor: 0.2, unit: 'kWh' },
                'Heating oil': { factor: 2.7, unit: 'liters' },
                'Coal': { factor: 2.4, unit: 'kg' }
            },
            food: {
                'Beef': { factor: 27, unit: 'kg' },
                'Pork': { factor: 12, unit: 'kg' },
                'Chicken': { factor: 6, unit: 'kg' },
                'Fish': { factor: 4, unit: 'kg' },
                'Dairy products': { factor: 1.3, unit: 'kg' },
                'Eggs': { factor: 1.7, unit: 'kg' },
                'Rice': { factor: 2.7, unit: 'kg' },
                'Vegetables': { factor: 0.4, unit: 'kg' }
            },
            waste: {
                'General waste': { factor: 0.5, unit: 'kg' },
                'Plastic waste': { factor: 1.8, unit: 'kg' },
                'Paper waste': { factor: 0.9, unit: 'kg' },
                'Food waste': { factor: 0.3, unit: 'kg' }
            }
        };
    }

    setupEventListeners() {
    
        document.getElementById('category').addEventListener('change', () => this.updateActivityOptions());

        document.getElementById('activity-form').addEventListener('submit', (e) => this.addActivity(e));

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn));
        });
    }

    updateActivityOptions() {
        const category = document.getElementById('category').value;
        const activitySelect = document.getElementById('activity');
        const unitLabel = document.getElementById('unit-label');

        activitySelect.innerHTML = '<option value="">Select activity</option>';

        if (category && this.emissionFactors[category]) {
            Object.keys(this.emissionFactors[category]).forEach(activity => {
                activitySelect.innerHTML += `<option value="${activity}">${activity}</option>`;
            });
        }

        activitySelect.onchange = () => {
            const activity = activitySelect.value;
            if (activity && category) {
                unitLabel.textContent = this.emissionFactors[category][activity].unit;
            } else {
                unitLabel.textContent = 'unit';
            }
        };
    }

    addActivity(e) {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const activity = document.getElementById('activity').value;
        const quantity = parseFloat(document.getElementById('quantity').value);

        if (!category || !activity || !quantity) {
            alert('Please fill in all fields');
            return;
        }

        const emissionData = this.emissionFactors[category][activity];
        const co2Emissions = parseFloat((quantity * emissionData.factor).toFixed(2));

        this.activities.push({
            id: Date.now(),
            category,
            activity,
            quantity,
            unit: emissionData.unit,
            co2Emissions,
            timestamp: new Date().toISOString()
        });

        this.saveToStorage();
        this.render();
        this.resetForm();
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(activity => activity.id !== id);
        this.saveToStorage();
        this.render();
    }

    resetForm() {
        document.getElementById('activity-form').reset();
        document.getElementById('unit-label').textContent = 'unit';
        document.getElementById('activity').innerHTML = '<option value="">Select activity</option>';
    }

    setFilter(clickedBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');

        const category = clickedBtn.dataset.category;
        document.querySelectorAll('.activity-item').forEach(item => {
            const shouldShow = category === 'all' || item.dataset.category === category;
            item.classList.toggle('hidden', !shouldShow);
        });
    }

    getTodayActivities() {
        const today = new Date().toDateString();
        return this.activities.filter(activity =>
            new Date(activity.timestamp).toDateString() === today
        );
    }

    getTotalEmissions() {
        return this.getTodayActivities().reduce((sum, activity) => sum + activity.co2Emissions, 0);
    }

    getCategoryTotals() {
        const totals = { transport: 0, food: 0, energy: 0, waste: 0 };
        this.getTodayActivities().forEach(activity => {
            totals[activity.category] += activity.co2Emissions;
        });
        return totals;
    }

    render() {
        this.renderTotal();
        this.renderActivities();
        this.renderChart();
    }

    renderTotal() {
        document.getElementById('total-co2').textContent = this.getTotalEmissions().toFixed(1);
    }

    renderActivities() {
        const activitiesList = document.getElementById('activities-list');
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

        activitiesList.innerHTML = todayActivities.map(activity => `
            <div class="activity-item ${activity.category}" data-category="${activity.category}">
                <div class="activity-info">
                    <div class="activity-name">${activity.activity}</div>
                    <div class="activity-details">${activity.quantity} ${activity.unit} • ${activity.category}</div>
                </div>
                <div class="activity-emissions">
                    ${activity.co2Emissions} kg CO₂
                    <button class="delete-btn" onclick="tracker.deleteActivity(${activity.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    initChart() {
        if (typeof Chart === 'undefined') {
            document.querySelector('.chart-section').style.display = 'none';
            return;
        }

        try {
            const ctx = document.getElementById('emissions-chart').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#3182ce', '#38a169', '#d69e2e', '#e53e3e'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${context.label}: ${value.toFixed(1)} kg CO₂ (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            this.chart = null;
            document.querySelector('.chart-section').style.display = 'none';
        }
    }

    renderChart() {
        if (!this.chart) return;

        const categoryTotals = this.getCategoryTotals();
        const colorMap = { transport: '#3182ce', food: '#38a169', energy: '#d69e2e', waste: '#e53e3e' };

        const chartData = Object.entries(categoryTotals)
            .filter(([_, total]) => total > 0)
            .reduce((acc, [category, total]) => {
                acc.labels.push(category.charAt(0).toUpperCase() + category.slice(1));
                acc.data.push(total);
                acc.colors.push(colorMap[category]);
                return acc;
            }, { labels: [], data: [], colors: [] });

        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.data;
        this.chart.data.datasets[0].backgroundColor = chartData.colors;
        this.chart.update();
    }

    saveToStorage() {
        localStorage.setItem('carbonFootprintActivities', JSON.stringify(this.activities));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('carbonFootprintActivities');
        return saved ? JSON.parse(saved) : [];
    }
}

let tracker;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => tracker = new CarbonFootprintTracker(), 200);
});