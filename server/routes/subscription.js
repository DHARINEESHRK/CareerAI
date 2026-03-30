const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { simulatePayment, PLAN_AMOUNT } = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/plan", authMiddleware, (req, res) => {
  res.json({
    name: "Premium",
    amount: PLAN_AMOUNT,
    currency: "INR",
  });
});

// Backward compatible endpoint used by existing frontend button.
router.post("/upgrade", authMiddleware, simulatePayment);

// Explicit demo payment endpoint.
router.post("/pay-demo", authMiddleware, simulatePayment);

module.exports = router;
