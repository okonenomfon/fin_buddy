const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chat = async (req, res) => {
  const { message, context } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are FinBuddy. Context: ${JSON.stringify(context)}. Be helpful and brief.` },
        { role: "user", content: message }
      ]
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (e) { res.status(500).json({ error: "AI Error" }); }
};