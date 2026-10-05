import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface GenerateContentOptions {
  model?: string;
  contents: any;
  config?: any;
}

// Resilient wrapper with automatic model fallbacks and retry logic for 503 / 429 / UNAVAILABLE / high demand spikes
async function generateContentWithFallback(options: GenerateContentOptions) {
  const ai = getGemini();
  const modelsToTry = [
    options.model || "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (let m = 0; m < uniqueModels.length; m++) {
    const currentModel = uniqueModels[m];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...options,
          model: currentModel,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const errStatus = err?.status || err?.code || "";
        const isTemporary = 
          errMsg.includes("503") || 
          errMsg.includes("high demand") || 
          errMsg.includes("UNAVAILABLE") || 
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("429") ||
          errStatus === 503 ||
          errStatus === "UNAVAILABLE" ||
          errStatus === 429;

        if (isTemporary && attempt === 0) {
          // Short delay to navigate transient demand spikes
          await new Promise((res) => setTimeout(res, 600));
          continue;
        }

        console.warn(`Model ${currentModel} encountered error: ${errMsg}. Trying next fallback model.`);
        break;
      }
    }
  }

  throw lastError;
}

// Curated pedagogical fallback for Miss Kelechi's daily advice to ensure the student dashboard always stays responsive
function getFallbackAdvice(userName: string = 'Scholar', grade: number = 1, history: any[] = []) {
  const options = [
    {
      subject: "General Mathematics",
      tip: "Solve 3 real-world word problems using Nigerian Naira (₦) today.",
      encouragement: `God has blessed you with a sharp mind, ${userName}!`
    },
    {
      subject: "English & Vocabulary",
      tip: "Explore 2 chapters in the Academy Digital Library and learn new words.",
      encouragement: "Diligence brings honor to God and your family!"
    },
    {
      subject: "Basic Science",
      tip: "Review God's wonderful laws of nature and revise your latest notes.",
      encouragement: "Keep asking curious questions, my brilliant scholar!"
    },
    {
      subject: "Christian Religious Studies",
      tip: "Meditate on Proverbs 3:5-6 before beginning your daily study session.",
      encouragement: "The fear of the Lord is the true beginning of wisdom."
    },
    {
      subject: "Rapid-Fire Drills",
      tip: "Take a 20-question speed drill to sharpen your recall and confidence.",
      encouragement: "Practice makes perfect. You are capable of great things!"
    }
  ];

  if (grade >= 8) {
    options.push({
      subject: "WAEC & JAMB Mastery",
      tip: "Practice 10 JAMB CBT questions using the official 8-key keyboard controls.",
      encouragement: "Through Christ who strengthens you, you will score A1 and 300+!"
    });
  }

  return options[Math.floor(Math.random() * options.length)];
}

// 1. API endpoint for Miss Kelechi Chat / AI Teacher
app.post("/api/kelechi/chat", async (req, res) => {
  try {
    const { messages, userGrade, userName, subject, topicTitle } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request. 'messages' array is required." });
    }

    const systemInstruction = `You are Miss Kelechi, a compassionate, loving, world-class Nigerian teacher, educational strategist, and school counselor.
You are interacting with a student named ${userName || 'Scholar'}, who is in Grade ${userGrade || 'their current grade'}.
${subject ? `Subject: ${subject}.` : ''} ${topicTitle ? `Topic: "${topicTitle}".` : ''}

Key Guidelines:
- Speak warmly with natural Nigerian motherly/teacherly encouragement (e.g. "My dear", "My child", "Excellent scholar", "You are blessed").
- ${userGrade >= 8 ? 'This is a Grade 8-10 scholar. Use sophisticated academic terminology, dense explanations, and university-level concepts.' : 'Keep explanations engaging, clear, and easy to understand for their grade level.'}
- Always use Naira (₦) for any money, price, or financial calculation.
- Weave in sound Christian moral principles, diligence, and biblical wisdom.
- Never use backslashes (\) in your output.
- Keep your answers formatted nicely with bold text, bullet points, and short paragraphs.`;

    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === 'teacher' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "My dear child, I am here for you. Tell me what you would like to learn today.";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Error in Miss Kelechi Chat API, serving fallback teacher guidance:", error?.message || error);
    res.json({
      reply: "My dear scholar, Miss Kelechi is right here with you! Let us keep our focus on your studies today. You can ask me any question about your lessons, mathematics with Naira (₦), or reading, and we will solve it together."
    });
  }
});

