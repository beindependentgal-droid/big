import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Heart, MessageSquare, Plus, Flame } from 'lucide-react';
import { Goal, Member } from '../data';

interface GoalTrackerViewProps {
  currentUser: Member;
  addPoints: (pts: number) => void;
}

export function GoalTrackerView({ currentUser, addPoints }: GoalTrackerViewProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'g1',
      userId: currentUser.id,
      title: 'Finish BIG Academy Module 2',
      category: 'weekly',
      status: 'pending',
      timestamp: '2 days ago',
      cheers: 5,
      cheeredBy: [],
      updates: []
    },
    {
      id: 'g2',
      userId: 'm2',
      title: 'Launch my new e-commerce store',
      category: 'monthly',
      status: 'completed',
      timestamp: '1 week ago',
      cheers: 24,
      cheeredBy: [currentUser.id],
      updates: [{ text: 'Domain purchased!', timestamp: '5 days ago' }]
    }
  ]);

  const [newGoal, setNewGoal] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'weekly' | 'monthly' | 'standup'>('weekly');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const goal: Goal = {
      id: `goal-${Date.now()}`,
      userId: currentUser.id,
      title: newGoal,
      category: newGoalCategory,
      status: 'pending',
      timestamp: 'Just now',
      cheers: 0,
      cheeredBy: [],
      updates: []
    };

    setGoals([goal, ...goals]);
    setNewGoal('');
    addPoints(10);
  };

  const handleToggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id && g.userId === currentUser.id) {
        const newStatus = g.status === 'pending' ? 'completed' : 'pending';
        if (newStatus === 'completed') addPoints(25);
        return { ...g, status: newStatus };
      }
      return g;
    }));
  };

  const handleCheer = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const isCheered = g.cheeredBy.includes(currentUser.id);
        if (isCheered) {
          return { ...g, cheers: g.cheers - 1, cheeredBy: g.cheeredBy.filter(u => u !== currentUser.id) };
        } else {
          return { ...g, cheers: g.cheers + 1, cheeredBy: [...g.cheeredBy, currentUser.id] };
        }
      }
      return g;
    }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full mb-4">
          <Target className="h-8 w-8 text-secondary" />
        </div>
        <h1 className="text-3xl font-black text-primary uppercase tracking-tight">Builder accountability</h1>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">Choose a clear next step, share your progress, and keep building with accountability.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-secondary" /> Set a building goal
        </h3>
        <form onSubmit={handleAddGoal} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="What is your next clear step?" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
          <select 
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-secondary"
          >
            <option value="weekly">Weekly Goal</option>
            <option value="monthly">Monthly Milestone</option>
            <option value="standup">Saturday Standup</option>
          </select>
          <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap">
            Commit
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {goals.map(goal => (
          <div key={goal.id} className={`bg-white rounded-2xl border p-5 transition-all ${goal.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
            <div className="flex items-start gap-4">
              <button 
                onClick={() => handleToggleGoal(goal.id)}
                disabled={goal.userId !== currentUser.id}
                className={`mt-1 flex-shrink-0 ${goal.userId !== currentUser.id ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-110'} transition-transform`}
              >
                {goal.status === 'completed' 
                  ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> 
                  : <Circle className="h-6 w-6 text-slate-300" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {goal.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{goal.timestamp}</span>
                </div>
                <h4 className={`text-lg font-bold ${goal.status === 'completed' ? 'text-slate-500 line-through' : 'text-primary'}`}>
                  {goal.title}
                </h4>
                
                {goal.updates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {goal.updates.map((update, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 block mb-1">{update.timestamp}</span>
                        {update.text}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-4">
                  <button 
                    onClick={() => handleCheer(goal.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${goal.cheeredBy.includes(currentUser.id) ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Heart className={`h-4 w-4 ${goal.cheeredBy.includes(currentUser.id) ? 'fill-current' : ''}`} />
                    {goal.cheers} Cheers
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    <MessageSquare className="h-4 w-4" /> Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
