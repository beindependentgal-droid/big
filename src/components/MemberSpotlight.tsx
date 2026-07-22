import React, { useState, useEffect } from 'react';
import { Member } from '../data';
import { Award, Star, ChevronLeft, ChevronRight, Zap, Bookmark } from 'lucide-react';

interface MemberSpotlightProps {
  members: Member[];
  handleViewProfile?: (id: string) => void;
  toggleFollow?: (memberId: string) => void;
  followingIds?: string[];
  currentUser: Member;
}

export function MemberSpotlight({ 
  members,
  handleViewProfile,
  toggleFollow,
  followingIds = [],
  currentUser
}: MemberSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out the current user (currentUser.id) and ensure we have members to show
  const spotlightMembers = members.filter(m => m.id !== currentUser.id && m.name);

  useEffect(() => {
    if (spotlightMembers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMembers.length);
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, [spotlightMembers.length]);

  if (spotlightMembers.length === 0) {
    return null;
  }

  const currentMember = spotlightMembers[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % spotlightMembers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + spotlightMembers.length) % spotlightMembers.length);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          Sisterhood Spotlight
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-sm opacity-20"></div>
          <img 
            src={currentMember.avatar} 
            alt={currentMember.name} 
            className="h-24 w-24 rounded-full object-cover border-4 border-white relative z-10 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleViewProfile?.(currentMember.id)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentMember.name)}&background=random`;
            }}
          />
          {currentMember.rank && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm whitespace-nowrap z-20 flex items-center gap-1">
              <Award className="h-3 w-3 text-secondary" />
              <span className="text-[10px] font-bold text-slate-700">{currentMember.rank}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <h4 
                className="text-lg font-bold text-slate-800 truncate hover:text-secondary cursor-pointer transition-colors"
                onClick={() => handleViewProfile?.(currentMember.id)}
              >
                {currentMember.name}
              </h4>
              <p className="text-sm text-slate-500 truncate">{currentMember.title}</p>
            </div>
            {toggleFollow && (
              <button
                onClick={() => toggleFollow(currentMember.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                  followingIds.includes(currentMember.id)
                    ? 'text-secondary border-secondary/30 bg-secondary/5 hover:bg-secondary/10'
                    : 'text-slate-600 border-slate-200 hover:text-secondary hover:border-secondary/45 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${followingIds.includes(currentMember.id) ? 'fill-current' : ''}`} />
                <span>{followingIds.includes(currentMember.id) ? 'Following' : 'Follow'}</span>
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Skills</h5>
            <div className="flex flex-wrap gap-2">
              {currentMember.skills?.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100">
                  {skill}
                </span>
              ))}
              {(!currentMember.skills || currentMember.skills.length === 0) && (
                <span className="text-xs text-slate-400 italic">Exploring new skills</span>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Achievement</h5>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-2 rounded-xl text-sm border border-amber-100/50">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium truncate">
                {currentMember.badges && currentMember.badges.length > 0 
                  ? `Earned "${currentMember.badges[0]}" badge`
                  : `Reached ${currentMember.points || 0} community points`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {spotlightMembers.slice(0, 8).map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex % 8 ? 'w-4 bg-primary' : 'w-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
