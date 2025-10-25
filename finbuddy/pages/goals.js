import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Target, Plus, Trophy, TrendingUp, Calendar, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navigation from '../components/Navigation'

export default function Goals({ user }) {
  const router = useRouter()
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: ''
  })
  const [suggestions, setSuggestions] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    
    // Load dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    fetchGoals()
    fetchSuggestions()
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGoals(response.data)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuggestions(response.data.suggestions)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        `${API_URL}/api/goals`,
        {
          title: newGoal.title,
          targetAmount: parseFloat(newGoal.targetAmount),
          deadline: newGoal.deadline
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowModal(false)
      setNewGoal({ title: '', targetAmount: '', deadline: '' })
      fetchGoals()
      alert('✅ Goal created successfully!')
    } catch (error) {
      alert('❌ Failed to create goal')
    }
  }

  const handleUpdateGoal = async (goalId, currentAmount) => {
    const amount = prompt('Enter amount to add:', '0')
    if (!amount) return

    try {
      const updatedAmount = parseFloat(currentAmount) + parseFloat(amount)
      await axios.patch(
        `${API_URL}/api/goals/${goalId}`,
        { currentAmount: updatedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchGoals()
    } catch (error) {
      alert('❌ Failed to update goal')
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Head>
        <title>Goals - FinBuddy</title>
      </Head>

      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Savings Goals 🎯
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Track your progress and stay motivated
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`p-3 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-lg transition-colors`}
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 btn-ripple"
            >
              <Plus size={20} />
              New Goal
            </button>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        {suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl p-6 mb-8 gradient-bg"
          >
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="text-yellow-400" />
              AI Savings Suggestions
            </h2>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{suggestions}</p>
          </motion.div>
        )}

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const progress = (goal.current_amount / goal.target_amount) * 100
            const isCompleted = progress >= 100

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg card-hover ${
                  isCompleted ? 'ring-4 ring-teal-500' : ''
                }`}
              >
                {isCompleted && (
                  <div className="flex items-center gap-2 text-teal-500 mb-3">
                    <Trophy size={20} />
                    <span className="font-semibold">Goal Achieved! 🎉</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {goal.title}
                    </h3>
                    {goal.deadline && (
                      <div className={`flex items-center gap-1 text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar size={14} />
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                    <Target size={24} className="text-white" />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                    <span className="font-semibold text-teal-600">{Math.min(progress, 100).toFixed(0)}%</span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      ₦{goal.current_amount.toLocaleString()}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      of ₦{goal.target_amount.toLocaleString()}
                    </p>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => handleUpdateGoal(goal.id, goal.current_amount)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        darkMode 
                          ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-400' 
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                      }`}
                    >
                      Add Funds
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Target size={64} className={darkMode ? 'text-gray-600' : 'text-gray-300'} />
            <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No savings goals yet
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Your First Goal
            </button>
          </motion.div>
        )}

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-300" />
            Your Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-3xl font-bold">{goals.length}</p>
              <p className="text-white/80 text-sm">Goals Created</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-3xl font-bold">
                {goals.filter(g => (g.current_amount / g.target_amount) >= 1).length}
              </p>
              <p className="text-white/80 text-sm">Goals Achieved</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-3xl font-bold">
                ₦{goals.reduce((sum, g) => sum + g.current_amount, 0).toLocaleString()}
              </p>
              <p className="text-white/80 text-sm">Total Saved</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full`}
          >
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
              Create New Goal
            </h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-black'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Amount (₦)
                </label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="10000"
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-black'
                  }`}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-black'
                  }`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 border-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all btn-ripple"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}