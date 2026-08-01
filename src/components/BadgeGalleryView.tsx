import React from 'react';
import { 
  X, 
  Award, 
  Trophy, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Heart, 
  Shield, 
  Layers, 
  Terminal, 
  Trees, 
  TrendingUp, 
  MessageSquare,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { Member } from '../data';

interface BadgeGalleryViewProps {
  isOpen: boolean;
  onClose: () => void;
  user: Member;
}

interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  howToEarn: string;
  icon: React.ComponentType<any>;
  themeColor: string; // Tailwind color classes for unlocked state
  bgGradient: string; // Premium gradient for unlocked card
}

const BADGE_DEFINITIONS: Record<string, BadgeDef> = {
  confidence: {
    id: 'confidence',
    title: 'Confidence Pillar',
    desc: 'Celebrates sisters who have developed their inner strength and self-assurance.',
    howToEarn: 'Complete the 7-day Confidence challenge or exercises.',
    icon: Shield,
    themeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    bgGradient: 'from-slate-500/10 to-slate-600/10 border-slate-300'
  },
  pioneer: {
    id: 'pioneer',
    title: 'Founder Pioneer',
    desc: 'Awarded to the bold visionaries launching early-stage startup projects.',
    howToEarn: 'Awarded to early-stage builders who launched in 2026.',
    icon: Sparkles,
    themeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    bgGradient: 'from-violet-500/10 to-purple-600/10 border-violet-300'
  },
  trailblazer: {
    id: 'trailblazer',
    title: 'Trailblazer Status',
    desc: 'Recognizes consistent academic effort and mastery across modules.',
    howToEarn: 'Granted for continuous academy module excellence.',
    icon: Trophy,
    themeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    bgGradient: 'from-amber-500/10 to-orange-600/10 border-amber-300'
  },
  mentor: {
    id: 'mentor',
    title: 'Verified Coach',
    desc: 'Given to sisters registered and vetted to support and coach others.',
    howToEarn: 'Register as a mentor and guide other young sisters in active pairs.',
    icon: Award,
    themeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgGradient: 'from-emerald-500/10 to-teal-600/10 border-emerald-300'
  },
  wealth_pioneer: {
    id: 'wealth_pioneer',
    title: 'Wealth Pioneer',
    desc: 'Demonstrates deep competence in business financing and planning.',
    howToEarn: 'Complete pitch planning, financial modeling, or fundraising reviews.',
    icon: TrendingUp,
    themeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    bgGradient: 'from-rose-500/10 to-pink-600/10 border-rose-300'
  },
  network: {
    id: 'network',
    title: 'Network Hub',
    desc: 'For active networkers expanding sisterhood links across physical cities.',
    howToEarn: 'Connect with multiple sisters outside of your default home city.',
    icon: Users,
    themeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    bgGradient: 'from-pink-500/10 to-fuchsia-600/10 border-pink-300'
  },
  community_star: {
    id: 'community_star',
    title: 'Community Star',
    desc: 'Awarded to highly active members contributing rich social context.',
    howToEarn: 'Contribute 10+ circle feed posts or peer comments.',
    icon: MessageSquare,
    themeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    bgGradient: 'from-cyan-500/10 to-pink-600/10 border-cyan-300'
  },
  entrepreneur: {
    id: 'entrepreneur',
    title: 'Active Entrepreneur',
    desc: 'Acknowledges real-world operational trade, retail, and business sales.',
    howToEarn: 'Currently running active regional retail or product projects.',
    icon: Zap,
    themeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    bgGradient: 'from-orange-500/10 to-amber-600/10 border-orange-300'
  },
  green_champion: {
    id: 'green_champion',
    title: 'Green Champion',
    desc: 'Exhibits commitment to sustainability and eco-conscious supply chains.',
    howToEarn: 'Focus on ecological sourcing, recycling, or organic materials.',
    icon: Trees,
    themeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    bgGradient: 'from-teal-500/10 to-emerald-600/10 border-teal-300'
  },
  field_hero: {
    id: 'field_hero',
    title: 'Field Specialist',
    desc: 'Granted to agricultural specialists driving localized production systems.',
    howToEarn: 'Show experience in agriculture supply-chains and food cooperatives.',
    icon: Layers,
    themeColor: 'bg-lime-100 text-lime-800 border-lime-200',
    bgGradient: 'from-lime-500/10 to-green-600/10 border-lime-300'
  },
  coder: {
    id: 'coder',
    title: 'Digital Coder',
    desc: 'Recognizes builders leveraging digital tech, software, or software teaching.',
    howToEarn: 'Actively building software tools, websites, or attending bootcamps.',
    icon: Terminal,
    themeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    bgGradient: 'from-pink-500/10 to-indigo-600/10 border-pink-300'
  },
  connector: {
    id: 'connector',
    title: 'Ecosystem Connector',
    desc: 'Recognizes coordinators structuring regional events and partnerships.',
    howToEarn: 'Help coordinate regional community meetups and joint sales booths.',
    icon: Heart,
    themeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    bgGradient: 'from-sky-500/10 to-pink-500/10 border-sky-300'
  }
};

