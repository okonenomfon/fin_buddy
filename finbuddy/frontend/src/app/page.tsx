'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Sparkles, TrendingUp, Bot, Award, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <nav className="glass-card mx-6 mt-6 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-display font-bold gradient-text">FinBuddy</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/auth/login')}
            className="btn-secondary"
          >
            Login
          </button>
          <button 
            onClick={() => router.push('/auth/register')}
            className="btn-primary"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        {/* Hero Content */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">AI-Powered</span>
            <br />
            Money Management
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let AI analyze your SMS bank alerts and help you save money automatically. 
            Perfect for students and young professionals.
          </p>
          <button 
            onClick={() => router.push('/auth/register')}
            className="btn-primary text-lg px-8 py-4 group"
          >
            Start Managing Money
            <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="glass-card p-8 animate-slide-up hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">AI SMS Parser</h3>
            <p className="text-gray-300">
              Automatically extracts transaction details from your bank SMS alerts using advanced AI.
            </p>
          </div>

          <div className="glass-card p-8 animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Smart Insights</h3>
            <p className="text-gray-300">
              Get personalized spending insights and predictions powered by GPT AI.
            </p>
          </div>

          <div className="glass-card p-8 animate-slide-up hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">AI Chatbot</h3>
            <p className="text-gray-300">
              Chat with FinBuddy to get instant answers about your spending and savings.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="glass-card p-12 mb-20 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-gray-300 mb-8">
            Paste a bank SMS like: "Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000"
            <br />
            And watch FinBuddy automatically categorize and track it!
          </p>
          <button 
            onClick={() => router.push('/auth/register')}
            className="btn-primary"
          >
            Try It Free
          </button>
        </div>

        {/* Gamification Feature */}
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">
            Earn Rewards While Saving
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Level up your financial game! Earn badges like "Smart Saver" and "Budget Boss" 
            as you hit your savings goals and track your spending consistently.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card mx-6 mb-6 px-6 py-8 mt-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet className="w-6 h-6 text-primary-500" />
          <span className="text-xl font-display font-bold gradient-text">FinBuddy</span>
        </div>
        <p className="text-gray-400 text-sm">
          AI-powered finance management for the next generation
        </p>
      </footer>
    </div>
  );
}
