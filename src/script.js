

class CarbonFootprintTracker {

    constructor() {
        this.activities = this.loadActivities();
        this.chart = null;


        this.emissionFactors = {
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

        this.initializeEventListeners();
        this.updateDisplay();
        this.initializeChart();
    }

    initializeEventListeners() {
        const categorySelect = document.getElementById('category');
        const form = document.getElementById('activity-form');
        const filterButtons = document.querySelectorAll('.filter-btn');

        categorySelect.addEventListener('change', () => this.updateActivityOptions());
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilterClick(btn));
        });
    }

    updateActivityOptions() {
        const category = document.getElementById('category').value;
        const activitySelection = document.getElementById('activity')
        const unitLabel = document.getElementById('unit-label')

        activitySelection.innerHTML = '<option value="">Select activity</option>';

        if (category && this.emissionFactors[category]) {
            Object.keys(this.emissionFactors[category]).forEach(activity => {
                const option = document.createElement('option')
                option.value = activity
                option.textContent = activity
                activitySelection.appendChild(option)
            })
        }

        activitySelection.addEventListener('change', () => {
            const selectedActivity = activitySelection.value;
            if (selectedActivity && category) {
                const unit = this.emissionFactors[category.toLowerCase()][selectedActivity].unit;
                unitLabel.textContent = unit
            } else {
                unitLabel.textContent = 'unit'
            }
        })
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const activity = document.getElementById('activity').value;
        const quantity = parseFloat(document.getElementById('quantity').value)

        if (!category || !activity || !quantity) {
            alert('Please fill in all fields');
            return
        }

        const emissionData = this.emissionFactors[category][activity];
        const co2Emissions = quantity * emissionData.factor;

        const activityData = {
            id: Date.now(),
            category,
            activity,
            quantity,
            unit: emissionData.unit,
            co2Emissions: parseFloat(co2Emissions.toFixed(2)),
            timestamp: new Date().toISOString()
        }

        this.activities.push(activityData)
        this.saveActivities();
        this.updateDisplay()
        this.resetForm();
    }

    resetForm() {
        document.getElementById('activity-form').reset();
        document.getElementById('unit-label').textContent = 'unit';
        document.getElementById('activity').innerHTML = '<option value="">Select activity</option>';
    }

    handleFilterClick(clickedBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedBtn.classList.add('active');

        const category = clickedBtn.dataset.category;
        this.filterActivities(category);
    }

    filterActivities(category) {
        const activityItems = document.querySelectorAll('.activity-item');

        activityItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    updateDisplay() {
        this.updateTotalEmissions();
        this.updateActivitiesList();
        this.updateChart();
    }

    updateTotalEmissions() {
        const today = new Date().toDateString();
        const todayActivities = this.activities.filter(activity =>
            new Date(activity.timestamp).toDateString() === today
        );

        const total = todayActivities.reduce((sum, activity) => sum + activity.co2Emissions, 0);
        document.getElementById('total-co2').textContent = total.toFixed(1);
    }

    updateActivitiesList() {
        const activitiesList = document.getElementById('activities-list');
        const today = new Date().toDateString();
        const todayActivities = this.activities.filter(activity => new Date(activity.timestamp).toDateString() === today);

        if (todayActivities.length === 0) {
            activitiesList.innerHTML = '<p class="no-activities">No activities logged yet. Start by adding your first activity above!</p>';
            return;
        }

        activitiesList.innerHTML = todayActivities.map(activity => `
            <div class="activity-item ${activity.category}" data-category="${activity.category}">
                <div class="activity-info">
                    <div class="activity-name">${activity.activity}</div>
                    <div class="activity-details">
                        ${activity.quantity} ${activity.unit} • ${activity.category}
                    </div>
                </div>
                <div class="activity-emissions">
                    ${activity.co2Emissions} kg CO₂
                    <button class="delete-btn" onclick="tracker.deleteActivity(${activity.id})">
                        Remove
                    </button>
                </div>
            </div>
        `).join('')
    }

    initializeChart() {

        if (typeof Chart === 'undefined') {
            document.querySelector('.chart-section').style.display = 'none';
            return;
        }

        try {
            const chartContext = document.getElementById('emissions-chart').getContext('2d');
            this.chart = new Chart(chartContext, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#3182ce',
                            '#38a169',
                            '#d69e2e',
                            '#e53e3e'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value.toFixed(1)} kg CO₂ (${percentage}%)`;
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

    updateChart() {
        if (!this.chart) {
            return;
        }

        const today = new Date().toDateString();
        const todayActivities = this.activities.filter(activity => new Date (activity.timestamp).toDateString() === today)

        const categoryTotals = {
            transport:0,
            food: 0,
            energy:0,
            waste: 0

        }

        todayActivities.forEach(activity => {
            categoryTotals[activity.category] += activity.co2Emissions
        })

        const labels = []
        const data = []
        const colors = []
        const colorMap = {
            transport: '#3182ce',
            food: '#38a169',
            energy: '#d69e2e',
            waste: '#e53e3e'
        }

        Object.entries(categoryTotals).forEach(([category, total]) => {
            if (total > 0) {
                labels.push(category.charAt(0).toUpperCase() + category.slice(1));
                data.push(total);
                colors.push(colorMap[category]);
            }
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].backgroundColor = colors;
        this.chart.update();

    }

    saveActivities() {
        localStorage.setItem('carbonFootprintActivities', JSON.stringify(this.activities));
    }

    loadActivities() {
        const saved = localStorage.getItem('carbonFootprintActivities')
        return saved ? JSON.parse(saved) : []
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(activity => activity.id !== id)
        this.saveActivities()
        this.updateDisplay()
    }




}

let tracker;
document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {
        tracker = new CarbonFootprintTracker();
    }, 100)
})