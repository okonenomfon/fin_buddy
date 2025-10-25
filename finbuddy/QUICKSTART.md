# 🚀 FINBUDDY - Quick Start

## Get Running in 5 Minutes

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env - ADD YOUR OPENAI_API_KEY
npm run init-db
npm run dev
```
Backend: http://localhost:5000

### 2. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

### 3. Login
- Email: demo@finbuddy.com
- Password: demo123

### 4. Test Features
- Dashboard: Parse SMS: "Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000"
- Chat: Ask "How much did I spend on food?"
- Goals: Create savings goal
- Profile: View achievements

## Required
- Node.js 18+
- OpenAI API Key: https://platform.openai.com/api-keys

## Stack
- Frontend: Next.js 14, React, TypeScript, Tailwind
- Backend: Node.js, Express, SQLite
- AI: OpenAI GPT-3.5/4

See README.md for full documentation!