export function BadgeGalleryView({ isOpen, onClose, user }: BadgeGalleryViewProps) {
  if (!isOpen) return null;

  const userBadgesList = user.badges || [];
  
  // Normalize user badges list to lowercase for exact match checks
  const normalizedUserBadges = userBadgesList.map(b => b.toLowerCase());

  // Find user's custom badges that are NOT in our standard definitions (e.g. "Mentor", "Top Contributor")
  const customBadges = userBadgesList.filter(b => {
    const key = b.toLowerCase();
    return !BADGE_DEFINITIONS[key];
  });

  const totalStandardBadges = Object.keys(BADGE_DEFINITIONS).length;
  const unlockedStandardCount = Object.keys(BADGE_DEFINITIONS).filter(key => 
    normalizedUserBadges.includes(key)
  ).length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-primary via-indigo-600 to-secondary p-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="h-32 w-32 rotate-12 text-white" />
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Close Gallery"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-accent shrink-0 shadow-lg shadow-black/10">
              <Award className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-accent/80">Sisterhood Achievements</p>
              <h2 className="text-2xl font-heading font-black tracking-tight mt-0.5">
                {user.name}'s Badge Gallery
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-1.5 w-32 rounded-full bg-white/20 overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-500" 
                    style={{ width: `${(unlockedStandardCount / totalStandardBadges) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                  {unlockedStandardCount} / {totalStandardBadges} Badges Earned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(BADGE_DEFINITIONS).map((badge) => {
              const isUnlocked = normalizedUserBadges.includes(badge.id);
              const IconComponent = badge.icon;

              return (
                <div 
                  key={badge.id}
                  className={`group relative rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between ${
                    isUnlocked 
                      ? `bg-gradient-to-br ${badge.bgGradient} border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5` 
                      : 'bg-slate-50/50 border-slate-150/60 dark:bg-slate-900/40 dark:border-slate-850 opacity-75'
                  }`}
                >
                  <div>
                    {/* Badge Icon & Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all ${
                        isUnlocked 
                          ? `${badge.themeColor} shadow-md shadow-slate-500/5 group-hover:scale-105` 
                          : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <div className="flex items-center">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <h3 className={`font-heading text-sm font-black transition-colors ${
                      isUnlocked ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {badge.title}
                    </h3>
                    <p className={`text-[11px] mt-1.5 leading-relaxed font-medium ${
                      isUnlocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/80 dark:text-slate-500/80'
                    }`}>
                      {badge.desc}
                    </p>
                  </div>

                  {/* Unlock instructions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100/60 dark:border-slate-800/60 flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      How to earn
                    </span>
                    <span className={`text-[10px] font-semibold leading-snug ${
                      isUnlocked ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {badge.howToEarn}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom / Platform Badges (Sponsor-awarded/Special Recognitions) */}
          {customBadges.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Special Recognitions</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {customBadges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 px-4 py-2 text-xs font-black text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 shadow-sm"
                  >
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Keep collaborating to unlock more badges!
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          >
            Close Gallery
          </button>
        </div>
      </motion.div>
    </div>
  );
}
