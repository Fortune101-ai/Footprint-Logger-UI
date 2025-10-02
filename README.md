# Carbon Footprint Logger

A beautiful, user-friendly web application that helps individuals track their daily activities and monitor their environmental impact. Built with simplicity in mind, this app makes it easy for anyone to understand and reduce their carbon footprint.

## What is a Carbon Footprint?

Your **carbon footprint** is the total amount of greenhouse gases (mainly CO₂) that your daily activities produce. This includes things like:  

- Driving your car  
- Using electricity at home  
- The food you eat  
- The waste you produce  

By tracking these activities, you can see where you have the biggest impact and make changes to help protect our planet!

## Features

### **Activity Input & Management**

- **ActivityForm**: Add daily activities with quantity and category.  
- **ActivitiesList**: View all activities for the day.  
- **FilterButtons**: Filter activities by category (Transport, Food, Energy, Waste).  
- **Delete Activity**: Remove unwanted activities.

### **Personal Goals & Tracking**

- **WeeklyGoals**: Set weekly CO₂ reduction goals and track progress.  
- **StreakSection**: Track streaks for consistent activity logging.

### **Real-Time Insights**

- **RealTimeTip**: Dynamic tips and reminders while using the app.  
- **TodayEmissions**: Shows total CO₂ emissions for the current day.  
- **SummaryStats**: Overview of total and average emissions.  
- **PersonalizedTips**: Personalized recommendations based on user activity.

### **Visualization**

- **ActivityChart**: Interactive chart showing CO₂ emissions by category.  
- **Leaderboard**: Compare your emissions with other users.

### **Real-Time Updates**

- Uses **WebSockets** to push live updates for streaks, leaderboard, and tips.

## Prerequisites & Setup

Before testing or running the application, make sure you have the following installed and configured:

### **Required Software**

- **Node.js** and **npm** – [https://nodejs.org](https://nodejs.org)  
- **Docker** – [https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)  
- **Arcjet API Key** – for security and bot detection - [https://docs.arcjet.com/](https://docs.arcjet.com/)
- **JWT Secret Key** – for authentication  

---

### **Backend Setup**

1. Copy environment variable templates and make sure to substitute placeholders with actual values:

```bash
cp .env.example .env
cp .env.development.example .env.development

```

2. Navigate to the backend directory

```bash
cd backend
```

3. install dependencies

```bash
npm install
```

4. start backend server

```bash
npm run start:dev
```

If you get a permission error, give the script execute permission and then try again:

```bash
chmod +x scripts/dev.sh
npm run start:dev
```

Backend should now be running and listening for requests

### **Frontend Setup**

1. Navigate to the frontend directory

```bash
cd ../frontend
```

2. install dependencies

```bash
npm install
```

3. start the frontend development server

```bash
npm run dev
```

4. Open your browser and navigate to [http://localhost:5173/](http://localhost:5173/)

you should see the applications homepage to which you can create your account by registering or login via the login page.

### **Bot Detection Notice**

If you are testing the API using curl, Postman or similar tools, you might see a 'bot detected' response in your backend error logs. This is normal behavior because Arcjet considers requests without a proper user agent as potential bots.

To Bypass for testing, ass a User-Agent header to your request,
For example if you are using curl:

```bash
curl -H "User-Agent: Mozilla/5.0" http://localhost:5000/api/<your-endpoint>

```