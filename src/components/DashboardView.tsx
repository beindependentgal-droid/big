import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Award, 
  Users, 
  Target, 
  BookOpen, 
  Activity, 
  Zap, 
  ChevronRight, 
  HelpCircle, 
  GraduationCap, 
  BriefcaseBusiness, 
  HeartHandshake, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Flame,
  Coins
} from 'lucide-react';
import { Member, Post, Challenge, Resource, Circle, MentorshipPair } from '../data';
import { MemberSpotlight } from './MemberSpotlight';
import { ConnectionInsights } from './ConnectionInsights';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  Legend, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';

interface DashboardViewProps {
  members: Member[];
  activeTab: 'learn' | 'connect' | 'earn' | 'thrive';
  setActiveTab: (tab: 'learn' | 'connect' | 'earn' | 'thrive') => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  resources: Resource[];
  currentUser: Member;
  addPoints: (pts: number, badge?: string, isChallenge?: boolean) => void;
  setCurrentView: (view: string) => void;
  followingIds: string[];
  toggleFollow: (memberId: string) => void;
  bookmarkedPostIds: string[];
  toggleBookmarkPost: (postId: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  profileCompletion: number;
  connections: { userId: string, status: 'Pending' | 'Connected' }[];
  requestConnection: (userId: string) => void;
  handleViewProfile?: (id: string) => void;
  isDark?: boolean;
  // Recommendations Props
  circles?: Circle[];
  setCircles?: React.Dispatch<React.SetStateAction<Circle[]>>;
  mentorshipPairs?: MentorshipPair[];
  setMentorshipPairs?: React.Dispatch<React.SetStateAction<MentorshipPair[]>>;
  logActivity?: (action: string, details: string) => void;
}

export function DashboardView({
  members,
  posts,
  challenges,
  resources,
  currentUser,
  addPoints,
  followingIds,
  toggleFollow,
  profileCompletion,
  connections,
  requestConnection,
  handleViewProfile,
  setSelectedConversationMember,
  setCurrentView,
  isDark = false,
  circles,
  setCircles,
  mentorshipPairs,
  setMentorshipPairs,
  logActivity
}: DashboardViewProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedPillar, setSelectedPillar] = useState<'all' | 'learn' | 'connect' | 'earn' | 'thrive'>('all');
  const [readLaterIds, setReadLaterIds] = useState<string[]>([]);
  const [joinedCircleIds, setJoinedCircleIds] = useState<string[]>([]);
  const [requestedMentorIds, setRequestedMentorIds] = useState<string[]>([]);

  // Get recommended circles based on user interests and skills
  const recommendedCircles = React.useMemo(() => {
    if (!circles) return [];
    
    // Filter out circles already joined
    const nonJoinedCircles = circles.filter(c => !c.isJoined);
    
    // Calculate match score for each
    const scored = nonJoinedCircles.map(circle => {
      let score = 0;
      
      const userSkills = currentUser.skills || [];
      const userInterests = currentUser.interests || [];
      
      const circleNameLower = circle.name.toLowerCase();
      const circleDescLower = circle.description.toLowerCase();
      
      // Match category
      if (circle.category) {
        const catLower = circle.category.toLowerCase();
        if (userSkills.some(s => s.toLowerCase().includes(catLower)) || 
            userInterests.some(i => i.toLowerCase().includes(catLower))) {
          score += 15;
        }
      }
      
      // Match skills
      userSkills.forEach(skill => {
        const sLower = skill.toLowerCase();
        if (circleNameLower.includes(sLower)) {
          score += 25;
        }
        if (circleDescLower.includes(sLower)) {
          score += 10;
        }
      });
      
      // Match interests
      userInterests.forEach(interest => {
        const iLower = interest.toLowerCase();
        if (circleNameLower.includes(iLower)) {
          score += 25;
        }
        if (circleDescLower.includes(iLower)) {
          score += 10;
        }
      });
      
      // Add small base score based on member count
      score += (circle.memberCount || 0) / 1000;
      
      return { circle, score };
    });
    
    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    
    // Return top 2 suggested circles
    return scored.slice(0, 2).map(item => item.circle);
  }, [circles, currentUser.skills, currentUser.interests]);

