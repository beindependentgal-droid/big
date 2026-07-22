import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Hash, 
  ArrowRight, 
  LayoutGrid, 
  List,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { Circle, Member, CircleRequest } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield } from 'lucide-react';
import { CirclesMarketingView } from './CirclesMarketingView';

interface CirclesViewProps {
  circles: Circle[];
  setCircles: (circles: Circle[]) => void;
  circleRequests: CircleRequest[];
  setCircleRequests: React.Dispatch<React.SetStateAction<CircleRequest[]>>;
  currentUser: Member;
  onSelectCircle: (circleId: string) => void;
  addPoints: (pts: number) => void;
  addNotification: (title: string) => void;
  isAuthenticated?: boolean;
  setCurrentView?: (view: string) => void;
}

export function CirclesView({
  circles,
  setCircles,
  circleRequests,
  setCircleRequests,
  currentUser,
  onSelectCircle,
  addPoints,
  addNotification,
  isAuthenticated = true,
  setCurrentView
}: CirclesViewProps) {
  const [showMarketing, setShowMarketing] = useState(!isAuthenticated);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'joined' | 'custom'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<{message: string, type: string} | null>(null);
  
  // Create Circle State
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<'custom'>('custom');

  // Eligibility Logic
  const userOwnedCircles = circles.filter(c => c.createdBy === currentUser.id);
  const userPendingRequests = circleRequests.filter(r => r.userId === currentUser.id && r.status === 'pending');
  const totalCircleSlots = userOwnedCircles.length + userPendingRequests.length;
  
  const hasReachedLimit = totalCircleSlots >= 2;
  const isQualifiedByPoints = (currentUser.points || 0) >= 100;
  const isEligible = isQualifiedByPoints && !hasReachedLimit;

  const triggerNotice = (message: string, type: string = 'info') => {
    setSimulationNotice({ message, type });
    setTimeout(() => setSimulationNotice(null), 5000);
  };

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          circle.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'joined' ? circle.isJoined :
      activeFilter === 'custom' ? circle.category === 'custom' : true;
    
    return matchesSearch && matchesFilter;
  });

  const handleJoinCircle = (e: React.MouseEvent, circleId: string) => {
    e.stopPropagation();
    setCircles(circles.map(c => 
      c.id === circleId ? { ...c, isJoined: !c.isJoined, memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 } : c
    ));
    const circle = circles.find(c => c.id === circleId);
    if (circle && !circle.isJoined) {
      addPoints(50);
    }
  };

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName || !newCircleDesc) return;

    if (!isEligible && !currentUser.isSuperAdmin) {
      triggerNotice("You do not meet the criteria to create a circle.", "warning");
      return;
    }

    const request: CircleRequest = {
      id: `creq-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      circleName: newCircleName,
      description: newCircleDesc,
      category: newCircleCategory,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    setCircleRequests([...circleRequests, request]);
    setShowCreateModal(false);
    setNewCircleName('');
    setNewCircleDesc('');
    
    addNotification(`🚨 New Circle Request: "${request.circleName}" submitted by ${request.userName}. Review needed in Admin Dashboard.`);
    triggerNotice(`Proposal for "${request.circleName}" sent to Super Admin for review!`, 'success');
  };

  // Recommendation logic for suggested circles
  const suggestedCircles = circles
    .filter(c => !c.isJoined)
    .map(circle => {
      let score = 0;
      // Match by interests
      currentUser.interests.forEach(interest => {
        if (circle.name.toLowerCase().includes(interest.toLowerCase()) || 
            circle.description.toLowerCase().includes(interest.toLowerCase())) {
          score += 10;
        }
      });
      // Match by points/level (simple heuristic)
      if (currentUser.points > 500 && circle.id === 'earn') score += 15;
      if (currentUser.points > 300 && circle.id === 'thrive') score += 5;
      
      return { ...circle, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (showMarketing) {
    return (
      <div className="relative">
        {isAuthenticated && (
          <div className="sticky top-0 z-[110] bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Marketing Preview</span>
            </div>
            <button
              onClick={() => setShowMarketing(false)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Back to Circles Dashboard
            </button>
          </div>
        )}
        <CirclesMarketingView setCurrentView={setCurrentView} isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/30 min-h-screen relative">
      
      {/* Simulation Notice */}
      <AnimatePresence>
        {simulationNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              simulationNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              simulationNotice.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
              'bg-pink-50 border-pink-200 text-pink-800'
            }`}
          >
            <div className={`h-2 w-2 rounded-full animate-pulse ${
              simulationNotice.type === 'success' ? 'bg-emerald-500' : 
              simulationNotice.type === 'warning' ? 'bg-amber-500' : 
              'bg-pink-500'
            }`} />
            <span className="text-xs font-black uppercase tracking-widest">{simulationNotice.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              <Sparkles className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sisterhood Clusters</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-primary uppercase tracking-tight">
              Community <span className="text-secondary">Circles</span>
            </h1>
            <p className="max-w-2xl text-sm font-medium text-slate-500 leading-relaxed">
              Join specialized clusters of sisters sharing your specific industry, goals, or growth stage. Circles are safe, high-trust spaces for deeper collaboration and mutual support.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button 
              onClick={() => setShowMarketing(true)}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-primary hover:border-secondary hover:text-secondary shadow-lg shadow-slate-100/50 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-secondary" />
              About Circles
            </button>

            <button 
              onClick={() => {
                if (!isEligible && !currentUser.isSuperAdmin) {
                  const reason = hasReachedLimit 
                    ? "You have reached the maximum limit of 2 circles (including pending requests)."
                    : "You need at least 100 Sisterhood Points to qualify as a Circle Founder.";
                  triggerNotice(`Access Restricted: ${reason}`, 'warning');
                  return;
                }
                setShowCreateModal(true);
              }}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${
                isEligible || currentUser.isSuperAdmin
                  ? 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Plus className="h-4 w-4" />
              Create Circle
            </button>
          </div>
        </div>
      </header>

      {/* SUGGESTED CIRCLES SECTION */}
      {suggestedCircles.length > 0 && searchQuery === '' && activeFilter === 'all' && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
               <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Suggested for you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {suggestedCircles.map(circle => (
               <div 
                key={`suggested-${circle.id}`} 
                className="group relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-amber-200/50 transition-all cursor-pointer"
                onClick={() => onSelectCircle(circle.id)}
               >
                 <div className="absolute top-0 right-0 p-1 bg-amber-50 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                 </div>
                 <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    {circle.image ? (
                    <img src={circle.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                 </div>
                 <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-primary uppercase tracking-tight line-clamp-1">{circle.name}</h3>
                      <div className="px-2 py-0.5 rounded-md bg-amber-50 text-[8px] font-black uppercase text-amber-600 tracking-widest shrink-0">98% Match</div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {circle.description}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                       <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400">
                          <Users className="h-3 w-3" />
                          <span>{circle.memberCount} Sisters</span>
                       </div>
                       <button 
                        onClick={(e) => handleJoinCircle(e, circle.id)}
                        className="px-4 py-1.5 rounded-lg bg-secondary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10 hover:scale-105 active:scale-95 transition-all"
                       >
                         Join Now
                       </button>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      )}

      {/* SEARCH & FILTERS */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {(['all', 'joined', 'custom'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-white border-secondary text-secondary shadow-lg shadow-secondary/10'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {filter === 'all' ? 'All Circles' : filter === 'joined' ? 'My Circles' : 'Custom Hubs'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search circles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl border border-slate-100 py-4 pl-12 pr-4 text-xs font-medium outline-none focus:border-secondary transition-all"
            />
          </div>
          <div className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CIRCLES GRID */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCircles.map((circle) => (
              <motion.div
                layout
                key={circle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onSelectCircle(circle.id)}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  {circle.image ? (
                  <img 
                    src={circle.image} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={circle.name} 
                  />
                ) : (
                  <div className="h-full w-full bg-slate-200" />
                )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    {circle.category === 'custom' ? (
                       <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase text-white border border-white/20">Custom</span>
                    ) : (
                       <span className="px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-md text-[9px] font-black uppercase text-white border border-white/20">Official</span>
                    )}
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 text-white">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{circle.memberCount} Sisters</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors">
                    {circle.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {circle.description}
                  </p>
                  
                  <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <button 
                      onClick={(e) => handleJoinCircle(e, circle.id)}
                      className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        circle.isJoined
                          ? 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:scale-105'
                      }`}
                    >
                      {circle.isJoined ? 'Joined' : 'Join Circle'}
                    </button>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                          <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                        </div>
                      ))}
                      <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCircles.map((circle) => (
            <div 
              key={circle.id}
              onClick={() => onSelectCircle(circle.id)}
              className="group flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0">
                {circle.image ? (
                <img src={circle.image} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full bg-slate-200" />
              )}
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-black text-primary uppercase tracking-tight mb-1 group-hover:text-secondary">{circle.name}</h3>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{circle.description}</p>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-black text-primary">{circle.memberCount}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400">Sisters</p>
                </div>
                <button 
                  onClick={(e) => handleJoinCircle(e, circle.id)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    circle.isJoined
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:scale-105'
                  }`}
                >
                  {circle.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CIRCLE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90dvh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-black text-primary uppercase tracking-tight">Form a <span className="text-secondary">Circle</span></h2>
                    <p className="text-[11px] font-medium text-slate-500">Create your community hub</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-3 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5 stroke-[3px]" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
                {/* Founder Criteria Section */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-secondary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Founder Qualification</p>
                      <p className="text-[9px] font-bold text-slate-500">Requires 100+ Points • Max 2 Active Circles</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${isQualifiedByPoints ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {currentUser.points} / 100 PTS
                    </div>
                    <div className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${!hasReachedLimit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {totalCircleSlots} / 2 SLOTS
                    </div>
                  </div>
                </div>

                <form id="create-circle-form" onSubmit={handleCreateCircle} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Circle Name</label>
                    <input 
                      required
                      value={newCircleName}
                      onChange={(e) => setNewCircleName(e.target.value)}
                      placeholder="e.g. Lagos Tech Founders"
                      className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-medium outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Description</label>
                    <textarea 
                      required
                      value={newCircleDesc}
                      onChange={(e) => setNewCircleDesc(e.target.value)}
                      placeholder="What is the purpose of this circle? Who should join?"
                      rows={4}
                      className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-medium outline-none focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border-2 border-secondary bg-secondary/5 space-y-1 relative cursor-pointer">
                      <div className="flex items-center justify-between">
                         <Globe className="h-5 w-5 text-secondary" />
                         <div className="h-5 w-5 rounded-full border-[3px] border-secondary bg-white flex items-center justify-center">
                           <div className="h-2 w-2 rounded-full bg-secondary" />
                         </div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary pt-2">Public Circle</p>
                      <p className="text-[10px] font-medium text-slate-600 leading-relaxed">Visible to all BIG members in the directory.</p>
                    </div>
                    <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 space-y-1 opacity-60 cursor-not-allowed">
                      <div className="flex items-center justify-between">
                         <Lock className="h-5 w-5 text-slate-400" />
                         <div className="h-5 w-5 rounded-full border-2 border-slate-200 bg-white" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">Private Hub <span className="lowercase normal-case font-medium ml-1 text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded text-[8px]">(Coming Soon)</span></p>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed">Invitation only. Perfect for confidential masterminds.</p>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Footer Actions */}
              <div className="p-6 sm:p-8 border-t border-slate-100 shrink-0 bg-slate-50/50 flex gap-4 rounded-b-[2.5rem]">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-grow py-4 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="create-circle-form"
                  className="flex-grow py-4 rounded-2xl bg-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Launch Circle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
