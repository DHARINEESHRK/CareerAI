const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  phone: {
    type: String,
  },
  domain: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  goal: {
    type: String,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  publicProfile: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