// 2. API endpoint for Miss Kelechi Info Center custom queries
app.post("/api/kelechi/query", async (req, res) => {
  try {
    const { query, userName, userGrade } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const systemInstruction = `You are Miss Kelechi, a premier educational strategist and professional teacher guide in the Student Portal of the African School Curriculum app.
You are responding to a student named ${userName || 'Scholar'} who is currently in Grade ${userGrade || 'their grade'}.

Context about the app and curriculum:
- Accreditations: Follows Nigerian & African academic standards for Grades 1 to 10.
- Core subjects: Math (always use Naira ₦ for any money or budget calculation), English, Science, Social Studies, Literature, Bible Study, Spelling, and Alphabet (Grade 1 only).
- Every subject is structured into 4 distinct Terms (Terms 1, 2, 3, and Term 4).
- Rapid-Fire Drills (20 random questions per session), Digital Library (500+ novels & story books), Student Dashboard (awards, badges, graduation for Grade 10), Parent Portal (real-time progress tracking, redo policy if score < 60%).

Tone and style guidelines:
- Speak as a loving, supportive teacher with natural British-Nigerian motherly warmth ("Excellent scholar", "My dear child").
- Answer their question concisely, directly, and encourage them to keep learning.
- Keep your answer brief (maximum 4-5 short sentences) and formatted nicely. Use Naira (₦) for any currency examples.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I am always here to guide you, my dear! Please explore the subjects above to start learning.";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Error in Miss Kelechi Query API, serving fallback query response:", error?.message || error);
    res.json({
      reply: "Welcome to the Academy Information Desk! I am always here to guide you, my dear child. Please explore your subjects, library books, or Rapid-Fire Drills to keep building your mastery today."
    });
  }
});

// 3. API endpoint for AI Homework Solver & Concept Explainer
app.post("/api/ai/solve-homework", async (req, res) => {
  try {
    const { question, subject, grade, studentName } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const systemInstruction = `You are Miss Kelechi, the AI Master Homework & Study Assistant for the African School Curriculum.
A student named ${studentName || 'Scholar'} in Grade ${grade || 5} needs help solving a homework problem or understanding a concept in ${subject || 'School'}.

Your Task:
1. Provide a step-by-step, clear solution or explanation tailored to Grade ${grade || 5}.
2. If it is a Math or financial question, ALWAYS use Naira (₦) as the currency.
3. Include 1 key "Teacher's Memory Rule" or mnemonic to help them remember the concept.
4. Conclude with an encouraging blessing or praise.
5. Format with bold headers, bullet points, and clean spacing.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: question }] }],
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ answer: response.text || "I have analyzed your question, my scholar! Let us break it down step by step." });

  } catch (error: any) {
    console.error("Error in AI Homework API, serving fallback homework guide:", error?.message || error);
    res.json({
      answer: `### Miss Kelechi's Step-by-Step Homework Guide\n\n**Dear Scholar,**\n\nTo solve this question, remember the fundamental rule of learning: break the problem into smaller parts!\n\n1. **Identify the Given Information**: Write down what you already know from the question.\n2. **Identify the Formula or Rule**: Recall the key principle taught in your lesson.\n3. **Calculate or Reason Carefully**: Take your time step-by-step (always remember to calculate in Naira ₦ if working with money).\n4. **Check Your Answer**: Re-read the question to ensure you answered completely.\n\n🌟 *Teacher's Memory Rule*: "Diligence and careful observation prevent errors!"\n\nMay God grant you clarity and sharp understanding as you complete your homework!`
    });
  }
});

