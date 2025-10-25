const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATEGORIES = [
  'food', 'transport', 'airtime', 'shopping', 'bills', 'entertainment',
  'health', 'education', 'groceries', 'fuel', 'subscription', 'transfer', 'other'
];

async function parseSMSTransaction(smsText) {
  try {
    const regexResult = parseWithRegex(smsText);
    if (regexResult.confidence > 0.8) {
      return regexResult;
    }
    const aiResult = await parseWithOpenAI(smsText);
    return aiResult;
  } catch (error) {
    console.error('Error parsing SMS:', error);
    throw error;
  }
}

function parseWithRegex(smsText) {
  const result = { type: null, amount: null, vendor: null, category: 'other', balance: null, confidence: 0 };
  const text = smsText.toLowerCase();
  
  if (text.includes('debit') || text.includes('debited') || text.includes('dr')) {
    result.type = 'debit';
    result.confidence += 0.3;
  } else if (text.includes('credit') || text.includes('credited') || text.includes('cr')) {
    result.type = 'credit';
    result.confidence += 0.3;
  }
  
  const amountRegex = /(?:₦|ngn|n|naira)?\s*([0-9,]+(?:\.[0-9]{2})?)/gi;
  const amounts = [];
  let match;
  while ((match = amountRegex.exec(text)) !== null) {
    amounts.push(parseFloat(match[1].replace(/,/g, '')));
  }
  
  if (amounts.length > 0) {
    result.amount = amounts[0];
    result.confidence += 0.3;
  }
  if (amounts.length > 1) {
    result.balance = amounts[amounts.length - 1];
    result.confidence += 0.1;
  }
  
  const vendorPatterns = [
    /(?:at|to|from)\s+([a-z0-9\s]+?)(?:\s*bal|\s*avail|\s*\.|\s*$)/i,
    /pos\s+([a-z0-9\s]+?)(?:\s*bal|\s*avail|\s*\.|\s*$)/i,
  ];
  
  for (const pattern of vendorPatterns) {
    const vendorMatch = text.match(pattern);
    if (vendorMatch) {
      result.vendor = vendorMatch[1].trim();
      result.confidence += 0.2;
      break;
    }
  }
  
  if (result.vendor) {
    result.category = categorizeTransaction(result.vendor, text);
    result.confidence += 0.1;
  }
  
  return result;
}

async function parseWithOpenAI(smsText) {
  const prompt = `You are a financial SMS parser. Extract transaction details from this SMS message.

SMS: "${smsText}"

Extract and return ONLY a valid JSON object with these exact fields:
{
  "type": "debit" or "credit",
  "amount": number (transaction amount),
  "vendor": "string" (merchant/vendor name or null),
  "category": "one of: food, transport, airtime, shopping, bills, entertainment, health, education, groceries, fuel, subscription, transfer, other",
  "balance": number (account balance after transaction or null),
  "confidence": number between 0 and 1
}

Return ONLY the JSON object, no explanations.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  const content = response.choices[0].message.content.trim();
  let jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to parse AI response');
}

function categorizeTransaction(vendor, text) {
  const vendorLower = vendor.toLowerCase();
  const textLower = text.toLowerCase();

  const categoryKeywords = {
    food: ['restaurant', 'cafe', 'food', 'kfc', 'dominos', 'pizza', 'chicken', 'burger', 'eatery', 'kitchen'],
    transport: ['uber', 'bolt', 'taxi', 'bus', 'fuel', 'petrol', 'transport', 'mrt', 'ride'],
    airtime: ['airtime', 'data', 'mtn', 'glo', 'airtel', '9mobile', 'recharge'],
    shopping: ['shoprite', 'mall', 'market', 'store', 'shop', 'boutique', 'amazon', 'jumia'],
    bills: ['electric', 'nepa', 'water', 'dstv', 'gotv', 'bill', 'utility'],
    entertainment: ['cinema', 'movie', 'netflix', 'spotify', 'game', 'club', 'bar'],
    health: ['pharmacy', 'hospital', 'clinic', 'medical', 'drug', 'health'],
    education: ['school', 'university', 'tuition', 'book', 'course'],
    groceries: ['grocery', 'supermarket', 'provisions'],
    fuel: ['filling station', 'gas station', 'petrol', 'fuel', 'diesel'],
    subscription: ['subscription', 'monthly', 'recurring'],
    transfer: ['transfer', 'sent to', 'received from'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (vendorLower.includes(keyword) || textLower.includes(keyword)) {
        return category;
      }
    }
  }
  return 'other';
}

async function generateSpendingInsights(transactions, savingsGoals = []) {
  try {
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const categoryBreakdown = transactions.filter(t => t.type === 'debit').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0];

    const prompt = `You are FinBuddy, a friendly AI financial advisor for students and young professionals.

User's spending data:
- Total spent: ₦${totalSpent.toFixed(2)}
- Number of transactions: ${transactions.length}
- Top spending category: ${topCategory ? `${topCategory[0]} (₦${topCategory[1].toFixed(2)})` : 'N/A'}
- Savings goals: ${savingsGoals.length} active goal(s)

Generate a friendly, encouraging, and actionable insight (2-3 sentences max) about their spending. 
Use emojis, be motivating, and give one practical tip. Keep it conversational and relatable for young people.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating insights:', error);
    return "Keep up the good work! 💪 Track your spending to reach your financial goals.";
  }
}

