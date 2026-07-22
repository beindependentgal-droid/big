import { Calendar, TrendingUp, UserPlus, Users, Award, ShieldCheck } from 'lucide-react';
import { Member, Event as CommunityEvent } from '../data';
import React from 'react';

interface WidgetProps {
  events: CommunityEvent[];
  members: Member[];
  onConnect: (memberId: string) => void;
  onViewEvent: (eventId: string) => void;
}

export function FeedWidgets({ events, members, onConnect, onViewEvent }: WidgetProps) {
  const trendingTopics = [
    { tag: '#Entrepreneurship', posts: '124' },
    { tag: '#WomenInTech', posts: '89' },
    { tag: '#Sustainability', posts: '67' },
    { tag: '#DigitalLiteracy', posts: '45' }
  ];

  const suggestedMembers = members.slice(0, 3);
  const topContributors = members.slice(2, 5);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      
      {/* Community Guidelines Card */}
      <div className="rounded-xl border border-secondary/20 bg-pink-50/40 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 text-secondary stroke-[2px]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Community Guidelines</h3>
            <p className="text-[11px] font-normal text-slate-600 leading-normal">
              We are a supportive, empowering space. Be professional, share knowledge, and uplift each other.
            </p>
            <button className="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wider mt-2 transition-colors cursor-pointer">
              Read Guidelines
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Mentors Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4.5 w-4.5 text-primary stroke-[2px]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Suggested Mentors</h3>
        </div>
        <div className="space-y-3">
          {suggestedMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm overflow-hidden border border-slate-200 shadow-sm">
                  {member.avatar?.trim() ? (
                    <img src={member.avatar || null} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    member.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 hover:text-secondary transition-colors truncate">{member.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{member.skills?.[0] || 'Leadership Trainer'}</p>
                </div>
              </div>
              <button 
                onClick={() => onConnect(member.id)}
                className="ml-2 h-7 px-2.5 rounded-full border border-secondary hover:bg-pink-50 text-secondary text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Follow</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4.5 w-4.5 text-amber-500 stroke-[2px]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upcoming Events</h3>
        </div>
        <div className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <div 
              key={event.id} 
              onClick={() => onViewEvent(event.id)}
              className="group cursor-pointer flex items-start gap-3 p-2 rounded-lg border border-transparent hover:bg-slate-50 transition-all"
            >
              <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-pink-50 text-secondary shrink-0 font-bold">
                <span className="text-[9px] uppercase leading-none">{event.date.split(' ')[0]}</span>
                <span className="text-xs leading-none mt-1">{event.date.split(' ')[1]}</span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-secondary truncate transition-colors">{event.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{event.time} • {event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-600 stroke-[2px]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trending Topics</h3>
        </div>
        <div className="space-y-2">
          {trendingTopics.map((topic) => (
            <div 
              key={topic.tag} 
              className="flex items-center justify-between py-1 cursor-pointer group hover:bg-slate-50 rounded px-1"
            >
              <span className="text-xs font-bold text-secondary hover:underline">{topic.tag}</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {topic.posts} posts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4.5 w-4.5 text-amber-500 stroke-[2px]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Contributors</h3>
        </div>
        <div className="space-y-3">
          {topContributors.map((member) => (
            <div key={member.id} className="flex items-center gap-2.5 group cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm overflow-hidden border border-slate-200 shadow-sm">
                {member.avatar ? (
                  <img src={member.avatar || null} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  member.name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 hover:text-secondary transition-colors truncate">{member.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{member.rank || 'Active Member'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
