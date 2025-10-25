# 📖 FINBUDDY - Complete Installation & Usage Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Using the Features](#using-the-features)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [Deployment](#deployment)

---

## 🎯 Prerequisites

Before you begin, ensure you have:

### Required:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))

### Check Installation:
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## 🔧 Installation

### Method 1: Using Setup Script (Easiest)

```bash
# 1. Navigate to project directory
cd finbuddy

# 2. Run setup script
chmod +x setup.sh
./setup.sh
```

The script will:
- Check for Node.js
- Install dependencies
- Help you configure .env
- Start the application

### Method 2: Manual Installation

```bash
# 1. Navigate to project
cd finbuddy

# 2. Install dependencies
npm install

# 3. Configure environment (see next section)
cp .env.example .env
# Edit .env with your API key

# 4. Start the app
npm run dev:all
```

---

## ⚙️ Configuration

### 1. Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Edit Configuration

Open `.env` and update:

```env
# REQUIRED: Your OpenAI API Key
OPENAI_API_KEY=sk-your-actual-key-here

# Optional: Use defaults or customize
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-random-string
NEXT_PUBLIC_API_URL=http://localhost:5000
PORT=5000
JWT_SECRET=change-this-to-random-string
DATABASE_PATH=./backend/finbuddy.db
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up / Log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Paste into `.env` file

**Note:** Free tier includes $5 credit. GPT-3.5-turbo is very affordable (~$0.002 per request).

---

## 🚀 Running the Application

### Option 1: Both Servers Together (Recommended)

```bash
npm run dev:all
```

This runs:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Option 2: Separate Terminals

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 3: Production Mode

```bash
# Build
npm run build

# Start
npm start
```

---

## 💻 Using the Features

### 1. Create an Account

1. Open `http://localhost:3000`
2. Click "Get Started Free"
3. Fill in:
   - Full Name
   - Email address
   - Password (minimum 6 characters)
4. Click "Create Account"

### 2. Add Transactions

**Via SMS Parser:**

1. Go to Dashboard
2. Find "Add Transaction (SMS)" section
3. Paste a bank SMS alert:
   ```
   Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000.
   ```
4. Click "Parse with AI"
5. View the transaction added to your dashboard

**More Sample SMS:**
```
Credit: ₦50,000 Salary payment. Bal: ₦62,000.
Debit: ₦1,200 Airtime purchase. Bal: ₦60,800.
Debit: ₦3,000 Uber ride. Bal: ₦57,800.
Debit: ₦8,500 Netflix subscription. Bal: ₦49,300.
```

### 3. Chat with AI Assistant

1. Navigate to "Chat" page
2. Ask questions:
   - "How much did I spend this week?"
   - "What's my biggest expense?"
   - "Give me a savings tip"
   - "How can I save ₦10,000?"
3. Use quick question buttons for common queries

### 4. Set Savings Goals

1. Go to "Goals" page
2. Click "New Goal"
3. Enter:
   - Goal title (e.g., "Emergency Fund")
   - Target amount (e.g., 50000)
   - Deadline (optional)
4. Click "Create Goal"
5. Track progress and add funds regularly

### 5. View AI Insights

- Dashboard shows AI-generated spending insights
- Category breakdown with pie chart
- Weekly trends with bar chart
- Savings suggestions based on your habits

### 6. Check Your Profile

- View your account info
- See earned badges
- Track achievements
- Review recent activity

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Auth
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login

#### Transactions
- `POST /transactions/parse-sms` - Parse SMS alert
- `GET /transactions` - Get user transactions
- `GET /transactions/stats` - Get statistics

#### AI Features
- `GET /insights` - Get AI insights
- `POST /chat` - Chat with AI
- `GET /suggestions` - Get savings tips

#### Goals
- `POST /goals` - Create savings goal
- `GET /goals` - Get user goals
- `PATCH /goals/:id` - Update goal

Full API documentation: See `API_DOCS.md`

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000/5000 already in use"

```bash
# Solution 1: Kill the process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows

# Solution 2: Change port in .env
PORT=5001
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Issue: "OpenAI API Error"

**Solutions:**
- Check API key is correct in `.env`
- Ensure you have credits ([check](https://platform.openai.com/usage))
- App will fallback to regex parsing if AI fails

### Issue: "Database is locked"

```bash
# Solution: Delete and recreate database
rm backend/finbuddy.db
npm run server  # Database auto-recreates
```

### Issue: "JWT token expired"

**Solution:** Login again to get a new token

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables in Vercel dashboard
6. Deploy!

### Backend (Render)

1. Go to [Render](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: finbuddy-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm run server`
5. Add environment variables
6. Deploy!

### Update Frontend API URL

After backend deployment, update `.env`:
```env
NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com
```

Full deployment guide: See `DEPLOYMENT.md`

---

## 📊 Database Schema

The SQLite database includes:

- **users** - User accounts
- **transactions** - Financial transactions
- **savings_goals** - User savings goals
- **chat_history** - AI chat messages
- **badges** - Gamification badges

Database auto-creates on first run.

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#your-color', // Change primary color
  },
  teal: {
    500: '#your-accent', // Change accent color
  }
}
```

### Add New Features

1. **Backend**: Add routes in `backend/server.js`
2. **Frontend**: Add pages in `pages/` directory
3. **Components**: Add to `components/` directory

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

---

## 🤝 Support

Having issues? 

1. Check this guide thoroughly
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all environment variables
5. Try restarting both servers

---

## 📄 License

MIT License - Free to use and modify

---

**Ready to manage your finances smarter? Let's go! 💰🚀**

For quick start, see `QUICKSTART.md`
For API details, see `API_DOCS.md`
For deployment, see `DEPLOYMENT.md`
