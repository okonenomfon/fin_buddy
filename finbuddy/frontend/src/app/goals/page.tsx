'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { goalsAPI, insightsAPI } from '@/lib/api';
import { Target, Plus, TrendingUp, CheckCircle, X, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
  created_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
    loadSuggestions();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await insightsAPI.getSavingsSuggestions();
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await goalsAPI.create({
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        deadline: newGoal.deadline || undefined,
      });
      
      setNewGoal({ title: '', target_amount: '', deadline: '' });
      setShowModal(false);
      loadGoals();
    } catch (error: any) {
      alert('Failed to create goal: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleUpdateProgress = async (goalId: number, amount: number) => {
    try {
      await goalsAPI.update(goalId, { current_amount: amount });
      loadGoals();
    } catch (error) {
      alert('Failed to update goal');
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
    try {
      await goalsAPI.update(goalId, { status: 'completed' });
      loadGoals();
    } catch (error) {
      alert('Failed to complete goal');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsAPI.delete(goalId);
      loadGoals();
    } catch (error) {
      alert('Failed to delete goal');
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
              <Target className="w-8 h-8 text-primary-500" />
              Savings Goals
            </h1>
            <p className="text-gray-400">Set and track your financial goals 🎯</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* AI Savings Suggestions */}
        {suggestions.length > 0 && (
          <div className="glass-card p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">AI Savings Tips</h3>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-gray-200 text-sm">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Active Goals */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Goals ({activeGoals.length})</h2>
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const isComplete = progress >= 100;

                return (
                  <div key={goal.id} className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{goal.title}</h3>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-teal-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-primary-400">
                          ₦{goal.current_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          of ₦{goal.target_amount.toLocaleString()}
                        </p>
                      </div>
                      {goal.deadline && (
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Deadline</p>
                          <p className="font-semibold">{format(new Date(goal.deadline), 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isComplete ? (
                        <button
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const amount = prompt('Enter amount to add to this goal:');
                            if (amount) {
                              handleUpdateProgress(goal.id, goal.current_amount + parseFloat(amount));
                            }
                          }}
                          className="btn-primary flex-1"
                        >
                          Add Funds
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No active goals yet. Create your first savings goal!</p>
              <button onClick={() => setShowModal(true)} className="btn-primary">
                Create Goal
              </button>
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Goals 🎉</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="glass-card p-6 bg-green-500/10 border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold">{goal.title}</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-2">
                    ₦{goal.current_amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Completed on {format(new Date(goal.updated_at || goal.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="glass-card p-8 max-w-md w-full relative z-10">
            <h2 className="text-2xl font-bold mb-6">Create New Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Buy a Laptop"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Amount (₦) *</label>
                <input
                  type="number"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="50000"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleCreateGoal} className="btn-primary flex-1">
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
