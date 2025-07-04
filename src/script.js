

class CarbonFootprintTracker {

    constructor() {
        this.activities = this.loadActivities();


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
    }

}

let tracker;
document.addEventListener('DOMContentLoaded', ()=> {

    setTimeout(()=>{
        tracker = new CarbonFootprintTracker();
    },100)
})