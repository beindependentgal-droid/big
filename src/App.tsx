import { useState, useEffect, lazy, Suspense } from 'react';
import { calculatePointsAndBadges, updateMembers, getDefaultAcademyProgressState, mergeAcademyProgressState } from './lib/stateHelpers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { HomeView } from './components/HomeView';
import { AcademyView } from './components/AcademyView';
import { CirclesView } from './components/CirclesView';
import { CircleHub } from './components/CircleHub';
import { DirectoryView } from './components/DirectoryView';
import { MentorshipView } from './components/MentorshipView';
import { EventsView } from './components/EventsView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { PostComposer } from './components/PostComposer';
import { SearchView } from './components/SearchView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { TourOverlay } from './components/TourOverlay';
import { JobBoardView } from './components/JobBoardView';
import { GoalTrackerView } from './components/GoalTrackerView';
import { AboutView } from './components/AboutView';
import { BIGClubView } from './components/BIGClubView';
import { ContactView } from './components/ContactView';
import { ProgramsView } from './components/ProgramsView';
import { NotificationsView } from './components/NotificationsView';
import { BottomNav } from './components/Navigation';
import { LeftSidebar } from './components/LeftSidebar';
import { ScrollToTop } from './components/ScrollToTop';

const DashboardView = lazy(() => import('./components/DashboardView').then((module) => ({ default: module.DashboardView })));
const MessagesView = lazy(() => import('./components/MessagesView').then((module) => ({ default: module.MessagesView })));
const AdminDashboardView = lazy(() => import('./components/AdminDashboardView').then((module) => ({ default: module.AdminDashboardView })));
const CommunityFeedsView = lazy(() => import('./components/CommunityFeedsView').then((module) => ({ default: module.CommunityFeedsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then((module) => ({ default: module.SettingsView })));
const MySistersView = lazy(() => import('./components/MySistersView').then((module) => ({ default: module.MySistersView })));
const BIGFundView = lazy(() => import('./components/BIGFundView').then((module) => ({ default: module.BIGFundView })));
const ResourceLibraryView = lazy(() => import('./components/ResourceLibraryView').then((module) => ({ default: module.ResourceLibraryView })));
import { 
  INITIAL_MEMBERS, 
  INITIAL_EVENTS, 
  INITIAL_CHALLENGES, 
  INITIAL_RESOURCES, 
  INITIAL_POSTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MENTORSHIP_PAIRS,
  INITIAL_CIRCLES,
  Member,
  Post,
  Event,
  Challenge,
  Conversation,
  MentorshipPair,
  Circle,
  CircleRequest,
  Message,
  Resource
} from './data';
import { ActivityLog } from './types';
import { Sparkles, Award, X, Database, CheckCircle2, AlertTriangle, Copy, FileText, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured, supabaseService, areTablesMissing } from './supabase';
import { apiService } from './api';
import { copyToClipboard } from './lib/utils';

const appViewFallback = (
  <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 text-sm text-slate-300">
    Loading view...
  </div>
);

const routeFallback = (
  <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-300">
    Loading view...
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('big_v2_is_auth') === 'true';
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('big_v2_current_user_id') || 'you';
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    const isAuth = localStorage.getItem('big_v2_is_auth') === 'true';
    const view = isAuth ? 'feeds' : 'home';
    return view;
  });
  const [previousView, setPreviousView] = useState<string>('feeds');
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'auto'>(() => {
    return (localStorage.getItem('big_v2_theme_pref') as 'light' | 'dark' | 'auto') || 'auto';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const pref = localStorage.getItem('big_v2_theme_pref') || 'auto';
    if (pref === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return pref === 'dark';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (themePref === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      setIsDark(mediaQuery.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      setIsDark(themePref === 'dark');
    }
  }, [themePref]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('big_v2_theme_pref', themePref);
  }, [isDark, themePref]);

  const [sessionExpiredAlert, setSessionExpiredAlert] = useState<boolean>(false);

  // Session Inactivity Timeout Watcher
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    
    const handleActivity = () => {
      lastActivity = Date.now();
    };

    // Listen to user activity events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    const interval = setInterval(() => {
      const timeoutStr = localStorage.getItem('big_v2_session_timeout') || 'never';
      if (timeoutStr === 'never') return;

      const timeoutMinutes = parseInt(timeoutStr, 10);
      if (isNaN(timeoutMinutes)) return;

      const idleDurationMs = Date.now() - lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      if (idleDurationMs >= timeoutMs) {
        // Session expired!
        setIsAuthenticated(false);
        localStorage.setItem('big_v2_is_auth', 'false');
        setCurrentView('home');
        setSessionExpiredAlert(true);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('big_v2_tour_completed') && currentView !== 'onboarding' && currentView !== 'auth') {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentView]);

  const toggleTheme = () => {
    setThemePref(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const handleNavigation = (view: string, mode?: 'login' | 'register') => {
    if (mode) {
      setAuthMode(mode);
    }
    if (view === 'auth' && isAuthenticated) {
      setIsAuthenticated(false);
      setCurrentView('home');
      return;
    }
    
    if (view !== currentView && view !== 'search') {
      setPreviousView(currentView);
    }

    const publicViews = ['home', 'auth', 'about', 'contact', 'big-club', 'programs', 'big-fund', 'academy', 'circles', 'directory'];
    if (!isAuthenticated && !publicViews.includes(view)) {
      setCurrentView('auth');
    } else if (isAuthenticated && view === 'auth') {
      setCurrentView('feeds');
    } else {
      setCurrentView(view);
    }
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      if (currentView !== 'search') {
        setPreviousView(currentView);
        setCurrentView('search');
      }
    } else {
      if (currentView === 'search') {
        setCurrentView(previousView || 'feeds');
      }
    }
  };

  const handleQuickMessage = (memberId: string, text: string) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      content: text,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.member.id === memberId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          messages: [...updated[existingIndex].messages, newMessage],
          unread: false
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          member: targetMember,
          messages: [newMessage],
          unread: false
        };
        return [newConv, ...prev];
      }
    });

    addNotification(`Sent a message to ${targetMember.name}`);
  };

  useEffect(() => {
    const publicViews = ['home', 'auth', 'about', 'contact', 'big-club', 'programs', 'big-fund', 'academy', 'circles', 'directory'];
    if (isAuthenticated) {
      if (currentView === 'auth') {
        setCurrentView('feeds');
      }
    } else {
      if (!publicViews.includes(currentView)) {
        setCurrentView('home');
      }
    }
  }, [isAuthenticated, currentView]);

  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [circleTab, setCircleTab] = useState<'learn' | 'connect' | 'earn' | 'thrive'>('learn');

  // Supabase state
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);


  // Shared application states with LocalStorage persistence
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('big_v2_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('big_v2_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('big_v2_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('big_v2_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('big_v2_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [mentorshipPairs, setMentorshipPairs] = useState<MentorshipPair[]>(() => {
    const saved = localStorage.getItem('big_v2_mentorship_pairs');
    return saved ? JSON.parse(saved) : INITIAL_MENTORSHIP_PAIRS;
  });

  const [circles, setCircles] = useState<Circle[]>(() => {
    const saved = localStorage.getItem('big_v2_circles');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && parsed.length > 0 ? parsed : INITIAL_CIRCLES;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('big_v2_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  useEffect(() => {
    localStorage.setItem('big_v2_resources', JSON.stringify(resources));
  }, [resources]);

  const [circleRequests, setCircleRequests] = useState<CircleRequest[]>(() => {
    const saved = localStorage.getItem('big_v2_circle_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentCircleId, setCurrentCircleId] = useState<string | null>(null);

  // Proposed mentor from Directory redirection
  const [proposedMentor, setProposedMentor] = useState<Member | null>(null);
  
  // Selected conversation partner from Directory redirection
  const [selectedConversationMember, setSelectedConversationMember] = useState<Member | null>(null);
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_blocked_user_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [reportedUserIds, setReportedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_reported_user_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [autoHideReported, setAutoHideReported] = useState<boolean>(() => {
    return localStorage.getItem('big_v2_auto_hide_reported') === 'true';
  });
  const [reportThreshold, setReportThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('big_v2_report_threshold');
    return saved ? parseInt(saved, 10) : 2;
  });

  useEffect(() => {
    localStorage.setItem('big_v2_auto_hide_reported', String(autoHideReported));
  }, [autoHideReported]);

  useEffect(() => {
    localStorage.setItem('big_v2_report_threshold', String(reportThreshold));
  }, [reportThreshold]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('big_v2_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [logRetentionDays, setLogRetentionDays] = useState<number | null>(() => {
    const saved = localStorage.getItem('big_v2_log_retention_days');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('big_v2_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('big_v2_log_retention_days', JSON.stringify(logRetentionDays));
    
    if (logRetentionDays) {
      const now = Date.now();
      const msInDays = logRetentionDays * 24 * 60 * 60 * 1000;
      setActivityLogs(prev => prev.filter(log => (now - log.timestamp) < msInDays));
    }
  }, [logRetentionDays]);

  const logActivity = (action: string, details: string, userId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      action,
      details,
      userId
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // User details state (Your profile)
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('big_v2_user_points');
    return saved ? parseInt(saved, 10) : 320;
  });

  useEffect(() => {
    localStorage.setItem('big_v2_blocked_user_ids', JSON.stringify(blockedUserIds));
  }, [blockedUserIds]);

  useEffect(() => {
    localStorage.setItem('big_v2_reported_user_ids', JSON.stringify(reportedUserIds));
  }, [reportedUserIds]);

  const blockUser = (userId: string) => {
    setBlockedUserIds(prev => [...prev, userId]);
    logActivity('User Blocked', `User with ID ${userId} has been blocked.`);
  };

  const reportUser = (userId: string) => {
    setReportedUserIds(prev => [...prev, userId]);
    logActivity('User Reported', `User with ID ${userId} has been reported.`);
  };
  const [userBadges, setUserBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_user_badges');
    return saved ? JSON.parse(saved) : ['confidence'];
  });

  // Followed sisters & Bookmarked feed posts
  const [connections, setConnections] = useState<{ userId: string, status: 'Pending' | 'Connected' }[]>(() => {
    const saved = localStorage.getItem('big_v2_connections');
    return saved ? JSON.parse(saved) : [{ userId: 'm2', status: 'Connected' }];
  });

  const requestConnection = (userId: string) => {
    setConnections(prev => {
      const next = [...prev, { userId, status: 'Pending' as const }];
      localStorage.setItem('big_v2_connections', JSON.stringify(next));
      apiService.syncState({ notifications, userPoints, userBadges, followingIds, bookmarkedPostIds, circleRequests, members, posts, events, challenges, conversations, mentorshipPairs, circles }).catch(err => console.warn('Failed to sync connection state to backend:', err));
      return next;
    });
    setToast({
      id: `conn-${Date.now()}`,
      title: '🔗 Connection Request Sent!',
      desc: 'They will be notified of your request to connect.',
      type: 'badge'
    });

    // Simulate real-time acceptance for demo purposes
    // In a real app, this would be triggered by a backend websocket event
    setTimeout(() => {
      acceptConnection(userId);
    }, 4000);
  };

  const acceptConnection = (userId: string) => {
    setConnections(prev => {
      const next = prev.map(c => c.userId === userId ? { ...c, status: 'Connected' as const } : c);
      if (!next.find(c => c.userId === userId)) {
        next.push({ userId, status: 'Connected' as const });
      }
      localStorage.setItem('big_v2_connections', JSON.stringify(next));
      apiService.syncState({ notifications, userPoints, userBadges, followingIds, bookmarkedPostIds, circleRequests, members, posts, events, challenges, conversations, mentorshipPairs, circles }).catch(err => console.warn('Failed to sync connection state to backend:', err));
      return next;
    });

    // Find the sister who accepted
    const sister = members.find(m => m.id === userId);
    if (sister) {
      // Trigger the real-time notification
      addNotification(`${sister.name} accepted your connection request!`);
      
      // Also show a toast alert for immediate feedback
      setToast({
        id: `accept-${Date.now()}`,
        title: '🤝 Connection Confirmed!',
        desc: `You and ${sister.name} are now connected. You can start chatting!`,
        type: 'points'
      });

      logActivity('Connection Established', `You are now connected with ${sister.name}`);
      addPoints(25); // Bonus for growing the sisterhood!
    }
  };

  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_following_ids');
    return saved ? JSON.parse(saved) : ['m1', 'm3'];
  });

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_bookmarked_post_ids');
    return saved ? JSON.parse(saved) : ['post-1'];
  });

  const [academyProgress, setAcademyProgress] = useState(() => {
    const saved = localStorage.getItem('big_v2_academy_progress');
    if (!saved) return getDefaultAcademyProgressState();
    try {
      return mergeAcademyProgressState(getDefaultAcademyProgressState(), JSON.parse(saved));
    } catch {
      return getDefaultAcademyProgressState();
    }
  });

  const toggleFollow = (memberId: string) => {
    let nextFollowingIds: string[] = [];
    
    setFollowingIds(prev => {
      const isFollowing = prev.includes(memberId);
      const next = isFollowing ? prev.filter(id => id !== memberId) : [...prev, memberId];
      localStorage.setItem('big_v2_following_ids', JSON.stringify(next));
      if (isSupabaseConfigured()) {
        void supabaseService.saveMember({
          ...currentUser,
          followingIds: next,
          id: currentUserId
        } as Member);
      }
      
      nextFollowingIds = next;

      if (!isFollowing) {
        addPoints(10);
        setToast({
          id: `follow-${Date.now()}`,
          title: '➕ Sister Followed!',
          desc: 'You are now following this sister\'s journey, updates, and milestones. (+10 Pts)',
          type: 'points'
        });
      } else {
        setToast({
          id: `unfollow-${Date.now()}`,
          title: '➖ Unfollowed Sister',
          desc: 'You unfollowed this sister. You can follow her again at any time.',
          type: 'points'
        });
      }
      return next;
    });

    // Bidirectional followers syncing
    setMembers(prev => {
      const hasYou = prev.some(m => m.id === currentUserId);
      let baseList = prev;
      if (!hasYou) {
        const defaultYou: Member = {
          id: currentUserId,
          name: 'Sarah Jenkins',
          avatar: '/images/african_woman_portrait.jpg',
          title: 'Aspiring Fashion Founder',
          city: 'Nairobi',
          rank: 'Learner',
          skills: ['Apparel Design', 'Creative Direction'],
          interests: ['Sustainable Fashion', 'E-Commerce'],
          bio: 'Fashion designer looking to scale my artisan-made brand globally.',
          business_stage: 'Early Stage',
          mentoring_capacity: 'Seeking Match',
          points: userPoints,
          badges: userBadges,
          followingIds: [],
          circleIds: ['learn', 'earn']
        };
        baseList = [...prev, defaultYou];
      }

      return baseList.map(m => {
        if (m.id === currentUserId) {
          return {
            ...m,
            followingIds: nextFollowingIds
          };
        }
        if (m.id === memberId) {
          const currentFollowers = m.followerIds || [];
          const isFollower = currentFollowers.includes(currentUserId);
          const nextFollowers = isFollower 
            ? currentFollowers.filter(id => id !== currentUserId)
            : [...currentFollowers, currentUserId];
          return {
            ...m,
            followerIds: nextFollowers
          };
        }
        return m;
      });
    });
  };

  const toggleBookmarkPost = (postId: string) => {
    setBookmarkedPostIds(prev => {
      const isBookmarked = prev.includes(postId);
      const next = isBookmarked ? prev.filter(id => id !== postId) : [...prev, postId];
      localStorage.setItem('big_v2_bookmarked_post_ids', JSON.stringify(next));
      if (isSupabaseConfigured()) {
        void supabaseService.saveMember({
          ...currentUser,
          id: currentUserId,
          followingIds: followingIds
        } as Member);
      }
      
      if (!isBookmarked) {
        addPoints(5);
        setToast({
          id: `bookmark-${Date.now()}`,
          title: '🔖 Post Bookmarked!',
          desc: 'This post is saved to your bookmarks library. (+5 Pts)',
          type: 'points'
        });
      } else {
        setToast({
          id: `unbookmark-${Date.now()}`,
          title: '🗑️ Bookmark Removed',
          desc: 'This post has been removed from your saved list.',
          type: 'points'
        });
      }
      return next;
    });
  };

  const addNotification = (title: string) => {
    const newNotif = { id: `not-${Date.now()}`, title, read: false };
    setNotifications(prev => {
      const next = [newNotif, ...prev];
      localStorage.setItem('big_v2_notifications', JSON.stringify(next));
      apiService.syncState({ notifications: next }).catch(err => console.warn('Failed to sync notifications to backend:', err));
      return next;
    });
  };

  // Real-time custom toast alert overlay
  const [toast, setToast] = useState<{ id: string; title: string; desc: string; type: 'points' | 'badge' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Header notification logs
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; read: boolean }>>(() => {
    const saved = localStorage.getItem('big_v2_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'not-0', title: 'Welcome to Be Independent Gal platform! You currently have 320 points.', read: false }
    ];
  });

  // Computed dynamic current user profile reading from members state
  const foundYou = members.find(m => m.id === currentUserId);
  const currentUser: Member = {
    ...(foundYou || {
      id: currentUserId,
      name: 'Sarah Jenkins',
      avatar: '/images/african_woman_portrait.jpg',
      title: 'Aspiring Fashion Founder',
      city: 'Nairobi',
      rank: 'Learner',
      skills: ['Apparel Design', 'Creative Direction'],
      interests: ['Sustainable Fashion', 'E-Commerce'],
      bio: 'Fashion designer looking to scale my artisan-made brand globally.',
      business_stage: 'Early Stage',
      mentoring_capacity: 'Seeking Match',
      circleIds: ['learn', 'earn'],
      isSuperAdmin: false
    }),
    isSuperAdmin: (foundYou?.email === 'athkhassan@gmail.com') || (foundYou?.email === 'beindependentgal@gmail.com') || (currentUserId === 'you') || Boolean(foundYou?.isSuperAdmin),
    points: userPoints,
    badges: userBadges
  };

  const calculateProfileCompletion = (user: Member): number => {
    const fields = [
      user.name,
      user.title,
      user.city,
      user.bio,
      user.avatar,
      user.business_stage,
      user.mentoring_capacity,
      user.skills?.length > 0,
      user.interests?.length > 0,
    ];
    const filledFields = fields.filter(field => !!field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(currentUser);

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && profileCompletion < 50) {
      if (!sessionStorage.getItem('big_profile_modal_dismissed')) {
        setShowProfileModal(true);
      }
    }
  }, [isAuthenticated, profileCompletion]);

  // Load data from Express backend on mount (and fallback to Supabase/localStorage)
  useEffect(() => {
    async function loadAllData() {
      let backendLoaded = false;
      try {
        const data = await apiService.getFullState();
        if (data) {
          if (data.members && data.members.length > 0) setMembers(data.members);
          if (data.posts && data.posts.length > 0) setPosts(data.posts);
          if (data.events && data.events.length > 0) setEvents(data.events);
          if (data.challenges && data.challenges.length > 0) setChallenges(data.challenges);
          if (data.conversations && data.conversations.length > 0) setConversations(data.conversations);
          if (data.mentorshipPairs && data.mentorshipPairs.length > 0) setMentorshipPairs(data.mentorshipPairs);
          const hasLocalPoints = localStorage.getItem('big_v2_user_points') !== null;
          const hasLocalBadges = localStorage.getItem('big_v2_user_badges') !== null;
          const hasLocalFollowing = localStorage.getItem('big_v2_following_ids') !== null;
          const hasLocalBookmarks = localStorage.getItem('big_v2_bookmarked_post_ids') !== null;

          if (!hasLocalPoints && data.userPoints !== undefined) setUserPoints(data.userPoints);
          if (!hasLocalBadges && data.userBadges && data.userBadges.length > 0) setUserBadges(data.userBadges);
          if (!hasLocalFollowing && data.followingIds && data.followingIds.length > 0) setFollowingIds(data.followingIds);
          if (!hasLocalBookmarks && data.bookmarkedPostIds && data.bookmarkedPostIds.length > 0) setBookmarkedPostIds(data.bookmarkedPostIds);
          if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
          
          setNotifications(prev => [
            { id: `not-backend-${Date.now()}`, title: '⚡ Connected and synced with your live Express backend!', read: false },
            ...prev
          ]);
          backendLoaded = true;
        }
      } catch (err) {
        console.warn('Failed to load from Express backend:', err);
      }

      // Live Supabase secondary syncing
      if (isSupabaseConfigured()) {
        try {
          const fetchedMembers = await supabaseService.getMembers();
          
          if (areTablesMissing()) {
            setSupabaseConnected(false);
            return;
          }

          const fetchedPosts = await supabaseService.getPosts();
          const fetchedEvents = await supabaseService.getEvents();
          const fetchedChallenges = await supabaseService.getChallenges();
          const fetchedConversations = await supabaseService.getConversations();
          const fetchedMentorshipPairs = await supabaseService.getMentorshipPairs();

          // Only overwrite if backend load failed, to prevent regression
          if (!backendLoaded) {
            if (fetchedMembers.length > 0) {
              setMembers(fetchedMembers);
              const youMember = fetchedMembers.find(m => m.id === currentUserId);
              if (youMember && youMember.followingIds) {
                setFollowingIds(youMember.followingIds);
                localStorage.setItem('big_v2_following_ids', JSON.stringify(youMember.followingIds));
              }
            }
            if (fetchedPosts.length > 0) setPosts(fetchedPosts);
            if (fetchedEvents.length > 0) setEvents(fetchedEvents);
            if (fetchedChallenges.length > 0) setChallenges(fetchedChallenges);
            if (fetchedConversations.length > 0) setConversations(fetchedConversations);
            if (fetchedMentorshipPairs.length > 0) setMentorshipPairs(fetchedMentorshipPairs);
          }
          
          setSupabaseConnected(true);
        } catch (err) {
          console.warn('Failed to load from Supabase:', err);
          setSupabaseConnected(false);
        }
      } else {
        setSupabaseConnected(false);
      }
    }
    loadAllData();
  }, []);

  // Persist state updates to localStorage & Express Backend & Supabase
  useEffect(() => {
    localStorage.setItem('big_v2_members', JSON.stringify(members));
    if (members.length > 0) {
      apiService.syncState({ members }).catch(err => console.warn('Failed to sync members to backend:', err));
    }
  }, [members]);

  useEffect(() => {
    localStorage.setItem('big_v2_events', JSON.stringify(events));
    if (events.length > 0) {
      apiService.syncState({ events }).catch(err => console.warn('Failed to sync events to backend:', err));
    }
  }, [events]);

  useEffect(() => {
    localStorage.setItem('big_v2_challenges', JSON.stringify(challenges));
    if (challenges.length > 0) {
      apiService.syncState({ challenges }).catch(err => console.warn('Failed to sync challenges to backend:', err));
    }
    if (isSupabaseConfigured() && challenges.length > 0) {
      supabaseService.seedChallenges(challenges);
    }
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('big_v2_posts', JSON.stringify(posts));
    if (posts.length > 0) {
      apiService.syncState({ posts }).catch(err => console.warn('Failed to sync posts to backend:', err));
    }
    if (isSupabaseConfigured() && posts.length > 0) {
      supabaseService.seedPosts(posts);
    }
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('big_v2_conversations', JSON.stringify(conversations));
    if (conversations.length > 0) {
      apiService.syncState({ conversations }).catch(err => console.warn('Failed to sync conversations to backend:', err));
    }
    if (isSupabaseConfigured() && conversations.length > 0) {
      supabaseService.seedConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('big_v2_mentorship_pairs', JSON.stringify(mentorshipPairs));
    if (mentorshipPairs.length > 0) {
      apiService.syncState({ mentorshipPairs }).catch(err => console.warn('Failed to sync mentorshipPairs to backend:', err));
    }
    if (isSupabaseConfigured() && mentorshipPairs.length > 0) {
      supabaseService.seedMentorshipPairs(mentorshipPairs);
    }
  }, [mentorshipPairs]);

  useEffect(() => {
    localStorage.setItem('big_v2_circles', JSON.stringify(circles));
    if (circles.length > 0) {
      apiService.syncState({ circles }).catch(err => console.warn('Failed to sync circles to backend:', err));
    }
    if (isSupabaseConfigured() && circles.length > 0) {
      circles.forEach(circle => {
        void supabaseService.saveCircle(circle);
      });
    }
  }, [circles]);

  useEffect(() => {
    localStorage.setItem('big_v2_circle_requests', JSON.stringify(circleRequests));
    if (isSupabaseConfigured() && circleRequests.length > 0) {
      circleRequests.forEach(request => {
        void supabaseService.saveCircleRequest(request);
      });
    }
  }, [circleRequests]);

  useEffect(() => {
    localStorage.setItem('big_v2_user_points', userPoints.toString());
    apiService.syncState({ userPoints }).catch(err => console.warn('Failed to sync userPoints to backend:', err));
    if (isSupabaseConfigured()) {
      void supabaseService.saveMember({ ...currentUser, points: userPoints, badges: userBadges, id: currentUserId } as Member);
    }
  }, [userPoints, userBadges, currentUserId]);

  useEffect(() => {
    localStorage.setItem('big_v2_user_badges', JSON.stringify(userBadges));
    apiService.syncState({ userBadges }).catch(err => console.warn('Failed to sync userBadges to backend:', err));
    if (isSupabaseConfigured()) {
      void supabaseService.saveMember({ ...currentUser, points: userPoints, badges: userBadges, id: currentUserId } as Member);
    }
  }, [userBadges, userPoints, currentUserId]);

  useEffect(() => {
    localStorage.setItem('big_v2_following_ids', JSON.stringify(followingIds));
    apiService.syncState({ followingIds }).catch(err => console.warn('Failed to sync followingIds to backend:', err));
    if (isSupabaseConfigured()) {
      void supabaseService.saveMember({ ...currentUser, followingIds, id: currentUserId } as Member);
    }
  }, [followingIds, currentUserId]);

  useEffect(() => {
    localStorage.setItem('big_v2_bookmarked_post_ids', JSON.stringify(bookmarkedPostIds));
    apiService.syncState({ bookmarkedPostIds }).catch(err => console.warn('Failed to sync bookmarkedPostIds to backend:', err));
  }, [bookmarkedPostIds]);

  useEffect(() => {
    localStorage.setItem('big_v2_academy_progress', JSON.stringify(academyProgress));
    apiService.syncState({
      members,
      userPoints,
      userBadges,
      followingIds,
      bookmarkedPostIds,
      notifications,
      circleRequests,
      circles,
      posts,
      events,
      challenges,
      conversations,
      mentorshipPairs,
      academyProgress
    }).catch(err => console.warn('Failed to sync academy progress to backend:', err));
    if (isSupabaseConfigured()) {
      void supabaseService.saveMember({ ...currentUser, points: userPoints, badges: userBadges, followingIds, id: currentUserId } as Member);
    }
  }, [academyProgress, members, userPoints, userBadges, followingIds, bookmarkedPostIds, notifications, circleRequests, circles, posts, events, challenges, conversations, mentorshipPairs, currentUser, currentUserId]);

  useEffect(() => {
    localStorage.setItem('big_v2_circle_requests', JSON.stringify(circleRequests));
    apiService.syncState({ circleRequests }).catch(err => console.warn('Failed to sync circleRequests to backend:', err));
  }, [circleRequests]);

  useEffect(() => {
    localStorage.setItem('big_v2_notifications', JSON.stringify(notifications));
    apiService.syncState({ notifications }).catch(err => console.warn('Failed to sync notifications to backend:', err));
  }, [notifications]);


  const addPoints = (pts: number, badgeCode?: string, isChallengeOrAdminAction: boolean = false) => {
    const result = calculatePointsAndBadges({
      pts,
      badgeCode,
      isChallengeOrAdminAction,
      currentPoints: userPoints,
      currentBadges: userBadges,
    });

    if (isChallengeOrAdminAction) {
      setUserPoints(result.newPoints);
    }

    if (result.unlockedBadge) {
      setUserBadges(result.newBadges);
      setTimeout(() => {
        setToast({
          id: `tb-${Date.now()}`,
          title: `🌟 New Badge Unlocked!`,
          desc: `Congratulations! You unlocked the "${result.unlockedBadge.toUpperCase()}" badge on the global BIG Club leaderboard.`,
          type: 'badge'
        });
      }, 1200);
    }

    if (result.newToast && isChallengeOrAdminAction) {
      setToast(result.newToast);
    }

    if (result.newNotificationTitle) {
      setNotifications(prev => [
        { id: `not-${Date.now()}`, title: result.newNotificationTitle!, read: false },
        ...prev
      ]);
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSaveProfile = (updatedUser: Member) => {
    const nextMember = updatedUser.id === currentUserId
      ? {
          ...updatedUser,
          preferences: {
            messagePermissions: updatedUser.preferences?.messagePermissions ?? 'connections',
            emailVerifyRequired: updatedUser.preferences?.emailVerifyRequired ?? false,
            codeVerifyRequired: updatedUser.preferences?.codeVerifyRequired ?? false,
            sessionTimeout: updatedUser.preferences?.sessionTimeout ?? 'never',
            theme: updatedUser.preferences?.theme ?? 'light',
            ...updatedUser.preferences,
          }
        }
      : updatedUser;

    setMembers(prev => updateMembers(prev, nextMember));

    if (isSupabaseConfigured()) {
      supabaseService.saveMember(nextMember);
    }

    apiService.syncState({
      members: updateMembers(members, nextMember),
      userPoints,
      userBadges,
      followingIds,
      bookmarkedPostIds,
      notifications,
      circleRequests,
      circles,
      posts,
      events,
      challenges,
      conversations,
      mentorshipPairs
    }).catch(err => console.warn('Failed to sync profile update to backend:', err));

    if (updatedUser.id === currentUserId) {
      setToast({
        id: `profile-save-${Date.now()}`,
        title: '✨ Profile Saved!',
        desc: 'Your profile information and photo have been updated successfully.',
        type: 'badge'
      });
    } else {
      setToast({
        id: `endorse-save-${Date.now()}`,
        title: '✨ Success!',
        desc: `Action for ${updatedUser.name} completed successfully.`,
        type: 'badge'
      });
    }
  };

  // Auto-scroll to top when view shifts and handle URL params
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle deep linking via URL params (e.g. ?view=profile&id=m1)
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const id = params.get('id');

    if (view && ['home', 'about', 'contact', 'big-club', 'academy', 'dashboard', 'profile', 'directory', 'circles', 'mentorship', 'events', 'leaderboard', 'messages', 'feeds', 'search', 'notifications'].includes(view)) {
      setCurrentView(view);
      if (view === 'profile' && id) {
        setSelectedProfileId(id);
      }
    }
  }, [currentView]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute unread message conversations count
  const unreadMessagesCount = conversations.filter(c => c.unread).length;

  useEffect(() => {
  }, [currentView]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-primary dark:text-slate-100 flex-col overflow-x-clip">
      
      {/* Connectivity Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white overflow-hidden z-[1000] sticky top-0 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
              <WifiOff className="h-4 w-4 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                Offline Mode: Connection lost. Changes are being saved to your local storage.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* GLOBAL NOTIFICATION SYSTEM */}
        <Header 
          currentView={currentView}
          setCurrentView={handleNavigation}
          unreadCount={unreadMessagesCount}
          notifications={notifications}
          markNotificationsRead={markNotificationsRead}
          userPoints={userPoints}
          currentUser={currentUser}
          setSelectedProfileId={setSelectedProfileId}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          themePref={themePref}
          isDark={isDark}
          toggleTheme={toggleTheme}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          members={members}
          posts={posts}
          events={events}
          circles={circles}
          setCircleTab={setCircleTab}
          setCurrentCircleId={setCurrentCircleId}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchQueryChange}
        />

        <ErrorBoundary>
        {currentView === 'auth' && (
          <AuthView
            initialMode={authMode}
            onAuthSuccess={(isNewUser, name, email) => {
              setIsAuthenticated(true);
              localStorage.setItem('big_v2_is_auth', 'true');

              if (name && email) {
                const existingUser = members.find(m => m.email?.toLowerCase() === email.toLowerCase());
                if (existingUser) {
                  setCurrentUserId(existingUser.id);
                  localStorage.setItem('big_v2_current_user_id', existingUser.id);

                  if (existingUser.points !== undefined) {
                    setUserPoints(existingUser.points);
                    localStorage.setItem('big_v2_user_points', JSON.stringify(existingUser.points));
                  } else {
                    setUserPoints(0);
                    localStorage.setItem('big_v2_user_points', JSON.stringify(0));
                  }

                  if (existingUser.badges !== undefined) {
                    setUserBadges(existingUser.badges);
                    localStorage.setItem('big_v2_user_badges', JSON.stringify(existingUser.badges));
                  } else {
                    setUserBadges([]);
                    localStorage.setItem('big_v2_user_badges', JSON.stringify([]));
                  }
                } else {
                  const newUserId = `user-${Date.now()}`;
                  setCurrentUserId(newUserId);
                  localStorage.setItem('big_v2_current_user_id', newUserId);
                  localStorage.setItem('big_v2_user_badges', JSON.stringify([]));
                  localStorage.setItem('big_v2_connections', JSON.stringify([]));
                  localStorage.setItem('big_v2_circle_requests', JSON.stringify([]));
                  localStorage.setItem('big_v2_notifications', JSON.stringify([]));

                  setFollowingIds([]);
                  setBookmarkedPostIds([]);
                  setUserPoints(0);
                  setUserBadges([]);
                  setConnections([]);
                  setCircleRequests([]);
                  setNotifications([]);

                  const newProfile = {
                    id: newUserId,
                    name,
                    email,
                    avatar: '',
                    title: '',
                    city: '',
                    rank: 'Learner',
                    skills: [],
                    interests: [],
                    bio: '',
                    business_stage: '',
                    mentoring_capacity: '',
                    circleIds: []
                  };

                  const updatedMembers = [...members, newProfile as Member];
                  setMembers(updatedMembers);
                  localStorage.setItem('big_v2_members', JSON.stringify(updatedMembers));
                }
              }

              setCurrentView(isNewUser ? 'onboarding' : 'feeds');
            }}
          />
        )}
        {currentView === 'onboarding' && (
          <OnboardingView
            onComplete={(profileData) => {
              let updatedMembers = [...members];
              if (!updatedMembers.some(m => m.id === currentUserId)) {
                updatedMembers.push({ ...currentUser, ...profileData } as Member);
              } else {
                updatedMembers = updatedMembers.map(m => 
                  m.id === currentUserId ? { ...m, ...profileData } as Member : m
                );
              }
              setMembers(updatedMembers);
              localStorage.setItem('big_v2_members', JSON.stringify(updatedMembers));
              
              setCircles(circles.map(c => 
                (c.id === 'learn' || c.id === 'connect') ? { ...c, isJoined: true, memberCount: c.isJoined ? c.memberCount : c.memberCount + 1 } : c
              ));

              setCurrentView('feeds');
              
              setTimeout(() => {
                addNotification("Welcome to the Sisterhood! Your profile is now live.");
              }, 1500);
            }}
          />
        )}
        {currentView === 'home' && (
          <HomeView 
            setCurrentView={handleNavigation}
            setCircleTab={setCircleTab}
            members={members}
            setToast={setToast}
          />
        )}
        
        {currentView === 'about' && (
          <AboutView setCurrentView={handleNavigation} />
        )}
        
        {currentView === 'contact' && (
          <ContactView />
        )}

        {currentView === 'programs' && (
          <ProgramsView setCurrentView={handleNavigation} />
        )}

        {currentView === 'big-fund' && (
          <Suspense fallback={routeFallback}>
            <BIGFundView 
              setCurrentView={handleNavigation} 
              isAuthenticated={isAuthenticated}
            />
          </Suspense>
        )}

        {currentView === 'big-club' && (
          <BIGClubView />
        )}
        
        {currentView === 'academy' && (
          <AcademyView 
            addPoints={addPoints}
            onJoinCircle={(id) => {
              setCurrentCircleId(id);
              setCurrentView('circle-hub');
            }}
            isAuthenticated={isAuthenticated}
            setCurrentView={handleNavigation}
            academyProgress={academyProgress}
            setAcademyProgress={setAcademyProgress}
          />
        )}

        {currentView === 'dashboard' && (
          <Suspense fallback={routeFallback}>
            <DashboardView 
              members={members}
              activeTab={circleTab}
              setActiveTab={setCircleTab}
              posts={posts}
              setPosts={setPosts}
              challenges={challenges}
              setChallenges={setChallenges}
              resources={resources}
              currentUser={currentUser}
              addPoints={addPoints}
              setCurrentView={handleNavigation}
              followingIds={followingIds}
              toggleFollow={toggleFollow}
              bookmarkedPostIds={bookmarkedPostIds}
              toggleBookmarkPost={toggleBookmarkPost}
              setSelectedConversationMember={setSelectedConversationMember}
              profileCompletion={calculateProfileCompletion(currentUser)}
              connections={connections}
              requestConnection={requestConnection}
              handleViewProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentView('profile');
              }}
              isDark={isDark}
              circles={circles}
              setCircles={setCircles}
              mentorshipPairs={mentorshipPairs}
              setMentorshipPairs={setMentorshipPairs}
              logActivity={logActivity}
            />
          </Suspense>
        )}

        {currentView === 'profile' && (
          <ProfileView 
            currentUser={currentUser}
            targetUser={selectedProfileId && selectedProfileId !== currentUserId ? (members.find(m => m.id === selectedProfileId) || currentUser) : currentUser}
            onSaveProfile={handleSaveProfile}
            addPoints={addPoints}
            setCurrentView={handleNavigation}
            setSelectedProfileId={setSelectedProfileId}
            toggleFollow={toggleFollow}
            followingIds={followingIds}
            setSelectedConversationMember={setSelectedConversationMember}
            circles={circles}
            blockUser={blockUser}
            reportUser={reportUser}
            logActivity={logActivity}
            setToast={setToast}
            addNotification={addNotification}
          />
        )}

        {currentView === 'settings' && (
          <Suspense fallback={routeFallback}>
            <SettingsView 
              currentUser={currentUser}
              onSaveProfile={handleSaveProfile}
              addPoints={addPoints}
            />
          </Suspense>
        )}

        {currentView === 'directory' && (
          <DirectoryView 
            members={members}
            setCurrentView={handleNavigation}
            setSelectedConversationMember={setSelectedConversationMember}
            setMessageDraft={setMessageDraft}
            setMentorshipProposedMentor={setProposedMentor}
            followingIds={followingIds}
            toggleFollow={toggleFollow}
            connections={connections}
            requestConnection={requestConnection}
            mentorshipPairs={mentorshipPairs}
            handleViewProfile={(id) => {
              setSelectedProfileId(id);
              setCurrentView('profile');
            }}
            onSendMessage={handleQuickMessage}
            circles={circles}
            currentUser={currentUser}
            addNotification={addNotification}
          />
        )}

        {currentView === 'my-sisters' && (
          <Suspense fallback={routeFallback}>
            <MySistersView 
              members={members}
              followingIds={followingIds}
              toggleFollow={toggleFollow}
              setCurrentView={handleNavigation}
              setSelectedConversationMember={setSelectedConversationMember}
              connections={connections}
              currentUser={currentUser}
              onSendMessage={handleQuickMessage}
              addNotification={addNotification}
            />
          </Suspense>
        )}

        {currentView === 'circles' && (
          <CirclesView 
            circles={circles}
            setCircles={setCircles}
            circleRequests={circleRequests}
            setCircleRequests={setCircleRequests}
            currentUser={currentUser}
            onSelectCircle={(id) => {
              setCurrentCircleId(id);
              setCurrentView('circle-hub');
            }}
            addPoints={addPoints}
            addNotification={addNotification}
            isAuthenticated={isAuthenticated}
            setCurrentView={handleNavigation}
          />
        )}

        {currentCircleId && currentView === 'circle-hub' && (() => {
          const matchedCircle = circles.find(c => c.id === currentCircleId);
          if (!matchedCircle) {
            return (
              <div className="py-24 text-center space-y-6">
                <p className="text-slate-500">Circle not found.</p>
                <button onClick={() => setCurrentView('circles')} className="rounded-full bg-primary text-white px-6 py-2.5 font-bold">
                  Back to Circles
                </button>
              </div>
            );
          }
          return (
            <CircleHub 
              circle={matchedCircle}
              circles={circles}
              onBack={() => setCurrentView('circles')}
              onJoinCircle={(id) => {
                setCircles(circles.map(c => 
                  c.id === id ? { ...c, isJoined: !c.isJoined, memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 } : c
                ));
                const circle = circles.find(c => c.id === id);
                if (circle && !circle.isJoined) {
                  addPoints(50);
                }
              }}
              onSelectCircle={(id) => {
                setCurrentCircleId(id);
                setCurrentView('circle-hub');
              }}
              addNotification={addNotification}
              setToast={setToast}
              members={members}
              setMembers={setMembers}
              posts={posts}
              setPosts={setPosts}
              setCircles={setCircles}
              circleRequests={circleRequests}
              setCircleRequests={setCircleRequests}
              challenges={challenges}
              setChallenges={setChallenges}
              events={events}
              currentUser={currentUser}
              addPoints={addPoints}
              setCurrentView={handleNavigation}
              setSelectedConversationMember={setSelectedConversationMember}
            />
          );
        })()}

        {currentView === 'mentorship' && (
          <MentorshipView 
            members={members}
            mentorshipPairs={mentorshipPairs}
            setMentorshipPairs={setMentorshipPairs}
            proposedMentor={proposedMentor}
            setProposedMentor={setProposedMentor}
            addPoints={addPoints}
            currentUser={currentUser}
          />
        )}

        {currentView === 'events' && (
          <EventsView 
            members={members}
            events={events}
            setEvents={setEvents}
            addPoints={addPoints}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView 
            members={members}
            userPoints={userPoints}
            userBadges={userBadges}
            currentUser={currentUser}
          />
        )}

        {currentView === 'messages' && (
          <Suspense fallback={routeFallback}>
            <MessagesView 
              conversations={conversations}
              setConversations={setConversations}
              selectedMember={selectedConversationMember}
              setSelectedMember={setSelectedConversationMember}
              addPoints={addPoints}
              initialDraftMessage={messageDraft}
              clearDraftMessage={() => setMessageDraft('')}
              currentUser={currentUser}
            />
          </Suspense>
        )}

        {currentView === 'admin' && (
          <Suspense fallback={routeFallback}>
            <AdminDashboardView 
              members={members}
              setMembers={setMembers}
              events={events}
              setEvents={setEvents}
              challenges={challenges}
              setChallenges={setChallenges}
              circles={circles}
              setCircles={setCircles}
              circleRequests={circleRequests}
              setCircleRequests={setCircleRequests}
              posts={posts}
              setPosts={setPosts}
              currentUser={currentUser}
              userPoints={userPoints}
              setUserPoints={setUserPoints}
              userBadges={userBadges}
              setUserBadges={setUserBadges}
              notifications={notifications}
              setNotifications={setNotifications}
              addPoints={addPoints}
              setCurrentView={handleNavigation}
              supabaseConnected={supabaseConnected}
              blockedUserIds={blockedUserIds}
              setBlockedUserIds={setBlockedUserIds}
              reportedUserIds={reportedUserIds}
              setReportedUserIds={setReportedUserIds}
              activityLogs={activityLogs}
              logActivity={logActivity}
              logRetentionDays={logRetentionDays}
              setLogRetentionDays={setLogRetentionDays}
              autoHideReported={autoHideReported}
              setAutoHideReported={setAutoHideReported}
              reportThreshold={reportThreshold}
              setReportThreshold={setReportThreshold}
            />
          </Suspense>
        )}

        {currentView === 'feeds' && (
          <Suspense fallback={routeFallback}>
            <CommunityFeedsView 
              members={members}
              posts={posts}
              setPosts={setPosts}
              circles={circles}
              setCircles={setCircles}
              circleRequests={circleRequests}
              setCircleRequests={setCircleRequests}
              events={events}
              currentUser={currentUser}
              addPoints={addPoints}
              setCurrentView={handleNavigation}
              followingIds={followingIds}
              toggleFollow={toggleFollow}
              bookmarkedPostIds={bookmarkedPostIds}
              toggleBookmarkPost={toggleBookmarkPost}
              setSelectedConversationMember={setSelectedConversationMember}
              handleViewProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentView('profile');
              }}
              logActivity={logActivity}
              autoHideReported={autoHideReported}
              reportThreshold={reportThreshold}
            />
          </Suspense>
        )}

        {currentView === 'search' && (
          <SearchView 
            members={members}
            posts={posts}
            events={events}
            circles={circles}
            resources={resources}
            setCurrentView={handleNavigation}
            setSelectedConversationMember={setSelectedConversationMember}
            setCircleTab={setCircleTab}
            setCurrentCircleId={setCurrentCircleId}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchQueryChange}
            handleViewProfile={(id) => {
              setSelectedProfileId(id);
              setCurrentView('profile');
            }}
            onOpenResourceLibrary={() => setCurrentView('resource-library')}
          />
        )}

        {currentView === 'resource-library' && (
          <Suspense fallback={routeFallback}>
            <ResourceLibraryView
              resources={resources}
              setResources={setResources}
              onBack={() => setCurrentView('search')}
              addPoints={addPoints}
              currentUser={currentUser}
            />
          </Suspense>
        )}

        {currentView === 'notifications' && (
          <NotificationsView 
            notifications={notifications}
            setNotifications={setNotifications}
            onConfigureAlerts={() => setCurrentView('settings')}
          />
        )}
        {currentView === 'job-board' && (
          <JobBoardView currentUser={currentUser} addPoints={addPoints} logActivity={logActivity} />
        )}
        {currentView === 'goal-tracker' && (
          <GoalTrackerView currentUser={currentUser} addPoints={addPoints} />
        )}

        {/* FOOTER */}
        {['home', 'about', 'contact', 'big-club', 'programs', 'big-fund', 'academy'].includes(currentView) && (
          <Footer setCurrentView={handleNavigation} isAuthenticated={isAuthenticated} />
        )}

        {isAuthenticated && (
          <BottomNav currentView={currentView} setCurrentView={handleNavigation} onOpenComposer={() => setIsComposerOpen(true)} />
        )}
        <ScrollToTop />
        </ErrorBoundary>
      </main>
    </div>

      {/* SUPPORT & CHAT WIDGET */}
      {!isAuthenticated && <ChatWidget />}

      {/* TOAST ALERT OVERLAY */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl border border-secondary/20 bg-white p-5 shadow-2xl animate-fade-in ring-4 ring-secondary/5">
          <div className="flex items-start gap-3.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              toast.type === 'badge' ? 'bg-amber-100 text-amber-600' : 'bg-pink-100 text-secondary'
            }`}>
              {toast.type === 'badge' ? (
                <Award className="h-5 w-5 animate-bounce" />
              ) : (
                <Sparkles className="h-5 w-5 animate-pulse" />
              )}
            </div>
            
            <div className="flex-grow space-y-1">
              <h4 className="text-xs font-heading font-extrabold text-primary">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {toast.desc}
              </p>
            </div>

            <button 
              onClick={() => setToast(null)}
              className="rounded-full p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {sessionExpiredAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4"
          >
            <div className="mx-auto h-12 w-12 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-500">
              <AlertTriangle className="h-6 w-6 text-rose-500 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-heading font-black text-primary dark:text-white uppercase tracking-tight">Session Expired</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                For your security, you have been automatically logged out due to inactivity. Please sign in again.
              </p>
            </div>
            <button
              onClick={() => {
                setSessionExpiredAlert(false);
                setCurrentView('auth');
              }}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-50 transition animate-pulse"
            >
              Sign In Again
            </button>
          </motion.div>
        </div>
      )}


            {/* Profile Completion Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl relative animate-fade-in border border-border">
              <button 
                onClick={() => {
                  sessionStorage.setItem('big_profile_modal_dismissed', 'true');
                  setShowProfileModal(false);
                }}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                <AlertTriangle className="h-7 w-7" />
              </div>
              
              <h2 className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Your profile is only <span className="font-bold text-amber-600">{profileCompletion}% complete</span>. Add your skills, interests, and bio to help other sisters find and connect with you!
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    sessionStorage.setItem('big_profile_modal_dismissed', 'true');
                    setShowProfileModal(false);
                    setCurrentView('profile');
                  }}
                  className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  Update Profile Now
                </button>
                <button 
                  onClick={() => {
                    sessionStorage.setItem('big_profile_modal_dismissed', 'true');
                    setShowProfileModal(false);
                  }}
                  className="rounded-full px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POST COMPOSER MODAL */}
        <AnimatePresence>
          {isComposerOpen && (
            <div className="fixed inset-0 z-[1001] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold">New Post</h2>
                  <button onClick={() => setIsComposerOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <PostComposer 
                  currentUser={currentUser} 
                  members={members}
                  standalone={true}
                  onClose={() => setIsComposerOpen(false)}
                  onPost={(content, type) => {
                    const newPostObj: Post = {
                      id: `post-custom-${Date.now()}`,
                      author: {
                        id: currentUser.id,
                        name: currentUser.name,
                        avatar: currentUser.avatar,
                        rank: currentUser.rank
                      },
                      content: content,
                      timestamp: 'Just now',
                      likes: [],
                      comments: [],
                      liked: false,
                      circleId: 'connect',
                      tag: type,
                      tags: (content.match(/#\w+/g) || []).map(m => m.slice(1))
                    };
                    setPosts(prev => [newPostObj, ...prev]);
                    addPoints(10);
                    setIsComposerOpen(false);
                  }} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* GET STARTED TOUR */}
      <AnimatePresence>
        {showTour && (
          <TourOverlay 
            onClose={() => {
              setShowTour(false);
              localStorage.setItem('big_v2_tour_completed', 'true');
            }}
            onNavigate={(view) => handleNavigation(view)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

