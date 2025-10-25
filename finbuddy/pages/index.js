import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Bot, Target } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      <Head>
        <title>FinBuddy - AI-Powered Finance Manager</title>
        <meta name="description" content="Manage your money smarter with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-white mb-6">
            <Sparkles className="inline-block mr-4" size={48} />
            FinBuddy
          </h1>
          <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Your AI-powered financial companion for smarter money management
          </p>

          <div className="flex gap-4 justify-center mb-20">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-neon btn-ripple"
              >
                Get Started Free
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30"
              >
                Sign In
              </motion.button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="glass p-8 rounded-3xl card-hover"
              >
                <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

const features = [
  {
    icon: <Bot size={32} className="text-teal-400" />,
    title: "AI SMS Parser",
    description: "Automatically analyzes your bank SMS alerts and categorizes transactions"
  },
  {
    icon: <TrendingUp size={32} className="text-teal-400" />,
    title: "Smart Insights",
    description: "Get personalized spending insights and predictions powered by AI"
  },
  {
    icon: <Target size={32} className="text-teal-400" />,
    title: "Savings Goals",
    description: "Set and track savings goals with gamified rewards and achievements"
  }
]