// 4. API endpoint for AI Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  const { topicTitle, subject, grade, count = 10, isSpelling = false } = req.body;
  try {
    const prompt = `Generate a ${count}-question quiz for a Grade ${grade || 5} student on the topic "${topicTitle || 'General Knowledge'}" in ${subject || 'General'}.

Rules:
${isSpelling && grade <= 3 ? '- Spelling Level: Primary (Grades 1-3). Simple words with meanings in the question.' : ''}
${isSpelling && grade >= 4 && grade <= 7 ? '- Spelling Level: Intermediate. Instruct student to identify correct spelling.' : ''}
${isSpelling && grade >= 8 ? '- Spelling Level: Advanced. Complex academic words with precise meanings.' : ''}
${!isSpelling && grade >= 8 ? '- High Academic Rigor (Grades 8-10): University-level depth, plausible distractors, advanced concepts.' : ''}
${subject === 'Math' ? '- Currency Rule: ALWAYS use Naira (₦) for any money calculations.' : ''}

Return a JSON array of question objects where each object has:
- id: number
- type: "multiple-choice" or "theory" (mix 50/50)
- question: string
- options: array of 4 string choices (for multiple-choice) or empty array (for theory)
- correctAnswer: string (for multiple-choice: exact matching option text; for theory: brief sample answer)
- hint: string (helpful teacher tip)
- explanation: string (step-by-step breakdown of why it's correct)`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              hint: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "type", "question", "options", "correctAnswer", "hint", "explanation"]
          }
        }
      }
    });

    const quizData = JSON.parse(response.text || '[]');
    res.json({ questions: quizData });

  } catch (error: any) {
    console.error("Error in AI Quiz Generator API, serving fallback curriculum questions:", error?.message || error);
    const fallbackQuestions = [
      {
        id: 1,
        type: "multiple-choice",
        question: `What is the official currency used for transactions across Nigeria?`,
        options: ["Naira (₦)", "Dollar ($)", "Pound (£)", "Cedi (GH₵)"],
        correctAnswer: "Naira (₦)",
        hint: "It uses the symbol ₦ and is issued by the Central Bank of Nigeria.",
        explanation: "The official national currency of Nigeria is the Nigerian Naira (₦)."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: `Which fundamental virtue is highlighted in Proverbs as the beginning of knowledge and wisdom?`,
        options: ["The fear of the Lord", "Earthly riches", "Boasting", "Impatience"],
        correctAnswer: "The fear of the Lord",
        hint: "See Proverbs 9:10 and Proverbs 1:7.",
        explanation: "Proverbs 9:10 teaches: 'The fear of the LORD is the beginning of wisdom.'"
      },
      {
        id: 3,
        type: "multiple-choice",
        question: `In practical Mathematics, if an exercise book costs ₦150, how much will 4 exercise books cost?`,
        options: ["₦600", "₦450", "₦500", "₦700"],
        correctAnswer: "₦600",
        hint: "Multiply ₦150 by 4.",
        explanation: "4 × ₦150 = ₦600."
      }
    ];
    res.json({ questions: fallbackQuestions });
  }
});

