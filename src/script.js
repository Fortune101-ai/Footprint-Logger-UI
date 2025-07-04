

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

        activitySelection.addEventListener('change',()=>{
            const selectedActivity = activitySelection.value;
            if (selectedActivity && category) {
                const unit = this.emissionFactors[category][selectedActivity].unit;
                unitLabel.textContent = unit
            } else {
                unitLabel.textContent = 'unit'
            }
        })
    }


}

let tracker;
document.addEventListener('DOMContentLoaded', ()=> {

    setTimeout(()=>{
        tracker = new CarbonFootprintTracker();
    },100)
})