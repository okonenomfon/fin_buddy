const Database = require('better-sqlite3');
const db = new Database('./finbuddy.db');

console.log('\n=== CHECKING DATABASE ===\n');

// Check all transactions
const transactions = db.prepare('SELECT * FROM transactions').all();
console.log('Total transactions:', transactions.length);
console.log('\nAll transactions:');
console.table(transactions);

// Check by type
const debits = db.prepare("SELECT * FROM transactions WHERE type = 'debit'").all();
const credits = db.prepare("SELECT * FROM transactions WHERE type = 'credit'").all();
console.log('\nDebits:', debits.length);
console.log('Credits:', credits.length);

// Check stats
const categoryStats = db.prepare(`
  SELECT category, SUM(amount) as total, COUNT(*) as count
  FROM transactions
  WHERE type = 'debit'
  GROUP BY category
`).all();
console.log('\nCategory Stats:');
console.table(categoryStats);

db.close();