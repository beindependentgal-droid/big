import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Target, Briefcase, Heart, BookOpen, Check } from 'lucide-react';
import { Member } from '../data';

interface OnboardingFlowProps {
  currentUser: Member;
  onComplete: () => void;
}

export function OnboardingFlow({ currentUser, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const goalOptions = [
    { id: 'grow_business', label: 'Grow my business', icon: <Target className="h-5 w-5" /> },
    { id: 'find_job', label: 'Find a new role', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'learn_skills', label: 'Learn new skills', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'network', label: 'Build my network', icon: <Heart className="h-5 w-5" /> }
  ];

  const interestOptions = [
    'Technology', 'Marketing', 'E-commerce', 'Design', 
    'Finance', 'Leadership', 'Freelancing', 'Mental Health'
  ];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onComplete();
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        <div className="h-2 w-full bg-slate-100">
          <div 
            className="h-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 bg-secondary/10 rounded-full text-secondary mb-2">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-black text-primary">Welcome, {currentUser.name.split(' ')[0]}!</h2>
                  <p className="text-slate-500 text-lg">Let's personalize your BIG experience to help you thrive.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest text-center">What is your primary goal?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goalOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => toggleGoal(option.id)}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                          goals.includes(option.id) 
                            ? 'border-secondary bg-secondary/5 text-secondary' 
                            : 'border-slate-100 hover:border-secondary/30 text-slate-600'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${goals.includes(option.id) ? 'bg-secondary/20' : 'bg-slate-100'}`}>
                          {option.icon}
                        </div>
                        <span className="font-bold text-sm">{option.label}</span>
                        {goals.includes(option.id) && <Check className="h-5 w-5 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black text-primary">What interests you?</h2>
                  <p className="text-slate-500">We'll use this to recommend Circles and mentors.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center pt-4">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                        interests.includes(interest)
                          ? 'bg-primary text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="inline-flex p-6 bg-emerald-50 rounded-full text-emerald-500 mb-2">
                  <Check className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-primary">You're all set!</h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                  Based on your goals, we recommend joining the <strong className="text-secondary">Learn Academy Lounge</strong> and setting your first goal in the <strong className="text-primary">Accountability Tracker</strong>.
                </p>
                
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 inline-block text-left mt-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your Matches</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">🎯</span>
                      Learn Academy Lounge
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <span className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">👩‍🏫</span>
                      Mentor: Amina Bello
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            <button 
              onClick={() => step === 0 ? onComplete() : setStep(step - 1)}
              className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
              {step === 0 ? 'Skip for now' : 'Back'}
            </button>
            <button 
              onClick={handleNext}
              disabled={step === 0 && goals.length === 0}
              className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {step === 2 ? "Let's Go!" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