  // Get recommended mentors based on user interests and skills
  const recommendedMentors = React.useMemo(() => {
    // Filter potential mentors
    const filtered = members.filter(m => {
      if (m.rank !== 'Mentor') return false;
      if (m.id === currentUser.id) return false;
      
      // check if already paired
      const isAlreadyPaired = (mentorshipPairs || []).some(pair => 
        (pair.mentor.id === m.id && pair.mentee.id === currentUser.id) ||
        (pair.mentor.id === currentUser.id && pair.mentee.id === m.id)
      );
      return !isAlreadyPaired;
    });
    
    // Calculate score
    const scored = filtered.map(mentor => {
      let score = 0;
      
      const userSkills = currentUser.skills || [];
      const userInterests = currentUser.interests || [];
      
      const mentorSkills = mentor.skills || [];
      const mentorInterests = mentor.interests || [];
      
      // Match skills
      userSkills.forEach(skill => {
        const sLower = skill.toLowerCase();
        if (mentorSkills.some(ms => ms.toLowerCase() === sLower)) {
          score += 30; // Direct skill match
        } else if (mentor.title.toLowerCase().includes(sLower) || mentor.bio.toLowerCase().includes(sLower)) {
          score += 10;
        }
      });
      
      // Match interests
      userInterests.forEach(interest => {
        const iLower = interest.toLowerCase();
        if (mentorInterests.some(mi => mi.toLowerCase() === iLower)) {
          score += 30; // Direct interest match
        } else if (mentor.bio.toLowerCase().includes(iLower)) {
          score += 10;
        }
      });
      
      // Add slight bonus if they have open mentoring capacity
      if (mentor.mentoring_capacity === 'Open') {
        score += 15;
      } else if (mentor.mentoring_capacity === 'Limited') {
        score += 5;
      }
      
      return { mentor, score };
    });
    
    // Sort descending
    scored.sort((a, b) => b.score - a.score);
    
    // Return top 2 potential mentors
    return scored.slice(0, 2).map(item => item.mentor);
  }, [members, mentorshipPairs, currentUser.skills, currentUser.interests, currentUser.id]);

  const primaryBrandColor = isDark ? '#EC4899' : '#4f46e5';
  const engagementColor = isDark ? '#EC4899' : '#4f46e5';
  const learningColor = isDark ? '#EC4899' : '#8b5cf6';
  const totalColor = isDark ? '#EC4899' : '#6366f1';

