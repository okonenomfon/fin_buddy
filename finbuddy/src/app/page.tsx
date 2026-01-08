'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SMSInput from '@/components/SMSInput';
import TransactionList from '@/components/TransactionList';
import FinBuddyChat from '@/components/FinBuddyChat';
import GoalsWidget from '@/components/GoalsWidget';

ChartJS.register(ArcElement, Tooltip, Legend);

// Inside src/app/page.tsx

export default function Dashboard() {
  // 1. CHANGE THIS: Start with null, not 1
  const [userId, setUserId] = useState<string | null>(null); 
  const [data, setData] = useState({ transactions: [], goals: [] });
  const router = useRouter(); // Add import { useRouter } from 'next/navigation'; at top

  // 2. CHANGE THIS: Check Login on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedId = localStorage.getItem('userId');

    if (!token || !storedId) {
      router.push('/login'); // Kick them out if not logged in
    } else {
      setUserId(storedId);
      // Fetch data only after we have the ID
      fetchData(storedId); 
    }
  }, []);

  const fetchData = async (id: string) => {
    try {
      const [tx, gl] = await Promise.all([
        axios.get(`http://localhost:5000/api/transactions?userId=${id}`),
        axios.get(`http://localhost:5000/api/goals?userId=${id}`)
      ]);
      setData({ transactions: tx.data, goals: gl.data });
    } catch (e) {
      console.error("Error fetching data", e);
    }
  };

  // Spending Chart Data
  const chartData = {
    labels: ['Food', 'Transport', 'Bills'],
    datasets: [{
      data: ['Food', 'Transport', 'Bills'].map(cat => 
        data.transactions.filter((t:any) => t.category === cat && t.type === 'debit').reduce((a, b:any) => a + b.amount, 0)
      ),
      backgroundColor: ['#F87171', '#60A5FA', '#34D399'],
      borderWidth: 0,
    }]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Input & List */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-6">FinBuddy</h1>
          <SMSInput userId={userId} onRefresh={fetchData} />
          <TransactionList transactions={data.transactions} />
        </div>

        {/* Right Col: Stats & Goals */}
        <div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl mb-6">
            <p className="text-blue-200 text-sm">Total Balance</p>
            <h2 className="text-4xl font-bold text-white mt-1">₦62,000</h2>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex justify-center">
            <div className="w-48 h-48">
              <Doughnut data={chartData} options={{plugins: {legend: {display: false}}}} />
            </div>
          </div>

          <GoalsWidget goals={data.goals} userId={userId} onRefresh={fetchData} />
        </div>
      </div>
      
      {/* Floating Chatbot */}
      <FinBuddyChat context={data.transactions.slice(0, 5)} />
    </main>
  );
}