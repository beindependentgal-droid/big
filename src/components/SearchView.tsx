import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  ChevronRight,
  Filter,
  X,
  Share2,
  Check,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, Post, Event, Circle } from '../data';
import { copyToClipboard } from '../lib/utils';

function MemberSearchCard({ 
  member, 
  setSelectedConversationMember, 
  setCurrentView,
  handleViewProfile
}: { 
  member: Member; 
  setSelectedConversationMember: (m: Member) => void; 
  setCurrentView: (v: string) => void;
  handleViewProfile?: (id: string) => void;
  key?: any;
}) {
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}/?view=profile&id=${member.id}`;
    await copyToClipboard(profileUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, x: 5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 hover:border-secondary hover:shadow-xl transition-all cursor-pointer"
      onClick={() => {
        if (handleViewProfile) {
          handleViewProfile(member.id);
        } else {
          setSelectedConversationMember(member);
          setCurrentView('messages');
        }
      }}
    >
      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-slate-50 shadow-sm">
        <img src={member.avatar || null} className="h-full w-full object-cover" alt="" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-black text-primary uppercase tracking-tight">{member.name}</h4>
        <p className="text-[10px] font-medium text-slate-400">{member.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
           <Tag className="h-2.5 w-2.5 text-secondary" />
           <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{member.rank}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedConversationMember(member);
            setCurrentView('messages');
          }}
          className="rounded-full border border-slate-150 text-slate-600 hover:text-secondary hover:border-secondary/40 hover:bg-secondary/5 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all md:opacity-0 group-hover:opacity-100"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Message</span>
        </button>
        <button
          onClick={handleShare}
          className={`relative p-2 rounded-full border transition-all ${
            shareCopied 
              ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
              : 'text-slate-400 border-slate-50 hover:text-secondary hover:border-secondary/40 hover:bg-white md:opacity-0 group-hover:opacity-100'
          }`}
          title="Share Profile"
        >
          <AnimatePresence mode="wait">
            {shareCopied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Share2 className="h-3.5 w-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}

interface SearchViewProps {
  members: Member[];
  posts: Post[];
  events: Event[];
  circles: Circle[];
  resources: any[];
  setCurrentView: (view: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  setCircleTab: (tab: 'learn' | 'connect' | 'earn' | 'thrive') => void;
  setCurrentCircleId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleViewProfile?: (id: string) => void;
  onOpenResourceLibrary?: () => void;
}

export function SearchView({ 
  members, 
  posts, 
  events, 
  circles,
  resources,
  setCurrentView,
  setSelectedConversationMember,
  setCircleTab,
  setCurrentCircleId,
  searchQuery,
  setSearchQuery,
  handleViewProfile,
  onOpenResourceLibrary
}: SearchViewProps) {
  const [filter, setFilter] = useState<'all' | 'members' | 'posts' | 'events' | 'circles' | 'resources'>('all');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { members: [], posts: [], events: [], circles: [], resources: [] };
    
    const q = searchQuery.toLowerCase();
    
    return {
      members: members.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.title.toLowerCase().includes(q) || 
        m.skills?.some(s => s.toLowerCase().includes(q)) ||
        m.city.toLowerCase().includes(q)
      ),
      posts: posts.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.author.name.toLowerCase().includes(q)
      ),
      events: events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q)
      ),
      circles: circles.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      ),
      resources: resources.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    };
  }, [searchQuery, members, posts, events, circles, resources]);

  const totalResults = searchResults.members.length + 
                       searchResults.posts.length + 
                       searchResults.events.length + 
                       searchResults.circles.length +
                       searchResults.resources.length;

  const trendingTopics = [
    'Fashion Scaling',
    'Sustainable Retail',
    'E-Commerce Lagos',
    'Mentorship Pairing',
    'Community Capital',
    'Creative Direction'
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* SEARCH HEADER - REMOVED AS HANDLED BY HEADER */}
      {/* Search Header placeholder if needed to preserve spacing */}
      <div className="mb-12"></div>

      {!searchQuery ? (
        <div className="space-y-12 animate-fade-in">
          {/* TRENDING TOPICS */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending among builders
            </h3>
            <div className="flex flex-wrap gap-3">
              {trendingTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSearchQuery(topic)}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-primary hover:border-secondary hover:text-secondary hover:shadow-lg transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => setCurrentView('directory')}
              className="p-8 rounded-[2rem] bg-violet-50 border border-violet-100 cursor-pointer group hover:shadow-xl transition-all"
            >
              <Users className="h-8 w-8 text-violet-600 mb-4" />
              <h4 className="text-sm font-black text-primary uppercase tracking-tight">Find builders</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-2">Find women building businesses, careers, and creative work.</p>
            </div>
            <div 
              onClick={() => onOpenResourceLibrary?.()}
              className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 cursor-pointer group hover:shadow-xl transition-all"
            >
              <BookOpen className="h-8 w-8 text-emerald-600 mb-4" />
              <h4 className="text-sm font-black text-primary uppercase tracking-tight">Resource Library</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-2">Access masterclasses, templates, and guides.</p>
            </div>
            <div 
              onClick={() => setCurrentView('events')}
              className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 cursor-pointer group hover:shadow-xl transition-all"
            >
              <Calendar className="h-8 w-8 text-amber-600 mb-4" />
              <h4 className="text-sm font-black text-primary uppercase tracking-tight">Builder calendar</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-2">Join live workshops and local meetups.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-fade-in">
          {/* SEARCH FILTERS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
              <Filter className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filter Results:</span>
            </div>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'members', label: 'Members' },
              { id: 'circles', label: 'Circles' },
              { id: 'posts', label: 'Posts' },
              { id: 'events', label: 'Events' },
              { id: 'resources', label: 'Resources' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t.id 
                    ? 'bg-primary text-white shadow-xl' 
                    : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-300">
              {totalResults} Results Found
            </span>
          </div>

          {totalResults === 0 ? (
            <div className="py-20 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-primary uppercase tracking-tight">No results matched your search</h3>
              <p className="text-sm text-slate-400 mt-2">Try using different keywords or browsing the community directories.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* MEMBERS RESULTS */}
              {(filter === 'all' || filter === 'members') && searchResults.members.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sisters in the Network
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.members.map((member) => (
                      <MemberSearchCard 
                        key={member.id}
                        member={member}
                        setSelectedConversationMember={setSelectedConversationMember}
                        setCurrentView={setCurrentView}
                        handleViewProfile={handleViewProfile}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* CIRCLES RESULTS */}
              {(filter === 'all' || filter === 'circles') && searchResults.circles.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Circles & Communities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.circles.map((circle) => (
                      <div 
                        key={circle.id}
                        className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-secondary hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                          setCurrentCircleId(circle.id);
                          setCircleTab(circle.pillar as any);
                          setCurrentView('circle-hub');
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white ${
                            circle.pillar === 'learn' ? 'bg-primary' : 
                            circle.pillar === 'connect' ? 'bg-secondary' : 
                            circle.pillar === 'earn' ? 'bg-amber-500' : 'bg-orange-500'
                          }`}>
                            <Users className="h-6 w-6" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{circle.membersCount} Members</span>
                        </div>
                        <h4 className="text-base font-black text-primary uppercase tracking-tight">{circle.name}</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-2 line-clamp-2">{circle.description}</p>
                        <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-secondary opacity-0 group-hover:opacity-100 transition-all">
                          Enter Circle <ArrowRight className="h-3 w-3 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* POSTS RESULTS */}
              {(filter === 'all' || filter === 'posts') && searchResults.posts.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussions & Feeds
                  </h3>
                  <div className="space-y-4">
                    {searchResults.posts.map((post) => (
                      <div 
                        key={post.id}
                        className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-secondary transition-all cursor-pointer"
                        onClick={() => setCurrentView('feeds')}
                      >
                        <div className="flex items-center gap-3 mb-4">
                           <img src={post.author.avatar || null} className="h-8 w-8 rounded-full object-cover" alt="" />
                           <div>
                             <p className="text-[10px] font-black text-primary uppercase tracking-tight">{post.author.name}</p>
                             <p className="text-[9px] text-slate-400">{post.timestamp}</p>
                           </div>
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-3 italic">"{post.content}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* EVENTS RESULTS */}
              {(filter === 'all' || filter === 'events') && searchResults.events.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {searchResults.events.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 hover:border-secondary transition-all cursor-pointer"
                        onClick={() => setCurrentView('events')}
                      >
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center shrink-0">
                           <span className="text-[9px] font-black uppercase text-slate-400">JUL</span>
                           <span className="text-xl font-black text-primary">12</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-primary uppercase tracking-tight">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-1.5">
                             <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                               <Clock className="h-3 w-3" /> {event.time}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                               <Users className="h-3 w-3" /> {event.attendees} Attending
                             </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-200" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* RESOURCES RESULTS */}
              {(filter === 'all' || filter === 'resources') && searchResults.resources.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Educational Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.resources.map((res) => (
                      <div 
                        key={res.id}
                        className="group flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 hover:border-secondary transition-all cursor-pointer"
                        onClick={() => onOpenResourceLibrary?.()}
                      >
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                           <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-primary uppercase tracking-tight">{res.title}</h4>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-1">{res.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="flex items-center gap-1 text-amber-500">
                               <Star className="h-2.5 w-2.5 fill-current" />
                               <span className="text-[9px] font-black">{res.rating || 'N/A'}</span>
                             </div>
                             <span className="text-[9px] text-slate-300 uppercase tracking-widest">{res.type}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-200" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
