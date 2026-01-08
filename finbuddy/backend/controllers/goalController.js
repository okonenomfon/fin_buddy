const db = require('../config/database');

exports.getGoals = (req, res) => {
  db.all(`SELECT * FROM goals WHERE userId = ?`, [req.query.userId], (err, rows) => res.json(rows));
};

exports.createGoal = (req, res) => {
  const { userId, name, target } = req.body;
  db.run(`INSERT INTO goals (userId, name, targetAmount, currentAmount) VALUES (?, ?, ?, 0)`, 
    [userId, name, target], function() { res.json({ id: this.lastID }); }
  );
};