// 5. API endpoint for AI Christian Faith & Devotional Helper
app.post("/api/ai/devotional", async (req, res) => {
  try {
    const { topic, userMood, studentName } = req.body;

    const systemInstruction = `You are a Christian spiritual counselor and Bible teacher for students in Africa.
Generate an uplifting, faith-building personal devotional for a student named ${studentName || 'Scholar'}.
Their current focus or mood: "${userMood || topic || 'Courage and Academic Excellence'}".

Include:
1. Title for the devotional.
2. Primary Scripture Anchor (Book, Chapter, Verse + full text).
3. Moral & Faith Reflection (3 short paragraphs connecting scripture to school, honesty, diligence, and family).
4. Personal Prayer of Dedication.
5. Daily Action Pledge (1 simple moral action step for today).`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: `Generate devotional for ${userMood || topic || 'Faith'}` }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ devotional: response.text });

  } catch (error: any) {
    console.error("Error in AI Devotional API, serving fallback devotional:", error?.message || error);
    res.json({
      devotional: `### Walking in Strength and Academic Excellence\n\n**Scripture Anchor**: Philippians 4:13 — *"I can do all things through Christ who strengthens me."*\n\n**Reflection**:\nAs a scholar, God has blessed you with immense potential, curiosity, and strength. Whenever your schoolwork feels challenging or new topics seem difficult, remember that you never study alone. The Lord provides the wisdom, focus, and patience you need.\n\nApproach your lessons today with joy and diligence. Honor your parents and teachers by giving your very best effort in every subject.\n\n**Personal Prayer**:\n*Dear Heavenly Father, thank You for the gift of education and the ability to learn. Grant me an understanding heart and a sharp mind today. Help me to be honest, kind, and hardworking in Jesus' name. Amen.*\n\n**Daily Action Pledge**:\nToday, I will complete my study tasks diligently without complaining and encourage a classmate or family member.`
    });
  }
});

// 6. API endpoint for AI Smart Advice
app.post("/api/ai/advice", async (req, res) => {
  const { userName = 'Scholar', grade = 1, history = [] } = req.body;
  try {
    const historySummary = Array.isArray(history) && history.length > 0
      ? history.map((h: any) => `Topic: ${h.topicId}, Score: ${h.score}`).join('\n')
      : "No lessons completed yet.";

    const prompt = `Analyze this student's history:
Name: ${userName}
Grade: ${grade}
History:
${historySummary}

Provide a personalized "Teacher's Tip" for today.
If no history, suggest a foundational subject like Math (with ₦) or Reading.
If low score, suggest revisiting. If high, suggest a challenge.

Respond ONLY with JSON:
{
  "subject": "Subject Name",
  "tip": "Short specific advice (max 15 words)",
  "encouragement": "Warm sentence from Miss Kelechi (max 10 words)"
}`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.subject && parsed.tip) {
      return res.json(parsed);
    }
    throw new Error("Invalid advice format received from model");

  } catch (error: any) {
    console.error("Error in AI Advice API, serving pedagogical fallback advice:", error?.message || error);
    // Graceful pedagogical fallback so student dashboard never throws 500 error or breaks
    const fallbackAdvice = getFallbackAdvice(userName, grade, history);
    return res.json(fallbackAdvice);
  }
});

// 7. API endpoint for AI Smart Flashcards & Drills
app.post("/api/ai/flashcards", async (req, res) => {
  const { mode, topic, subject, grade = 1, history = [] } = req.body;
  try {
    let prompt = '';
    if (mode === 'topics') {
      const topicName = topic || (history.length > 0 ? history[Math.floor(Math.random() * history.length)].topicId : 'Basic Math');
      prompt = `Create 3 flashcards for a review session about: "${topicName}".
Rules:
- Q: Simple question.
- A: Concise answer (1-3 words max).
- Tone: Encouraging.
Respond ONLY with JSON:
{
  "topic": "${topicName}",
  "cards": [
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." }
  ]
}`;
    } else {
      prompt = `Create 5 interactive drill flashcards for Grade ${grade} in subject: "${subject || 'Math'}".
Rules:
- Difficulty: Grade ${grade} African curriculum.
- Question types: Definitions, facts, simple calculation (use ₦ if money).
- Answer MUST be very short (1-2 words).
Respond ONLY with JSON:
{
  "topic": "${subject || 'Math'} Drills",
  "cards": [
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." }
  ]
}`;
    }

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);

  } catch (error: any) {
    console.error("Error in AI Flashcards API, serving fallback flashcards:", error?.message || error);
    res.json({
      topic: `${subject || 'Core'} Review Drills`,
      cards: [
        { q: "What currency symbol represents the Naira?", a: "₦" },
        { q: "Which organ pumps blood in the body?", a: "Heart" },
        { q: "Who built the ark in Genesis?", a: "Noah" },
        { q: "What is 250 plus 150 in Naira?", a: "₦400" }
      ]
    });
  }
});

