import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TransactionList({ transactions }: any) {
  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xl font-bold text-slate-300">Recent Activity</h3>
      {transactions.map((tx: any) => (
        <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {tx.type === 'credit' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
            </div>
            <div>
              <p className="font-medium text-white">{tx.description || tx.category}</p>
              <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
            {tx.type === 'debit' ? '-' : '+'}₦{tx.amount?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}