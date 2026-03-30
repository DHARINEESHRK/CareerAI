const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Path = require("../models/Path");
const Task = require("../models/Task");
const User = require("../models/User");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const extractFirstJsonObject = (text = "") => {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
};

const getDomainAnchoredTitle = (domain, aiTitle, explicitTitle) => {
  const normalizedDomain = (domain || "").trim();
  const preferredTitle = (explicitTitle || aiTitle || "").trim();

  if (!normalizedDomain) {
    return preferredTitle || "Career Advancement Path";
  }

  if (preferredTitle && preferredTitle.toLowerCase().includes(normalizedDomain.toLowerCase())) {
    return preferredTitle;
  }

  return `${normalizedDomain} Career Advancement Path`;
};

const buildPhaseTasks = (phase = {}) => {
  const rawTasks = Array.isArray(phase.tasks) ? phase.tasks : [];
  const cleaned = rawTasks
    .map((task) => {
      if (typeof task === "string") {
        const title = task.trim();
        return title ? { title, difficulty: "Medium" } : null;
      }

      if (task && typeof task === "object") {
        const title = (task.title || "").trim();
        if (!title) return null;
        return {
          title,
          difficulty: task.difficulty || "Medium",
        };
      }

      return null;
    })
    .filter(Boolean);

  if (cleaned.length > 0) return cleaned;

  const phaseTitle = phase.title || "this phase";
  return [
    { title: `Learn core concepts for ${phaseTitle}`, difficulty: "Easy" },
    { title: `Build one mini project for ${phaseTitle}`, difficulty: "Medium" },
    { title: `Document and review your progress in ${phaseTitle}`, difficulty: "Medium" }
  ];
};

const normalizeText = (value = "") => String(value || "").trim().toLowerCase();

