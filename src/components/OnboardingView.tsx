import React, { useState } from 'react';
import { ArrowRight, MapPin, BriefcaseBusiness, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Member } from '../data';

interface OnboardingViewProps {
  onComplete: (profileData: Partial<Member>) => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Member>>({
    city: '',
    title: '',
    business_stage: 'Idea Stage',
    interests: [],
    skills: []
  });

  const availableInterests = ['Sustainable Fashion', 'E-Commerce', 'FinTech', 'Agriculture', 'Education', 'Health Tech', 'Creative Arts', 'Logistics'];
  const availableSkills = ['Marketing', 'Product Design', 'Finance', 'Software Engineering', 'Operations', 'Sales', 'Leadership', 'Supply Chain'];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const toggleSelection = (field: 'interests' | 'skills', value: string) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(item => item !== value) });
    } else {
      if (current.length < 3) { // Limit to 3
        setFormData({ ...formData, [field]: [...current, value] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Progress Header */}
        <div className="bg-primary px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
              Set Up Your Profile
            </h2>
            <p className="text-white/80 text-xs mt-1">Step {step} of 4</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full ${i <= step ? 'bg-secondary' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground">Where are you building from?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Connecting you with sisters in your region.</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">City / Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm text-primary dark:text-primary-foreground focus:border-secondary focus:outline-none"
                    placeholder="e.g. Nairobi, Lagos, Accra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Professional Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm text-primary dark:text-primary-foreground focus:border-secondary focus:outline-none"
                    placeholder="e.g. Aspiring Fashion Founder"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary mb-4">
                  <BriefcaseBusiness className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground">What stage is your journey?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This helps us recommend the right circles and mentors.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Idea Stage', 'Early Stage', 'Growth Stage', 'Established'].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setFormData({ ...formData, business_stage: stage as Member['business_stage'] })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.business_stage === stage 
                        ? 'border-secondary bg-secondary/5' 
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary dark:text-primary-foreground">{stage}</span>
                      {formData.business_stage === stage && <CheckCircle2 className="h-5 w-5 text-secondary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-4">
                  <Compass className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground">Your Interests & Skills</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Select up to 3 for each to find your perfect match.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleSelection('interests', interest)}
                        className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                          formData.interests?.includes(interest)
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-secondary/50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSelection('skills', skill)}
                        className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                          formData.skills?.includes(skill)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black text-primary dark:text-primary-foreground">You're all set!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Based on your goals and interests, we've found some perfect matches for you to get started.
              </p>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left mt-6 max-w-sm mx-auto">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Your Personalized Matches</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-lg">🎯</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Recommended Circle</p>
                      <p className="text-sm font-black text-primary dark:text-primary-foreground">Learn Academy Lounge</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 text-lg">👩‍🏫</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Recommended Mentor</p>
                      <p className="text-sm font-black text-primary dark:text-primary-foreground">Amina Bello</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-lg">📈</span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Recommended Action</p>
                      <p className="text-sm font-black text-primary dark:text-primary-foreground">Set your first Goal</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-foreground transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={step === 1 && (!formData.city || !formData.title)}
              className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-primary/95 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{step === 4 ? 'Enter Sisterhood' : 'Next Step'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
