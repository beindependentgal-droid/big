import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Briefcase, GraduationCap, ArrowRight, X, Sparkles, LayoutDashboard } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  view: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'The Community Feed',
    description: 'This is where the magic happens! Share updates, ask questions, and celebrate milestones with sisters across the globe.',
    icon: Users,
    color: 'bg-primary',
    view: 'feeds'
  },
  {
    title: 'Member Directory',
    description: 'Find your perfect accountability partner, mentor, or collaborator. Filter by skills, industry, or location.',
    icon: Briefcase,
    color: 'bg-secondary',
    view: 'directory'
  },
  {
    title: 'BIG Academy',
    description: 'Access exclusive masterclasses, resources, and workshops designed to scale your business and leadership skills.',
    icon: GraduationCap,
    color: 'bg-accent',
    view: 'academy'
  }
];

interface TourOverlayProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function TourOverlay({ onClose, onNavigate }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      onNavigate(TOUR_STEPS[currentStep + 1].view);
    } else {
      onClose();
    }
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Glow Effect */}
        <div className={`absolute top-0 inset-x-0 h-2 ${step.color} opacity-50`} />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 pt-12">
          <div className="flex flex-col items-center text-center">
            <div className={`h-20 w-20 rounded-3xl ${step.color} flex items-center justify-center text-white mb-6 shadow-xl shadow-current/20`}>
              <Icon className="h-10 w-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Quick Start Tour
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              {step.title}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10 text-lg">
              {step.description}
            </p>

            {/* Progress Dots */}
            <div className="flex gap-2 mb-10">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    i === currentStep ? `w-8 ${step.color}` : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className={`flex-[1.5] group flex items-center justify-center gap-2 px-6 py-4 rounded-2xl ${step.color} text-white text-sm font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all`}
              >
                <span>{currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next Insight'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 h-40 w-40 bg-secondary/5 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