const daysUntil = (dateValue) => {
  const now = new Date();
  const target = new Date(dateValue);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const toOneDecimal = (value) => Math.round(value * 10) / 10;

const buildPathSignature = ({ domain, goal, title, completionDeadline, phases = [] }) => {
  const phaseTitles = (Array.isArray(phases) ? phases : [])
    .map((p) => normalizeText(p?.title))
    .filter(Boolean);

  return JSON.stringify({
    domain: normalizeText(domain),
    goal: normalizeText(goal),
    title: normalizeText(title),
    completionDeadline: normalizeText(completionDeadline),
    phaseTitles,
  });
};

const dedupePathsBySignature = (paths = []) => {
  const seen = new Set();
  const result = [];

  for (const path of paths) {
    const signature = path.signature || buildPathSignature({
      domain: path.domain,
      goal: path.goal,
      title: path.title,
      completionDeadline: path.completionDeadline,
      phases: path.phases,
    });

    if (seen.has(signature)) continue;
    seen.add(signature);
    result.push(path);
  }

  return result;
};

const savePathAndTasks = async ({ userId, domain, goal, title, completionDeadline, data }) => {
  const resolvedTitle = getDomainAnchoredTitle(domain, data.title, title);
  const incomingSignature = buildPathSignature({
    domain,
    goal,
    title: resolvedTitle,
    completionDeadline,
    phases: data.phases || [],
  });

  const duplicatePath = await Path.findOne({ userId, signature: incomingSignature });

  if (duplicatePath) {
    return { path: duplicatePath, created: false };
  }

  const newPath = new Path({
    userId,
    title: resolvedTitle,
    description: data.description || `A roadmap to become a ${goal}`,
    domain,
    goal,
    completionDeadline,
    recommendedDailyHours: data?.completionPlan?.recommendedDailyHours,
    estimatedTotalHours: data?.completionPlan?.estimatedTotalHours,
    targetDays: data?.completionPlan?.targetDays,
    signature: incomingSignature,
    phases: (data.phases || []).map((phase, index) => ({
      title: phase.title,
      description: phase.description,
      trendInsight: phase.trendInsight,
      demandLevel: phase.demandLevel || "Medium",
      order: index + 1,
      status: index === 0 ? "in-progress" : "pending",
    })),
    marketInsights: data.marketInsights || []
  });

  try {
    await newPath.save();
  } catch (saveError) {
    if (saveError?.code === 11000) {
      const existing = await Path.findOne({ userId, signature: incomingSignature });
      if (existing) {
        return { path: existing, created: false };
      }
    }
    throw saveError;
  }

  const taskPromises = [];
  (data.phases || []).forEach((phase, pIdx) => {
    const dbPhase = newPath.phases[pIdx];
    if (!dbPhase) return;

    const phaseTasks = buildPhaseTasks(phase);

    phaseTasks.forEach((taskObj, tIdx) => {
      taskPromises.push(new Task({
        userId,
        pathId: newPath._id,
        phaseId: dbPhase._id,
        title: taskObj.title,
        difficulty: taskObj?.difficulty || "Medium",
        order: tIdx + 1,
        dueDate: new Date(Date.now() + (pIdx * 7 + tIdx) * 24 * 60 * 60 * 1000),
      }).save());
    });
  });

  await Promise.all(taskPromises);

  const Notification = require("../models/Notification");
  await new Notification({
    userId,
    title: "🚀 New Roadmap Ready!",
    message: `Your strategic plan for ${domain} is live. Start your journey now!`,
    type: "path"
  }).save();

  return { path: newPath, created: true };
};

// @route   POST /api/path/generate
// @desc    Generate career path using AI and store in DB
router.post("/generate", authMiddleware, async (req, res) => {
  const { domain, skills, goal, title, completionDeadline, previewOnly = false } = req.body;
    if (!completionDeadline) {
      return res.status(400).json({ message: "Completion deadline is required." });
    }

    const parsedDeadline = new Date(completionDeadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Invalid completion deadline." });
    }

    const targetDays = daysUntil(parsedDeadline);


  try {
    // 1. Premium check
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle expiry check
    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      user.isPremium = false;
      await user.save();
    }

    const pathCount = await Path.countDocuments({ userId: req.user.userId });
    
    // Enforcement: Max 2 paths for free users
    if (!user.isPremium && pathCount >= 2) {
      return res.status(403).json({ 
        message: "Free users can only create up to 2 career paths. Upgrade to Pro for unlimited access.",
        isLimitReached: true
      });
    }

    // 2. AI Generate Path logic
    const prompt = `You are an expert career advisor + job market analyst.

Input:
* Domain: ${domain}
* Current Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
* Goal: ${goal}
* Completion Deadline: ${parsedDeadline.toISOString().split('T')[0]}
* Remaining Days: ${targetDays}

Analyze:
* Current industry trends
* Future demand (next 3-5 years)
* High-paying roles
* Emerging technologies

Generate a structured career plan in JSON.
STRICT RULES:
* Output ONLY valid JSON
* Use ONLY professional, industry-recognized job roles (e.g., Software Engineer, Data Scientist, Frontend Developer).
* NEVER use creative or unrealistic titles like "Hero", "Ninja", "Rich", or "Money Maker".
* No markdown or extra text.

JSON FORMAT:
{
  "title": "Path Title",
  "description": "Short overview",
  "completionPlan": {
    "deadline": "YYYY-MM-DD",
    "targetDays": ${targetDays},
    "estimatedTotalHours": 120,
    "recommendedDailyHours": 2.5,
    "planNote": "Short motivational guidance tied to the deadline"
  },
  "phases": [
    {
      "title": "Phase name",
      "description": "what to learn",
      "trendInsight": "Why this is trending now",
      "demandLevel": "High/Medium/Low",
      "tasks": [
        { "title": "Sub-task name", "difficulty": "Easy/Medium/Hard" }
      ]
    }
  ],
  "marketInsights": [
    {
      "role": "Specific Professional Job Role",
      "avgSalary": "$XXX,XXX",
      "demandLevel": "High/Medium/Low",
      "growthRate": "+XX%",
      "skillsRequired": ["Skill A", "Skill B"]
    }
  ]
}

Make phases realistic and tasks very small and actionable.
The completionPlan must align with the provided deadline and remaining days.`;

    const PRIMARY_MODEL = process.env.AI_MODEL || "deepseek-ai/deepseek-r1";
    const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "meta/llama-3.1-70b-instruct";

    let completion;
    let usedModel = PRIMARY_MODEL;

    try {
      completion = await openai.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        top_p: 0.7,
        max_tokens: 4096,
      });
    } catch (primaryError) {
      if (primaryError.status === 410 || primaryError.status === 404) {
        usedModel = FALLBACK_MODEL;
        completion = await openai.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          top_p: 0.7,
          max_tokens: 4096,
        });
      } else {
        throw primaryError;
      }
    }

    let content = completion.choices[0]?.message?.content || "";
    if (content.includes("```")) {
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    const jsonCandidate = extractFirstJsonObject(content) || content;

    let data;
    try {
      data = JSON.parse(jsonCandidate);
    } catch (parseError) {
      console.error("Path Generation JSON Parse Error:", parseError.message);
      console.error("AI Raw Content (first 500 chars):", content.slice(0, 500));
      return res.status(502).json({
        message: "AI returned an invalid response format. Please try again."
      });
    }

    const tasksCount = (data?.phases || []).reduce((acc, phase) => acc + buildPhaseTasks(phase).length, 0);
    const fallbackTotalHours = Math.max(20, tasksCount * 2);
    const aiTotalHoursRaw = Number(data?.completionPlan?.estimatedTotalHours);
    const aiDailyHoursRaw = Number(data?.completionPlan?.recommendedDailyHours);
    const estimatedTotalHours = Number.isFinite(aiTotalHoursRaw) && aiTotalHoursRaw > 0
      ? toOneDecimal(aiTotalHoursRaw)
      : toOneDecimal(fallbackTotalHours);
    const recommendedDailyHours = Number.isFinite(aiDailyHoursRaw) && aiDailyHoursRaw > 0
      ? toOneDecimal(aiDailyHoursRaw)
      : toOneDecimal(estimatedTotalHours / targetDays);

    data.completionPlan = {
      deadline: parsedDeadline.toISOString().split('T')[0],
      targetDays,
      estimatedTotalHours,
      recommendedDailyHours,
      planNote: data?.completionPlan?.planNote || "Stay consistent daily to hit your deadline confidently."
    };

    if (previewOnly) {
      const previewPath = {
        title: getDomainAnchoredTitle(domain, data.title, title),
        description: data.description || `A roadmap to become a ${goal}`,
        domain,
        goal,
        completionDeadline: data.completionPlan.deadline,
        recommendedDailyHours: data.completionPlan.recommendedDailyHours,
        estimatedTotalHours: data.completionPlan.estimatedTotalHours,
        targetDays: data.completionPlan.targetDays,
        phases: (data.phases || []).map((phase, index) => ({
          _id: `preview-${Date.now()}-${index}`,
          title: phase.title,
          description: phase.description,
          trendInsight: phase.trendInsight,
          demandLevel: phase.demandLevel || "Medium",
          order: index + 1,
          status: index === 0 ? "in-progress" : "pending",
          tasks: buildPhaseTasks(phase)
        })),
        marketInsights: data.marketInsights || [],
        isPreview: true
      };

      return res.status(200).json(previewPath);
    }

    const { path: savedPath, created } = await savePathAndTasks({
      userId: req.user.userId,
      domain,
      goal,
      title,
      completionDeadline: parsedDeadline,
      data
    });

    res.status(created ? 201 : 200).json(savedPath);
  } catch (error) {
    console.error("Path Generation Error:", error);
    res.status(500).json({ message: "Failed to generate AI roadmap", error: error.message });
  }
});

