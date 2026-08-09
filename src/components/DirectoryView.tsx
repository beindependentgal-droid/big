import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  HeartHandshake, 
  UserCheck, 
  Filter,
  CheckCircle2,
  Bookmark,
  UserPlus,
  Check,
  Users,
  Share2,
  User,
  Tag,
  X,
  Send,
  ThumbsUp,
  Coffee,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, MentorshipPair, Circle, isProfileVerified } from '../data';
import { copyToClipboard } from '../lib/utils';

function getCircleInfo(id: string) {
  switch (id) {
    case 'learn':
      return {
        name: 'Learn Academy',
        icon: '📚',
        classes: 'bg-pink-50 text-pink-700 border-pink-200/50 hover:bg-pink-100/50'
      };
    case 'connect':
      return {
        name: 'Connection Net',
        icon: '🔌',
        classes: 'bg-violet-50 text-violet-700 border-violet-200/50 hover:bg-violet-100/50'
      };
    case 'earn':
      return {
        name: 'Earn Scaling',
        icon: '💰',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/50'
      };
    case 'thrive':
      return {
        name: 'Thrive Wellness',
        icon: '🌸',
        classes: 'bg-rose-50 text-rose-700 border-rose-200/50 hover:bg-rose-100/50'
      };
    case 'tech-sisters':
      return {
        name: 'Tech Sisters',
        icon: '💻',
        classes: 'bg-sky-50 text-sky-700 border-sky-200/50 hover:bg-sky-100/50'
      };
    default:
      return {
        name: 'Sisters Network',
        icon: '🤝',
        classes: 'bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100/50'
      };
  }
}

interface MemberCardProps {
  member: Member;
  followingIds: string[];
  toggleFollow: (memberId: string) => void;
  connections: { userId: string, status: 'Pending' | 'Connected' }[];
  requestConnection: (userId: string) => void;
  mentorshipPairs: MentorshipPair[];
  handleRequestMentorship: (member: Member) => void;
  handleMessageSister: (member: Member) => void;
  handleAskMentor: (member: Member) => void;
  handleViewProfile?: (id: string) => void;
  handleScheduleCoffee?: (member: Member) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (memberId: string) => void;
  currentUser: Member;
  key?: string;
}

