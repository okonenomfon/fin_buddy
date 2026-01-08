'use client';
import { useState } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';

export default function SMSInput({ userId, onRefresh }: any) {
  const [sms, setSms] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if(!sms) return;
    setLoading(true);
    await axios.post('http://localhost:5000/api/transactions/parse', { smsText: sms, userId });
    setSms('');
    onRefresh();
    setLoading(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-teal-400"><Plus size={20}/> New Transaction</h2>
      <textarea 
        value={sms} 
        onChange={e => setSms(e.target.value)}
        className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 h-24 mb-3 text-white"
        placeholder="Paste Bank SMS..."
      />
      <button onClick={handleParse} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg font-medium">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Process with AI'}
      </button>
    </div>
  );
}