const Activity = require("../models/Activity");

const emissionFactors = {
  transport: {
    "Car (petrol)": { factor: 0.148, unit: "km" },
    "Car (diesel)": { factor: 0.18, unit: "km" },
    Bus: { factor: 0.068, unit: "km" },
    Train: { factor: 0.014, unit: "km" },
    "Plane (domestic)": { factor: 0.18, unit: "km" },
    "Plane (international)": { factor: 0.15, unit: "km" },
    Motorcycle: { factor: 0.072, unit: "km" },
    Bicycle: { factor: 0, unit: "km" },
  },
  energy: {
    Electricity: { factor: 0.87, unit: "kWh" },
    "Natural gas": { factor: 0.2, unit: "kWh" },
    "Heating oil": { factor: 2.7, unit: "liters" },
    Coal: { factor: 2.4, unit: "kg" },
  },
  food: {
    Beef: { factor: 27, unit: "kg" },
    Pork: { factor: 12, unit: "kg" },
    Chicken: { factor: 6, unit: "kg" },
    Fish: { factor: 4, unit: "kg" },
    "Dairy products": { factor: 1.3, unit: "kg" },
    Eggs: { factor: 1.7, unit: "kg" },
    Rice: { factor: 2.7, unit: "kg" },
    Vegetables: { factor: 0.4, unit: "kg" },
  },
  waste: {
    "General waste": { factor: 0.5, unit: "kg" },
    "Plastic waste": { factor: 1.8, unit: "kg" },
    "Paper waste": { factor: 0.9, unit: "kg" },
    "Food waste": { factor: 0.3, unit: "kg" },
  },
};

const addActivity = async (req, res) => {
  try {
    const { category, activity, quantity } = req.body;

    if (!category || !activity || !quantity) {
      return res
        .status(400)
        .json({ message: "Category, activity, and quantity are required" });
    }

    const factorData = emissionFactors[category]?.[activity];
    if (!factorData) {
      return res.status(400).json({ message: "Invalid category or activity" });
    }

    const co2Emissions = parseFloat((factorData.factor * quantity).toFixed(2));

    const newActivity = new Activity({
      user: req.user.id,
      category,
      activity,
      quantity,
      unit: factorData.unit,
      co2Emissions,
    });

    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error adding activity" });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({
      timestamp: -1,
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities" });
  }
};

const getActivityOptions = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category || !emissionFactors[category]) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const options = Object.keys(emissionFactors[category]);
    res.status(200).json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching activity options" });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting activity" });
  }
};

const getSummary = async (req, res) => {
  try {
    const allActivities = await Activity.aggregate([
      { $group: { _id: "$user", totalEmissions: { $sum: "$co2Emissions" } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          username: { $arrayElemAt: ["$userInfo.username", 0] },
          totalEmissions: 1,
        },
      },
      { $sort: { totalEmissions: 1 } },
    ]);

    const totalEmissionSum = allActivities.reduce(
      (sum, u) => sum + u.totalEmissions,
      0
    );
    const avgEmission =
      allActivities.length > 0 ? totalEmissionSum / allActivities.length : 0;

    res.json({ leaderboard: allActivities, averageEmissions: avgEmission });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};

const getUserSummary = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });

    const today = new Date().toDateString();
    const daily = activities
      .filter((a) => new Date(a.timestamp).toDateString() === today)
      .reduce((sum, a) => sum + a.co2Emissions, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weekly = activities
      .filter((a) => new Date(a.timestamp) >= last7Days)
      .reduce((sum, a) => sum + a.co2Emissions, 0);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const monthly = activities
      .filter((a) => new Date(a.timestamp) >= last30Days)
      .reduce((sum, a) => sum + a.co2Emissions, 0);

    res.json({ daily, weekly, monthly });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user summary" });
  }
};

const getUserStreak = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({
      timestamp: 1,
    });

    if (activities.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0 });
    }

    const activityDates = [
      ...new Set(activities.map((a) => new Date(a.timestamp).toDateString())),
    ].sort((a, b) => new Date(a) - new Date(b));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < activityDates.length; i++) {
      const prevDate = new Date(activityDates[i - 1]);
      const currDate = new Date(activityDates[i]);
      const dayDifference = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDifference === 1) {
        tempStreak += 1;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastActivityDate = activityDates[activityDates.length - 1];

    if (lastActivityDate === today || lastActivityDate === yesterday) {
      let streakCount = 1;
      for (let i = activityDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(activityDates[i]);
        const nextDate = new Date(activityDates[i + 1]);
        const dayDifference = (nextDate - prevDate) / (1000 * 60 * 60 * 24);

        if (dayDifference === 1) {
          streakCount += 1;
        } else {
          break;
        }
      }
      currentStreak = streakCount;
    }

    res.json({ currentStreak, longestStreak });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user streak" });
  }
};

module.exports = {
  addActivity,
  getUserActivities,
  getActivityOptions,
  deleteActivity,
  getSummary,
  getUserSummary,
  getUserStreak,
};
