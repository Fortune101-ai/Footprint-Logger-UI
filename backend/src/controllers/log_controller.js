const User = require("../models/User");
const Log = require("../models/Log");

const createLog = async (req, res, next) => {
  const { activity, emission } = req.body;
  const log = await Log.create({ user: req.user.id, activity, emission });
  res.status(201).json(log);
};

const getUserLogs = async (req, res, next) => {
  const logs = await Log.find({ user: req.user.id }).sort({ date: -1 });
  const totalEmission = logs.reduce((total, log) => total + log.emission, 0);
  res.json({ logs, totalEmission });
};

const getAverageEmission = async (req, res, next) => {
  const logsAggregate = await Log.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: null, averageEmission: { $avg: "$emission" } } },
  ]);
  const averageEmission = logsAggregate[0]
    ? logsAggregate[0].averageEmission
    : 0;
  res.json({ averageEmission });
};

const getLeaderboard = async (req, res, next) => {
  const leaderboard = await Log.aggregate([
    { $group: { _id: "$user", totalEmission: { $sum: "$emission" } } },
    { $sort: { totalEmission: 1 } },
    { $limit: 10 },
  ]);
  const populatedLeaderboard = await User.populate(leaderboard, {
    path: "_id",
    select: "username",
  });
  res.json(
    populatedLeaderboard.map((entry) => ({
      user: entry._id.username,
      totalEmission: entry.totalEmission,
    }))
  );
};

module.exports = {
  createLog,
  getUserLogs,
  getAverageEmission,
  getLeaderboard,
};