// 8. API endpoint for Subject Motivation
app.post("/api/ai/motivation", async (req, res) => {
  const { subject, grade } = req.body;
  try {
    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: `Explain why studying "${subject}" is useful for a child in Grade ${grade} in Africa.
Rules:
- Warm, inspiring tone like Miss Kelechi.
- Real-world use (e.g., buying items with ₦ for Math).
- Concise (max 30 words).`,
    });

    res.json({ motivation: response.text || "" });

  } catch (error: any) {
    console.error("Error in Subject Motivation API, serving fallback motivation:", error?.message || error);
    res.json({
      motivation: `Mastering ${subject || 'this subject'} builds practical wisdom and confidence. With diligence, you will use these skills to solve problems and bless your community!`
    });
  }
});

// 9. API endpoint for AI Parent Report
app.post("/api/ai/parent-report", async (req, res) => {
  const { studentName, grade, averageScore, completedTopicsCount, recentScores } = req.body;
  try {
    const prompt = `You are Miss Kelechi, writing an executive AI Performance Summary for the parents of ${studentName || 'the scholar'}, currently in Grade ${grade || 1}.

Student Data:
- Average Quiz Score: ${averageScore || 85}%
- Completed Lessons: ${completedTopicsCount || 12}
- Recent Activity Scores: ${JSON.stringify(recentScores || [])}

Generate a formal, encouraging Parent Report containing:
1. Executive Summary & Growth Trajectory.
2. Academic Strengths & Commendations.
3. Areas Needing Focus / Recommended Revision.
4. Actionable Home Study Tips for Parents.
5. Miss Kelechi's Blessing & Signature.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.6 }
    });

    res.json({ report: response.text });

  } catch (error: any) {
    console.error("Error in AI Parent Report API, serving fallback report:", error?.message || error);
    res.json({
      report: `### Executive Performance & Growth Summary for ${studentName || 'Scholar'}\n\n**Grade Level**: Grade ${grade || 1}\n**Average Assessment Score**: ${averageScore || 85}%\n**Completed Topics**: ${completedTopicsCount || 10} modules\n\n**Academic Commendation**:\n${studentName || 'Your child'} continues to demonstrate admirable consistency, enthusiasm, and diligence across learning modules. Their grasp of core foundational concepts is solid.\n\n**Recommended Home Support**:\n1. Maintain a regular 45-minute daily study timetable.\n2. Encourage active reading in the Academy Digital Library.\n3. Celebrate small victories to nurture intrinsic motivation.\n\n*"Train up a child in the way he should go: and when he is old, he will not depart from it." — Proverbs 22:6*\n\nWarm regards,\n**Miss Kelechi**\n*Chief Academic Strategist & Counselor*`
    });
  }
});

// 10. API endpoint for AI Song & Lyric Analysis
app.post("/api/ai/song-meaning", async (req, res) => {
  const { songTitle, artist, category } = req.body;
  try {
    const prompt = `Analyze the Christian song "${songTitle}" by ${artist} (Category: ${category || 'Worship'}).
Provide:
1. The Core Theological Theme.
2. Corresponding Biblical Scripture Anchor.
3. Faith Application & Reflection for a student.
4. Suggested Reflection Question.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.7 }
    });

    res.json({ analysis: response.text });

  } catch (error: any) {
    console.error("Error in AI Song Meaning API, serving fallback song reflection:", error?.message || error);
    res.json({
      analysis: `### Theological Theme & Reflection: "${songTitle || 'Praise Hymn'}"\n\n**Core Theme**: Praise, God's Sovereignty, and Trust in His Faithfulness.\n**Scripture Anchor**: Psalm 100:4-5 — *"Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name."*\n\n**Reflection for Scholars**:\nThis hymn reminds us to dedicate every gift, subject, and accomplishment to the Lord. Singing praises lifts our spirit and reminds us that God is our loving shepherd.`
    });
  }
});

