const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new Database('finbuddy.db');

// Initialize database with ALL new tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    dark_mode INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
    amount REAL NOT NULL,
    category TEXT,
    vendor TEXT,
    balance REAL,
    sms_text TEXT,
    receipt_path TEXT,
    is_split INTEGER DEFAULT 0,
    split_with TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    deadline DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    limit_amount REAL NOT NULL,
    period TEXT DEFAULT 'monthly',
    alert_threshold REAL DEFAULT 80,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    frequency TEXT NOT NULL,
    next_date DATE NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS budget_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    budget_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (budget_id) REFERENCES budgets (id)
  );
`);

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'finbuddy-secret-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============= AUTHENTICATION =============

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const result = stmt.run(email, hashedPassword, name);
    
    const token = jwt.sign(
      { id: result.lastInsertRowid, email },
      process.env.JWT_SECRET || 'finbuddy-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: result.lastInsertRowid, email, name } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'finbuddy-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        dark_mode: user.dark_mode 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============= NEW FEATURE 1: BULK SMS UPLOAD =============

app.post('/api/transactions/parse-bulk-sms', authenticateToken, async (req, res) => {
  try {
    const { smsArray } = req.body; // Array of SMS strings
    const userId = req.user.id;
    const results = [];
    const errors = [];

    for (let i = 0; i < smsArray.length; i++) {
      const smsText = smsArray[i].trim();
      if (!smsText) continue;

      try {
        // Parse each SMS
        let parsed = {
          type: smsText.toLowerCase().includes('debit') ? 'debit' : 'credit',
          amount: parseFloat(smsText.match(/[\d,]+\.?\d*/)?.[0]?.replace(/,/g, '') || 0),
          category: 'other',
          vendor: 'Unknown',
          balance: null
        };

        const balMatch = smsText.match(/bal:?\s*[₦$]?[\d,]+\.?\d*/i);
        if (balMatch) {
          parsed.balance = parseFloat(balMatch[0].match(/[\d,]+\.?\d*/)[0].replace(/,/g, ''));
        }

        const vendorMatch = smsText.match(/(?:at|from)\s+([a-zA-Z\s]+)/i);
        if (vendorMatch) {
          parsed.vendor = vendorMatch[1].trim();
        }

        const text = smsText.toLowerCase();
        if (text.includes('shoprite') || text.includes('food')) parsed.category = 'food';
        else if (text.includes('uber') || text.includes('transport')) parsed.category = 'transport';
        else if (text.includes('airtime')) parsed.category = 'airtime';
        else if (text.includes('netflix') || text.includes('subscription')) parsed.category = 'entertainment';

        const stmt = db.prepare(`
          INSERT INTO transactions (user_id, type, amount, category, vendor, balance, sms_text)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
          userId, parsed.type, parsed.amount, parsed.category, 
          parsed.vendor, parsed.balance, smsText
        );

        results.push({ id: result.lastInsertRowid, ...parsed, smsText });
        
        // Check budget alerts
        checkBudgetAlert(userId, parsed.category, parsed.amount);
        
      } catch (error) {
        errors.push({ index: i, sms: smsText.substring(0, 50), error: error.message });
      }
    }

    res.json({ 
      success: true, 
      processed: results.length, 
      failed: errors.length,
      results,
      errors 
    });
    
  } catch (error) {
    console.error('Bulk SMS parsing error:', error);
    res.status(500).json({ error: 'Bulk parsing failed' });
  }
});

// ============= NEW FEATURE 2: EXPORT DATA =============

