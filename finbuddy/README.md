# 🤖 FINBUDDY - AI-Powered Financial Manager

**An intelligent fintech web application designed for students and young professionals to automatically manage their money using AI that analyzes SMS alerts from banks.**

![FinBuddy](https://img.shields.io/badge/FinBuddy-AI%20Finance-teal?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-blue?style=flat-square)

---

## ✨ Features

### 🔐 User Authentication
- Email & password signup/login
- JWT-based authentication
- Secure password hashing with bcrypt
- Session management

### 🤖 AI SMS Parser
- Automatically analyzes bank SMS alerts
- Extracts transaction details using AI
- Smart categorization (food, transport, bills, etc.)
- Fallback regex parser for reliability

### 📊 AI Insights Dashboard
- Interactive charts (spending by category, weekly trends)
- Real-time statistics
- AI-generated personalized insights
- Trend predictions

### 💬 AI Chatbot (FinBuddy)
- Natural language financial Q&A
- Context-aware responses
- Chat history persistence
- Quick question suggestions

### 🎯 Savings Goals
- Create and track multiple goals
- Visual progress indicators
- Deadline tracking
- Achievement notifications

### 🎮 Gamification System
- Badges & achievements
- Progress tracking
- Motivational rewards

### 💡 Micro Savings Suggestions
- AI-powered recommendations
- Personalized based on spending patterns

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (https://platform.openai.com)

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd finbuddy
npm install
```

2. **Set up environment**

Create `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string
NEXT_PUBLIC_API_URL=http://localhost:5000
PORT=5000
JWT_SECRET=your_jwt_secret_here
DATABASE_PATH=./backend/finbuddy.db
```

3. **Run the app**

Option 1 - Two terminals:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

Option 2 - Single command:
```bash
npm run dev:all
```

4. **Open browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
finbuddy/
├── backend/
│   ├── server.js          # Express API
│   └── finbuddy.db        # SQLite database
├── components/
│   └── Navigation.js      # Navigation bar
├── pages/
│   ├── index.js          # Landing page
│   ├── login.js          # Login
│   ├── signup.js         # Sign up
│   ├── dashboard.js      # Dashboard
│   ├── chat.js           # AI chatbot
│   ├── goals.js          # Savings goals
│   └── profile.js        # User profile
├── styles/
│   └── globals.css       # Global styles
├── .env                  # Environment vars
└── package.json          # Dependencies
```

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Transactions
- `POST /api/transactions/parse-sms` - Parse SMS
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/stats` - Get stats

### AI
- `GET /api/insights` - Get insights
- `POST /api/chat` - Chat with AI
- `GET /api/suggestions` - Get savings tips

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get goals
- `PATCH /api/goals/:id` - Update goal

---

## 🧪 Testing

### Sample SMS
```
Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000.
Credit: ₦50,000 Transfer from John. Bal: ₦62,000.
Debit: ₦1,200 Airtime purchase. Bal: ₦60,800.
```

---

## 🚢 Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy

### Render (Backend)
1. Create Web Service
2. Connect repo
3. Set commands: `npm install` / `npm run server`
4. Add environment variables
5. Deploy

---

## 🎨 Design

- Glassmorphism UI
- Animated gradients
- Neon glow effects
- Responsive design
- Colors: Blue (#1890ff) & Teal (#14b8a6)

---

## 🐛 Troubleshooting

**Database issues:**
```bash
rm backend/finbuddy.db
npm run server  # Recreates database
```

**OpenAI errors:**
- Check API key validity
- App falls back to regex if AI fails

**Port conflicts:**
Change ports in `.env`

---

## 📝 Future Enhancements
- Google OAuth
- Bank API integration
- Budget templates
- Receipt scanning
- Mobile app

---

## 📄 License

MIT License

---

**Happy Saving! 💰🎯✨**
