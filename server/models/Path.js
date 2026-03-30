const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  domain: {
    type: String,
  },
  goal: {
    type: String,
  },
  completionDeadline: {
    type: Date,
  },
  recommendedDailyHours: {
    type: Number,
  },
  estimatedTotalHours: {
    type: Number,
  },
  targetDays: {
    type: Number,
  },
  signature: {
    type: String,
    default: null,
  },
  phases: [
    {
      title: { type: String, required: true },
      description: { type: String },
      trendInsight: { type: String },
      demandLevel: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
      order: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
      },
    },
  ],
  marketInsights: [{
    role: String,
    avgSalary: String,
    demandLevel: String,
    growthRate: String,
    skillsRequired: [String]
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  phaseEmailsSent: {
    type: Map,
    of: Boolean,
    default: new Map(),
  },
  pathCompletionEmailSent: {
    type: Boolean,
    default: false,
  },
  jobUnlockEmailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

pathSchema.index({ userId: 1, signature: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Path", pathSchema);
