# 📚 FinBuddy API Documentation

Complete API reference for FinBuddy backend.

**Base URL:** `http://localhost:5000` (development) or your deployed backend URL

---

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📍 Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Email already exists or missing fields
- `500` - Server error

---

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `500` - Server error

---

### Transactions

#### Parse SMS & Create Transaction
```http
POST /api/transactions/parse-sms
```
**Protected:** ✅ Requires authentication

**Request Body:**
```json
{
  "smsText": "Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000"
}
```

**Response (200):**
```json
{
  "id": 1,
  "type": "debit",
  "amount": 2500,
  "category": "shopping",
  "vendor": "Shoprite",
  "balance": 12000,
  "message": "Transaction added successfully"
}
```

**SMS Format Examples:**
```
Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000
Credit: ₦50,000 Transfer from John. Bal: ₦62,500
ATM Withdrawal: ₦10,000. Bal: ₦5,000
```

**Supported Categories:**
- `food` - Restaurants, food stores
- `transport` - Uber, taxi, fuel
- `airtime` - Mobile data, airtime
- `shopping` - Stores, malls
- `entertainment` - Movies, games
- `utilities` - Bills, electricity
- `transfer` - Money transfers
- `salary` - Income
- `other` - Uncategorized

**Errors:**
- `401` - Unauthorized (no token)
- `500` - Failed to parse or save

---

#### Get All Transactions
```http
GET /api/transactions
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "debit",
    "amount": 2500,
    "category": "shopping",
    "vendor": "Shoprite",
    "balance": 12000,
    "sms_text": "Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "type": "credit",
    "amount": 50000,
    "category": "salary",
    "vendor": "Company",
    "balance": 62500,
    "sms_text": "Credit: ₦50,000 Salary. Bal: ₦62,500",
    "created_at": "2025-01-01T09:00:00.000Z"
  }
]
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Insights

#### Get AI Insights
```http
GET /api/insights
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
{
  "totalSpent": 15000.50,
  "totalEarned": 75000.00,
  "categoryBreakdown": {
    "food": 5000.00,
    "transport": 3000.50,
    "shopping": 7000.00
  },
  "aiInsight": "💰 Great job! You spent ₦5,000 less than last week on food. Keep it up! 🎉",
  "netBalance": 59999.50
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

#### Get Savings Suggestions
```http
GET /api/suggestions
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
[
  {
    "category": "food",
    "currentSpending": 5000,
    "suggestion": "💡 If you reduce food spending by 20%, you could save ₦1,000 weekly!",
    "potentialSavings": 250
  },
  {
    "category": "transport",
    "currentSpending": 3000,
    "suggestion": "💡 Consider carpooling to save ₦600 weekly!",
    "potentialSavings": 150
  }
]
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Chat

#### Send Message to AI
```http
POST /api/chat
```
**Protected:** ✅ Requires authentication

**Request Body:**
```json
{
  "message": "How much did I spend on food last week?"
}
```

**Response (200):**
```json
{
  "response": "Based on your transactions, you spent ₦5,000 on food last week! 🍕 That's about ₦714 per day. You're doing great! 💪"
}
```

**Example Questions:**
- "How much did I spend on food last week?"
- "What's my biggest expense category?"
- "How can I save ₦10,000 this month?"
- "Am I spending too much?"
- "Analyze my spending habits"

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

#### Get Chat History
```http
GET /api/chat/history
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "message": "How much did I spend on food last week?",
    "sender": "user",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "message": "Based on your transactions, you spent ₦5,000 on food last week!",
    "sender": "ai",
    "created_at": "2025-01-15T10:30:05.000Z"
  }
]
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Goals

#### Create Savings Goal
```http
POST /api/goals
```
**Protected:** ✅ Requires authentication

**Request Body:**
```json
{
  "name": "New Laptop",
  "targetAmount": 150000,
  "deadline": "2025-12-31"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "New Laptop",
  "targetAmount": 150000,
  "currentAmount": 0,
  "deadline": "2025-12-31"
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

#### Get All Goals
```http
GET /api/goals
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "New Laptop",
    "target_amount": 150000,
    "current_amount": 50000,
    "deadline": "2025-12-31",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

#### Update Goal Progress
```http
PUT /api/goals/:id
```
**Protected:** ✅ Requires authentication

**Request Body:**
```json
{
  "currentAmount": 75000
}
```

**Response (200):**
```json
{
  "message": "Goal updated successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Achievements

#### Get User Achievements
```http
GET /api/achievements
```
**Protected:** ✅ Requires authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "badge_name": "Smart Saver",
    "badge_level": "Bronze",
    "earned_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "badge_name": "Budget Boss",
    "badge_level": "Silver",
    "earned_at": "2025-01-20T14:15:00.000Z"
  }
]
```

**Available Badges:**
- Smart Saver - Save ₦10,000+
- Budget Boss - Track 50+ transactions
- Goal Getter - Complete 3 goals
- Spending Master - Use app for 30 days
- Finance Pro - Maintain positive balance for 60 days

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Health Check

#### Check API Status
```http
GET /api/health
```
**Protected:** ❌ Public endpoint

**Response (200):**
```json
{
  "status": "ok",
  "message": "FinBuddy API is running"
}
```

---

## 🔒 Error Responses

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### 400 Bad Request
```json
{
  "error": "Email already exists"
}
```
or
```json
{
  "error": "All fields are required"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```
or
```json
{
  "error": "Failed to [action]"
}
```

---

## 🧪 Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get transactions (replace TOKEN):
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Parse SMS:
```bash
curl -X POST http://localhost:5000/api/transactions/parse-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "smsText": "Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000"
  }'
```

---

## 📊 Rate Limits

Currently, there are no rate limits implemented. For production, consider:
- 100 requests per 15 minutes per IP
- 1000 requests per day per user
- Use Redis for rate limiting

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Store JWT secret securely** - use environment variables
3. **Validate all inputs** on the server side
4. **Use strong passwords** - minimum 8 characters
5. **Rotate API keys** regularly
6. **Monitor for suspicious activity**

---

## 🚀 Future API Endpoints

Planned for future versions:

- `POST /api/budget/create` - Create monthly budgets
- `GET /api/analytics/monthly` - Monthly spending analytics
- `POST /api/export/csv` - Export transactions
- `POST /api/notifications/settings` - Configure notifications
- `GET /api/compare/users` - Anonymous spending comparisons

---

## 📞 Support

For API issues or questions:
- Check the main [README.md](../README.md)
- Review the [Deployment Guide](../DEPLOYMENT.md)
- Open an issue on GitHub
