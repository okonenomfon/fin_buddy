import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinBuddy | AI Financial Assistant',
  description: 'AI-powered personal finance manager for students and professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-teal-500 selection:text-black`}>
        {/* Simple Top Navigation Bar */}
        <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center font-bold text-white">
                F
              </div>
              <span className="font-bold text-xl tracking-tight text-white">FinBuddy</span>
            </div>
            <div className="text-sm text-slate-400">
              v1.0.0
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}