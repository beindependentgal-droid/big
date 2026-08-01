import { 
  Plus
} from 'lucide-react';
import { BOTTOM_NAV_LINKS } from '../lib/navigation';

interface NavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  unreadCount?: number;
  onOpenComposer: () => void;
}

export function BottomNav({ currentView, setCurrentView, onOpenComposer }: NavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t border-slate-200 bg-white px-2 py-1 md:hidden dark:bg-slate-900 dark:border-slate-800 h-16">
      {BOTTOM_NAV_LINKS.slice(0, 2).map((link) => {
        const Icon = link.icon;
        const active = currentView === link.id;
        return (
          <button
            key={link.id}
            onClick={() => setCurrentView(link.id)}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold tracking-tight transition-all active:scale-95 ${
              active 
                ? 'text-secondary dark:text-pink-500 scale-105' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
            id={`bottom-nav-${link.id}`}
          >
            <Icon className={`h-5.5 w-5.5 transition-transform ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span>{link.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenComposer}
        className="flex flex-col items-center justify-center -mt-8 transition-all active:scale-95"
        id="bottom-nav-composer"
      >
        <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/40 border-4 border-white dark:border-[#130826]">
          <Plus className="h-8 w-8" />
        </div>
      </button>
      {BOTTOM_NAV_LINKS.slice(2).map((link) => {
        const Icon = link.icon;
        const active = currentView === link.id;
        return (
          <button
            key={link.id}
            onClick={() => setCurrentView(link.id)}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold tracking-tight transition-all active:scale-95 ${
              active 
                ? 'text-secondary dark:text-pink-500 scale-105' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
            id={`bottom-nav-${link.id}`}
          >
            <Icon className={`h-5.5 w-5.5 transition-transform ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span>{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

