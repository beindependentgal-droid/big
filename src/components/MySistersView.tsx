import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Member } from '../data';
import { 
  Users, 
  MessageSquare, 
  UserCheck, 
  UserPlus, 
  Search, 
  MapPin, 
  Sparkles,
  X,
  Send,
  CheckCircle2,
  Check,
  StickyNote,
  Coffee,
  Calendar as CalendarIcon
} from 'lucide-react';

interface MySistersViewProps {
  members: Member[];
  followingIds: string[];
  toggleFollow: (id: string) => void;
  setCurrentView: (view: string) => void;
  setSelectedConversationMember: (m: Member) => void;
  connections: { userId: string, status: 'Pending' | 'Connected' }[];
  currentUser: Member | null;
  onSendMessage?: (memberId: string, text: string) => void;
  addNotification?: (text: string) => void;
}

export function MySistersView({
  members,
  followingIds,
  toggleFollow,
  setCurrentView,
  setSelectedConversationMember,
  connections,
  currentUser,
  onSendMessage,
  addNotification
}: MySistersViewProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'connections'>('following');
  const [searchQuery, setSearchQuery] = useState('');

  // Private Note State
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('big_v2_personal_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeNoteMember, setActiveNoteMember] = useState<Member | null>(null);
  const [currentNote, setCurrentNote] = useState('');

  const handleSaveNote = () => {
    if (!activeNoteMember) return;
    const nextNotes = { ...personalNotes, [activeNoteMember.id]: currentNote };
    setPersonalNotes(nextNotes);
    localStorage.setItem('big_v2_personal_notes', JSON.stringify(nextNotes));
    setActiveNoteMember(null);
  };

  // Quick Message Modal State
  const [activeMessageMember, setActiveMessageMember] = useState<Member | null>(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Coffee Chat State
  const [activeCoffeeChatMember, setActiveCoffeeChatMember] = useState<Member | null>(null);
  const [coffeeChatTime, setCoffeeChatTime] = useState('');
  const [coffeeChatDate, setCoffeeChatDate] = useState('');
  const [isSchedulingCoffee, setIsSchedulingCoffee] = useState(false);
  const [coffeeChatSuccess, setCoffeeChatSuccess] = useState(false);

  const handleScheduleCoffee = (member: Member) => {
    setActiveCoffeeChatMember(member);
    setCoffeeChatDate('');
    setCoffeeChatTime('');
    setCoffeeChatSuccess(false);
  };

  const handleConfirmCoffeeChat = async () => {
    if (!activeCoffeeChatMember || !coffeeChatDate || !coffeeChatTime) return;

    setIsSchedulingCoffee(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (addNotification) {
      addNotification(`Coffee chat request sent to ${activeCoffeeChatMember.name} for ${coffeeChatDate} at ${coffeeChatTime}.`);
      console.log(`Notification sent to ${activeCoffeeChatMember.name}: New coffee chat proposed for ${coffeeChatDate} at ${coffeeChatTime}`);
    }

    setIsSchedulingCoffee(false);
    setCoffeeChatSuccess(true);

    setTimeout(() => {
      setActiveCoffeeChatMember(null);
      setCoffeeChatSuccess(false);
    }, 2000);
  };

  const handleSendQuickMessage = async () => {
    if (!activeMessageMember || !quickMessage.trim()) return;

    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (onSendMessage) {
      onSendMessage(activeMessageMember.id, quickMessage);
    }

    setIsSending(false);
    setSendSuccess(true);
    
    // Auto-close after success
    setTimeout(() => {
      setActiveMessageMember(null);
      setSendSuccess(false);
    }, 1500);
  };

  const displayMembers = members.filter(m => {
    if (m.id === currentUser?.id) return false;
    
    const isFollowing = followingIds.includes(m.id);
    const isConnected = connections.some(c => c.userId === m.id && c.status === 'Connected');

    if (activeTab === 'following' && !isFollowing) return false;
    if (activeTab === 'connections' && !isConnected) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getMutualConnections = (member: Member) => {
    if (!currentUser) return [];
    
    // Deterministic mutual connections based on IDs
    const seed = (currentUser.id + member.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = seed % 5; // 0 to 4 mutual connections
    
    const others = members.filter(m => m.id !== currentUser.id && m.id !== member.id);
    if (others.length === 0) return [];
    
    const startIndex = seed % others.length;
    
    const mutuals = [];
    for (let i = 0; i < count; i++) {
      if (others[(startIndex + i) % others.length]) {
        mutuals.push(others[(startIndex + i) % others.length]);
      }
    }
    // ensure uniqueness
    return Array.from(new Set(mutuals));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            My Sisters
          </h1>
          <p className="text-slate-500 mt-1">Your personal network of inspiring women.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Following ({followingIds.length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'connections'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Connections ({connections.filter(c => c.status === 'Connected').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sisters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary/50 dark:text-white"
            />
          </div>
        </div>

        {displayMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No sisters found
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery 
                ? "Try adjusting your search terms to find someone specific."
                : `You don't have any ${activeTab} yet. Explore the directory to find inspiring women to connect with!`}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setCurrentView('directory')}
                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-xl font-bold hover:bg-secondary/90 transition-colors"
              >
                Explore Directory
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMembers.map((member, idx) => {
              const isFollowing = followingIds.includes(member.id);
              const mutuals = getMutualConnections(member);
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col hover:border-secondary/30 transition-all hover:shadow-md"
                >
                  <div className="flex gap-4 items-start mb-4">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        {member.name}
                        {member.badges?.includes('founding-member') && (
                          <Sparkles className="h-3 w-3 text-secondary fill-secondary" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">{member.title} {member.company ? `@ ${member.company}` : ''}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        {member.city}
                      </div>
                    </div>
                  </div>
                  
                  {mutuals.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {mutuals.length} Mutual Connection{mutuals.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {mutuals.map(m => (
                            <img 
                              key={m.id} 
                              src={m.avatar} 
                              alt={m.name} 
                              title={m.name} 
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {mutuals.map(m => m.name.split(' ')[0]).slice(0, 2).join(', ')}
                          {mutuals.length > 2 ? ` +${mutuals.length - 2}` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex gap-2">
                    <button
                      onClick={() => toggleFollow(member.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isFollowing
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          Follow
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveMessageMember(member);
                        setQuickMessage('');
                        setSendSuccess(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </button>
                    <button
                      onClick={() => handleScheduleCoffee(member)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all"
                      title="Schedule Coffee Chat"
                    >
                      <Coffee className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveNoteMember(member);
                        setCurrentNote(personalNotes[member.id] || '');
                      }}
                      className={`p-2 rounded-xl border transition-colors ${
                        personalNotes[member.id]
                          ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-secondary hover:border-secondary/40'
                      }`}
                      title={personalNotes[member.id] ? "Edit Private Note" : "Add Private Note"}
                    >
                      <StickyNote className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRIVATE NOTE MODAL */}
      <AnimatePresence>
        {activeNoteMember && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNoteMember(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Note for {activeNoteMember.name}</h3>
                </div>
                <button onClick={() => setActiveNoteMember(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Reminders</p>
                <textarea
                  autoFocus
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Add a private note about this sister... (only you can see this)"
                  className="w-full h-32 p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none dark:text-white"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setActiveNoteMember(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="flex-[2] py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK MESSAGE MODAL */}
      <AnimatePresence>
        {activeMessageMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSending && setActiveMessageMember(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={activeMessageMember.avatar} 
                      alt={activeMessageMember.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-black text-white leading-none">
                      Message {activeMessageMember.name.split(' ')[0]}
                    </h3>
                    <p className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-wider">
                      Quick Action
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMessageMember(null)}
                  disabled={isSending}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {sendSuccess ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-heading font-black text-primary dark:text-white">Message Sent!</h4>
                    <p className="mt-2 text-xs font-bold text-slate-500">Your sister will be notified immediately.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                        "Your message will appear in her direct messages. Keep it professional, supportive, and kind!"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        Your Message
                      </label>
                      <textarea
                        autoFocus
                        value={quickMessage}
                        onChange={(e) => setQuickMessage(e.target.value)}
                        placeholder={`Hi ${activeMessageMember.name.split(' ')[0]}, I'd love to connect and chat about...`}
                        className="w-full min-h-[120px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs text-primary dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setActiveMessageMember(null)}
                        disabled={isSending}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendQuickMessage}
                        disabled={isSending || !quickMessage.trim()}
                        className="flex-[2] rounded-xl bg-secondary px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-secondary/20 hover:bg-secondary/95 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                      >
                        {isSending ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COFFEE CHAT MODAL */}
      <AnimatePresence>
        {activeCoffeeChatMember && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSchedulingCoffee && setActiveCoffeeChatMember(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Coffee className="h-5 w-5" />
                  <h3 className="text-sm font-heading font-black leading-none">
                    Coffee Chat with {activeCoffeeChatMember.name.split(' ')[0]}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveCoffeeChatMember(null)}
                  disabled={isSchedulingCoffee}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {coffeeChatSuccess ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-heading font-black text-primary dark:text-white">Invitation Sent!</h4>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">Proposed: {coffeeChatDate} at {coffeeChatTime}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Propose a time to connect with your sister. We'll notify her of your request!
                    </p>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input 
                            type="date" 
                            value={coffeeChatDate}
                            onChange={(e) => setCoffeeChatDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Time</label>
                        <select
                          value={coffeeChatTime}
                          onChange={(e) => setCoffeeChatTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">-- Select Time --</option>
                          <option value="9:00 AM">9:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="1:00 PM">1:00 PM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="3:00 PM">3:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                          <option value="5:00 PM">5:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmCoffeeChat}
                      disabled={isSchedulingCoffee || !coffeeChatDate || !coffeeChatTime}
                      className="w-full mt-2 rounded-xl bg-amber-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                    >
                      {isSchedulingCoffee ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <Coffee className="h-4 w-4" />
                          <span>Propose Coffee Chat</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
