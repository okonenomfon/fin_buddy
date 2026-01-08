'use client';
import { Plus } from 'lucide-react';
import axios from 'axios';

export default function GoalsWidget({ goals, userId, onRefresh }: any) {
  const addGoal = async () => {
    const name = prompt("Goal Name?");
    const target = prompt("Target Amount?");
    if(name && target) {
      await axios.post('http://localhost:5000/api/goals', { userId, name, target });
      onRefresh();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-300">Savings Goals</h3>
        <button onClick={addGoal} className="text-teal-400"><Plus size={18}/></button>
      </div>
      {goals.map((g: any) => (
        <div key={g.id} className="mb-4">
          <div className="flex justify-between text-sm mb-1 text-slate-300">
            <span>{g.name}</span>
            <span>₦0 / ₦{g.targetAmount}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[10%]"></div>
          </div>
        </div>
      ))}
    </div>
  );
}