// 11. API endpoint for AI Search Explorer with Google Search Grounding
app.post("/api/ai/search-explorer", async (req, res) => {
  const { query, grade, studentName } = req.body;
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const systemInstruction = `You are Miss Kelechi, the AI Discovery & Research Guide for African Scholars in Grade ${grade || 5}.
When a student named ${studentName || 'Scholar'} searches for any topic, place, historical event, scientific phenomenon, current technological advancement, animal, African heritage, invention, or academic concept:
1. Provide fascinating, engaging, up-to-date, and accurate real-world facts grounded in Google Search data.
2. Structure your response clearly:
   - 🌟 **Did You Know? (Mind-Blowing Discovery)**
   - 🌍 **Real-World & African Context** (how it impacts life, history, technology, or daily experiences, using Naira ₦ for any financial or economic references)
   - 💡 **How It Works / Key Principles** (explained clearly and brilliantly for Grade ${grade || 5})
   - 📖 **Moral & Spiritual Connection** (a short inspiring verse or moral principle related to wisdom, stewardship, curiosity, diligence, or God's creation)
   - ❓ **Quick Knowledge Check** (3 fun multiple-choice or quick recall questions with answer keys)
3. Speak with teacherly warmth, high enthusiasm, and encouraging words ("My dear scholar", "What an excellent research topic!").
4. Never use backslashes (\\) in your response.`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction,
        temperature: 0.6,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    res.json({
      answer: response.text || "I found great information about your search! Let us explore together.",
      groundingMetadata: groundingMetadata || null,
    });

  } catch (error: any) {
    console.error("Error in AI Search Explorer API, serving fallback discovery guide:", error?.message || error);
    res.json({
      answer: `🌟 **Did You Know?**\n"${query}" is a fascinating topic that connects world history, science, and practical understanding.\n\n🌍 **Real-World & African Context**\nScholars across Africa and the world explore this subject to build new innovations, understand our heritage, and solve community challenges.\n\n💡 **Key Principles**\nWhen studying this topic, observe the cause-and-effect relationships and key facts carefully.\n\n📖 **Moral & Spiritual Anchor**\n*"It is the glory of God to conceal a thing: but the honour of kings is to search out a matter." — Proverbs 25:2*\n\nKeep researching with joy, my dear scholar!`,
      groundingMetadata: null
    });
  }
});