app.get('/api/transactions/export', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'csv' } = req.query;

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(userId);

    if (format === 'csv') {
      const csv = [
        'ID,Date,Type,Amount,Category,Vendor,Balance',
        ...transactions.map(t => 
          `${t.id},${t.date},${t.type},${t.amount},${t.category},${t.vendor},${t.balance || ''}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    } else {
      res.json(transactions);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// ============= NEW FEATURE 3: MONTHLY REPORTS =============

app.get('/api/reports/monthly', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    const monthStr = month || new Date().getMonth() + 1;
    const yearStr = year || new Date().getFullYear();

    const report = db.prepare(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spending,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_income,
        AVG(CASE WHEN type = 'debit' THEN amount END) as avg_transaction
      FROM transactions
      WHERE user_id = ? 
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
    `).get(userId, String(monthStr).padStart(2, '0'), yearStr);

    const categoryBreakdown = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = ? 
      AND type = 'debit'
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
      GROUP BY category
      ORDER BY total DESC
    `).all(userId, String(monthStr).padStart(2, '0'), yearStr);

    const topVendors = db.prepare(`
      SELECT vendor, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = ? 
      AND type = 'debit'
      AND strftime('%m', date) = ?
      AND strftime('%Y', date) = ?
      GROUP BY vendor
      ORDER BY total DESC
      LIMIT 5
    `).all(userId, String(monthStr).padStart(2, '0'), yearStr);

    res.json({
      period: `${monthStr}/${yearStr}`,
      summary: report,
      categoryBreakdown,
      topVendors
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

// ============= NEW FEATURE 4: BUDGET ALERTS =============

function checkBudgetAlert(userId, category, amount) {
  try {
    const budget = db.prepare(`
      SELECT * FROM budgets 
      WHERE user_id = ? AND category = ?
    `).get(userId, category);

    if (!budget) return;

    const spent = db.prepare(`
      SELECT SUM(amount) as total
      FROM transactions
      WHERE user_id = ? 
      AND category = ?
      AND type = 'debit'
      AND date >= date('now', 'start of month')
    `).get(userId, category);

    const spentAmount = spent.total || 0;
    const percentage = (spentAmount / budget.limit_amount) * 100;

    if (percentage >= budget.alert_threshold) {
      const alertType = percentage >= 100 ? 'exceeded' : 'warning';
      const message = percentage >= 100 
        ? `You've exceeded your ${category} budget by ₦${(spentAmount - budget.limit_amount).toFixed(2)}!`
        : `You've used ${percentage.toFixed(0)}% of your ${category} budget.`;

      db.prepare(`
        INSERT INTO budget_alerts (user_id, budget_id, alert_type, message)
        VALUES (?, ?, ?, ?)
      `).run(userId, budget.id, alertType, message);
    }
  } catch (error) {
    console.error('Budget alert check error:', error);
  }
}

app.get('/api/budgets', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = db.prepare(`
      SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON t.user_id = b.user_id 
        AND t.category = b.category 
        AND t.type = 'debit'
        AND t.date >= date('now', 'start of month')
      WHERE b.user_id = ?
      GROUP BY b.id
    `).all(userId);

    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', authenticateToken, (req, res) => {
  try {
    const { category, limit_amount, period, alert_threshold } = req.body;
    const userId = req.user.id;

    const stmt = db.prepare(`
      INSERT INTO budgets (user_id, category, limit_amount, period, alert_threshold)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, category, limit_amount, period || 'monthly', alert_threshold || 80);
    res.json({ id: result.lastInsertRowid, category, limit_amount });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

app.get('/api/alerts', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const alerts = db.prepare(`
      SELECT * FROM budget_alerts 
      WHERE user_id = ? 
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId);

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// ============= NEW FEATURE 5: RECEIPT UPLOAD =============

app.post('/api/transactions/:id/receipt', authenticateToken, upload.single('receipt'), (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const receiptPath = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    db.prepare(`
      UPDATE transactions 
      SET receipt_path = ? 
      WHERE id = ? AND user_id = ?
    `).run(receiptPath, id, userId);

    res.json({ success: true, receiptPath });
  } catch (error) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ error: 'Receipt upload failed' });
  }
});

// ============= NEW FEATURE 6: RECURRING TRANSACTIONS =============

app.get('/api/recurring', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const recurring = db.prepare(`
      SELECT * FROM recurring_transactions 
      WHERE user_id = ? 
      ORDER BY next_date ASC
    `).all(userId);

    res.json(recurring);
  } catch (error) {
    console.error('Get recurring error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
});

app.post('/api/recurring', authenticateToken, (req, res) => {
  try {
    const { name, amount, category, frequency, next_date } = req.body;
    const userId = req.user.id;

    const stmt = db.prepare(`
      INSERT INTO recurring_transactions (user_id, name, amount, category, frequency, next_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, name, amount, category, frequency, next_date);
    res.json({ id: result.lastInsertRowid, name, amount, frequency });
  } catch (error) {
    console.error('Create recurring error:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

// ============= NEW FEATURE 7: SPLIT TRANSACTIONS =============

app.post('/api/transactions/:id/split', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { split_with, split_amount } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE transactions 
      SET is_split = 1, split_with = ?
      WHERE id = ? AND user_id = ?
    `).run(JSON.stringify(split_with), id, userId);

    res.json({ success: true, split_with, split_amount });
  } catch (error) {
    console.error('Split transaction error:', error);
    res.status(500).json({ error: 'Split failed' });
  }
});

