const Activity = require("../models/Activity");
const User = require("../models/User");

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

const addActivity = async (req, res, next) => {
  try {
    const { category, activity, quantity } = req.body;

    if (!category || !activity || !quantity) {
      return res
        .status(400)
        .json({ message: "Category, activity, and quantity are required" });
    }

    const factorData =
      emissionFactors[category] && emissionFactors[category][activity];
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

const getActivityOptions = async (req, res) => {
  const { category } = req.query;
  if (!category || !emissionFactors[category]) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const options = Object.keys(emissionFactors[category]);
  res.status(200).json(options);
};

const getUserActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({
      timestamp: -1,
    });
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error getting user activities" });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    await activity.deleteOne();
    res.json({ message: "Activity deleted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error deleting activity" });
  }
};

const getSummary = async (req, res) => {
  try {
    const allActivities = await Activity.aggregate([
      {
        $group: {
          _id: "$user",
          totalEmissions: { $sum: "$co2Emissions" },
        },
      },
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
    console.error(error);
    res.status(500).json({ message: "Server error fetching summary" });
  }
};

module.exports = {
  addActivity,
  getUserActivities,
  getActivityOptions,
  deleteActivity,
  getSummary,
};
