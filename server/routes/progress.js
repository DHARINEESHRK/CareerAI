const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");

const router = express.Router();

// Helper to format date to local YYYY-MM-DD
const getLocalDateString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

// @route   GET /api/progress
// @desc    Get detailed task completion analytics (Daily, Monthly, Weekly, Momentum)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const allTasks = await Task.find({ userId: req.user.userId });
    
    const daily = {};
    const monthly = {};
    let momentumCount = 0;
    
    // Helper for months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    allTasks.forEach(task => {
      if (task.completed && task.completedAt) {
        // 1. Daily completion
        const dateStr = getLocalDateString(task.completedAt);
        daily[dateStr] = (daily[dateStr] || 0) + 1;

        // 2. Monthly stats
        const month = monthNames[new Date(task.completedAt).getMonth()];
        monthly[month] = (monthly[month] || 0) + 1;

        // 3. Momentum (last 7 days)
        if (new Date(task.completedAt) >= sevenDaysAgo) {
          momentumCount += 1;
        }
      }
    });

    // 4. Momentum Score (normalized out of 100)
    // Assuming 10 tasks in a week is a "High Momentum" (100%) - can adjust threshold
    const momentum = Math.min(Math.round((momentumCount / 10) * 100), 100);

    // 5. Weekly consistency (last 4 weeks)
    const weekly = [0, 0, 0, 0];
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);

    allTasks.forEach(task => {
        if (task.completed && task.completedAt) {
            const taskDate = new Date(task.completedAt);
            if (taskDate >= fourWeeksAgo) {
                const dayDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
                const weekIndex = Math.floor(dayDiff / 7);
                if (weekIndex < 4) {
                    weekly[3 - weekIndex] += 1; // 0 is 28-21 days ago, 3 is last 7 days
                }
            }
        }
    });

    res.json({
      daily,
      monthly,
      weekly,
      momentum
    });
  } catch (err) {
    console.error("Progress API Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