// ============= NEW FEATURE 8: DARK MODE =============

app.put('/api/user/settings', authenticateToken, (req, res) => {
  try {
    const { dark_mode } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE users 
      SET dark_mode = ? 
      WHERE id = ?
    `).run(dark_mode ? 1 : 0, userId);

    res.json({ success: true, dark_mode });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Settings update failed' });
  }
});

// ============= NEW FEATURE 9: TRANSACTION SEARCH/FILTER =============

app.get('/api/transactions/search', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { query, category, type, date_from, date_to, min_amount, max_amount } = req.query;

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (query) {
      sql += ' AND (vendor LIKE ? OR sms_text LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (date_from) {
      sql += ' AND date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      sql += ' AND date <= ?';
      params.push(date_to);
    }

    if (min_amount) {
      sql += ' AND amount >= ?';
      params.push(parseFloat(min_amount));
    }

    if (max_amount) {
      sql += ' AND amount <= ?';
      params.push(parseFloat(max_amount));
    }

    sql += ' ORDER BY date DESC LIMIT 100';

    const transactions = db.prepare(sql).all(...params);
    res.json(transactions);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============= NEW FEATURE 10: SPENDING LIMITS (Already covered in budgets) =============

// ============= NEW FEATURE 11: DAILY FINANCE NEWS =============

app.get('/api/news/finance', authenticateToken, async (req, res) => {
  try {
    // In production, integrate with a real news API like NewsAPI
    // For demo, return mock data
    const news = [
      {
        id: 1,
        title: "Naira strengthens against Dollar",
        source: "Bloomberg",
        summary: "The Nigerian Naira gained 2% against the US Dollar today...",
        url: "https://example.com/news1",
        published_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "CBN raises interest rates",
        source: "Reuters",
        summary: "Central Bank of Nigeria increases monetary policy rate to 18%...",
        url: "https://example.com/news2",
        published_at: new Date().toISOString()
      },
      {
        id: 3,
        title: "Tech stocks surge in Nigerian market",
        source: "Financial Times",
        summary: "Nigerian technology sector sees 15% growth this quarter...",
        url: "https://example.com/news3",
        published_at: new Date().toISOString()
      }
    ];

    res.json(news);
  } catch (error) {
    console.error('Finance news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// ============= EXISTING ENDPOINTS (Enhanced) =============

app.post('/api/transactions/parse-sms', authenticateToken, async (req, res) => {
  try {
    const { smsText } = req.body;
    const userId = req.user.id;

    let parsed = {
      type: smsText.toLowerCase().includes('debit') ? 'debit' : 'credit',
      amount: parseFloat(smsText.match(/[\d,]+\.?\d*/)?.[0]?.replace(/,/g, '') || 0),
      category: 'other',
      vendor: 'Unknown',
      balance: null
    };

    const balMatch = smsText.match(/bal:?\s*[₦$]?[\d,]+\.?\d*/i);
    if (balMatch) {
      parsed.balance = parseFloat(balMatch[0].match(/[\d,]+\.?\d*/)[0].replace(/,/g, ''));
    }

    const vendorMatch = smsText.match(/(?:at|from)\s+([a-zA-Z\s]+)/i);
    if (vendorMatch) {
      parsed.vendor = vendorMatch[1].trim();
    }

    const text = smsText.toLowerCase();
    if (text.includes('shoprite') || text.includes('food')) parsed.category = 'food';
    else if (text.includes('uber') || text.includes('transport')) parsed.category = 'transport';
    else if (text.includes('airtime')) parsed.category = 'airtime';

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Extract transaction details from SMS. Return JSON: {type, amount, category, vendor, balance}. Type must be lowercase: "debit" or "credit".`
            },
            { role: "user", content: smsText }
          ],
          temperature: 0.3,
        });
        parsed = JSON.parse(completion.choices[0].message.content);
        if (parsed.type) parsed.type = parsed.type.toLowerCase();
      } catch (aiError) {
        console.log('Using regex parsing');
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, category, vendor, balance, sms_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, parsed.type, parsed.amount, parsed.category || 'other',
      parsed.vendor || 'Unknown', parsed.balance || null, smsText);

    // Check budget alert
    if (parsed.type === 'debit') {
      checkBudgetAlert(userId, parsed.category, parsed.amount);
    }

    res.json({ id: result.lastInsertRowid, ...parsed, smsText });
  } catch (error) {
    console.error('SMS parsing error:', error);
    res.status(500).json({ error: 'Failed to parse SMS' });
  }
});

