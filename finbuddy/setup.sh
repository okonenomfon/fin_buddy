#!/bin/bash

# FinBuddy Setup and Run Script
# This script helps you set up and run the FinBuddy application

set -e

echo "🚀 FinBuddy Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env file and add your OpenAI API key!"
    echo "   Get your key at: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter to continue after adding your API key..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Choose how to run FinBuddy:"
echo ""
echo "1) Run both frontend and backend together (recommended)"
echo "2) Run backend only"
echo "3) Run frontend only"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting FinBuddy..."
        echo "   Backend: http://localhost:5000"
        echo "   Frontend: http://localhost:3000"
        echo ""
        npm run dev:all
        ;;
    2)
        echo ""
        echo "🚀 Starting Backend API on http://localhost:5000..."
        npm run server
        ;;
    3)
        echo ""
        echo "🚀 Starting Frontend on http://localhost:3000..."
        npm run dev
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac
