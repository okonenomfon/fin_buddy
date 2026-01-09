const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
  if (err) console.error('DB Error:', err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Users Table with Gamification
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, badges TEXT
  )`);
  // Transactions Table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY, userId INTEGER, amount REAL, type TEXT, category TEXT, description TEXT, date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Goals Table
  db.run(`CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY, userId INTEGER, name TEXT, targetAmount REAL, currentAmount REAL, deadline TEXT
  )`);
});

module.exports = db;