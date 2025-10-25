'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insightsAPI, achievementsAPI } from '@/lib/api';
import { 
  User, 
  Home, 
  MessageCircle, 
  Target, 
  LogOut, 
  Sparkles,
  Award,
  TrendingUp,
  Lightbulb,
  Mail,
  Calendar
} from 'lucide-react';

interface Suggestion {
  category: string;
  currentSpending: number;
  suggestion: string;
  potentialSavings: number;
}

interface Achievement {
  id: number;
  badge_name: string;
  badge_level: string;
  earned_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(savedUser));
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [suggestionsRes, achievementsRes] = await Promise.all([
        insightsAPI.getSuggestions(),
        achievementsAPI.getAll()
      ]);
      setSuggestions(suggestionsRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const badgeColors: Record<string, string> = {
    'Smart Saver': 'from-green-500 to-emerald-500',
    'Budget Boss': 'from-blue-500 to-cyan-500',
    'Goal Getter': 'from-purple-500 to-pink-500',
    'Spending Master': 'from-orange-500 to-red-500',
    'Finance Pro': 'from-yellow-500 to-orange-500'
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
              Profile
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/chat" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <Link href="/goals" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Target className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="p-2 bg-white/10 rounded-lg">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
              <p className="text-white/70">Loading profile...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
                  <div className="flex items-center gap-4 text-white/60">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email || 'user@example.com'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Savings Suggestions */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent-500/20 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-accent-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Savings Tips</h2>
                    <p className="text-white/60 text-sm">Personalized suggestions based on your spending</p>
                  </div>
                </div>

                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">Add more transactions to get personalized savings tips!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent-500/20 rounded-lg flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-accent-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 capitalize">{suggestion.category}</h4>
                            <p className="text-sm text-white/70 mb-2">{suggestion.suggestion}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/50">Current: ₦{suggestion.currentSpending.toFixed(2)}</span>
                              <span className="text-accent-400 font-semibold">
                                Save: ₦{suggestion.potentialSavings.toFixed(2)}/week
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Achievements</h2>
                    <p className="text-white/60 text-sm">Your financial milestones</p>
                  </div>
                </div>

                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-6 bg-white/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Award className="w-10 h-10 text-white/30" />
                    </div>
                    <p className="text-white/60 mb-2">No achievements yet</p>
                    <p className="text-sm text-white/40">Keep managing your finances to earn badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:scale-105 transition-transform"
                      >
                        <div 
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                            badgeColors[achievement.badge_name] || 'from-gray-500 to-gray-600'
                          } flex items-center justify-center mx-auto mb-3`}
                        >
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-center mb-1">{achievement.badge_name}</h4>
                        <p className="text-xs text-center text-white/60">{achievement.badge_level}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badge Progress */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="font-semibold mb-3">Available Badges</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Smart Saver</span>
                      <span className="text-green-400">Save ₦10,000+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Budget Boss</span>
                      <span className="text-blue-400">Track 50+ transactions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Goal Getter</span>
                      <span className="text-purple-400">Complete 3 goals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Quick Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-400 mb-1">
                    {suggestions.length}
                  </div>
                  <p className="text-white/60 text-sm">Active Suggestions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-400 mb-1">
                    {achievements.length}
                  </div>
                  <p className="text-white/60 text-sm">Badges Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    ₦{suggestions.reduce((sum, s) => sum + s.potentialSavings, 0).toFixed(0)}
                  </div>
                  <p className="text-white/60 text-sm">Weekly Savings Potential</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    🔥 {Math.floor(Math.random() * 30) + 1}
                  </div>
                  <p className="text-white/60 text-sm">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
