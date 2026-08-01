import React from 'react';
import { Sparkles, UserPlus, UserCheck, CheckCircle2, ArrowRight, Bookmark } from 'lucide-react';
import { Member } from '../data';

interface ConnectionInsightsProps {
  currentUser: Member;
  members: Member[];
  connections: { userId: string, status: 'Pending' | 'Connected' }[];
  requestConnection: (userId: string) => void;
  setCurrentView?: (view: string) => void;
  setSelectedConversationMember?: (member: Member | null) => void;
  handleViewProfile?: (id: string) => void;
  toggleFollow?: (memberId: string) => void;
  followingIds?: string[];
}

export function ConnectionInsights({
  currentUser,
  members,
  connections,
  requestConnection,
  setCurrentView,
  setSelectedConversationMember,
  handleViewProfile,
  toggleFollow,
  followingIds = []
}: ConnectionInsightsProps) {
  // Find sisters to suggest (excluding ourselves and already connected / pending / highly followed if possible, but let's prioritize those not connected)
  const recommendations = members
    .filter(m => m.id !== currentUser.id)
    .map(m => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Shared Interests
      const sharedInterests = m.interests.filter(interest => 
        currentUser.interests.some(currInterest => 
          currInterest.toLowerCase() === interest.toLowerCase()
        )
      );
      if (sharedInterests.length > 0) {
        score += sharedInterests.length * 3;
        reasons.push(`Shared Interest: ${sharedInterests[0]}`);
      }

      // 2. Career Goals / Title keyword matches
      const mTitleWords = m.title.toLowerCase().split(/\s+/);
      const currTitleWords = currentUser.title.toLowerCase().split(/\s+/);
      const sharedTitleWords = mTitleWords.filter(word => 
        word.length > 3 && currTitleWords.includes(word)
      );
      if (sharedTitleWords.length > 0) {
        score += sharedTitleWords.length * 4;
        reasons.push(`Career Match: Both in ${m.title.split(' ')[0] || 'similar space'}`);
      } else if (m.business_stage && currentUser.business_stage && m.business_stage === currentUser.business_stage) {
        score += 2;
        reasons.push(`Similar business stage: ${m.business_stage}`);
      }

      // 3. Same City
      if (m.city && currentUser.city && m.city.toLowerCase() === currentUser.city.toLowerCase()) {
        score += 2;
        reasons.push(`Local Connection: Active in ${m.city}`);
      }

      // Fallback reasons if none matched
      if (reasons.length === 0) {
        if (m.rank === 'Mentor') {
          score += 1;
          reasons.push('Expert Sister: Highly recommended Mentor');
        } else {
          reasons.push('Rising Peer: Share skills to grow together');
        }
      }

      // Give penalty if already connected or pending to show new potential peers, but keep them in database
      const conn = connections.find(c => c.userId === m.id);
      if (conn?.status === 'Connected') {
        score -= 100; // Deprioritize already connected
      }

      return {
        member: m,
        score,
        reason: reasons[0] || 'Shared entrepreneurial values'
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div id="connection-insights-card" className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/10 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-black text-primary flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
          <span>Connection Insights</span>
        </h3>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          AI Suggested
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Sisters hand-selected for you based on overlapping career trajectories, shared business interests, or local networks.
      </p>

      <div className="space-y-4">
        {recommendations.map(({ member, reason }) => {
          const connection = connections.find(c => c.userId === member.id);
          const isPending = connection?.status === 'Pending';
          const isConnected = connection?.status === 'Connected';
          const isFollowing = followingIds.includes(member.id);

          return (
            <div 
              key={member.id} 
              className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200/50 hover:bg-white transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform cursor-pointer" 
                    onClick={() => {
                      if (handleViewProfile) {
                        handleViewProfile(member.id);
                      }
                    }}
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-extrabold text-primary flex items-center gap-1 hover:text-secondary cursor-pointer"
                      onClick={() => {
                        if (handleViewProfile) {
                          handleViewProfile(member.id);
                        } else if (setCurrentView && setSelectedConversationMember) {
                          setSelectedConversationMember(member);
                          setCurrentView('messages');
                        }
                      }}
                    >
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{member.title}</p>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">📍 {member.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Follow Button */}
                  {toggleFollow && (
                    <button
                      onClick={() => toggleFollow(member.id)}
                      className={`p-1.5 rounded-full border transition-all ${
                        isFollowing
                          ? 'text-secondary border-secondary/30 bg-secondary/5 hover:bg-secondary/10'
                          : 'text-slate-400 border-slate-200 hover:text-secondary hover:border-secondary/45 hover:bg-slate-50'
                      }`}
                      title={isFollowing ? "You follow this sister" : "Follow sister"}
                    >
                      <Bookmark className={`h-3 w-3 ${isFollowing ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  {isConnected ? (
                    <button
                      disabled
                      className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 flex items-center gap-1 cursor-default"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Sisters</span>
                    </button>
                  ) : isPending ? (
                    <button
                      disabled
                      className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 flex items-center gap-1 cursor-default"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>Sent</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => requestConnection(member.id)}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm hover:shadow transition-all"
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shared Insight Tagline */}
              <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-indigo-50/40 border border-indigo-100/30 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                <Sparkles className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                <span className="truncate">{reason}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1">
        <button
          onClick={() => setCurrentView?.('directory')}
          className="w-full py-2 border border-slate-150 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50/10 hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Explore All Sisters</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
