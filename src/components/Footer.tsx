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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* TOP CTA: READY TO JOIN */}
        <div className="text-center pb-12 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-primary dark:text-primary-foreground uppercase tracking-tight">
            Ready to Join the Movement?
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Become part of a community of ambitious women building independent, purpose-driven futures together.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => setCurrentView('auth')}
              className="mt-6 rounded-full bg-primary px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-secondary transition-colors shadow-lg"
            >
              Join the Sisterhood
            </button>
          )}
        </div>

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12">
          
          {/* BIG Academy Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
                <img src="/logo.png" alt="Organization Logo" className="h-12 w-12 object-contain" style={{ objectFit: 'contain', objectPosition: 'center' }} />
              </div>
              <span className="text-base font-heading font-black text-primary dark:text-primary-foreground uppercase tracking-tight">
                BIG Academy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Practical learning and mentorship for women who want to grow skills, income, and independence.
            </p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => setCurrentView('academy')}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors"
                >
                  Academy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('auth')}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors"
                >
                  Join
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('mentorship')}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors"
                >
                  Mentorship
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('contact')}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors"
                >
                  Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors">
                  Privacy
                </button>
              </li>
              <li>
                <button className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors">
                  Terms
                </button>
              </li>
              <li>
                <button className="font-bold text-slate-600 dark:text-slate-400 hover:text-secondary transition-colors">
                  Cookies
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-black text-slate-500 dark:text-slate-400">
            © 2026 BIG
          </p>
          
          <div className="flex items-center gap-1 font-bold text-slate-400">
            <span>Built to support your next step.</span>
            <Heart className="h-3 w-3 text-secondary fill-secondary animate-pulse ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
