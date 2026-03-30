const User = require("../models/User");
const Payment = require("../models/Payment");

const PLAN_AMOUNT = 199;
const PLAN_DURATION_DAYS = 30;

const processingUsers = new Set();

const generatePaymentId = () => {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEMO_PAY_${ts}_${rand}`;
};

const getUpgradedUserPayload = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  profilePicture: userDoc.profilePicture,
  domain: userDoc.domain,
  skills: userDoc.skills,
  goal: userDoc.goal,
  isPremium: userDoc.isPremium,
  premiumExpiry: userDoc.premiumExpiry,
  isProfileComplete: userDoc.isProfileComplete,
  createdAt: userDoc.createdAt,
});

const simulatePayment = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (processingUsers.has(userId)) {
    return res.status(429).json({
      success: false,
      message: "Payment is already being processed. Please wait.",
    });
  }

  const { amount = PLAN_AMOUNT, idempotencyKey } = req.body || {};

  if (Number(amount) !== PLAN_AMOUNT) {
    return res.status(400).json({
      success: false,
      message: `Invalid amount. Expected ₹${PLAN_AMOUNT}.`,
    });
  }

  processingUsers.add(userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (idempotencyKey) {
      const existing = await Payment.findOne({ userId, idempotencyKey, status: "success" });
      if (existing) {
        return res.json({
          success: true,
          paymentId: existing.paymentId,
          payment: {
            amount: existing.amount,
            status: existing.status,
            createdAt: existing.createdAt,
          },
          user: getUpgradedUserPayload(user),
          message: "Payment already processed.",
        });
      }
    }

    const now = new Date();
    const baseDate = user.premiumExpiry && new Date(user.premiumExpiry) > now
      ? new Date(user.premiumExpiry)
      : now;
    const expiry = new Date(baseDate);
    expiry.setDate(expiry.getDate() + PLAN_DURATION_DAYS);

    const paymentId = generatePaymentId();

    const payment = await Payment.create({
      userId,
      amount: PLAN_AMOUNT,
      status: "success",
      paymentId,
      idempotencyKey: idempotencyKey || null,
    });

    user.isPremium = true;
    user.premiumExpiry = expiry;
    await user.save();

    return res.json({
      success: true,
      paymentId: payment.paymentId,
      payment: {
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
      },
      user: getUpgradedUserPayload(user),
      message: "Demo payment successful. Premium unlocked.",
    });
  } catch (error) {
    if (error?.code === 11000 && idempotencyKey) {
      try {
        const existing = await Payment.findOne({ userId, idempotencyKey, status: "success" });
        const user = await User.findById(userId);
        if (existing && user) {
          return res.json({
            success: true,
            paymentId: existing.paymentId,
            payment: {
              amount: existing.amount,
              status: existing.status,
              createdAt: existing.createdAt,
            },
            user: getUpgradedUserPayload(user),
            message: "Payment already processed.",
          });
        }
      } catch (dupErr) {
        console.error("Idempotency recovery failed:", dupErr.message);
      }
    }

    console.error("Demo payment failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to process demo payment",
    });
  } finally {
    processingUsers.delete(userId);
  }
};

module.exports = {
  simulatePayment,
  PLAN_AMOUNT,
};