app.get('/api/transactions', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 50
    `).all(userId);
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.get('/api/transactions/stats', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    const categoryStats = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND type = 'debit'
      GROUP BY category
    `).all(userId);

    const totals = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spending,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_income
      FROM transactions
      WHERE user_id = ?
    `).get(userId);

    const weeklySpending = db.prepare(`
      SELECT 
        strftime('%Y-%W', date) as week,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as spending,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as income
      FROM transactions
      WHERE user_id = ? AND date >= datetime('now', '-56 days')
      GROUP BY week
      ORDER BY week DESC
      LIMIT 8
    `).all(userId);

    const latestTransaction = db.prepare(`
      SELECT balance FROM transactions
      WHERE user_id = ? AND balance IS NOT NULL
      ORDER BY date DESC LIMIT 1
    `).get(userId);

    res.json({
      categoryStats,
      weeklySpending: weeklySpending.reverse(),
      currentBalance: latestTransaction?.balance || 0,
      totalSpending: totals?.total_spending || 0,
      totalIncome: totals?.total_income || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recentTransactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 10
    `).all(userId);

    const categoryStats = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type = 'debit'
      GROUP BY category
    `).all(userId);

    let insights = [];

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      try {
        const prompt = `Based on these spending patterns: ${JSON.stringify(categoryStats.slice(0, 3))}, provide 3 brief financial tips.`;
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        insights = completion.choices[0].message.content.split('\n').filter(i => i.trim());
      } catch (aiError) {
        console.log('Using fallback insights');
      }
    }

    if (insights.length === 0) {
      insights = [
        "💡 Track your daily expenses to identify spending patterns",
        "🎯 Set monthly budgets for each category",
        "💰 Save at least 20% of your income"
      ];
    }

    res.json({ insights, recentTransactions, categoryStats });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)').run(
      userId, 'user', message
    );

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 20
    `).all(userId);

    const categoryStats = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND type = 'debit'
      GROUP BY category
    `).all(userId);

    const totals = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spending,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_income
      FROM transactions
      WHERE user_id = ?
    `).get(userId);

    let response = "I'm here to help with your finances! Ask me about your spending, savings, or get financial tips.";

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      try {
        const contextMessage = `
User's Financial Summary:
- Total Spending: ₦${totals?.total_spending || 0}
- Total Income: ₦${totals?.total_income || 0}
- Transactions: ${transactions.length}
- Categories: ${JSON.stringify(categoryStats)}

Answer the user's question based on this data.`;

        const history = db.prepare(`
          SELECT role, content FROM chat_history
          WHERE user_id = ?
          ORDER BY timestamp DESC
          LIMIT 10
        `).all(userId).reverse();

        const messages = [
          { role: "system", content: `You are FinBuddy, a friendly AI financial assistant. ${contextMessage}` },
          ...history.map(h => ({ role: h.role, content: h.content }))
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.7,
        });

        response = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('OpenAI error:', aiError);
        
        if (message.toLowerCase().includes('spending') || message.toLowerCase().includes('spent')) {
          response = `You've spent ₦${totals?.total_spending?.toLocaleString() || 0}!\n\n`;
          if (categoryStats.length > 0) {
            response += "Breakdown:\n";
            categoryStats.forEach(cat => {
              response += `• ${cat.category}: ₦${cat.total.toLocaleString()}\n`;
            });
          }
        }
      }
    }

    db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)').run(
      userId, 'assistant', response
    );

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.get('/api/goals', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const goals = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').all(userId);
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', authenticateToken, (req, res) => {
  try {
    const { title, target_amount, deadline } = req.body;
    const userId = req.user.id;
    
    const stmt = db.prepare(`
      INSERT INTO savings_goals (user_id, title, target_amount, deadline)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, title, target_amount, deadline);
    res.json({ id: result.lastInsertRowid, title, target_amount, deadline });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FinBuddy API is running',
    features: [
      'Bulk SMS Upload',
      'Export Data',
      'Monthly Reports',
      'Budget Alerts',
      'Receipt Upload',
      'Recurring Transactions',
      'Split Transactions',
      'Dark Mode',
      'Search & Filter',
      'Spending Limits',
      'Finance News'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ FinBuddy API running on http://localhost:${PORT}`);
  console.log(`🚀 11 NEW features enabled!`);
});
