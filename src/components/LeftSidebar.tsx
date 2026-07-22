import React from 'react';
import { NAVIGATION_CATEGORIES } from '../lib/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LeftSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  unreadCount?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function LeftSidebar({ currentView, setCurrentView, unreadCount, mobileMenuOpen, setMobileMenuOpen }: LeftSidebarProps) {
  
  const sidebarContent = (
    <div className="py-6 px-4 space-y-8">
      {NAVIGATION_CATEGORIES.map((category) => (
        <div key={category.title}>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-3">
            {category.title}
          </h4>
          <nav className="space-y-0.5">
            {category.links.map((link) => {
              if (link.adminOnly) return null;

              const active = currentView === link.id || (link.id === 'feeds' && currentView === 'feeds');
              const Icon = link.icon;
              
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentView(link.id);
                    if (setMobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                    <span className="text-sm">{link.label}</span>
                  </div>
                  {link.badge && unreadCount ? (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl md:hidden overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="font-black text-xl text-primary tracking-tighter">THE <span className="text-secondary">SISTERHOOD</span></div>
                <button 
                  onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
