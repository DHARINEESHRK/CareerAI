const express = require("express");
const OpenAI = require("openai");
const authMiddleware = require("../middleware/authMiddleware");

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

router.post("/generate", authMiddleware, async (req, res) => {
  const { domain, skills, goal } = req.body;

  if (!domain || !skills || !goal) {
    return res.status(400).json({ message: "Domain, skills, and goal are required" });
  }

  try {
    const prompt = `You are a career mentor AI.

Given:
* Domain: ${domain}
* Current Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
* Goal: ${goal}

Generate a structured career plan.

STRICT RULES:
* Output ONLY valid JSON
* No explanations
* No markdown

JSON FORMAT:
{
  "path": [
    {
      "title": "Phase name",
      "duration": "time range",
      "description": "what to learn"
    }
  ],
  "tasks": [
    {
      "day": "Day 1",
      "tasks": ["task1", "task2"],
      "phase": "Phase name"
    }
  ]
}

Make:
* Path realistic and step-by-step
* Tasks detailed and actionable
* Tasks aligned with path
* Timeline progressive (beginner → advanced)`;

    const PRIMARY_MODEL = process.env.AI_MODEL || "deepseek-ai/deepseek-r1";
    const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "meta/llama-3.3-70b-instruct";

    let completion;
    let usedModel = PRIMARY_MODEL;

    try {
      completion = await openai.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        top_p: 0.7,
        max_tokens: 4096,
        stream: false,
      });
    } catch (primaryError) {
      console.error("PRIMARY MODEL ERROR (AI Route):", primaryError.status, primaryError.message);
      if (primaryError.status === 410 || primaryError.status === 404) {
        usedModel = FALLBACK_MODEL;
        completion = await openai.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          top_p: 0.7,
          max_tokens: 4096,
          stream: false,
        });
      } else {
        throw primaryError;
      }
    }

    const reasoning = completion.choices[0]?.message?.reasoning_content;
    void reasoning;

    let content = completion.choices[0]?.message?.content || "";

    // Clean markdown formatting if present
    if (content.includes("```")) {
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    const jsonCandidate = extractFirstJsonObject(content) || content;

    try {
      const parsedData = JSON.parse(jsonCandidate);
      res.json(parsedData);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError.message);
      res.status(502).json({ message: "AI generated invalid JSON. Please try again." });
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Failed to generate AI roadmap", error: error.message });
  }
});

module.exports = router;
