'use client';
import { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X } from 'lucide-react';

export default function FinBuddyChat({ context }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<{role:string, text:string}[]>([]);

  const send = async () => {
    const userMsg = msg;
    setMsg('');
    setHistory(p => [...p, {role: 'user', text: userMsg}]);
    const res = await axios.post('http://localhost:5000/api/chat', { message: userMsg, context });
    setHistory(p => [...p, {role: 'bot', text: res.data.reply}]);
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
      <MessageSquare size={24} className="text-white"/>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="bg-slate-800 p-3 flex justify-between border-b border-slate-700">
        <span className="font-bold text-white flex gap-2"><MessageSquare/> FinBuddy AI</span>
        <button onClick={() => setIsOpen(false)}><X className="text-white"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.map((h, i) => (
          <div key={i} className={`p-2 rounded text-sm ${h.role === 'user' ? 'bg-blue-600 ml-auto text-white' : 'bg-slate-700 text-slate-200'} max-w-[85%]`}>
            {h.text}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-slate-700 flex gap-2">
        <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 bg-black/20 text-white rounded px-2 text-sm" placeholder="Ask advice..."/>
        <button onClick={send} className="bg-blue-600 p-2 rounded text-white"><Send size={14}/></button>
      </div>
    </div>
  );
}