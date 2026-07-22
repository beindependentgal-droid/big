import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  isAuthenticated?: boolean;
}

export function Footer({ setCurrentView, isAuthenticated = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-12 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* TOP CTA: READY TO JOIN (ONLY SHOW IF NOT AUTHENTICATED) */}
        {!isAuthenticated && (
          <div className="text-center pb-12 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-primary dark:text-primary-foreground uppercase tracking-tight">
              Ready to Join the Movement?
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Become part of a community of ambitious women building independent, purpose-driven futures together.
            </p>
            <button
              onClick={() => setCurrentView('auth')}
              className="mt-6 rounded-full bg-primary px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-secondary transition-colors shadow-lg cursor-pointer"
            >
              Join the Sisterhood
            </button>
          </div>
        )}

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-10 py-12 text-left">
          
          {/* BIG Academy Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(isAuthenticated ? 'feeds' : 'home')}>
              <div className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <img src="/logo.png" alt="Organization Logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-base font-heading font-black text-primary dark:text-primary-foreground uppercase tracking-tight">
                BIG Academy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
              Helping ambitious African women build practical competencies, establish sovereign financial independence, and scale.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView('academy')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Academy Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView(isAuthenticated ? 'mentorship' : 'auth')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Mentorship Circle
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('circles')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Sister Circles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('programs')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Syllabus Paths
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView(isAuthenticated ? 'resource-library' : 'auth')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Study Templates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView(isAuthenticated ? 'job-board' : 'auth')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Job Board
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView(isAuthenticated ? 'goal-tracker' : 'auth')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Goal Tracker
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('big-fund')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  BIG Fund Grants
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView('about')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  About BIG
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('contact')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('big-club')}
                  className="hover:text-secondary transition-colors text-left"
                >
                  BIG Club Space
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-black text-slate-500 dark:text-slate-400">
            © {currentYear} Be Independent Gal (BIG). All rights reserved.
          </p>
          
          <div className="flex items-center gap-1 font-bold text-slate-400 dark:text-slate-500">
            <span>Built to support your next step.</span>
            <Heart className="h-3 w-3 text-secondary fill-secondary animate-pulse ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