async function generateChatResponse(userMessage, userData, recentMessages = []) {
  try {
    const { transactions = [], savingsGoals = [], preferences = {} } = userData;
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const categorySpending = transactions.filter(t => t.type === 'debit').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const systemPrompt = `You are FinBuddy, an AI financial assistant helping students and young professionals manage their money. 

User Context:
- Total spent: ₦${totalSpent.toFixed(2)}
- Total income: ₦${totalIncome.toFixed(2)}
- Recent transactions: ${transactions.slice(0, 5).map(t => `${t.type} ₦${t.amount} at ${t.vendor || t.category}`).join(', ')}
- Category breakdown: ${JSON.stringify(categorySpending)}
- Active savings goals: ${savingsGoals.length}

Personality:
- Friendly, supportive, and motivating
- Use emojis naturally (but not excessively)
- Give practical, actionable advice
- Keep responses concise (2-4 sentences usually)
- Be relatable to young people
- Celebrate wins and encourage during setbacks

Answer the user's question using their actual data when relevant.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.slice(-6),
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.8,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "Hey! I'm having trouble processing that right now. Try asking me about your spending or savings goals! 💬";
  }
}

async function generateSavingsSuggestions(transactions) {
  try {
    const weeklySpending = transactions.filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.transaction_date) > weekAgo && t.type === 'debit';
    }).reduce((sum, t) => sum + t.amount, 0);

    const categorySpending = transactions.filter(t => t.type === 'debit').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const prompt = `Analyze this spending and suggest 2-3 micro-savings tips:

Weekly spending: ₦${weeklySpending.toFixed(2)}
Category breakdown: ${JSON.stringify(categorySpending)}

Give practical, specific suggestions like "Skip one coffee shop visit per week to save ₦500" or "Cook at home twice more per week to save ₦2,000". 
Be encouraging and realistic for students/young professionals. Return as a JSON array of strings.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [
      "💡 Cook at home more often to save on food costs",
      "🚶 Walk short distances instead of taking rides",
      "📱 Review and cancel unused subscriptions"
    ];
  } catch (error) {
    console.error('Error generating savings suggestions:', error);
    return [
      "💡 Track your spending daily to stay aware",
      "🎯 Set a weekly spending limit",
      "🏦 Save a small amount from each income"
    ];
  }
}

module.exports = {
  parseSMSTransaction,
  generateSpendingInsights,
  generateChatResponse,
  generateSavingsSuggestions,
  CATEGORIES,
};