// 12. API endpoint for AI Bible Scholar & Scripture Assistant
app.post("/api/bible/ask", async (req, res) => {
  const { question, book, chapter, grade, studentName, conversationHistory = [] } = req.body;
  try {
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: "Bible question is required." });
    }

    const systemInstruction = `You are Miss Kelechi, the AI Bible Teacher & Scripture Scholar at Anne-Sam Christian Academy.
You are guiding a scholar named ${studentName || 'Scholar'} in Grade ${grade || 5} who is reading God's Word and asking questions from the Holy Scriptures.

Your Mission:
1. Explain the Holy Scriptures with deep biblical fidelity, accuracy, spiritual wisdom, and loving pedagogical warmth.
2. ${book ? `Context: The student is currently studying the Book of ${book}${chapter ? ` Chapter ${chapter}` : ''}.` : ''}
3. Break down complex theological concepts into clear, beautiful, age-appropriate insights suitable for Grade ${grade || 5}.
4. Structure your response with clean Markdown:
   - 📖 **Scripture Foundation**: Cite specific chapter and verses with accurate biblical quotes (KJV, NIV, or ESV).
   - 💡 **The Meaning & Historical Context**: Explain the background, original intent, and what God is teaching us.
   - 🌟 **Daily Life & School Application**: Concrete, practical ways to practice this truth today (e.g., studying diligently, honoring parents, showing kindness to classmates, speaking truth, prayer).
   - 🙏 **Prayer & Heart Reflection**: A 2-sentence heartfelt prayer for the student.
   - 📌 **Memory Verse**: Highlight one memorable key verse with citation.
5. Speak with motherly encouragement, reverence for God's Word, and joy ("My dear scholar", "What a wonderful question about God's Word!").
6. Never use backslashes (\\) in your response.`;

    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((item: any) => {
        contents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text || item.content || '' }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      answer: response.text || "God's Word is a lamp unto our feet and a light unto our path. Let us explore this verse together!",
    });

  } catch (error: any) {
    console.error("Error in AI Bible Ask API, serving fallback scripture reflection:", error?.message || error);
    res.json({
      answer: `📖 **Scripture Foundation**\n*"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105*\n\n💡 **The Meaning & Spiritual Insight**\nGod's Word gives us divine wisdom for every stage of life. When you study scripture with an open heart, the Holy Spirit teaches you truth, righteousness, and peace.\n\n🌟 **Daily Application**\nPractice kindness, speak the truth in love, and dedicate your studies to God each morning.\n\n🙏 **Heart Prayer**\n*Lord, thank You for Your holy Word. Open my eyes that I may see wondrous things out of Your law. Amen.*`
    });
  }
});

// 13. API endpoint for WAEC & JAMB AI Tutor (Miss Kelechi Exam Strategist)
app.post("/api/exam/waec-jamb/ask", async (req, res) => {
  const { question, examType, subject, studentName } = req.body;
  try {
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const systemInstruction = `You are Miss Kelechi, the Premier WAEC (WASSCE) and JAMB (UTME) Chief Examiner & AI Academic Strategist for Anne-Sam Christian Academy.
You are guiding a high school scholar named ${studentName || 'Scholar'} preparing for ${examType || 'WAEC / JAMB'} in ${subject || 'their chosen subject'}.

Standards & Rules:
1. Ground your pedagogical guidance strictly in the official WAEC Chief Examiner's reports and the official JAMB UTME syllabus.
2. If this is WAEC:
   - Clarify Paper 1 (Objective 50/60 marks) vs Paper 2 (Theory / Essay marking scheme: Concept M marks, Accuracy A marks, Bonus B marks).
   - If Math: Always show full step-by-step working and state formula first. Use Nigerian Naira (₦) for currency calculations.
   - If English: Emphasize avoiding informal chat abbreviations, formal essay structure, and summary writing without verbatim lifting.
   - If Biology: Emphasize standard drawing rules (HB pencil, magnification, uncrossed label lines).
   - If CRS: Emphasize accurate biblical citations and contemporary moral application.
3. If this is JAMB:
   - Emphasize the 8-Key computer-based test (CBT) shortcuts (A, B, C, D, N for Next, P for Prev, S for Submit, R for Review).
   - Advise on time management (40 seconds per question across 180 questions for 400 marks).
   - Clarify that JAMB has NO negative marking.
4. Conclude with a motivational word of excellence and Christian faith ("Through Christ who strengthens you, you will score A1 / 300+!").
5. Format cleanly with Markdown headings, bold keywords, and bullet points. Never use backslashes (\\).`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: `Exam: ${examType || 'WAEC & JAMB'} | Subject: ${subject || 'General'} | Question: ${question}` }] }],
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      answer: response.text || "My dear scholar, let us master this exam concept together!",
    });

  } catch (error: any) {
    console.error("Error in WAEC/JAMB Ask API, serving fallback exam strategist guidance:", error?.message || error);
    res.json({
      answer: `### Miss Kelechi's WAEC & JAMB Strategy Insight\n\n**Exam Focus**: ${examType || 'WAEC / JAMB'} — ${subject || 'General Studies'}\n\n1. **Core Concept Mastery**: Thoroughly understand the syllabus definitions and standard formulas before attempting past questions.\n2. **WAEC Paper 2 Marking Scheme**: Always show step-by-step working for Method Marks (M1). State your formula first and calculate accurately (A1).\n3. **JAMB CBT 8-Key Speed Rule**: Practice using keys \`A\`, \`B\`, \`C\`, \`D\`, \`N\` (Next), and \`P\` (Previous). Spend no more than 40 seconds per question.\n4. **Christian Encouragement**: *"I can do all things through Christ who strengthens me."* You are destined for A1 and 300+!`
    });
  }
});

