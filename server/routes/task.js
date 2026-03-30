const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const Path = require("../models/Path");
const User = require("../models/User");
const { sendTaskCompletedEmail, sendPhaseCompletedEmail, sendPathCompletedEmail, sendJobUnlockedEmail } = require("../utils/mailer");

const router = express.Router();

// @route   GET /api/task/:pathId
// @desc    Get tasks for a specific path (only for current active phase)
router.get("/:pathId", authMiddleware, async (req, res) => {
  try {
    const path = await Path.findOne({ _id: req.params.pathId, userId: req.user.userId });
    if (!path) return res.status(404).json({ message: "Path not found" });

    // Find the current active phase (prefer in-progress, then pending, then fallback)
    const activePhase =
      path.phases.find((p) => p.status === "in-progress") ||
      path.phases.find((p) => p.status === "pending") ||
      path.phases[path.phases.length - 1];

    const tasks = await Task.find({ 
      userId: req.user.userId, 
      pathId: req.params.pathId,
      phaseId: activePhase._id
    }).sort({ order: 1 });

    res.json({ tasks, activePhase });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/task/:id
// @desc    Mark task complete
router.post("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = await User.findById(req.user.userId);

    if (task.completed) {
      return res.status(400).json({ message: "Completed tasks cannot be marked incomplete." });
    }

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    // 3. Generate Task Notification (on complete)
    const Notification = require("../models/Notification");
    if (task.completed) {
       await new Notification({
          userId: req.user.userId,
          title: "🔥 Task Secured!",
          message: `Mastery increased. You successfully completed: ${task.title}`,
          type: "task"
       }).save();

       if (!task.completionEmailSent) {
         const userPath = await Path.findOne({ _id: task.pathId, userId: req.user.userId });
         const phaseTitle = userPath?.phases?.find(p => p._id.toString() === task.phaseId.toString())?.title;
         if (user?.email) {
           sendTaskCompletedEmail(user.email, user.name, task.title, phaseTitle);
         }
         task.completionEmailSent = true;
         await task.save();
       }
    }

    // Check if ALL tasks in current phase are complete
    const allTasksInPhase = await Task.find({ pathId: task.pathId, phaseId: task.phaseId });
    const allCompleted = allTasksInPhase.length > 0 && allTasksInPhase.every(t => t.completed);

    if (allCompleted) {
      // 1. Mark phase as completed in Path model
      const path = await Path.findById(task.pathId);
      const phaseIndex = path.phases.findIndex(p => p._id.toString() === task.phaseId.toString());
      
      if (phaseIndex !== -1 && path.phases[phaseIndex].status !== "completed") {
        const completedPhaseTitle = path.phases[phaseIndex].title;
        path.phases[phaseIndex].status = "completed";
        
        // Send phase completion email and create matching notification
        if (user?.email && !path.phaseEmailsSent) {
          path.phaseEmailsSent = path.phaseEmailsSent || {};
        }
        if (user?.email && (!path.phaseEmailsSent || !path.phaseEmailsSent[task.phaseId.toString()])) {
          sendPhaseCompletedEmail(user.email, user.name, completedPhaseTitle, path.title);
          if (!path.phaseEmailsSent) path.phaseEmailsSent = {};
          path.phaseEmailsSent[task.phaseId.toString()] = true;
        }

        // Create phase completion notification (matches email)
        await new Notification({
          userId: req.user.userId,
          title: "🎯 Phase Completed",
          message: `Congratulations! You have successfully completed the "${completedPhaseTitle}" phase.`,
          type: "achievement"
        }).save();
        
        // 2. Unlock NEXT phase if exists
        const nextPhase = path.phases[phaseIndex + 1];
        const isPathFullyCompleted = phaseIndex === path.phases.length - 1; // Last phase just completed
        
        if (nextPhase) {
          nextPhase.status = "in-progress";

          // Milestone Notification for next phase unlock
          await new Notification({
            userId: req.user.userId,
            title: "🚀 Next Phase Unlocked!",
            message: `Level Up! The next phase is now available for you to begin.`,
            type: "achievement"
          }).save();
        } else if (isPathFullyCompleted) {
          // ALL PHASES COMPLETED - Send path completion and job unlock emails and notifications
          
          // Send path completed email and create matching notification
          if (user?.email && !path.pathCompletionEmailSent) {
            sendPathCompletedEmail(user.email, user.name, path.title, path.domain);
            path.pathCompletionEmailSent = true;
          }

          await new Notification({
            userId: req.user.userId,
            title: "🏆 Career Path Mastered!",
            message: `Extraordinary! You've completed all phases of "${path.title}". You are now a master in this domain!`,
            type: "achievement"
          }).save();

          // Send job unlock email and create matching notification
          if (user?.email && !path.jobUnlockEmailSent) {
            sendJobUnlockedEmail(user.email, user.name, path.title);
            path.jobUnlockEmailSent = true;
          }

          await new Notification({
            userId: req.user.userId,
            title: "💼 Job Matches Unlocked!",
            message: `Your job recommendations are now available! Check the Jobs section to discover opportunities that match your new skill set.`,
            type: "achievement"
          }).save();
        }
        
        await path.save();
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
