require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization","Cache-Control","Expires","Pragma"],
  credentials: true
}))
app.use(express.json());

// Connect DB
connectDB();

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/path", require("./routes/path"));
app.use("/api/task", require("./routes/task"));
app.use("/api/market", require("./routes/market"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/subscription", require("./routes/subscription"));
app.use("/api/notification", require("./routes/notification"));
app.use("/api/chat", require("./routes/chat"));

// Start Cron Jobs
require("./jobs/reminderJob");

const path = require("path");
const fs = require("fs");

// Serve React production build static files if present
const clientBuildPath = path.join(__dirname, "../career-ai/dist");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API Running 🚀");
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});