function MemberCard({ 
  member, 
  followingIds, 
  toggleFollow, 
  connections,
  requestConnection,
  mentorshipPairs, 
  handleRequestMentorship, 
  handleMessageSister,
  handleAskMentor,
  handleViewProfile,
  handleScheduleCoffee,
  selectable,
  selected,
  onToggleSelect,
  currentUser
}: MemberCardProps) {
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
      whileHover={{ 
        y: -6, 
        scale: 1.025, 
        boxShadow: "0 25px 30px -10px rgb(0 0 0 / 0.12), 0 12px 15px -8px rgb(0 0 0 / 0.06)" 
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`relative rounded-2xl border ${selected ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/50' : 'border-slate-150 bg-white hover:border-secondary/40'} p-6 shadow-sm transition-colors flex flex-col h-full space-y-4 cursor-pointer`}
      onClick={(e) => {
        if (selectable && onToggleSelect) {
          onToggleSelect(member.id);
          return;
        }
        if (handleViewProfile) handleViewProfile(member.id);
      }}
    >
      {selectable && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selected ? 'bg-secondary border-secondary text-white' : 'border-slate-300 bg-white'}`}>
            {selected && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-start gap-4">
        {member.avatar ? (
          <img 
            src={member.avatar} 
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/5"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-bold text-white text-xl ring-2 ring-primary/5">
            {member.name ? member.name[0] : 'M'}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-extrabold text-primary flex items-center gap-1.5 flex-wrap">
            <span>{member.name}</span>
            {member.rank === 'Mentor' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 fill-emerald-50/20" />
            )}
            {isProfileVerified(member) && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-pink-50 text-pink-600 border border-pink-100 uppercase tracking-wide shrink-0 shadow-xs" title="Verified Profile (100% complete)">
                <CheckCircle2 className="h-2.5 w-2.5 text-pink-500 fill-pink-100/30 shrink-0" />
                Verified
              </span>
            )}
          </h3>
          <p className="text-[11px] font-semibold text-slate-600 leading-tight">
            {member.title}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span>{member.city}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold pt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-secondary/85" />
              {member.followerIds?.length || 0} {(member.followerIds?.length || 0) === 1 ? 'follower' : 'followers'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>
              {member.followingIds?.length || 0} following
            </span>
            {member.endorsements && member.endorsements.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 text-emerald-600 font-black">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {member.endorsements.length} Endorsements
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-1 pt-1.5">
            {member.business_stage && (
              <span className="inline-flex items-center rounded-md bg-pink-50 px-1.5 py-0.5 text-[9px] font-bold text-pink-700 ring-1 ring-inset ring-pink-700/10">
                {member.business_stage}
              </span>
            )}
            {member.mentoring_capacity && (
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ring-1 ring-inset ${
                member.mentoring_capacity === 'Open'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                  : member.mentoring_capacity === 'Limited'
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/10'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/10'
              }`}>
                Capacity: {member.mentoring_capacity}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio description */}
      <p className="text-[11px] text-slate-500 leading-relaxed flex-grow">
        {member.bio}
      </p>

      {/* Active Circles Badges */}
      {member.circleIds && member.circleIds.length > 0 && (
        <div className="border-t border-slate-100/70 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Users className="h-3 w-3 text-secondary" />
            <span>Active Circles</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {member.circleIds.map((circleId) => {
              const circleInfo = getCircleInfo(circleId);
              if (!circleInfo) return null;
              return (
                <span 
                  key={circleId}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors ${circleInfo.classes}`}
                  title={circleInfo.name}
                >
                  <span>{circleInfo.icon}</span>
                  <span>{circleInfo.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Area */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Core Skills
        </p>
        <div className="flex flex-wrap gap-1">
          {member.skills.map((skill, sIdx) => {
            const count = (member.endorsements || []).filter(e => e.skill === skill).length;
            return (
              <span 
                key={sIdx}
                className="rounded-lg bg-primary/5 px-2 py-0.5 text-[9px] font-bold text-primary flex items-center gap-1"
              >
                {skill}
                {count > 0 && (
                  <span className="flex items-center gap-0.5 bg-primary text-white px-1 rounded-full text-[7px]">
                    {count}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Interests Area */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Growth Focus
        </p>
        <div className="flex flex-wrap gap-1">
          {member.interests.map((interest, iIdx) => (
            <span 
              key={iIdx}
              className="rounded-lg bg-secondary/5 px-2 py-0.5 text-[9px] font-bold text-secondary"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Rank and actions */}
      <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-50 border border-slate-150 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-primary/75">
          {member.rank}
        </span>

        <div className="flex gap-1.5 items-center flex-wrap justify-end">
          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className={`relative p-2 rounded-full border transition-all ${
              shareCopied 
                ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                : 'text-slate-500 border-slate-150 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50'
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
            {shareCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-xl whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>

          {/* Connection Status */}
          {(() => {
            const connection = connections.find(c => c.userId === member.id);
            const status = connection?.status;

            if (status === 'Pending') {
              return (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-[9px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Pending</span>
                </div>
              );
            }

            if (status === 'Connected') {
              return (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                  <UserCheck className="h-3 w-3" />
                  <span>Connected</span>
                </div>
              );
            }

            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  requestConnection(member.id);
                }}
                className="rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <UserPlus className="h-3 w-3" />
                <span>Connect</span>
              </button>
            );
          })()}

          {(() => {
            const pair = mentorshipPairs.find(p => p.mentor.id === member.id && p.mentee.id === currentUser.id);
            const status = pair?.status;

            if (status === 'Pending') {
              return (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Mentorship Pending</span>
                </div>
              );
            }

            if (status === 'Active') {
              return (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                  <UserCheck className="h-3 w-3" />
                  <span>Mentorship Active</span>
                </div>
              );
            }

            return member.rank === 'Mentor' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAskMentor(member);
                  }}
                  className="rounded-full bg-secondary hover:bg-secondary/95 text-white px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Ask Mentor</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestMentorship(member);
                  }}
                  className="rounded-full bg-primary hover:bg-primary/95 text-white px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <HeartHandshake className="h-3 w-3 text-accent" />
                  <span>Mentor Request</span>
                </button>
              </div>
            ) : null;
          })()}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow(member.id);
            }}
            title={followingIds.includes(member.id) ? "You follow this sister" : "Follow sister"}
            className={`p-2 rounded-full border transition-colors ${
              followingIds.includes(member.id) 
                ? 'text-secondary border-secondary/30 bg-secondary/5 hover:bg-secondary/10' 
                : 'text-slate-500 border-slate-150 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50'
            }`}
          >
            {followingIds.includes(member.id) ? (
              <Bookmark className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>

          {handleScheduleCoffee && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScheduleCoffee(member);
              }}
              title="Schedule Coffee Chat"
              className="p-2 rounded-full border border-slate-150 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all"
            >
              <Coffee className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMessageSister(member);
            }}
            className="rounded-full border border-slate-150 text-slate-600 hover:text-secondary hover:border-secondary/40 hover:bg-secondary/5 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Message</span>
          </button>
        </div>
      </div>

    </motion.div>
  );
}

