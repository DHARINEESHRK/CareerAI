const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// @route   POST /api/chat
// @desc    Career AI Chatbot with context
router.post("/", authMiddleware, async (req, res) => {
  const { message, context } = req.body;

  try {
    const isPersonalQuery = /my path|my task|what should i do next|am i on track|my goal/i.test(message);
    
    let contextString = "";
    if (isPersonalQuery && context) {
      contextString = `
      User Current Context:
      - Active Path: ${JSON.stringify(context.path?.title || "None")}
      - Current Phase: ${JSON.stringify(context.path?.phases?.find(p => p.status === 'in-progress')?.title || "None")}
      - Tasks To Do: ${JSON.stringify(context.tasks?.filter(t => !t.completed).slice(0, 5).map(t => t.title).join(", ")) || "None"}
      `;
    }

    const systemPrompt = `You are "CareerAI Mentor", a helpful and professional career advisor.
    
    ${contextString}

    RULES:
    1. If the user asks about their own progress/tasks, use the provided context to give specific advice.
    2. If the user asks general career questions, provide industry-leading insights and trends.
    3. Be concise, encouraging, and clear.
    4. Format multi-step advice using bullet points.
    5. If context is missing for a personal question, politely ask them to generate a path first.`;

    const MODEL = process.env.AI_MODEL || "deepseek-ai/deepseek-r1";
    const FALLBACK = process.env.FALLBACK_MODEL || "meta/llama-3.1-70b-instruct";

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
    } catch (err) {
      completion = await openai.chat.completions.create({
        model: FALLBACK,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
    }

    const responseContent = completion.choices[0]?.message?.content;

    res.json({
      role: "assistant",
      content: responseContent
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ message: "Chatbot is temporarily offline" });
  }
});

module.exports = router;
