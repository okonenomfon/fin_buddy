const express = require('express');
const router = express.Router();
const txController = require('../controllers/transactionController');
const chatController = require('../controllers/chatController');
const goalController = require('../controllers/goalController');

// Transactions
router.post('/transactions/parse', txController.parseSMS);
router.get('/transactions', txController.getTransactions);

// Chat
router.post('/chat', chatController.chat);

// Goals
router.get('/goals', goalController.getGoals);
router.post('/goals', goalController.createGoal);

module.exports = router;