  useEffect(() => {
    const saved = localStorage.getItem('read_later_resources');
    if (saved) {
      try {
        setReadLaterIds(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  // Dynamic calculations based on real user state
  const totalConnections = connections.filter(c => c.status === 'Connected').length;
  const pendingConnections = connections.filter(c => c.status === 'Pending').length;
  const userPostsCount = posts.filter(p => p.author?.name.includes('You') || p.circleId === 'user').length;
  const completedChallengesCount = challenges.filter(c => c.completed).length;
  const activeChallengesCount = challenges.filter(c => !c.completed).length;

  // Calculate Pillar Scores based on actual application data
  const learnScore = Math.min(95, Math.max(45, (currentUser.skills?.length || 0) * 8 + (resources?.length || 0) * 1.5));
  const connectScore = Math.min(95, Math.max(40, totalConnections * 12 + followingIds.length * 6 + (currentUser.interests?.length || 0) * 3));
  
  let baseEarn = 40;
  if (currentUser.business_stage === 'Early Stage') baseEarn = 65;
  else if (currentUser.business_stage === 'Growth Stage') baseEarn = 85;
  else if (currentUser.business_stage === 'Idea Stage') baseEarn = 50;
  else if (currentUser.business_stage === 'Established') baseEarn = 95;
  const earnScore = Math.min(95, Math.max(35, baseEarn + Math.floor((currentUser.points || 0) / 40)));
  
  const thriveScore = Math.min(95, Math.max(45, completedChallengesCount * 15 + (currentUser.badges?.length || 0) * 8 + (currentUser.points ? Math.floor(currentUser.points / 50) : 10)));

  // Mock data for Weekly Engagement Trajectory - fluctuates depending on user's points and activity
  const engagementData = timeframe === '7d' ? [
    { name: 'Mon', Learning: 20, Networking: 15, Enterprise: 10, Wellbeing: 25, Total: 70 },
    { name: 'Tue', Learning: 45, Networking: 30, Enterprise: 15, Wellbeing: 20, Total: 110 },
    { name: 'Wed', Learning: 30, Networking: 25, Enterprise: 40, Wellbeing: 35, Total: 130 },
    { name: 'Thu', Learning: 60, Networking: 50, Enterprise: 20, Wellbeing: 40, Total: 170 },
    { name: 'Fri', Learning: 40, Networking: 45, Enterprise: 35, Wellbeing: 30, Total: 150 },
    { name: 'Sat', Learning: 15, Networking: 20, Enterprise: 10, Wellbeing: 55, Total: 100 },
    { name: 'Sun', Learning: 25, Networking: 35, Enterprise: 15, Wellbeing: 45, Total: 120 },
  ] : timeframe === '30d' ? [
    { name: 'Week 1', Learning: 120, Networking: 80, Enterprise: 60, Wellbeing: 90, Total: 350 },
    { name: 'Week 2', Learning: 150, Networking: 140, Enterprise: 110, Wellbeing: 100, Total: 500 },
    { name: 'Week 3', Learning: 180, Networking: 160, Enterprise: 90, Wellbeing: 140, Total: 570 },
    { name: 'Week 4', Learning: 220, Networking: 190, Enterprise: 130, Wellbeing: 170, Total: 710 },
  ] : [
    { name: 'Jan-Feb', Learning: 450, Networking: 310, Enterprise: 210, Wellbeing: 330, Total: 1300 },
    { name: 'Mar-Apr', Learning: 600, Networking: 490, Enterprise: 380, Wellbeing: 440, Total: 1910 },
    { name: 'May-Jun', Learning: 720, Networking: 650, Enterprise: 500, Wellbeing: 590, Total: 2460 },
    { name: 'Jul-Aug', Learning: 910, Networking: 880, Enterprise: 640, Wellbeing: 780, Total: 3210 },
  ];

  // Dynamic Points Growth & Engagement Trend Data
  const trendData = timeframe === '7d' ? [
    { name: 'Mon', Engagement: 35, Points: Math.max(50, (currentUser.points || 420) - 150) },
    { name: 'Tue', Engagement: 55, Points: Math.max(50, (currentUser.points || 420) - 120) },
    { name: 'Wed', Engagement: 45, Points: Math.max(50, (currentUser.points || 420) - 90) },
    { name: 'Thu', Engagement: 85, Points: Math.max(50, (currentUser.points || 420) - 60) },
    { name: 'Fri', Engagement: 75, Points: Math.max(50, (currentUser.points || 420) - 40) },
    { name: 'Sat', Engagement: 50, Points: Math.max(50, (currentUser.points || 420) - 15) },
    { name: 'Sun', Engagement: 95, Points: currentUser.points || 420 },
  ] : timeframe === '30d' ? [
    { name: 'Week 1', Engagement: 160, Points: Math.max(50, (currentUser.points || 420) - 260) },
    { name: 'Week 2', Engagement: 280, Points: Math.max(50, (currentUser.points || 420) - 170) },
    { name: 'Week 3', Engagement: 240, Points: Math.max(50, (currentUser.points || 420) - 80) },
    { name: 'Week 4', Engagement: 390, Points: currentUser.points || 420 },
  ] : [
    { name: 'Jan-Feb', Engagement: 680, Points: Math.max(50, (currentUser.points || 420) - 310) },
    { name: 'Mar-Apr', Engagement: 1100, Points: Math.max(50, (currentUser.points || 420) - 200) },
    { name: 'May-Jun', Engagement: 1450, Points: Math.max(50, (currentUser.points || 420) - 90) },
    { name: 'Jul-Aug', Engagement: 2100, Points: currentUser.points || 420 },
  ];

  // Radar chart showing alignment across the four main pillars
  const pillarAlignmentData = [
    { subject: 'Learn Circle', A: learnScore, fullMark: 100, color: isDark ? '#EC4899' : '#8b5cf6' },
    { subject: 'Connect Circle', A: connectScore, fullMark: 100, color: isDark ? '#EC4899' : '#f43f5e' },
    { subject: 'Earn Circle', A: earnScore, fullMark: 100, color: isDark ? '#EC4899' : '#f59e0b' },
    { subject: 'Thrive Circle', A: thriveScore, fullMark: 100, color: isDark ? '#EC4899' : '#f97316' },
  ];

  // Bar chart of contributions vs community peer average
  const contributionComparisonData = [
    { name: 'Academy Modules', You: (currentUser.skills?.length || 2) + 2, PeerAverage: 3 },
    { name: 'Coaching Sessions', You: completedChallengesCount + 1, PeerAverage: 2 },
    { name: 'Networking Actions', You: totalConnections + followingIds.length, PeerAverage: 5 },
    { name: 'Knowledge Shared', You: userPostsCount + 1, PeerAverage: 2 },
  ];

  // Dynamic feedback and insights based on the scores
  const getPillarStatus = (score: number) => {
    if (score >= 80) return { label: 'Empowered Pioneer', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (score >= 60) return { label: 'Active Contributor', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
    return { label: 'Budding Explorer', color: 'text-slate-500 bg-slate-50 border-slate-100' };
  };

  const learnStatus = getPillarStatus(learnScore);
  const connectStatus = getPillarStatus(connectScore);
  const earnStatus = getPillarStatus(earnScore);
  const thriveStatus = getPillarStatus(thriveScore);
  

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in relative space-y-8" id="analytics-dashboard">
      
      {/* HEADER HERO PANEL */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4.5">
          <div className="relative">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="h-16 w-16 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-bold text-white text-2xl">
                {currentUser.name ? currentUser.name[0] : 'S'}
              </div>
            )}
            <div className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 text-white p-1 rounded-full shadow-md">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-black text-slate-900">
                {currentUser.name}
              </h1>
              <span className="text-[10px] bg-slate-900 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentUser.rank || 'Elder Member'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentUser.title} • {currentUser.city || 'Lagos, Nigeria'}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
              <Calendar className="h-3 w-3" />
              <span>Joined community: June 2026</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setTimeframe('7d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              timeframe === '7d' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setTimeframe('30d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              timeframe === '30d' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => setTimeframe('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              timeframe === 'all' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* KEY STATS Bento Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* STAT 1: Community Points */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Community Capital</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-slate-900">{currentUser.points || 420}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Accumulated sisterhood activity points</p>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
              <span>Next Level: 500 PTS</span>
              <span>84%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>

        {/* STAT 2: Network Growth */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sisterhood Network</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-slate-900">{totalConnections}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Direct professional matches active</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="text-rose-600 flex items-center gap-0.5">
              +{pendingConnections} pending requests
            </span>
            <span className="hover:underline cursor-pointer" onClick={() => setCurrentView('directory')}>
              Find peers →
            </span>
          </div>
        </div>

        {/* STAT 3: Progress & Academy */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wellbeing & Goals</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-slate-900">{completedChallengesCount}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Empowerment challenges completed</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="text-orange-600">{activeChallengesCount} active challenges</span>
            <span>Avg 78% progress</span>
          </div>
        </div>

        {/* STAT 4: Badges & Rewards */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Earned Badges</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-slate-900">{currentUser.badges?.length || 2}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Official achievement honors unlocked</p>
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="text-amber-600">Top 12% in Lagos</span>
            <span>Profile {profileCompletion}%</span>
          </div>
        </div>
      </div>

      {/* SISTERHOOD SPOTLIGHT & RECOMMENDED PEERS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MemberSpotlight
            currentUser={currentUser} 
            members={members} 
            handleViewProfile={handleViewProfile} 
            toggleFollow={toggleFollow} 
            followingIds={followingIds} 
          />
        </div>
        <div>
          <ConnectionInsights 
            currentUser={currentUser}
            members={members}
            connections={connections}
            requestConnection={requestConnection}
            setCurrentView={setCurrentView}
            setSelectedConversationMember={setSelectedConversationMember}
            handleViewProfile={handleViewProfile}
            toggleFollow={toggleFollow}
            followingIds={followingIds}
          />
        </div>
      </div>

      {/* SUGGESTED FOR YOU */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 fill-indigo-100/30 animate-pulse" />
            <span>Suggested For You</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalized recommendations based on your unique skills and interests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RECOMMENDED CIRCLES */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Users className="h-4 w-4 text-violet-500" />
              <span>Recommended Circles</span>
            </h3>
            {recommendedCircles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">You're fully integrated!</p>
                <p className="text-[10px] text-slate-400 mt-1">You have joined all recommended circles matching your profile.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedCircles.map(circle => {
                  const isJoinedLocal = joinedCircleIds.includes(circle.id);
                  // Find matches
                  const matches = [
                    ...(currentUser.skills || []).filter(s => circle.name.toLowerCase().includes(s.toLowerCase()) || circle.description.toLowerCase().includes(s.toLowerCase())),
                    ...(currentUser.interests || []).filter(i => circle.name.toLowerCase().includes(i.toLowerCase()) || circle.description.toLowerCase().includes(i.toLowerCase()))
                  ];
                  
                  return (
                    <div key={circle.id} className="group relative rounded-2xl border border-slate-100 hover:border-violet-100 bg-slate-50/50 hover:bg-white p-4 transition-all duration-200 flex flex-col justify-between min-h-[140px] hover:shadow-md hover:shadow-violet-500/5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">
                                {circle.name}
                              </h4>
                              <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                                {circle.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                              {circle.description}
                            </p>
                          </div>
                          {circle.image && (
                            <img 
                              src={circle.image} 
                              alt={circle.name}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        {matches.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                            <span className="text-[8px] font-extrabold uppercase tracking-wide text-slate-400">Match:</span>
                            {matches.slice(0, 2).map((m, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5">
                                <Sparkles className="h-2 w-2 text-emerald-500 fill-emerald-100" />
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400">
                          {circle.memberCount + (isJoinedLocal ? 1 : 0)} members
                        </span>
                        <button
                          onClick={() => {
                            if (isJoinedLocal) return;
                            setJoinedCircleIds(prev => [...prev, circle.id]);
                            if (setCircles && circles) {
                              setCircles(prev => prev.map(c => 
                                c.id === circle.id ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
                              ));
                            }
                            addPoints(50, undefined, true);
                            if (logActivity) {
                              logActivity('Joined Circle', `Joined recommended circle "${circle.name}" from Dashboard suggestions.`);
                            }
                          }}
                          disabled={isJoinedLocal}
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                            isJoinedLocal
                              ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100'
                              : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 hover:scale-102 cursor-pointer'
                          }`}
                        >
                          {isJoinedLocal ? 'Joined ✓' : 'Join Circle'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* POTENTIAL MENTORS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <HeartHandshake className="h-4 w-4 text-rose-500" />
              <span>Mentorship Match suggestions</span>
            </h3>
            {recommendedMentors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No active suggestions</p>
                <p className="text-[10px] text-slate-400 mt-1">You are already connected with all eligible recommended mentors.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedMentors.map(mentor => {
                  const isRequestedLocal = requestedMentorIds.includes(mentor.id);
                  const isPendingInPairs = (mentorshipPairs || []).some(pair => 
                    pair.mentor.id === mentor.id && pair.mentee.id === currentUser.id && pair.status === 'Pending'
                  );
                  const isRequested = isRequestedLocal || isPendingInPairs;
                  
                  // Find matches
                  const matchedSkills = (currentUser.skills || []).filter(s => mentor.skills?.some(ms => ms.toLowerCase() === s.toLowerCase()));
                  const matchedInterests = (currentUser.interests || []).filter(i => mentor.interests?.some(mi => mi.toLowerCase() === i.toLowerCase()));
                  const allMatches = [...matchedSkills, ...matchedInterests];

                  return (
                    <div key={mentor.id} className="group relative rounded-2xl border border-slate-100 hover:border-rose-100 bg-slate-50/50 hover:bg-white p-4 transition-all duration-200 flex flex-col justify-between min-h-[140px] hover:shadow-md hover:shadow-rose-500/5">
                      <div>
                        <div className="flex items-start gap-3">
                          <img 
                            src={mentor.avatar} 
                            alt={mentor.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">
                                {mentor.name}
                              </h4>
                              <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                                {mentor.rank}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {mentor.title} • {mentor.city}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {mentor.bio}
                            </p>
                          </div>
                        </div>
                        {allMatches.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                            <span className="text-[8px] font-extrabold uppercase tracking-wide text-slate-400">Mutual:</span>
                            {allMatches.slice(0, 2).map((m, idx) => (
                              <span key={idx} className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5">
                                <Sparkles className="h-2 w-2 text-rose-500 fill-rose-100" />
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center justify-between">
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${
                          mentor.mentoring_capacity === 'Open'
                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                            : 'text-amber-600 bg-amber-50 border border-amber-100'
                        }`}>
                          Capacity: {mentor.mentoring_capacity || 'Open'}
                        </span>
                        <button
                          onClick={() => {
                            if (isRequested) return;
                            setRequestedMentorIds(prev => [...prev, mentor.id]);
                            if (setMentorshipPairs && mentorshipPairs) {
                              const newPair: MentorshipPair = {
                                id: `pair-${Date.now()}`,
                                mentor: mentor,
                                mentee: currentUser,
                                topic: `Mentorship in ${mentor.skills[0] || 'Professional Development'}`,
                                status: 'Pending',
                                startDate: new Date().toISOString().split('T')[0]
                              };
                              setMentorshipPairs([newPair, ...mentorshipPairs]);
                            }
                            addPoints(10, undefined, true);
                            if (logActivity) {
                              logActivity('Requested Mentorship', `Initiated mentorship request with suggested mentor "${mentor.name}".`);
                            }
                          }}
                          disabled={isRequested}
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                            isRequested
                              ? 'bg-rose-50 text-rose-600 cursor-default border border-rose-100'
                              : 'bg-rose-600 text-white shadow-sm shadow-rose-600/10 hover:bg-rose-700 hover:scale-102 cursor-pointer'
                          }`}
                        >
                          {isRequested ? 'Request Pending ✓' : 'Connect & Pair'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY: ENGAGEMENT & POINTS ACCRUAL TREND */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-heading text-lg font-black text-slate-900">
                Engagement & Points Accrual Trend
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Holistic correlation between active community footprint and virtual network capital points.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span className="text-slate-600">Engagement Score</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-slate-600">Cumulative Points</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Dual Axis Chart */}
          <div className="lg:col-span-2 h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEngagementSum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryBrandColor} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={primaryBrandColor} stopOpacity={0.00}/>
                  </linearGradient>
                  <linearGradient id="colorPointsSum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.10}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.00}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                {/* Left Y Axis for Engagement */}
                <YAxis 
                  yAxisId="left"
                  stroke={primaryBrandColor} 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                {/* Right Y Axis for Points */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '16px', 
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="Engagement" 
                  stroke={primaryBrandColor} 
                  strokeWidth={2.5} 
                  fill="url(#colorEngagementSum)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="Points" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 7 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Accrual Speed and Highlights Panel */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accrual Velocity</span>
                <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-1 rounded-full border border-amber-100">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>5-Day Hot Streak</span>
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-heading font-black text-slate-900 flex items-baseline gap-1">
                  <span>+{timeframe === '7d' ? '45' : timeframe === '30d' ? '180' : '820'} PTS</span>
                  <span className="text-xs font-bold text-emerald-600">earned</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Points accrued during selected timeframe</p>
              </div>

              <div className="space-y-2.5 pt-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activity Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      Academy Learning
                    </span>
                    <span className="font-bold text-slate-800">+120 PTS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Sister Match Actions
                    </span>
                    <span className="font-bold text-slate-800">+90 PTS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      Empowerment Challenges
                    </span>
                    <span className="font-bold text-slate-800">+150 PTS</span>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/* CORE VISUALIZATION CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* CHART 1: Engagement Area Chart (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span>Weekly Engagement Trajectory</span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Hourly activity, mentorship interactions, and learning points mapped by area.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="text-slate-600">Learn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-slate-600">Connect</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">Earn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-600">Thrive</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalColor} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={totalColor} stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '16px', 
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="Learning" stroke={learningColor} strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="Networking" stroke="#f43f5e" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="Enterprise" stroke="#f59e0b" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="Wellbeing" stroke="#f97316" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="Total" stroke={totalColor} strokeWidth={2} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Pillar Alignment Radar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-6">
          <div>
            <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
              <span>Circle Alignment Balance</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Visualizes your holistic alignment across the four foundational pillars.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={pillarAlignmentData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <Radar 
                  name="Sovereign Sister alignment" 
                  dataKey="A" 
                  stroke={primaryBrandColor} 
                  fill={primaryBrandColor} 
                  fillOpacity={0.15} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold">Insight: Balance Quotient</p>
            <p className="text-[10px] text-slate-400 leading-snug">
              Your growth is balanced. Focus on your <span className="text-amber-600 font-extrabold">Earn Circle</span> index to match high Learn metrics.
            </p>
          </div>
        </div>

      </div>

      {/* PILLAR ANALYSIS & RECOMMENDATIONS ROW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* PILLAR SCORE CARDS LIST */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading text-sm font-black text-slate-900">Pillar Indexes</h3>
            <p className="text-[10px] text-slate-500">Your standing across core development facets.</p>
          </div>

          <div className="space-y-3">
            {/* Learn */}
            <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/10 p-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Learn Index</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${learnStatus.color}`}>
                    {learnStatus.label}
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-violet-700">{learnScore}%</span>
            </div>

            {/* Connect */}
            <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/10 p-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Connect Index</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${connectStatus.color}`}>
                    {connectStatus.label}
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-rose-700">{connectScore}%</span>
            </div>

            {/* Earn */}
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/10 p-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Earn Index</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${earnStatus.color}`}>
                    {earnStatus.label}
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-amber-700">{earnScore}%</span>
            </div>

            {/* Thrive */}
            <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/10 p-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Thrive Index</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${thriveStatus.color}`}>
                    {thriveStatus.label}
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-orange-700">{thriveScore}%</span>
            </div>
          </div>
        </div>

        {/* PEER BENCHMARK BAR CHART */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Peer Benchmark Analysis</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Compares your community footprint metrics against global sisterhood averages.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={8} fontWeight="bold" stroke="#94a3b8" />
                <YAxis fontSize={8} fontWeight="bold" stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="You" fill={primaryBrandColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="PeerAverage" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryBrandColor }} />
              <span>Your Activity Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#cbd5e1]" />
              <span>Regional Sisters Median</span>
            </div>
          </div>
        </div>
      </div>

      {/* READ LATER SECTION */}
      {/* RECENT ACTIVITY WIDGET */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            <span>Community Recent Activity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            The latest milestones and accomplishments reached by your sisters.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { id: 1, user: 'Wanjiku K.', avatar: 'https://i.pravatar.cc/150?u=wanjiku', action: 'earned a new badge', target: 'Founder Pioneer', type: 'badge', time: '2 hours ago', icon: Award, color: 'text-violet-500', bg: 'bg-violet-50' },
            { id: 2, user: 'Ngozi O.', avatar: 'https://i.pravatar.cc/150?u=ngozi', action: 'completed the challenge', target: 'Pitch Deck Mastery', type: 'challenge', time: '4 hours ago', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50' },
            { id: 3, user: 'Aisha M.', avatar: 'https://i.pravatar.cc/150?u=aisha', action: 'earned a new badge', target: 'Community Star', type: 'badge', time: '5 hours ago', icon: Award, color: 'text-violet-500', bg: 'bg-violet-50' },
            { id: 4, user: 'Grace M.', avatar: 'https://i.pravatar.cc/150?u=grace', action: 'completed the challenge', target: 'First 100 Customers', type: 'challenge', time: '1 day ago', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50' },
            { id: 5, user: 'Fatima S.', avatar: 'https://i.pravatar.cc/150?u=fatima', action: 'earned a new badge', target: 'Mentor', type: 'badge', time: '1 day ago', icon: Award, color: 'text-violet-500', bg: 'bg-violet-50' },
          ].map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${activity.bg} flex items-center justify-center border-2 border-white shadow-sm`}>
                    <activity.icon className={`w-3 h-3 ${activity.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-bold">{activity.user}</span> <span className="text-slate-500">{activity.action}</span> <span className="font-bold text-slate-900">{activity.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{activity.time}</p>
                </div>
              </div>
              <button className="hidden sm:block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors">
                Congratulate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SAVED RESOURCES SECTION (Optional based on readLaterIds) */}
      {readLaterIds.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>Read Later</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Your personal reading list of saved resources.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('resource-library')}
              className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-1"
            >
              Browse Library <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.filter(r => readLaterIds.includes(r.id)).map(res => (
              <div key={res.id} className="border border-slate-100 hover:border-secondary/30 transition-colors rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{res.title}</h4>
                    {res.category && (
                      <span className="shrink-0 bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        {res.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2">{res.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{res.type}</span>
                  <button 
                    onClick={() => {
                      if (res.url) window.open(res.url, '_blank');
                    }}
                    className="text-secondary font-bold text-[10px] hover:underline flex items-center gap-1"
                  >
                    Read <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
