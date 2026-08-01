import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  FileText, 
  Calendar, 
  MoreVertical, 
  Plus, 
  Share2, 
  Bell, 
  Hash,
  Search,
  Filter,
  CheckCircle2,
  Trophy,
  Activity,
  LayoutGrid,
  Sparkles,
  PlusCircle,
  Heart,
  Shield,
  Edit2,
  Save,
  UserPlus,
  Ban,
  UserMinus,
  Trash2,
  Lock,
  Unlock,
  X,
  VolumeX,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Circle, Member, Post, Resource, Event, Challenge, CircleRequest } from '../data';
import { CircleGroupChat } from './CircleGroupChat';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard, formatTimeAgo } from '../lib/utils';

interface CircleHubProps {
  circle: Circle;
  circles: Circle[];
  onBack: () => void;
  onJoinCircle: (id: string) => void;
  onSelectCircle: (id: string) => void;
  addNotification?: (title: string) => void;
  setToast: (toast: { id: string; title: string; desc: string; type: 'points' | 'badge' } | null) => void;
  members: Member[];
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  circleRequests: CircleRequest[];
  setCircleRequests: React.Dispatch<React.SetStateAction<CircleRequest[]>>;
  challenges: Challenge[];
  setChallenges?: React.Dispatch<React.SetStateAction<Challenge[]>>;
  events: Event[];
  currentUser: Member;
  addPoints: (pts: number, badge?: string, isChallenge?: boolean) => void;
  setCurrentView: (view: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
}

interface CompletedChallengeActivity {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  challengeTitle: string;
  timestamp: string;
  celebrations: number;
  celebratedBy: string[];
}

export function CircleHub({
  circle,
  circles,
  onBack,
  onJoinCircle,
  onSelectCircle,
  addNotification,
  setToast,
  members,
  posts,
  setPosts,
  setCircles,
  setMembers,
  challenges,
  setChallenges,
  events,
  currentUser,
  addPoints,
  setCurrentView,
  setSelectedConversationMember,
  circleRequests,
  setCircleRequests
}: CircleHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'chat' | 'members' | 'challenges' | 'events' | 'admin'>('feed');
  const [newPostText, setNewPostText] = useState('');
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [joinRequestSubmitted, setJoinRequestSubmitted] = useState(false);

  // Circle Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editCircle, setEditCircle] = useState({
    name: circle.name,
    description: circle.description,
    image: circle.image,
    rules: circle.rules || ['Respect sisters', 'No spam', 'Support each other'],
    permissions: circle.permissions || {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: false
    },
    allowedPostTypes: circle.allowedPostTypes || ['text', 'image', 'video', 'poll']
  });

  const isCircleAdmin = currentUser.id === circle.createdBy || circle.moderators?.includes(currentUser.id) || currentUser.isSuperAdmin;
  const canPost = circle.permissions?.whoCanPost === 'anyone' || isCircleAdmin;
  const isMuted = circle.mutedMemberIds?.includes(currentUser.id);
  const isSuspended = circle.suspendedMemberIds?.includes(currentUser.id);
  const existingJoinRequest = circleRequests.find(r => r.type === 'join' && r.circleId === circle.id && r.userId === currentUser.id && r.status === 'pending');
  const canActuallyPost = canPost && !isMuted && !isSuspended;

  const handleSaveCircle = () => {
    setCircles(prev => prev.map(c => c.id === circle.id ? { 
      ...c, 
      name: editCircle.name, 
      description: editCircle.description,
      image: editCircle.image,
      rules: editCircle.rules,
      permissions: editCircle.permissions,
      allowedPostTypes: editCircle.allowedPostTypes as any
    } : c));
    setIsEditing(false);
    if (addNotification) addNotification(`Circle "${editCircle.name}" settings updated successfully!`);
  };

  const handleMemberAction = (memberId: string, action: 'remove' | 'suspend' | 'ban' | 'mute' | 'make_mod' | 'remove_mod') => {
    const memberName = members.find(m => m.id === memberId)?.name || 'Member';
    
    if (action === 'remove') {
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c));
      if (addNotification) addNotification(`${memberName} has been removed from the circle.`);
    } else if (action === 'suspend') {
      if (addNotification) addNotification(`${memberName}'s posting privileges have been suspended in this circle.`);
    } else if (action === 'ban') {
      if (addNotification) addNotification(`${memberName} has been permanently banned from this circle.`);
    } else if (action === 'mute') {
      if (addNotification) addNotification(`${memberName} has been muted in this circle.`);
    } else if (action === 'make_mod') {
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, moderators: [...(c.moderators || []), memberId] } : c));
      if (addNotification) addNotification(`${memberName} is now a moderator.`);
    } else if (action === 'remove_mod') {
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, moderators: (c.moderators || []).filter(id => id !== memberId) } : c));
      if (addNotification) addNotification(`${memberName} is no longer a moderator.`);
    }
  };

  const handleShareClick = async (post: Post) => {
    const postUrl = `${window.location.origin}/circle/${circle.id}/posts/${post.id}`;
    const shareData = {
      title: `Circle Update from ${post.author.name}`,
      text: post.content.substring(0, 100) + '...',
      url: postUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    }

    // Fallback
    const success = await copyToClipboard(postUrl);
    if (success) {
      if (addNotification) addNotification('Post link copied to clipboard!');
    } else {
      console.error('Failed to copy link');
    }
  };

  const circleMembers = members.filter(m => 
    circle.category === 'custom' 
      ? (m.interests.some(i => circle.name.toLowerCase().includes(i.toLowerCase())) || m.id === circle.createdBy)
      : true 
  ).slice(0, 15);

  const circlePosts = posts.filter(p => p.circleId === circle.id);
  const circleChallenges = challenges.filter(c => c.category === circle.id || (circle.category === 'custom' && c.category === 'connect'));
  const circleEvents = events.filter(e => e.category === circle.id || (circle.category === 'custom' && e.category === 'connect'));

  const [completedActivities, setCompletedActivities] = useState<CompletedChallengeActivity[]>(() => {
    const otherMembers = members.filter(m => m.id !== currentUser.id && m.id !== 'currentUser');
    const circleChallengesList = challenges.filter(c => c.category === circle.id || (circle.category === 'custom' && c.category === 'connect'));
    const activeCircleChallenges = circleChallengesList.length > 0 ? circleChallengesList : challenges;
    const times = [
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    ];
    
    return otherMembers.slice(0, 3).map((member, idx) => {
      const challengeItem = activeCircleChallenges[idx % activeCircleChallenges.length];
      return {
        id: `comp-chal-${member.id}-${idx}`,
        memberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar,
        challengeTitle: challengeItem ? challengeItem.title : '7-Day Confidence Challenge',
        timestamp: times[idx % times.length],
        celebrations: idx + 2,
        celebratedBy: []
      };
    });
  });

  const handleJoinRequest = () => {
    if (circle.isJoined) {
      onJoinCircle(circle.id);
      return;
    }

    if (existingJoinRequest) {
      setToast({ id: `join-request-duplicate-${Date.now()}`, title: 'Join request already pending.', desc: `Your request to join ${circle.name} is already under review.`, type: 'points' });
      return;
    }

    const request: CircleRequest = {
      id: `joinreq-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      circleId: circle.id,
      circleName: circle.name,
      description: joinRequestMessage || `I would like to join the ${circle.name} circle to collaborate with other sisters.`,
      category: circle.category,
      type: 'join',
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    setCircleRequests(prev => [...prev, request]);
    setJoinRequestSubmitted(true);
    setToast({ id: `join-request-${Date.now()}`, title: 'Join request sent', desc: `Your request to join ${circle.name} has been submitted.`, type: 'badge' });
  };

  const handleCompleteChallenge = (id: string, rewardText: string, badgeCode: string) => {
    if (setChallenges) {
      setChallenges(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, completed: true, progress: 100 };
        }
        return c;
      }));
    }

    // Add user's own completion to the celebrate feed
    const completedCh = challenges.find(c => c.id === id);
    const userActivity: CompletedChallengeActivity = {
      id: `comp-chal-you-${Date.now()}`,
      memberId: currentUser.id,
      memberName: currentUser.name,
      memberAvatar: currentUser.avatar,
      challengeTitle: completedCh ? completedCh.title : 'Weekly Challenge Task',
      timestamp: 'Just now',
      celebrations: 0,
      celebratedBy: []
    };
    setCompletedActivities(prev => [userActivity, ...prev]);

    // Parse points from reward text e.g., "Badge + 100 Points"
    const pointsMatch = rewardText.match(/(\d+)\s*Points/);
    const pts = pointsMatch ? parseInt(pointsMatch[1], 10) : 50;

    addPoints(pts, badgeCode, true);
  };

  const handleCelebrateActivity = (activityId: string) => {
    setCompletedActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        const alreadyCelebrated = act.celebratedBy.includes(currentUser.id);
        if (alreadyCelebrated) {
          return {
            ...act,
            celebratedBy: act.celebratedBy.filter(id => id !== currentUser.id),
            celebrations: Math.max(0, act.celebrations - 1)
          };
        } else {
          // Award 1 point for social engagement
          addPoints(1, undefined, true);
          return {
            ...act,
            celebratedBy: [...act.celebratedBy, currentUser.id],
            celebrations: act.celebrations + 1
          };
        }
      }
      return act;
    }));
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: `circle-post-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank
      },
      content: newPostText,
      timestamp: 'Just now',
      likes: [],
      comments: [],
      liked: false,
      circleId: circle.id
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    addPoints(10);
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* CIRCLE HERO HEADER */}
      <div className="relative h-80 w-full overflow-hidden">
        <img src={circle.image || null} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-8 max-w-7xl mx-auto w-full">
          <button 
            onClick={onBack}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Circles
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-secondary/80 backdrop-blur-xl text-white shadow-xl">
                   <Hash className="h-6 w-6 font-black" />
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tight leading-none">
                  {circle.name}
                </h1>
              </div>
              <p className="max-w-2xl text-sm font-medium text-slate-300 leading-relaxed">
                {circle.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
               <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all">
                 <Bell className="h-5 w-5" />
               </button>
               <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all">
                 <Share2 className="h-5 w-5" />
               </button>
               <button
                 type="button"
                 onClick={() => {
                   if (circle.permissions?.isPrivate && !circle.isJoined) {
                     handleJoinRequest();
                     return;
                   }
                   onJoinCircle(circle.id);
                 }}
                 className="px-8 py-4 rounded-2xl bg-white text-primary text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
               >
                 {circle.isJoined ? 'Exit Circle' : circle.permissions?.isPrivate ? (existingJoinRequest ? 'Request Pending' : 'Request Invite') : 'Join Circle'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR: NAVIGATION & INFO */}
          <aside className="lg:col-span-1 space-y-8">
            <nav className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm overflow-hidden">
              <div className="space-y-1">
                {(['feed', 'chat', 'members', 'challenges', 'events', 'admin'] as const).map((tab) => {
                  if (tab === 'admin' && !isCircleAdmin) return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeSubTab === tab
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      {tab === 'feed' && <LayoutGrid className="h-4 w-4" />}
                      {tab === 'chat' && <MessageCircle className="h-4 w-4" />}
                      {tab === 'members' && <Users className="h-4 w-4" />}
                      {tab === 'challenges' && <Trophy className="h-4 w-4" />}
                      {tab === 'events' && <Calendar className="h-4 w-4" />}
                      {tab === 'admin' && <Shield className="h-4 w-4" />}
                      {tab}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Circle Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-heading font-black text-primary">{circle.memberCount}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400">Sisters</p>
                 </div>
                 <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-heading font-black text-primary">{circlePosts.length}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400">Posts</p>
                 </div>
               </div>
               {circle.permissions?.isPrivate && !circle.isJoined && (
                 <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-5 mt-6 space-y-4">
                   <div className="flex items-center gap-3 text-amber-700">
                     <Shield className="h-5 w-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Private circle access</span>
                   </div>
                   <p className="text-[11px] text-slate-600 leading-relaxed">
                     This circle is invite-only. Submit a short request to join and an admin will review it.
                   </p>
                   {!existingJoinRequest ? (
                     <div className="space-y-3">
                       <textarea
                         value={joinRequestMessage}
                         onChange={(e) => setJoinRequestMessage(e.target.value)}
                         placeholder="Tell the circle leaders why you'd like to join..."
                         className="w-full min-h-[96px] rounded-3xl border border-amber-200 bg-white p-4 text-sm text-slate-700 outline-none focus:border-amber-300"
                       />
                       <button
                         type="button"
                         onClick={handleJoinRequest}
                         className="w-full rounded-2xl bg-amber-500 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                       >
                         Send Join Request
                       </button>
                     </div>
                   ) : (
                     <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                       Your request to join this circle is pending review. You will be notified when a moderator acts.
                     </div>
                   )}
                 </div>
               )}
               {circle.permissions?.isPrivate && !circle.isJoined && (
                 <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-700 mt-4">
                   <p className="font-black uppercase tracking-wider text-[10px]">Private Circle</p>
                   <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                     {existingJoinRequest ? 'Your join request is pending review. You will be notified when access is granted.' : 'Submit a request to join this private circle. An admin will review your application shortly.'}
                   </p>
                 </div>
               )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Moderators</h3>
               <div className="space-y-4">
                 {members.filter(m => m.rank === 'Community Lead' || m.id === circle.createdBy).slice(0, 2).map(mod => (
                    <div key={mod.id} className="flex items-center gap-3">
                      <img src={mod.avatar || null} className="h-10 w-10 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-tight">{mod.name}</p>
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{mod.rank}</p>
                      </div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recommended</h3>
                 <Sparkles className="h-3 w-3 text-amber-400" />
               </div>
               <div className="space-y-4">
                 {circles
                   .filter(c => !c.isJoined && c.id !== circle.id)
                   .sort(() => 0.5 - Math.random()) // Randomize for variety
                   .slice(0, 2)
                   .map(c => (
                    <div 
                      key={c.id} 
                      className="group flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:border-secondary/20 hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() => onSelectCircle(c.id)}
                    >
                      <img src={c.image || null} className="h-12 w-12 rounded-xl object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-primary uppercase tracking-tight truncate">{c.name}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinCircle(c.id);
                          }}
                          className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-secondary hover:text-secondary/80 transition-colors mt-1"
                        >
                          <PlusCircle className="h-2.5 w-2.5" />
                          Quick Join
                        </button>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeSubTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* POST INPUT */}
                  {canActuallyPost ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                      <form onSubmit={handlePostSubmit} className="space-y-4">
                         <div className="flex gap-4">
                           <img src={currentUser.avatar || null} className="h-12 w-12 rounded-full object-cover shrink-0" alt="" />
                           <textarea 
                             value={newPostText}
                             onChange={(e) => setNewPostText(e.target.value)}
                             placeholder={`Share something with the ${circle.name} sisters...`}
                             className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium outline-none focus:border-secondary transition-all resize-none min-h-[100px]"
                           />
                         </div>
                         <div className="flex justify-end gap-3">
                            <button type="button" className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                               <Calendar className="h-5 w-5" />
                            </button>
                            <button type="submit" className="px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                               Post update
                            </button>
                         </div>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 text-center shadow-inner">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {isMuted || isSuspended 
                          ? "Your posting privileges have been suspended." 
                          : "Only moderators can post in this circle."}
                      </p>
                    </div>
                  )}

                  {/* POSTS LIST */}
                  <div className="space-y-6">
                    {circlePosts.length > 0 ? (
                      circlePosts.map(post => (
                        <div key={post.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <img src={post.author.avatar || null} className="h-12 w-12 rounded-full object-cover" alt="" />
                               <div>
                                 <div className="flex items-center gap-2">
                                   <h4 className="text-sm font-black text-primary uppercase tracking-tight">{post.author.name}</h4>
                                   <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black uppercase text-slate-500 tracking-widest">{post.author.rank}</span>
                                 </div>
                                 <p className="text-[10px] font-medium text-slate-400">{post.timestamp}</p>
                               </div>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-300 transition-all">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{post.content}</p>
                          <div className="pt-6 border-t border-slate-50 flex items-center gap-6">
                             <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors">
                                <Plus className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {Array.isArray(post.likes) ? post.likes.length : post.likes}
                                </span>
                             </button>
                             <button className="flex items-center gap-2 text-slate-400 hover:text-secondary transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{post.comments.length}</span>
                             </button>
                             <button 
                               onClick={() => handleShareClick(post)}
                               className="ml-auto text-slate-400 hover:text-primary transition-colors"
                             >
                               <Share2 className="h-4 w-4" />
                             </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center space-y-4">
                         <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <Plus className="h-10 w-10 text-slate-200" />
                         </div>
                         <div className="space-y-1">
                           <h3 className="text-lg font-black text-primary uppercase tracking-tight">No circle posts yet</h3>
                           <p className="text-xs font-medium text-slate-400">Be the first to share an update, resource, or question with your sisters!</p>
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSubTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CircleGroupChat 
                    activeTab={circle.id as any}
                    currentUser={currentUser}
                    members={members}
                    addPoints={addPoints}
                    setSelectedConversationMember={setSelectedConversationMember}
                    setCurrentView={setCurrentView}
                  />
                </motion.div>
              )}

              {activeSubTab === 'members' && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Circle Sisters <span className="text-slate-300">({circle.memberCount})</span></h3>
                     <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Find a sister..." 
                         className="bg-white rounded-2xl border border-slate-100 py-3 pl-12 pr-4 text-xs font-medium outline-none focus:border-secondary transition-all w-64"
                       />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {circleMembers.map(member => (
                      <div key={member.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between hover:border-secondary/20 transition-all group">
                         <div className="flex items-center gap-4">
                            <img src={member.avatar || null} className="h-14 w-14 rounded-2xl object-cover" alt="" />
                            <div>
                               <p className="text-sm font-black text-primary uppercase tracking-tight group-hover:text-secondary">{member.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.title}</p>
                            </div>
                         </div>
                         <button 
                          onClick={() => {
                            setSelectedConversationMember(member);
                            setCurrentView('messages');
                          }}
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-secondary hover:text-white transition-all"
                         >
                            <MessageCircle className="h-4 w-4" />
                         </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              {activeSubTab === 'challenges' && (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Circle Challenges</h3>
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                        <Trophy className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Earn BIG Points</span>
                     </div>
                  </div>

                  {/* Two Column Layout: Active list + Sister's celebrate feed */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     
                     {/* Column 1 & 2: Active Challenges */}
                     <div className="lg:col-span-2 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Tasks ({circleChallenges.length})</h4>
                       {circleChallenges.map(challenge => (
                         <div key={challenge.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-secondary transition-all">
                            <div className="space-y-4 flex-grow">
                               <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${challenge.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary/10 text-secondary'}`}>
                                    {challenge.completed ? 'Completed' : 'Active Challenge'}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Target: {challenge.target}</span>
                               </div>
                               <h4 className="text-base font-black text-primary uppercase tracking-tight leading-none">{challenge.title}</h4>
                               <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{challenge.description}</p>
                               <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-secondary transition-all" style={{ width: `${challenge.progress}%` }} />
                               </div>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                               <div className="text-center">
                                  <p className="text-base font-black text-primary">{challenge.reward}</p>
                                  <p className="text-[8px] font-black uppercase text-slate-400">Reward</p>
                               </div>
                               {challenge.completed ? (
                                 <button 
                                   disabled
                                   className="px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                                 >
                                    Completed!
                                 </button>
                               ) : (
                                 <button 
                                   onClick={() => handleCompleteChallenge(challenge.id, challenge.reward, challenge.badge)}
                                   className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                 >
                                    Mark Completed
                                 </button>
                               )}
                            </div>
                         </div>
                       ))}
                     </div>

                     {/* Column 3: Sisters' Celebrate Feed */}
                     <div className="lg:col-span-1 space-y-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celebrate Feed</h4>
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-black uppercase tracking-wider">
                           <Sparkles className="h-2.5 w-2.5" />
                           +1 PT Cheer
                         </span>
                       </div>
                       
                       <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 space-y-4 max-h-[500px] overflow-y-auto">
                         {completedActivities.length === 0 ? (
                           <p className="text-xs text-slate-400 font-medium text-center py-8">No completed challenges recorded yet in this circle.</p>
                         ) : (
                           completedActivities.map(act => {
                             const hasCelebrated = act.celebratedBy.includes(currentUser.id);
                             return (
                               <div key={act.id} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3 shadow-sm hover:shadow transition-all">
                                 <div className="flex items-center gap-3">
                                   <img src={act.memberAvatar || null} className="h-8 w-8 rounded-xl object-cover shrink-0" alt="" referrerPolicy="no-referrer" />
                                   <div className="min-w-0 flex-1">
                                     <p className="text-[11px] font-black text-primary leading-tight truncate">{act.memberName}</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{act.timestamp}</p>
                                   </div>
                                   <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                                     <Trophy className="h-3 w-3 shrink-0" />
                                     <span>DONE</span>
                                   </div>
                                 </div>
                                 
                                 <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100/50">
                                   <p className="text-[10px] font-extrabold text-primary uppercase tracking-tight leading-none mb-1">Completed Task</p>
                                   <p className="text-[11px] font-medium text-slate-600 leading-snug">{act.challengeTitle}</p>
                                 </div>
                                 
                                 <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                     <Heart className={`h-3 w-3 ${act.celebratedBy.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                                     {act.celebrations} {act.celebrations === 1 ? 'cheer' : 'cheers'}
                                   </span>
                                   
                                   <button 
                                     onClick={() => handleCelebrateActivity(act.id)}
                                     className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                                       hasCelebrated 
                                         ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                         : 'bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 hover:border-rose-100 border border-transparent'
                                     }`}
                                   >
                                     <Sparkles className="h-3 w-3" />
                                     <span>{hasCelebrated ? 'Celebrated!' : 'Support'}</span>
                                   </button>
                                 </div>
                               </div>
                             );
                           })
                         )}
                       </div>
                     </div>

                  </div>
                </motion.div>
              )}

              {activeSubTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Upcoming Events</h3>
                     <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                       <Plus className="h-4 w-4" />
                       Host Event
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {circleEvents.map(event => (
                      <div key={event.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                         <div className="h-40 overflow-hidden">
                            <img src={event.image || null} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="" />
                         </div>
                         <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{event.date}</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{event.time}</span>
                            </div>
                            <h4 className="text-sm font-black text-primary uppercase tracking-tight group-hover:text-secondary">{event.title}</h4>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                               <div className="flex items-center gap-2 text-slate-400">
                                  <Users className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{event.attendees} Sisters</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (addNotification) {
                                        addNotification(`Reminder set: ${event.title} on ${event.date} at ${event.time}`);
                                        setToast({
                                          id: `reminder-${event.id}`,
                                          title: '⏰ Reminder Set!',
                                          desc: `We'll notify you when "${event.title}" is about to start.`,
                                          type: 'points'
                                        });
                                      }
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-150 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-secondary hover:border-secondary transition-all"
                                  >
                                     Remind Me
                                  </button>
                                  <button className="px-4 py-2 rounded-xl bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-secondary hover:text-white transition-all">
                                     RSVP
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeSubTab === 'admin' && isCircleAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Circle Management</h3>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-secondary hover:border-secondary transition-all shadow-sm"
                        >
                          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                          {isEditing ? 'Discard Changes' : 'Edit Circle Settings'}
                        </button>
                        {isEditing && (
                          <button 
                            onClick={handleSaveCircle}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
                          >
                            <Save className="h-4 w-4" />
                            Save Configuration
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Circle Identity & Branding */}
                    <div className={`bg-white rounded-3xl border p-8 shadow-sm space-y-6 transition-all ${isEditing ? 'border-secondary ring-4 ring-secondary/5' : 'border-slate-100'}`}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Identity & Vision
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Circle Name</label>
                          <input 
                            disabled={!isEditing}
                            value={editCircle.name}
                            onChange={(e) => setEditCircle({...editCircle, name: e.target.value})}
                            className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold text-primary border-2 border-transparent focus:border-secondary focus:bg-white outline-none transition-all disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Image URL</label>
                          <input 
                            disabled={!isEditing}
                            value={editCircle.image}
                            onChange={(e) => setEditCircle({...editCircle, image: e.target.value})}
                            className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold text-primary border-2 border-transparent focus:border-secondary focus:bg-white outline-none transition-all disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                          <textarea 
                            disabled={!isEditing}
                            rows={4}
                            value={editCircle.description}
                            onChange={(e) => setEditCircle({...editCircle, description: e.target.value})}
                            className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold text-primary border-2 border-transparent focus:border-secondary focus:bg-white outline-none transition-all disabled:opacity-60 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permissions & Rules */}
                    <div className={`bg-white rounded-3xl border p-8 shadow-sm space-y-6 transition-all ${isEditing ? 'border-secondary ring-4 ring-secondary/5' : 'border-slate-100'}`}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        Governance & Rules
                      </h4>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Circle Rules</p>
                          <div className="space-y-2">
                            {editCircle.rules.map((rule, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input 
                                  disabled={!isEditing}
                                  value={rule}
                                  onChange={(e) => {
                                    const newRules = [...editCircle.rules];
                                    newRules[idx] = e.target.value;
                                    setEditCircle({...editCircle, rules: newRules});
                                  }}
                                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold text-primary border-2 border-transparent focus:border-secondary transition-all disabled:opacity-60"
                                />
                                {isEditing && (
                                  <button 
                                    onClick={() => {
                                      const newRules = editCircle.rules.filter((_, i) => i !== idx);
                                      setEditCircle({...editCircle, rules: newRules});
                                    }}
                                    className="p-2 text-rose-400 hover:text-rose-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {isEditing && (
                              <button 
                                onClick={() => setEditCircle({...editCircle, rules: [...editCircle.rules, '']})}
                                className="w-full py-2 rounded-xl border-2 border-dashed border-slate-100 text-[9px] font-black uppercase text-slate-400 hover:border-secondary hover:text-secondary transition-all"
                              >
                                + Add New Rule
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-tight">Private Circle</p>
                              <p className="text-[9px] font-bold text-slate-400">Only visible to invited members</p>
                            </div>
                            <button 
                              disabled={!isEditing}
                              onClick={() => setEditCircle({...editCircle, permissions: {...editCircle.permissions, isPrivate: !editCircle.permissions.isPrivate}})}
                              className={`w-12 h-6 rounded-full transition-all relative ${editCircle.permissions.isPrivate ? 'bg-secondary' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editCircle.permissions.isPrivate ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-tight">Who can post?</p>
                            <div className="flex gap-2">
                              {['anyone', 'moderators'].map(opt => (
                                <button
                                  key={opt}
                                  disabled={!isEditing}
                                  onClick={() => setEditCircle({...editCircle, permissions: {...editCircle.permissions, whoCanPost: opt as any}})}
                                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    editCircle.permissions.whoCanPost === opt
                                      ? 'bg-secondary text-white border-secondary'
                                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-50">
                            <p className="text-[10px] font-black text-primary uppercase tracking-tight">Allowed Post Types</p>
                            <div className="flex flex-wrap gap-2">
                              {['text', 'image', 'video', 'poll'].map(type => {
                                const isAllowed = editCircle.allowedPostTypes.includes(type as any);
                                return (
                                  <button
                                    key={type}
                                    disabled={!isEditing}
                                    onClick={() => {
                                      const newTypes = isAllowed
                                        ? editCircle.allowedPostTypes.filter(t => t !== type)
                                        : [...editCircle.allowedPostTypes, type];
                                      setEditCircle({...editCircle, allowedPostTypes: newTypes as any});
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                      isAllowed
                                        ? 'bg-secondary/10 text-secondary border-secondary/20'
                                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                    }`}
                                  >
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member Moderation Table */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Member Moderation Center
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        <input placeholder="Search members..." className="bg-slate-50 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-secondary w-48" />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="pb-4 px-2">Member</th>
                            <th className="pb-4 px-2">Role</th>
                            <th className="pb-4 px-2">Status</th>
                            <th className="pb-4 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {circleMembers.map(m => {
                            const isFounder = m.id === circle.createdBy;
                            const isMod = circle.moderators?.includes(m.id);
                            return (
                            <tr key={m.id} className="group hover:bg-slate-50/50 transition-all">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <img src={m.avatar || null} className="h-8 w-8 rounded-full object-cover" alt="" />
                                  <p className="text-xs font-black text-primary uppercase tracking-tight">{m.name}</p>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                  {isFounder ? 'Founder' : isMod ? 'Moderator' : 'Sister'}
                                </span>
                              </td>
                              <td className="py-4 px-2">
                                <span className="rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase">Active</span>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {m.id !== currentUser.id && !isFounder && (
                                    <>
                                      {isMod ? (
                                        <button 
                                          onClick={() => handleMemberAction(m.id, 'remove_mod')}
                                          title="Remove Moderator"
                                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                        >
                                          <ShieldAlert className="h-3.5 w-3.5" />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => handleMemberAction(m.id, 'make_mod')}
                                          title="Make Moderator"
                                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                                        >
                                          <ShieldCheck className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleMemberAction(m.id, 'mute')}
                                        title="Mute Member"
                                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
                                      >
                                        <VolumeX className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleMemberAction(m.id, 'suspend')}
                                        title="Suspend Posting"
                                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                                      >
                                        <Ban className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleMemberAction(m.id, 'remove')}
                                        title="Remove from Circle"
                                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                      >
                                        <UserMinus className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleMemberAction(m.id, 'ban')}
                                        title="Permanent Ban"
                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
