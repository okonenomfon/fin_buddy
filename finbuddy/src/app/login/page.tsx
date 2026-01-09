'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user.id);
        router.push('/');
      } else if (!isLogin) {
        setIsLogin(true);
        alert('Account created! Please login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
          {isLogin ? 'Welcome Back' : 'Join FinBuddy'}
        </h2>
        <p className="text-center text-slate-400 mb-8">AI-Powered Financial Management</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-black/20 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
            />
          )}
          <input 
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
          />
          
          <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-teal-400 hover:text-teal-300 font-semibold">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}