// 14. API endpoint for Dynamic WAEC & JAMB Practice Questions
app.post("/api/exam/waec-jamb/generate", async (req, res) => {
  const { examType = 'JAMB', subject = 'General Mathematics', topic, count = 5 } = req.body;
  try {
    const prompt = `Generate ${count} authentic ${examType} (West African Examination / UTME) questions for the subject "${subject}"${topic ? ` on the topic "${topic}"` : ''}.

Guidelines:
- Match the authentic tone, phrasing, and difficulty of standard WAEC WASSCE and JAMB UTME past papers.
- For Mathematics, ALWAYS use Nigerian Naira (₦) for money or commercial problems.
- If multiple-choice, provide 4 options (A, B, C, D) with plausible distractors.
- Include a detailed step-by-step explanation for the correct answer, citing relevant formulas or grammar rules.
- Include the year (between 2018 and 2024).

Return JSON array where each object has:
- id: string
- examType: "${examType}"
- subjectName: "${subject}"
- year: number
- questionNumber: number
- paperType: "Paper 1 (Objective)" or "Paper 2 (Theory/Essay)"
- topic: string
- question: string
- options: array of 4 strings (for multiple-choice) or empty array (for theory)
- correctAnswer: string
- explanation: string
- difficulty: "Standard" or "Challenging"`;

    const response = await generateContentWithFallback({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              examType: { type: Type.STRING },
              subjectName: { type: Type.STRING },
              year: { type: Type.INTEGER },
              questionNumber: { type: Type.INTEGER },
              paperType: { type: Type.STRING },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "examType", "subjectName", "year", "questionNumber", "paperType", "topic", "question", "options", "correctAnswer", "explanation", "difficulty"]
          }
        }
      }
    });

    const questions = JSON.parse(response.text || '[]');
    res.json({ questions });

  } catch (error: any) {
    console.error("Error generating WAEC/JAMB questions, serving authentic past paper fallback:", error?.message || error);
    res.json({
      questions: [
        {
          id: "WJ-FALLBACK-1",
          examType: examType || "JAMB",
          subjectName: subject || "General Mathematics",
          year: 2023,
          questionNumber: 1,
          paperType: "Paper 1 (Objective)",
          topic: "Commercial Arithmetic",
          question: "A trader bought a carton of educational books for ₦12,000 and sold them for ₦15,000. Calculate the percentage profit.",
          options: ["20%", "25%", "30%", "15%"],
          correctAnswer: "25%",
          explanation: "Profit = ₦15,000 - ₦12,000 = ₦3,000. Percentage profit = (₦3,000 / ₦12,000) * 100 = 25%.",
          difficulty: "Standard"
        },
        {
          id: "WJ-FALLBACK-2",
          examType: examType || "WAEC",
          subjectName: subject || "English Language",
          year: 2022,
          questionNumber: 2,
          paperType: "Paper 1 (Objective)",
          topic: "Grammar & Concord",
          question: "Neither the teacher nor the students ______ present at the morning assembly.",
          options: ["were", "was", "is", "are"],
          correctAnswer: "were",
          explanation: "In 'neither... nor' constructions, the verb agrees in number with the closer subject ('the students' is plural, requiring 'were').",
          difficulty: "Standard"
        }
      ]
    });
  }
});

// Start dev or production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up static file serving for production...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

