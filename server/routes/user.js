const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/user/profile
// @desc    Update user profile & preferences
router.post("/profile", authMiddleware, async (req, res) => {
  const { phone, domain, skills, goal, notificationsEnabled, publicProfile } = req.body;

  try {
    let user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Profile Fields
    if (phone !== undefined) user.phone = phone;
    if (domain !== undefined) user.domain = domain;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(s => s);
    }
    if (goal !== undefined) user.goal = goal;
    
    // Preferences (Settings)
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    if (publicProfile !== undefined) user.publicProfile = publicProfile;
    
    // Mark profile as complete if it wasn't
    if (!user.isProfileComplete) {
       user.isProfileComplete = true;
    }

    await user.save();

    // Return updated user
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
