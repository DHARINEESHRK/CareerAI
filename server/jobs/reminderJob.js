const cron = require("node-cron");
const User = require("../models/User");
const Task = require("../models/Task");
const Path = require("../models/Path");
const { sendTaskReminder } = require("../utils/mailer");

// Run every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      // Find the current active path for this user
      const activePath = await Path.findOne({ userId: user._id, isActive: true });
      if (!activePath) continue;

      // Find the current active phase
      const activePhase = activePath.phases.find(p => p.status === "in-progress");
      if (!activePhase) continue;

      // Find pending tasks for this phase
      const tasks = await Task.find({
        userId: user._id,
        pathId: activePath._id,
        phaseId: activePhase._id,
        completed: false
      }).limit(5);

      if (tasks.length > 0) {
        await sendTaskReminder(user.email, user.name, tasks);
      }
    }
  } catch (err) {
    console.error("Daily reminder job failed:", err.message);
  }
});
