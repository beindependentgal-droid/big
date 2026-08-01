import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter(req => req.met).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500';
  let textColor = 'text-rose-500';
  let ringColor = 'border-rose-200 dark:border-rose-950/40';

  if (score === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    textColor = 'text-amber-500';
    ringColor = 'border-amber-200 dark:border-amber-950/40';
  } else if (score === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-yellow-500';
    textColor = 'text-yellow-500';
    ringColor = 'border-yellow-200 dark:border-yellow-950/40';
  } else if (score === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    textColor = 'text-emerald-500';
    ringColor = 'border-emerald-200 dark:border-emerald-950/40';
  } else if (score === 5) {
    strengthLabel = 'Excellent';
    strengthColor = 'bg-teal-500';
    textColor = 'text-teal-500';
    ringColor = 'border-teal-200 dark:border-teal-950/40';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border ${ringColor} bg-slate-50/50 dark:bg-slate-900/50 space-y-3.5 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password Strength</span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${textColor}`}>
          {score >= 4 ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
          {strengthLabel}
        </span>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-full rounded-full transition-all duration-300 ${
              index <= score ? strengthColor : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-1.5 pt-1">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${
                req.met
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
                  : 'bg-transparent border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700'
              }`}
            >
              <Check className={`h-2.5 w-2.5 stroke-[3] transition-transform duration-200 ${req.met ? 'scale-100' : 'scale-0'}`} />
            </div>
            <span
              className={`text-[10px] font-medium tracking-normal transition-colors duration-200 ${
                req.met ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