interface DirectoryViewProps {
  members: Member[];
  setCurrentView: (view: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  setMentorshipProposedMentor: (member: Member | null) => void;
  setMessageDraft?: (msg: string) => void;
  followingIds: string[];
  toggleFollow: (memberId: string) => void;
  connections: { userId: string, status: 'Pending' | 'Connected' }[];
  requestConnection: (userId: string) => void;
  mentorshipPairs: MentorshipPair[];
  handleViewProfile?: (id: string) => void;
  onSendMessage?: (memberId: string, text: string) => void;
  circles: Circle[];
  currentUser: Member;
  addNotification?: (text: string) => void;
}

export function DirectoryView({
  members,
  setCurrentView,
  setSelectedConversationMember,
  setMentorshipProposedMentor,
  setMessageDraft,
  followingIds,
  toggleFollow,
  connections,
  requestConnection,
  mentorshipPairs,
  handleViewProfile,
  onSendMessage,
  circles,
  currentUser,
  addNotification
}: DirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'skill' | 'city'>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);

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

  // Bulk Invite State
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [bulkInviteTargetCircle, setBulkInviteTargetCircle] = useState('');
  const [bulkInviteSuccess, setBulkInviteSuccess] = useState(false);

  const managedCircles = circles.filter(c => c.createdBy === currentUser.id || c.moderators?.includes(currentUser.id));

  // Filter members
  const filteredMembers = members.filter(member => {
    // Exclude current logged in user from directory list
    if (member.id === currentUser.id) return false;

    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;

    if (query !== '') {
      if (searchField === 'all') {
        matchesSearch = 
          member.name.toLowerCase().includes(query) ||
          member.title.toLowerCase().includes(query) ||
          member.city.toLowerCase().includes(query) ||
          member.skills.some(s => s.toLowerCase().includes(query)) ||
          member.interests.some(i => i.toLowerCase().includes(query));
      } else if (searchField === 'name') {
        matchesSearch = member.name.toLowerCase().includes(query);
      } else if (searchField === 'skill') {
        matchesSearch = member.skills.some(s => s.toLowerCase().includes(query));
      } else if (searchField === 'city') {
        matchesSearch = member.city.toLowerCase().includes(query);
      }
    }
    
    const matchesRank = selectedRank === 'all' || member.rank.toLowerCase() === selectedRank.toLowerCase();
    const matchesCity = selectedCity === 'all' || member.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesStage = selectedStage === 'all' || member.business_stage === selectedStage;
    const matchesCapacity = selectedCapacity === 'all' || member.mentoring_capacity === selectedCapacity;
    const matchesFollowing = !showFollowingOnly || followingIds.includes(member.id);

    return matchesSearch && matchesRank && matchesCity && matchesStage && matchesCapacity && matchesFollowing;
  });

