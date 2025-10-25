'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { goalsAPI } from '@/lib/api';
import { 
  Target, 
  Home, 
  MessageCircle, 
  User, 
  LogOut, 
  Sparkles,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalsAPI.create({
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        deadline: newGoal.deadline
      });
      setShowCreateModal(false);
      setNewGoal({ name: '', targetAmount: '', deadline: '' });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateProgress = async (goalId: number, amount: number) => {
    try {
      await goalsAPI.update(goalId, amount);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
              Savings Goals
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/chat" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <Link href="/goals" className="p-2 bg-white/10 rounded-lg">
              <Target className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Savings Goals 🎯</h1>
            <p className="text-white/60">Track your progress and achieve your financial dreams</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
              <p className="text-white/70">Loading your goals...</p>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="p-6 bg-accent-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Target className="w-10 h-10 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Goals Yet</h2>
            <p className="text-white/60 mb-6">Start setting savings goals to track your financial progress!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass-button inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
              const daysLeft = getDaysRemaining(goal.deadline);
              const isCompleted = progress >= 100;

              return (
                <div key={goal.id} className="glass-card p-6 hover:scale-105 transition-transform">
                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-4 h-4" />
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Progress</span>
                      <span className="text-sm font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-accent-500 to-primary-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Current</span>
                      <span className="font-semibold text-accent-400">
                        ₦{goal.current_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Target</span>
                      <span className="font-semibold">₦{goal.target_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Remaining</span>
                      <span className="font-semibold text-primary-400">
                        ₦{Math.max(0, goal.target_amount - goal.current_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Update Button */}
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const amount = prompt('Enter amount to add to this goal:');
                        if (amount) {
                          const newAmount = goal.current_amount + parseFloat(amount);
                          handleUpdateProgress(goal.id, newAmount);
                        }
                      }}
                      className="w-full glass-button py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Add Progress
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-full bg-green-500/20 border border-green-500/50 rounded-xl py-2 text-center text-green-400 font-semibold">
                      🎉 Goal Achieved!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Create New Goal</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="input-glass w-full"
                    placeholder="e.g., New Laptop, Emergency Fund"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="input-glass w-full"
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="input-glass w-full"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="glass-button flex-1">
                    Create Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
