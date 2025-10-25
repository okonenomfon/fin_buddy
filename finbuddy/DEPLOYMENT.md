# 🚀 Deployment Guide

## Backend (Render.com)
1. Go to render.com → New Web Service
2. Connect repository (backend folder)
3. Settings:
   - Build: `npm install`
   - Start: `npm start`
4. Environment Variables:
   - `OPENAI_API_KEY=sk-your-key`
   - `JWT_SECRET=random-secure-string`
   - `NODE_ENV=production`
5. Deploy!
6. Copy backend URL: https://your-app.onrender.com

## Frontend (Vercel.com)
1. Go to vercel.com → Import Project
2. Select frontend folder
3. Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
4. Deploy!
5. Your app: https://your-app.vercel.app

## Update Backend CORS
In Render, add environment variable:
- `FRONTEND_URL=https://your-app.vercel.app`

## Free Tier
- Render: Free (sleeps after 15 min)
- Vercel: Free unlimited
- OpenAI: ~$5-10/month usage

Done! 🎉
