import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Award, TrendingUp, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navigation from '../components/Navigation'

export default function Profile({ user }) {
  const router = useRouter()
  const [badges, setBadges] = useState([])
  const [transactions, setTransactions] = useState([])
  const [darkMode, setDarkMode] = useState(false)

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
    
    fetchBadges()
    fetchTransactions()
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/badges`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBadges(response.data)
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const availableBadges = [
    { name: 'Smart Saver', icon: '💰', description: 'Save for 7 consecutive days', earned: false },
    { name: 'Budget Boss', icon: '📊', description: 'Track 30 transactions', earned: transactions.length >= 30 },
    { name: 'Goal Getter', icon: '🎯', description: 'Complete your first savings goal', earned: false },
    { name: 'Week Warrior', icon: '⚡', description: 'Add transactions for 7 days straight', earned: false },
    { name: 'Month Master', icon: '🏆', description: 'Stay under budget for a month', earned: false },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Head>
        <title>Profile - FinBuddy</title>
      </Head>

      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Your Profile 👤
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Manage your account and view achievements
            </p>
          </motion.div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-lg transition-colors`}
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 shadow-lg`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <User size={48} className="text-white" />
              </div>
              
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} text-center mb-6`}>
                {user?.name || 'User'}
              </h2>

              <div className="space-y-4">
                <div className={`flex items-center gap-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Mail size={20} />
                  <span>{user?.email || 'email@example.com'}</span>
                </div>
                <div className={`flex items-center gap-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar size={20} />
                  <span>Joined recently</span>
                </div>
                <div className={`flex items-center gap-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <TrendingUp size={20} />
                  <span>{transactions.length} transactions</span>
                </div>
              </div>

              <div className={`mt-8 p-4 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-teal-900/30 to-blue-900/30' 
                  : 'bg-gradient-to-br from-teal-50 to-blue-50'
              }`}>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Account Status
                </p>
                <p className={`text-xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                  Active Member 🌟
                </p>
              </div>
            </div>
          </motion.div>

          {/* Badges & Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 shadow-lg mb-6`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center gap-2`}>
                <Award className="text-yellow-500" />
                Badges & Achievements
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {availableBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      badge.earned
                        ? darkMode
                          ? 'border-teal-500 bg-gradient-to-br from-teal-900/30 to-blue-900/30'
                          : 'border-teal-500 bg-gradient-to-br from-teal-50 to-blue-50'
                        : darkMode
                          ? 'border-gray-700 bg-gray-700/50 opacity-60'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {badge.description}
                    </p>
                    {badge.earned && (
                      <div className={`mt-3 font-semibold text-sm ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                        ✓ Earned!
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 shadow-lg`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
                Recent Activity
              </h2>
              
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {transaction.vendor}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'Debit' ? 'text-red-600' : 'text-teal-600'
                        }`}>
                          {transaction.type === 'Debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No transactions yet
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}