

class CarbonFootprintTracker {

    constructor() {
        this.activities = this.loadActivities();
        
    }

}

let tracker;
document.addEventListener('DOMContentLoaded', ()=> {

    setTimeout(()=>{
        tracker = new CarbonFootprintTracker();
    },100)
})