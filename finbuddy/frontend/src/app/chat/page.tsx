'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { chatAPI } from '@/lib/api';
import { Send, Bot, User, Trash2, Loader } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      message: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await chatAPI.send(userMessage);
      
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        message: response.data.response,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      alert('Failed to get response: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return;

    try {
      await chatAPI.clearHistory();
      setMessages([]);
    } catch (error) {
      alert('Failed to clear chat history');
    }
  };

  const suggestedQuestions = [
    "How much did I spend on food last week?",
    "What's my biggest spending category?",
    "Give me tips to save ₦10,000 this month",
    "Am I overspending?",
    "How can I reduce my transport costs?",
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
                <Bot className="w-8 h-8 text-primary-500" />
                Chat with FinBuddy
              </h1>
              <p className="text-gray-400">Ask me anything about your finances! 💬</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="btn-secondary flex items-center gap-2"
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 glass-card p-6 overflow-y-auto mb-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Bot className="w-20 h-20 text-primary-500 mb-4 animate-float" />
              <h2 className="text-2xl font-bold mb-2">Hey there! 👋</h2>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                I'm your AI financial assistant. Ask me anything about your spending, 
                savings, or financial goals!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="glass-card-hover p-4 text-left text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-400" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary-500/20 text-white'
                        : 'bg-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text - black">
                      <User className="w-5 h-5 text-teal-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <Loader className="w-5 h-5 animate-spin text-primary-400" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="glass-card p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your finances..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary px-6"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
