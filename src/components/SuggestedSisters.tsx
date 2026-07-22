import React from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { Member } from '../data';

interface SuggestedSistersProps {
  currentUser: Member;
  members: Member[];
  followingIds: string[];
  toggleFollow: (memberId: string) => void;
}

export function SuggestedSisters({ currentUser, members, followingIds, toggleFollow }: SuggestedSistersProps) {
  const recommended = members
    .filter(m => m.id !== currentUser.id && !followingIds.includes(m.id))
    .map(m => {
      let score = 0;
      // Shared skills
      m.skills.forEach(skill => {
        if (currentUser.skills.includes(skill)) score += 2;
      });
      // Shared interests
      m.interests.forEach(interest => {
        if (currentUser.interests.includes(interest)) score += 1;
      });
      return { member: m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.member);

  if (recommended.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-sm font-bold text-primary mb-4 flex items-center gap-2">
        <UserPlus className="h-4.5 w-4.5 text-secondary" />
        Suggested Sisters
      </h3>
      <div className="space-y-4">
        {recommended.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={member.avatar || null} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
              <div className="truncate">
                <p className="text-xs font-extrabold text-primary truncate">{member.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{member.title}</p>
              </div>
            </div>
            <button
              onClick={() => toggleFollow(member.id)}
              className="p-1.5 rounded-full border border-slate-150 text-slate-500 hover:text-secondary hover:bg-slate-50 transition-colors"
              title="Follow"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
