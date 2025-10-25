import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { 
  TrendingDown, TrendingUp, Wallet, MessageSquare, Target, Upload, LogOut,
  Download, FileText, AlertCircle, Repeat, Image as ImageIcon, Search, Moon, Sun, Bell, Newspaper, Filter
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navigation from '../components/Navigation'

export default function Dashboard({ user }) {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [insight, setInsight] = useState('')
  const [smsText, setSmsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recurring, setRecurring] = useState([])
  const [news, setNews] = useState([])
  
  // Feature states
  const [bulkSms, setBulkSms] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showMonthlyReport, setShowMonthlyReport] = useState(false)
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadTransactionId, setUploadTransactionId] = useState(null)

  // New budget form
  const [newBudget, setNewBudget] = useState({
    category: 'food',
    limit_amount: '',
    alert_threshold: 80
  })

  // New recurring form
  const [newRecurring, setNewRecurring] = useState({
    name: '',
    amount: '',
    category: 'subscription',
    frequency: 'monthly',
    next_date: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    await Promise.all([
      fetchStats(),
      fetchInsights(),
      fetchTransactions(),
      fetchBudgets(),
      fetchAlerts(),
      fetchRecurring(),
      fetchNews()
    ])
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInsight(response.data.insights?.[0] || '')
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBudgets(response.data)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlerts(response.data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchRecurring = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recurring`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRecurring(response.data)
    } catch (error) {
      console.error('Failed to fetch recurring:', error)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/news/finance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNews(response.data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    }
  }

  const handleParseSMS = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(
        `${API_URL}/api/transactions/parse-sms`,
        { smsText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSmsText('')
      fetchAll()
      alert('✅ Transaction added successfully!')
    } catch (error) {
      alert('❌ Failed to parse SMS')
    } finally {
      setLoading(false)
    }
  }

  // FEATURE 1: Bulk SMS Upload
  const handleBulkParseSMS = async () => {
    setLoading(true)
    try {
      const smsArray = bulkSms.split('\n\n').filter(s => s.trim())
      await axios.post(
        `${API_URL}/api/transactions/parse-bulk-sms`,
        { smsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBulkSms('')
      setShowBulkUpload(false)
      fetchAll()
      alert('✅ Bulk SMS parsed successfully!')
    } catch (error) {
      alert('❌ Failed to parse bulk SMS')
    } finally {
      setLoading(false)
    }
  }

  // FEATURE 2: Export Data
  const handleExport = async (format = 'csv') => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'csv' ? 'blob' : 'json'
      })
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'transactions.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      alert('✅ Data exported successfully!')
    } catch (error) {
      alert('❌ Export failed')
    }
  }

  // FEATURE 3: Monthly Reports
  const fetchMonthlyReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/monthly`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMonthlyReport(response.data)
      setShowMonthlyReport(true)
    } catch (error) {
      alert('❌ Failed to generate report')
    }
  }

  // FEATURE 4: Create Budget
  const handleCreateBudget = async () => {
    try {
      await axios.post(`${API_URL}/api/budgets`, {
        ...newBudget,
        limit_amount: parseFloat(newBudget.limit_amount),
        alert_threshold: Number(newBudget.alert_threshold)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowBudgetModal(false)
      setNewBudget({ category: 'food', limit_amount: '', alert_threshold: 80 })
      fetchBudgets()
      alert('✅ Budget created!')
    } catch (error) {
      alert('❌ Failed to create budget')
    }
  }

  // FEATURE 5: Receipt Upload
  const handleReceiptUpload = async (transactionId) => {
    if (!selectedFile) return
    
    const formData = new FormData()
    formData.append('receipt', selectedFile)

    try {
      await axios.post(`${API_URL}/api/transactions/${transactionId}/receipt`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('✅ Receipt uploaded!')
      setSelectedFile(null)
      setUploadTransactionId(null)
      fetchTransactions()
    } catch (error) {
      alert('❌ Receipt upload failed')
    }
  }

  // FEATURE 6: Create Recurring Transaction
  const handleCreateRecurring = async () => {
    try {
      await axios.post(`${API_URL}/api/recurring`, newRecurring, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowRecurringModal(false)
      setNewRecurring({ name: '', amount: '', category: 'subscription', frequency: 'monthly', next_date: '' })
      fetchRecurring()
      alert('✅ Recurring transaction created!')
    } catch (error) {
      alert('❌ Failed to create recurring transaction')
    }
  }

  // FEATURE 8: Dark Mode Toggle
  const toggleDarkMode = async () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    try {
      await axios.put(`${API_URL}/api/user/settings`, 
        { dark_mode: newMode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      console.error('Failed to update dark mode')
    }
  }

  // FEATURE 9: Search Transactions
  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/search`, {
        params: { query: searchQuery, category: filterCategory },
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data)
    } catch (error) {
      alert('❌ Search failed')
    }
  }

  const COLORS = ['#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Head>
        <title>Dashboard - FinBuddy Enhanced</title>
      </Head>

      <Navigation user={user} />

      <main className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-white' : ''}`}>
        {/* Header with new features */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Here's your financial overview</p>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* FEATURE 11: Finance News Indicator */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Newspaper className="w-6 h-6" />
              {news.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* FEATURE 4: Alerts Bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="w-6 h-6" />
              {alerts.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* FEATURE 8: Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* FEATURE 1: Bulk Upload */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowBulkUpload(true)}
            className={`flex flex-col items-center gap-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl`}
          >
            <Upload className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-semibold">Bulk Upload</span>
          </motion.button>

          {/* FEATURE 2: Export */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleExport('csv')}
            className={`flex flex-col items-center gap-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl`}
          >
            <Download className="w-8 h-8 text-teal-600" />
            <span className="text-sm font-semibold">Export CSV</span>
          </motion.button>

          {/* FEATURE 3: Monthly Report */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={fetchMonthlyReport}
            className={`flex flex-col items-center gap-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl`}
          >
            <FileText className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-semibold">Monthly Report</span>
          </motion.button>

          {/* FEATURE 4 & 10: Budget Limits */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowBudgetModal(true)}
            className={`flex flex-col items-center gap-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl`}
          >
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-semibold">Set Budget</span>
          </motion.button>

          {/* FEATURE 6: Recurring */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowRecurringModal(true)}
            className={`flex flex-col items-center gap-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl`}
          >
            <Repeat className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-semibold">Add Recurring</span>
          </motion.button>
        </div>

        {/* FEATURE 11: Finance News */}
        {news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg mb-8`}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Newspaper className="text-blue-600" />
              Today's Finance News
            </h2>
            <div className="grid gap-4">
              {news.map(item => (
                <div key={item.id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.summary}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FEATURE 4: Budget Alerts */}
        {alerts.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-lg mb-8">
            <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2">⚠️ Budget Alerts</h3>
            {alerts.slice(0, 3).map(alert => (
              <p key={alert.id} className="text-sm text-orange-700 dark:text-orange-400">
                {alert.message}
              </p>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Wallet size={32} />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Balance</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ₦{stats?.currentBalance?.toLocaleString() || '0'}
            </h3>
            <p className="text-blue-100 text-sm">Current balance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingDown size={32} />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Spending</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ₦{stats?.totalSpending?.toLocaleString() || '0'}
            </h3>
            <p className="text-red-100 text-sm">Total spending</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Income</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ₦{stats?.totalIncome?.toLocaleString() || '0'}
            </h3>
            <p className="text-teal-100 text-sm">Total income</p>
          </motion.div>
        </div>

        {/* AI Insight Card */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl p-6 mb-8 gradient-bg"
          >
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="text-teal-400" />
              AI Insights
            </h2>
            <p className="text-white/90 leading-relaxed">{insight}</p>
          </motion.div>
        )}

        {/* FEATURE 9: Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg mb-8`}
        >
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="airtime">Airtime</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              <Filter size={20} />
            </button>
          </div>
        </motion.div>

        {/* SMS Parser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg mb-8`}
          >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Upload className="text-teal-500" />
            Add Transaction (SMS)
          </h2>
          <form onSubmit={handleParseSMS} className="space-y-4">
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste your bank SMS here...&#10;Example: Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000."
              className={`w-full border-2 rounded-xl p-4 focus:border-teal-500 focus:outline-none min-h-[100px] ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 text-black'}`}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 btn-ripple"
            >
              {loading ? 'Processing...' : '🤖 Parse with AI'}
            </button>
          </form>
        </motion.div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 shadow-lg mb-8`}
          >
            <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.slice(0, 10).map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-4 border rounded-xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div>
                    <p className="font-semibold">{t.vendor}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === 'debit' ? 'text-red-600' : 'text-teal-600'}`}>
                      {t.type === 'debit' ? '-' : '+'}₦{t.amount.toLocaleString()}
                    </span>
                    {/* FEATURE 5: Receipt Upload */}
                    <button 
                      onClick={() => setUploadTransactionId(t.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Category Spending */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg`}
          >
            <h2 className="text-2xl font-bold mb-6">Spending by Category</h2>
            {stats?.categoryStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: ₦${entry.total.toLocaleString()}`}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-20">No data yet. Add some transactions!</p>
            )}
          </motion.div>

          {/* Weekly Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg`}
          >
            <h2 className="text-2xl font-bold mb-6">Weekly Trends</h2>
            {stats?.weeklySpending?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...stats.weeklySpending].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="spending" fill="#ef4444" name="Spending" />
                  <Bar dataKey="income" fill="#14b8a6" name="Income" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-20">No data yet. Add some transactions!</p>
            )}
          </motion.div>
        </div>

        {/* MODALS */}
        
        {/* FEATURE 1: Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-4">📤 Bulk SMS Upload</h2>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Paste multiple SMS messages separated by blank lines
              </p>
              <textarea
                value={bulkSms}
                onChange={(e) => setBulkSms(e.target.value)}
                placeholder="Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000.

Debit: ₦1,200 Airtime purchase. Bal: ₦10,800.

Credit: ₦50,000 Salary payment. Bal: ₦60,800."
                className={`w-full p-4 border rounded-xl mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                rows={10}
              />
              <div className="flex gap-4">
                <button
                  onClick={handleBulkParseSMS}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                  {loading ? 'Processing...' : 'Upload All'}
                </button>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className={`px-6 py-3 border rounded-xl font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 4: Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full`}>
              <h2 className="text-2xl font-bold mb-4">💰 Set Spending Limit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                  >
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="airtime">Airtime</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Monthly Limit (₦)</label>
                  <input
                    type="number"
                    value={newBudget.limit_amount}
                    onChange={(e) => setNewBudget({...newBudget, limit_amount: e.target.value})}
                    className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Alert at % ({newBudget.alert_threshold}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={newBudget.alert_threshold}
                    onChange={(e) => setNewBudget({...newBudget, alert_threshold: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateBudget}
                    className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700"
                  >
                    Create Budget
                  </button>
                  <button
                    onClick={() => setShowBudgetModal(false)}
                    className={`px-6 py-3 border rounded-xl font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 6: Recurring Modal */}
        {showRecurringModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full`}>
              <h2 className="text-2xl font-bold mb-4">🔁 Add Recurring Transaction</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name (e.g., Netflix)"
                  value={newRecurring.name}
                  onChange={(e) => setNewRecurring({...newRecurring, name: e.target.value})}
                  className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                />
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({...newRecurring, amount: e.target.value})}
                  className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                />
                <select
                  value={newRecurring.frequency}
                  onChange={(e) => setNewRecurring({...newRecurring, frequency: e.target.value})}
                  className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="date"
                  value={newRecurring.next_date}
                  onChange={(e) => setNewRecurring({...newRecurring, next_date: e.target.value})}
                  className={`w-full p-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateRecurring}
                    className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700"
                  >
                    Add Recurring
                  </button>
                  <button
                    onClick={() => setShowRecurringModal(false)}
                    className={`px-6 py-3 border rounded-xl font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 3: Monthly Report Modal */}
        {showMonthlyReport && monthlyReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-2xl w-full my-8`}>
              <h2 className="text-2xl font-bold mb-4">📊 Monthly Report - {monthlyReport.period}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spending</p>
                  <p className="text-2xl font-bold text-blue-600">₦{monthlyReport.summary.total_spending?.toLocaleString() || 0}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                  <p className="text-2xl font-bold text-teal-600">₦{monthlyReport.summary.total_income?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Category Breakdown</h3>
                {monthlyReport.categoryBreakdown.map(cat => (
                  <div key={cat.category} className={`flex justify-between p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span className="capitalize">{cat.category}</span>
                    <span className="font-semibold">₦{cat.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Top Vendors</h3>
                {monthlyReport.topVendors.map(vendor => (
                  <div key={vendor.vendor} className={`flex justify-between p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span>{vendor.vendor}</span>
                    <span className="font-semibold">₦{vendor.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowMonthlyReport(false)}
                className={`w-full px-6 py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* FEATURE 5: Receipt Upload Modal */}
        {uploadTransactionId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full`}>
              <h2 className="text-2xl font-bold mb-4">📷 Upload Receipt</h2>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className={`w-full p-3 border rounded-xl mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200'}`}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => handleReceiptUpload(uploadTransactionId)}
                  disabled={!selectedFile}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setUploadTransactionId(null)
                    setSelectedFile(null)
                  }}
                  className={`px-6 py-3 border rounded-xl font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}