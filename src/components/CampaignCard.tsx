import React from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, Coins, ArrowUpRight, Heart, Phone } from 'lucide-react';
import { Campaign } from '../data';

interface CampaignCardProps {
  key?: any;
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
  onMpesaStk?: (campaign: Campaign) => void;
  buttonText?: string;
  className?: string;
}

export function CampaignCard({ campaign, onDonate, onMpesaStk, buttonText = 'Donate', className = '' }: CampaignCardProps) {
  const percent = Math.min(Math.round((campaign.amountRaised / campaign.goalAmount) * 100), 100);
  const isArchived = campaign.status === 'archived';
  const isPaused = campaign.status === 'paused';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      id={`campaign-card-${campaign.id}`}
      className={`bg-white border border-slate-200 hover:border-pink-300 rounded-[2.2rem] overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-xl ${className}`}
    >
      <div>
        {/* Cover image banner */}
        <div className="h-48 relative overflow-hidden bg-slate-100">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          {/* Category Tag */}
          <span className="absolute top-4 left-4 text-[9px] uppercase font-extrabold tracking-widest text-pink-700 bg-white/95 px-3 py-1.5 rounded-xl border border-pink-200 shadow-md backdrop-blur-sm">
            {campaign.category}
          </span>

          {/* Status overlay if not active */}
          {(isPaused || isArchived) && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-xs">
              <span className="px-4 py-2 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-black uppercase tracking-wider">
                {campaign.status}
              </span>
            </div>
          )}
        </div>

        {/* Title and descriptions */}
        <div className="p-6 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-pink-600 transition leading-snug">
              {campaign.title}
            </h3>
            <span className="text-slate-400 group-hover:text-pink-600 transition duration-300 shrink-0 mt-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
            {campaign.shortDescription}
          </p>
        </div>
      </div>

      {/* Progress and Actions */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Raised and Progress Percent */}
          <div className="flex items-end justify-between text-xs font-bold">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Raised So Far</span>
              <span className="text-slate-900 text-sm font-black mt-0.5">KES {campaign.amountRaised.toLocaleString()}</span>
            </div>
            <span className="text-pink-700 font-black text-sm bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
              {percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.3)]"
            />
          </div>

          {/* Goal vs Remaining */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-slate-400" />
              Goal: KES {campaign.goalAmount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              {campaign.daysRemaining} days remaining
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-slate-100" />

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-900 font-black leading-none">{campaign.supportersCount}</span>
              <span className="text-[9px] text-slate-500 font-bold leading-none mt-1">supporters</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMpesaStk && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMpesaStk(campaign);
                }}
                disabled={isArchived}
                title="Direct M-Pesa STK Push"
                className="flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl transition duration-200 shadow-sm"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-300" />
              </button>
            )}

            <button
              onClick={() => onDonate(campaign)}
              disabled={isArchived}
              id={`donate-btn-${campaign.id}`}
              className="group/btn flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md"
            >
              <Heart className="h-3.5 w-3.5 fill-white stroke-none transition group-hover/btn:scale-110" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