// @route   POST /api/path/save-generated
// @desc    Save already generated preview path to DB (called on Focus Task)
router.post("/save-generated", authMiddleware, async (req, res) => {
  const {
    title,
    description,
    domain,
    goal,
    phases,
    marketInsights,
    completionDeadline,
    recommendedDailyHours,
    estimatedTotalHours,
    targetDays,
  } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      user.isPremium = false;
      await user.save();
    }

    const pathCount = await Path.countDocuments({ userId: req.user.userId });
    if (!user.isPremium && pathCount >= 2) {
      return res.status(403).json({
        message: "Free users can only create up to 2 career paths. Upgrade to Pro for unlimited access.",
        isLimitReached: true
      });
    }

    const generatedData = {
      title,
      description,
      phases: phases || [],
      marketInsights: marketInsights || [],
      completionPlan: {
        recommendedDailyHours,
        estimatedTotalHours,
        targetDays,
      }
    };

    const { path: savedPath, created } = await savePathAndTasks({
      userId: req.user.userId,
      domain,
      goal,
      title,
      completionDeadline,
      data: generatedData
    });

    res.status(created ? 201 : 200).json(savedPath);
  } catch (error) {
    console.error("Save Generated Path Error:", error);
    res.status(500).json({ message: "Failed to save generated roadmap", error: error.message });
  }
});

// @route   GET /api/path
// @desc    Get user paths (limit 2 for free users)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let paths = await Path.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    paths = dedupePathsBySignature(paths);
    
    // Enforcement: Return only latest 2 paths for free users
    if (!user.isPremium) {
      paths = paths.slice(0, 2);
    }

    res.json(paths);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/path/:id
// @desc    Delete a user roadmap and all related tasks
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const path = await Path.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!path) {
      return res.status(404).json({ message: "Path not found" });
    }

    await Task.deleteMany({ userId: req.user.userId, pathId: path._id });
    await Path.deleteOne({ _id: path._id, userId: req.user.userId });

    res.json({ message: "Roadmap and related tasks deleted successfully" });
  } catch (error) {
    console.error("Delete Path Error:", error);
    res.status(500).json({ message: "Failed to delete roadmap", error: error.message });
  }
});

module.exports = router;