  const handleMessageSister = (member: Member) => {
    setActiveMessageMember(member);
    setQuickMessage('');
    setSendSuccess(false);
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

  const handleAskMentor = (member: Member) => {
    setSelectedConversationMember(member);
    if (setMessageDraft) {
      setMessageDraft(`Hi ${member.name.split(' ')[0]}, I saw you are a Mentor and I'd love to ask you a few questions about your experience! Are you open to a brief chat?`);
    }
    setCurrentView('messages');
  };

  const handleRequestMentorship = (member: Member) => {
    if (member.rank !== 'Mentor') {
      alert('Only registered mentors can be requested for 1-on-1 coaching.');
      return;
    }
    setMentorshipProposedMentor(member);
    setCurrentView('mentorship');
  };

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

    // Trigger notification as requested
    if (addNotification) {
      addNotification(`Coffee chat request sent to ${activeCoffeeChatMember.name} for ${coffeeChatDate} at ${coffeeChatTime}.`);
      
      // In a real app, we would send a notification to the TARGET sister as well
      // The prompt says: "inform the selected sister of the proposed time"
      // Since this is a client-side simulation, we'll log it and show a success message
      console.log(`Notification sent to ${activeCoffeeChatMember.name}: New coffee chat proposed for ${coffeeChatDate} at ${coffeeChatTime}`);
    }

    setIsSchedulingCoffee(false);
    setCoffeeChatSuccess(true);

    setTimeout(() => {
      setActiveCoffeeChatMember(null);
      setCoffeeChatSuccess(false);
    }, 2000);
  };

  const handleToggleSelect = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const handleSendBulkInvites = async () => {
    if (!bulkInviteTargetCircle || selectedMemberIds.size === 0) return;
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSending(false);
    setBulkInviteSuccess(true);
    
    setTimeout(() => {
      setShowBulkInviteModal(false);
      setBulkSelectMode(false);
      setSelectedMemberIds(new Set());
      setBulkInviteSuccess(false);
    }, 1500);
  };

