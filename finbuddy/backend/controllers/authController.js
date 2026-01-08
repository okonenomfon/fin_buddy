const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const badges = JSON.stringify(['Newbie']); // Initial Gamification Badge
  
  db.run(`INSERT INTO users (email, password, name, badges) VALUES (?, ?, ?, ?)`, 
    [email, hashedPassword, name, badges], 
    function(err) {
      if (err) return res.status(400).json({ error: "Email exists" });
      res.json({ id: this.lastID, email });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, badges: JSON.parse(user.badges) } });
  });
};