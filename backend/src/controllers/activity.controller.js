import Activity from '#models/Activity.js';
import logger from '#config/logger.js';

const emissionFactors = {
  transport: {
    'Car (petrol)': { factor: 0.148, unit: 'km' },
    'Car (diesel)': { factor: 0.18, unit: 'km' },
    Bus: { factor: 0.068, unit: 'km' },
    Train: { factor: 0.014, unit: 'km' },
    'Plane (domestic)': { factor: 0.18, unit: 'km' },
    'Plane (international)': { factor: 0.15, unit: 'km' },
    Motorcycle: { factor: 0.072, unit: 'km' },
    Bicycle: { factor: 0, unit: 'km' },
  },
  energy: {
    Electricity: { factor: 0.87, unit: 'kWh' },
    'Natural gas': { factor: 0.2, unit: 'kWh' },
    'Heating oil': { factor: 2.7, unit: 'liters' },
    Coal: { factor: 2.4, unit: 'kg' },
  },
  food: {
    Beef: { factor: 27, unit: 'kg' },
    Pork: { factor: 12, unit: 'kg' },
    Chicken: { factor: 6, unit: 'kg' },
    Fish: { factor: 4, unit: 'kg' },
    'Dairy products': { factor: 1.3, unit: 'kg' },
    Eggs: { factor: 1.7, unit: 'kg' },
    Rice: { factor: 2.7, unit: 'kg' },
    Vegetables: { factor: 0.4, unit: 'kg' },
  },
  waste: {
    'General waste': { factor: 0.5, unit: 'kg' },
    'Plastic waste': { factor: 1.8, unit: 'kg' },
    'Paper waste': { factor: 0.9, unit: 'kg' },
    'Food waste': { factor: 0.3, unit: 'kg' },
  },
};

const addActivity = async (req, res) => {
  try {
    const { category, activity, quantity } = req.body;

    if (!category || !activity || !quantity) {
      logger.warn(
        `Bad request from User: ${
          req.user?.id || 'unknown'
        } - Missing fields: category=${category}, activity=${activity}, quantity=${quantity}`
      );
      return res
        .status(400)
        .json({ message: 'Category, activity, and quantity are required' });
    }

    const factorData = emissionFactors[category]?.[activity];
    if (!factorData) {
      logger.warn(
        `Invalid activity for User: ${
          req.user?.id || 'unknown'
        } - category=${category}, activity=${activity}`
      );
      return res.status(400).json({ message: 'Invalid category or activity' });
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
    logger.info(`Activity added: ${newActivity._id} by User: ${req.user.id}`);
    res.status(201).json(newActivity);
  } catch (error) {
    logger.error(`Error adding activity: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Internal server error adding activity' });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({
      timestamp: -1,
    });

    logger.info(`Fetched activities for User: ${req.user.id}`);
    res.status(200).json(activities);
  } catch (error) {
    logger.error(`Error fetching activities: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error fetching activities' });
  }
};

const getActivityOptions = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category || !emissionFactors[category]) {
      logger.warn(
        `Invalid category request from User: ${
          req.user?.id || 'unknown'
        } - category=${category}`
      );
      return res.status(400).json({ message: 'Invalid category' });
    }

    const options = Object.keys(emissionFactors[category]);

    logger.info(`Fetched activity options for category: ${category}`);
    res.status(200).json(options);
  } catch (error) {
    logger.error(`Error fetching activity options: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error fetching activity options' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!activity) {
      logger.warn(
        `Delete failed for User: ${req.user.id} - Activity not found with id=${req.params.id}`
      );
      return res.status(404).json({ message: 'Activity not found' });
    }

    logger.info(`Activity deleted: ${activity._id} by User: ${req.user.id}`);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    logger.error(`Error deleting activity: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error deleting activity' });
  }
};

const getSummary = async (req, res) => {
  try {
    const allActivities = await Activity.aggregate([
      { $group: { _id: '$user', totalEmissions: { $sum: '$co2Emissions' } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          username: { $arrayElemAt: ['$userInfo.username', 0] },
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

    logger.info('Fetched global summary');
    res.json({ leaderboard: allActivities, averageEmissions: avgEmission });
  } catch (error) {
    logger.error(`Error fetching summary: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error fetching summary' });
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

    logger.info(`Fetched summary for User: ${req.user.id}`);
    res.json({ daily, weekly, monthly });
  } catch (error) {
    logger.error(`Error fetching user summary: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error fetching user summary' });
  }
};

const getUserStreak = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({
      timestamp: 1,
    });

    if (activities.length === 0) {
      logger.warn(
        `No activities found for User: ${req.user.id} when fetching streak`
      );

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

    logger.info(`Fetched streak for User: ${req.user.id}`);
    res.json({ currentStreak, longestStreak });
  } catch (error) {
    logger.error(`Error fetching user streak: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: 'Error fetching user streak' });
  }
};

const getPersonalizedAnalysis = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });

    if (activities.length === 0) {
      logger.warn(
        `No activities found for User: ${req.user.id} when fetching personalized analysis`
      );

      return res.json({
        highestCategory: null,
        tip: 'Start tracking your activities and discover tips tailored to your journey!',
      });
    }

    const categoryEmissions = {};
    activities.forEach((activity) => {
      if (!categoryEmissions[activity.category]) {
        categoryEmissions[activity.category] = 0;
      }
      categoryEmissions[activity.category] += activity.co2Emissions;
    });

    const highestCategory = Object.keys(categoryEmissions).reduce((a, b) =>
      categoryEmissions[a] > categoryEmissions[b] ? a : b
    );

    const tips = {
      transport: [
        "Walk or cycle for short trips - it's healthy and can save up to 2kg C02 each week!",
      ],
      energy: [
        'Switch to LED bulbs and unplug devices when not in use - save 0.5kg CO2 every day',
      ],
      food: [
        'Go meat-free one day a week and cut 3-5kg CO2 from your footprint.',
      ],
      waste: [
        'Recycle and compost organic waste - reduce about 1kg CO2 weekly.',
      ],
    };

    const categoryTips = tips[highestCategory] || [
      'Keep tracking your activities for more personalized tips!',
    ];
    const randomTip =
      categoryTips[Math.floor(Math.random() * categoryTips.length)];

    logger.info(`Fetched personalized analysis for User: ${req.user.id}`);
    res.json({
      highestCategory,
      categoryEmissions: categoryEmissions[highestCategory],
      tip: randomTip,
      totalCategories: Object.keys(categoryEmissions).length,
    });
  } catch (error) {
    logger.error(`Error fetching personalized analysis: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({
      message: 'Error fetching personalized analysis',
    });
  }
};

export {
  addActivity,
  getUserActivities,
  getActivityOptions,
  deleteActivity,
  getSummary,
  getUserSummary,
  getUserStreak,
  getPersonalizedAnalysis,
};
