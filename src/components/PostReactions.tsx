import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const REACTION_TYPES = [
  { id: 'support', emoji: '❤️', label: 'Support' },
  { id: 'celebrate', emoji: '👏', label: 'Celebrate' },
  { id: 'helpful', emoji: '💡', label: 'Helpful' },
  { id: 'inspired', emoji: '🔥', label: 'Inspired' },
  { id: 'welcome', emoji: '🤝', label: 'Welcome' },
];

interface PostReactionsProps {
  initialCount: number;
  initialLiked: boolean;
  onReact?: (type: string) => void;
}

export function PostReactions({ initialCount, initialLiked, onReact }: PostReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [reaction, setReaction] = useState<{ id: string, emoji: string } | null>(initialLiked ? REACTION_TYPES[0] : null);
  const [count, setCount] = useState(initialCount);

  const handleReact = (type: typeof REACTION_TYPES[0]) => {
    if (reaction?.id === type.id) {
      setReaction(null);
      setCount(prev => prev - 1);
    } else {
      if (!reaction) setCount(prev => prev + 1);
      setReaction(type);
    }
    setShowPicker(false);
    onReact?.(type.id);
  };

  const handleDefaultClick = () => {
    if (reaction) {
      setReaction(null);
      setCount(prev => prev - 1);
    } else {
      setReaction(REACTION_TYPES[0]);
      setCount(prev => prev + 1);
    }
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => setShowPicker(false)}
    >
      <button 
        onClick={handleDefaultClick}
        className={`flex items-center gap-1.5 sm:gap-2 group/like ${reaction ? 'text-rose-500' : 'text-slate-500'}`}
      >
        <div className={`p-2 rounded-xl transition-all ${reaction ? 'bg-rose-50' : 'group-hover/like:bg-slate-50'}`}>
          {reaction ? (
            <span className="text-sm">{reaction.emoji}</span>
          ) : (
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2px] group-hover/like:stroke-rose-500" />
          )}
        </div>
        <span className="text-xs font-black">{count}</span>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex items-center gap-1 z-50"
          >
            {REACTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleReact(type)}
                className="hover:scale-125 hover:-translate-y-1 transition-all duration-200 p-2 relative group flex items-center justify-center"
                title={type.label}
              >
                <span className="text-xl">{type.emoji}</span>
                <span className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                  {type.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
