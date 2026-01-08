const db = require('../config/database');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.parseSMS = async (req, res) => {
  const { smsText, userId } = req.body;
  try {
    const aiRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "Extract JSON: { amount: number, type: 'credit'|'debit', category: 'Food'|'Transport'|'Bills'|'Other', description: string }." }, { role: "user", content: smsText }]
    });
    const data = JSON.parse(aiRes.choices[0].message.content);
    
    db.run(`INSERT INTO transactions (userId, amount, type, category, description) VALUES (?, ?, ?, ?, ?)`,
      [userId, data.amount, data.type, data.category, data.description],
      function(err) { res.json({ ...data, id: this.lastID }); }
    );
  } catch (e) {
    // Regex Fallback
    const amount = parseFloat(smsText.match(/₦([\d,]+)/)?.[1].replace(/,/g, '') || 0);
    const type = smsText.toLowerCase().includes('credit') ? 'credit' : 'debit';
    res.json({ amount, type, category: "Uncategorized", description: "Regex Parsed" });
  }
};

exports.getTransactions = (req, res) => {
  db.all(`SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC`, [req.query.userId], (err, rows) => res.json(rows));
};