  // Unique lists for dropdowns
  const ranks = ['all', 'Mentor', 'Learner', 'Member', 'Connector', 'Community Lead'];
  const cities = ['all', ...Array.from(new Set(members.map(m => m.city)))];
  const stages = ['all', 'Idea Stage', 'Early Stage', 'Growth Stage', 'Established'];
  const capacities = ['all', 'Open', 'Limited', 'No Capacity'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col items-center max-w-3xl mx-auto text-center relative">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
          Global Directory
        </p>
        <h1 className="mt-2 text-3xl font-heading font-black text-primary sm:text-4xl">
          Discover Your Sisters
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Search the member directory to discover coaches, partners, and collaborators. Filter by specialized technical skills, geographic location, or mentorship status.
        </p>
        
        {managedCircles.length > 0 && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                if (bulkSelectMode) setSelectedMemberIds(new Set());
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                bulkSelectMode 
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              {bulkSelectMode ? 'Cancel Bulk Invite' : 'Bulk Invite to Circle'}
            </button>
            {bulkSelectMode && selectedMemberIds.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowBulkInviteModal(true)}
                className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
              >
                <Send className="h-4 w-4" />
                Invite {selectedMemberIds.size} {selectedMemberIds.size === 1 ? 'Sister' : 'Sisters'}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="mb-8 rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          
          {/* Search Box */}
          <div className="relative lg:col-span-6 space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchField === 'all' 
                    ? "Search builders by name, title, skills, or city..." 
                    : searchField === 'name' 
                    ? "Search builders by name..." 
                    : searchField === 'skill' 
                    ? "Search builders by core skills (e.g. 'Finance', 'React')..." 
                    : "Search builders by city or location (e.g. 'London', 'Berlin')..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-bold">
              <span className="text-slate-400 font-extrabold mr-1">Search By:</span>
              <button
                type="button"
                onClick={() => setSearchField('all')}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  searchField === 'all'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Search className="h-3 w-3" />
                <span>All Fields</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchField('name')}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  searchField === 'name'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="h-3 w-3" />
                <span>Name</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchField('skill')}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  searchField === 'skill'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Tag className="h-3 w-3" />
                <span>Skills</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchField('city')}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  searchField === 'city'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-3 w-3" />
                <span>City</span>
              </button>
            </div>
          </div>

          {/* Filters Group */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:col-span-6 lg:items-start">
            {/* Rank Filter */}
            <div className="w-full">
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-[11px] text-primary font-bold focus:border-secondary focus:outline-none bg-slate-50/50"
              >
                <option value="all">🔍 All Ranks</option>
                <option value="mentor">👩‍🏫 Mentors</option>
                <option value="learner">📚 Learners</option>
                <option value="member">🌟 Members</option>
                <option value="connector">🔌 Connectors</option>
                <option value="community lead">👑 Leads</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="w-full">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-[11px] text-primary font-bold focus:border-secondary focus:outline-none bg-slate-50/50"
              >
                <option value="all">📍 All Cities</option>
                {cities.filter(c => c !== 'all').map(city => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            {/* Business Stage Filter */}
            <div className="w-full">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-[11px] text-primary font-bold focus:border-secondary focus:outline-none bg-slate-50/50"
              >
                <option value="all">🚀 All Stages</option>
                {stages.filter(s => s !== 'all').map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Mentoring Capacity Filter */}
            <div className="w-full">
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-[11px] text-primary font-bold focus:border-secondary focus:outline-none bg-slate-50/50"
              >
                <option value="all">🤝 Capacity</option>
                {capacities.filter(c => c !== 'all').map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Follow / Connection Segment Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filter View:</span>
          </div>
          <button
            onClick={() => setShowFollowingOnly(false)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
              !showFollowingOnly 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>All Sisters ({members.filter(m => m.id !== currentUser.id).length})</span>
          </button>
          <button
            onClick={() => setShowFollowingOnly(true)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
              showFollowingOnly 
                ? 'bg-secondary text-white shadow-sm' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Sisters I Follow ({followingIds.length})</span>
          </button>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-100 pt-3">
          <span>Found {filteredMembers.length} Sisters matching search parameters</span>
          <span className="text-secondary font-extrabold uppercase">Verified Community</span>
        </div>
      </div>

      {/* MEMBERS DIRECTORY GRID */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No builders found matching those search criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try expanding your search query, or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard 
              key={member.id}
              member={member}
              followingIds={followingIds}
              toggleFollow={toggleFollow}
              connections={connections}
              requestConnection={requestConnection}
              mentorshipPairs={mentorshipPairs}
              handleRequestMentorship={handleRequestMentorship}
              handleAskMentor={handleAskMentor}
              handleMessageSister={handleMessageSister}
              handleViewProfile={handleViewProfile}
              handleScheduleCoffee={handleScheduleCoffee}
              selectable={bulkSelectMode}
              selected={selectedMemberIds.has(member.id)}
              onToggleSelect={handleToggleSelect}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

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
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
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
                    <h4 className="text-lg font-heading font-black text-primary">Message Sent!</h4>
                    <p className="mt-2 text-xs font-bold text-slate-500">Your sister will be notified immediately.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
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
                        className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-xs text-primary placeholder:text-slate-300 focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setActiveMessageMember(null)}
                        disabled={isSending}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
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
                    <h4 className="text-base font-heading font-black text-primary">Invitation Sent!</h4>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">Proposed: {coffeeChatDate} at {coffeeChatTime}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
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
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Time</label>
                        <select
                          value={coffeeChatTime}
                          onChange={(e) => setCoffeeChatTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
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

      {/* BULK INVITE MODAL */}
      <AnimatePresence>
        {showBulkInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSending && setShowBulkInviteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-black text-white leading-none">
                      Bulk Invite
                    </h3>
                    <p className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-wider">
                      {selectedMemberIds.size} Sisters Selected
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBulkInviteModal(false)}
                  disabled={isSending}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {bulkInviteSuccess ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-heading font-black text-primary">Invites Sent!</h4>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      Successfully invited {selectedMemberIds.size} sisters to the circle.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        Select Target Circle
                      </label>
                      <select
                        value={bulkInviteTargetCircle}
                        onChange={(e) => setBulkInviteTargetCircle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm text-primary font-bold focus:border-secondary focus:outline-none bg-slate-50/50"
                      >
                        <option value="" disabled>Select a circle you manage...</option>
                        {managedCircles.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setShowBulkInviteModal(false)}
                        disabled={isSending}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendBulkInvites}
                        disabled={isSending || !bulkInviteTargetCircle}
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
                            <span>Send Invites</span>
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

    </div>
  );
}
