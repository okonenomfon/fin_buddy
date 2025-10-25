'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { achievementsAPI, preferencesAPI } from '@/lib/api';
import { User, Award, Settings, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsRes, preferencesRes] = await Promise.all([
        achievementsAPI.getAll(),
        preferencesAPI.get(),
      ]);
      setAchievements(achievementsRes.data);
      setPreferences(preferencesRes.data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const achievementBadges = [
    { type: 'first_transaction', name: 'Getting Started', icon: '🌟', color: 'from-blue-500 to-cyan-500' },
    { type: 'ten_transactions', name: 'Money Tracker', icon: '📊', color: 'from-purple-500 to-pink-500' },
    { type: 'fifty_transactions', name: 'Budget Boss', icon: '💼', color: 'from-yellow-500 to-orange-500' },
    { type: 'first_goal', name: 'Goal Getter', icon: '🎯', color: 'from-green-500 to-teal-500' },
    { type: 'five_goals', name: 'Smart Saver', icon: '💰', color: 'from-indigo-500 to-purple-500' },
  ];

  const earnedBadgeTypes = achievements.map(a => a.badge_type);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass-card p-6">
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
            <User className="w-8 h-8 text-primary-500" />
            Profile
          </h1>
          <p className="text-gray-400">Manage your account and view achievements 🏆</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="glass-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-teal-500 flex items-center justify-center text-4xl font-bold mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
              <p className="text-gray-400 mb-4">{user?.email}</p>
              
              <div className="w-full pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Achievements</span>
                  <span className="font-bold text-primary-400">{achievements.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-semibold">{new Date(user?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Achievements & Badges
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievementBadges.map((badge) => {
                const isEarned = earnedBadgeTypes.includes(badge.type);
                const earnedDate = isEarned ? achievements.find(a => a.badge_type === badge.type)?.earned_at : null;

                return (
                  <div
                    key={badge.type}
                    className={`glass-card p-4 text-center transition-all ${
                      isEarned ? 'glow' : 'opacity-40'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${isEarned ? 'animate-float' : ''}`}>
                      {badge.icon}
                    </div>
                    <h4 className="font-semibold mb-1">{badge.name}</h4>
                    {isEarned ? (
                      <p className="text-xs text-primary-400">
                        Earned {new Date(earnedDate).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Not earned yet</p>
                    )}
                  </div>
                );
              })}
            </div>

            {achievements.length === 0 && (
              <div className="text-center py-8">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Start tracking transactions to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-400" />
            Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <input
                type="text"
                value={preferences?.currency || '₦'}
                className="input-field"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weekly Savings Goal (₦)</label>
              <input
                type="number"
                value={preferences?.weekly_savings_goal || 0}
                onChange={async (e) => {
                  try {
                    await preferencesAPI.update({ weekly_savings_goal: parseFloat(e.target.value) });
                    loadData();
                  } catch (error) {
                    alert('Failed to update settings');
                  }
                }}
                className="input-field"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spending Limit (₦)</label>
              <input
                type="number"
                value={preferences?.spending_limit || 0}
                onChange={async (e) => {
                  try {
                    await preferencesAPI.update({ spending_limit: parseFloat(e.target.value) });
                    loadData();
                  } catch (error) {
                    alert('Failed to update settings');
                  }
                }}
                className="input-field"
                placeholder="50000"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="font-medium">Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.notification_enabled || false}
                  onChange={async (e) => {
                    try {
                      await preferencesAPI.update({ notification_enabled: e.target.checked });
                      loadData();
                    } catch (error) {
                      alert('Failed to update settings');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="glass-card p-6 bg-gradient-to-r from-primary-500/20 to-teal-500/20">
          <h3 className="text-2xl font-bold mb-4">Your Financial Journey</h3>
          <p className="text-gray-300 mb-4">
            You've earned <span className="font-bold text-primary-400">{achievements.length}</span> achievement{achievements.length !== 1 ? 's' : ''} so far! 
            Keep tracking your transactions and reaching your goals to unlock more badges.
          </p>
          <p className="text-gray-400 text-sm">
            💡 Tip: Complete a savings goal to earn the "Goal Getter" badge!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
