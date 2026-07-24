import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Calendar, 
  Award, 
  Plus, 
  Trash2, 
  TrendingUp,
  TrendingDown, 
  Radio, 
  Database, 
  FileDown, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  CircleDot,
  MapPin,
  Sparkles,
  Zap,
  Star,
  Search,
  MessageSquare,
  Check,
  Download,
  Sliders,
  ChevronRight,
  ChevronDown,
  Send,
  UserCheck,
  Flame,
  PieChart,
  X,
  BarChart as BarChartIcon,
  Activity,
  Wifi,
  Clock,
  Bell,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { Member, Event, Challenge, Post, Circle, CircleRequest } from '../data';
import { ActivityLog } from '../types';

interface AdminDashboardViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  circleRequests: CircleRequest[];
  setCircleRequests: React.Dispatch<React.SetStateAction<CircleRequest[]>>;
  currentUser: Member;
  userPoints: number;
  setUserPoints: React.Dispatch<React.SetStateAction<number>>;
  userBadges: string[];
  setUserBadges: React.Dispatch<React.SetStateAction<string[]>>;
  notifications: Array<{ id: string; title: string; read: boolean }>;
  setNotifications: React.Dispatch<React.SetStateAction<Array<{ id: string; title: string; read: boolean }>>>;
  addPoints: (pts: number, badge?: string, isChallenge?: boolean) => void;
  setCurrentView: (view: string) => void;
  supabaseConnected: boolean;
  blockedUserIds: string[];
  setBlockedUserIds: React.Dispatch<React.SetStateAction<string[]>>;
  reportedUserIds: string[];
  setReportedUserIds: React.Dispatch<React.SetStateAction<string[]>>;
  activityLogs: ActivityLog[];
  logActivity: (action: string, details: string, userId?: string) => void;
  logRetentionDays: number | null;
  setLogRetentionDays: React.Dispatch<React.SetStateAction<number | null>>;
  autoHideReported: boolean;
  setAutoHideReported: React.Dispatch<React.SetStateAction<boolean>>;
  reportThreshold: number;
  setReportThreshold: React.Dispatch<React.SetStateAction<number>>;
}

export function AdminDashboardView({
  members,
  setMembers,
  events,
  setEvents,
  challenges,
  setChallenges,
  posts,
  setPosts,
  circles,
  setCircles,
  circleRequests,
  setCircleRequests,
  currentUser,
  userPoints,
  setUserPoints,
  userBadges,
  setUserBadges,
  notifications,
  setNotifications,
  addPoints,
  setCurrentView,
  supabaseConnected,
  blockedUserIds,
  setBlockedUserIds,
  reportedUserIds,
  setReportedUserIds,
  activityLogs,
  logActivity,
  logRetentionDays,
  setLogRetentionDays,
  autoHideReported,
  setAutoHideReported,
  reportThreshold,
  setReportThreshold
}: AdminDashboardViewProps) {
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<'analytics' | 'members' | 'events' | 'circles' | 'broadcast' | 'data' | 'blocked' | 'reports' | 'logs' | 'roles'>('analytics');
  const [reportsSubTab, setReportsSubTab] = useState<'posts' | 'users'>('posts');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  // Summary Metrics
  const totalRegisteredMembers = members.length;
  const activePostsToday = posts.filter(p => {
    try {
      const postDate = new Date(p.timestamp);
      const today = new Date();
      return postDate.getDate() === today.getDate() &&
             postDate.getMonth() === today.getMonth() &&
             postDate.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  }).length;
  const totalPendingRequests = circleRequests.filter(r => r.status === 'pending').length;
  
  // New signups data for the last 7 days
  const signupsData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = members.filter(m => {
      try {
        const joinedDate = new Date(m.joinedAt);
        return joinedDate.toDateString() === d.toDateString();
      } catch {
        return false;
      }
    }).length;
    return { name: dateStr, signups: count };
  }).reverse();
  
  // Real-time System Status states
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [dbStatus, setDbStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkSystemStatus = async () => {
    setApiStatus('checking');
    setDbStatus('checking');
    const startTime = performance.now();
    try {
      const response = await fetch('/api/health');
      const latency = Math.round(performance.now() - startTime);
      setApiLatency(latency);
      setLastChecked(new Date().toLocaleTimeString());
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          setApiStatus('healthy');
        } else {
          setApiStatus('unhealthy');
        }
        if (data.database === 'connected') {
          setDbStatus('healthy');
        } else {
          setDbStatus('unhealthy');
        }
      } else {
        setApiStatus('unhealthy');
        setDbStatus('unhealthy');
      }
    } catch (error) {
      setApiStatus('unhealthy');
      setDbStatus('unhealthy');
      setApiLatency(null);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  React.useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Searching & filtering inside Admin member tab
  const [searchQuery, setSearchQuery] = useState('');
  const [circleSearchQuery, setCircleSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showBulkBroadcastModal, setShowBulkBroadcastModal] = useState(false);
  const [bulkBroadcastMessage, setBulkBroadcastMessage] = useState('');

  // Activity Logs filtering state
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  // New Member Form state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    title: '',
    city: '',
    rank: 'Learner' as Member['rank'],
    bio: '',
    skills: '',
    interests: '',
    businessStage: 'Idea Stage' as NonNullable<Member['business_stage']>,
    mentoringCapacity: 'Seeking Match' as NonNullable<Member['mentoring_capacity']>,
    points: 100
  });

  // New Event Form state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop' as Event['type'],
    description: ''
  });

  // New Challenge Form state
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    reward: '50 Pts',
    category: 'learn' as Challenge['category'],
    badge: 'trailblazer'
  });

  // Broadcast Notification Form state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'mentors' | 'learners'>('all');
  const [broadcastType, setBroadcastType] = useState<'info' | 'alert' | 'badge'>('info');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Backup & Reset states
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    'System initialization successful.',
    'Local database state parsed successfully.',
    `Found ${members.length} member entries, ${events.length} event records, and ${challenges.length} challenge points.`
  ]);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  // Helper stats computation
  const totalMembersCount = members.length;
  const totalPointsCount = members.reduce((sum, m) => sum + (m.id === currentUser.id ? userPoints : m.points), 0);
  const totalEventsCount = events.length;
  const totalChallengesCount = challenges.length;
  
  const mentorCount = members.filter(m => m.rank === 'Mentor' || m.rank === 'Coach').length;
  const learnerCount = members.filter(m => m.rank === 'Learner').length;
  
  // Circles breakdown estimation
  const postsByCircle = posts.reduce((acc, p) => {
    acc[p.circleId] = (acc[p.circleId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Predefined badges list
  const AVAILABLE_BADGES = [
    'confidence', 'pioneer', 'trailblazer', 'mentor', 'network', 
    'community_star', 'entrepreneur', 'green_champion', 'field_hero', 'coder', 'connector'
  ];

  // Predefined cities list
  const cities = Array.from(new Set(members.map(m => m.city)));

  const navItems = [
    { id: 'analytics' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'members' as const, label: 'Sisterhood', icon: Users, badge: members.length },
    { id: 'events' as const, label: 'Events & Challenges', icon: Calendar },
    { id: 'circles' as const, label: 'Circle Requests', icon: CircleDot, badge: circleRequests.filter(r => r.status === 'pending').length },
    { id: 'broadcast' as const, label: 'Announcements', icon: Radio },
    { id: 'data' as const, label: 'Maintenance', icon: Database },
    { id: 'blocked' as const, label: 'Blocked Users', icon: Shield, badge: blockedUserIds.length },
    { id: 'reports' as const, label: 'User Reports', icon: AlertCircle, badge: reportedUserIds.length },
    { id: 'roles' as const, label: 'Role Management', icon: Shield },
    { id: 'logs' as const, label: 'System Logs', icon: FileText },
  ];

  // Filtered members list
  const filteredMembers = members.filter(member => {
    const name = member.id === currentUser.id ? currentUser.name : member.name;
    const email = member.id === currentUser.id ? currentUser.email || '' : member.email || '';
    const title = member.id === currentUser.id ? currentUser.title : member.title;
    const city = member.id === currentUser.id ? currentUser.city : member.city;
    const rank = member.id === currentUser.id ? currentUser.rank : member.rank;

    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRank = rankFilter === 'all' || rank === rankFilter;
    const matchesCity = cityFilter === 'all' || city === cityFilter;

    return matchesSearch && matchesRank && matchesCity;
  });

  const filteredLogs = activityLogs.filter(log => {
    const matchesAction = logActionFilter === 'all' || log.action === logActionFilter;
    
    const logDate = new Date(log.timestamp);
    const matchesStart = !logStartDate || logDate >= new Date(logStartDate);
    const matchesEnd = !logEndDate || logDate <= new Date(new Date(logEndDate).setHours(23, 59, 59, 999));
    
    return matchesAction && matchesStart && matchesEnd;
  });

  const uniqueActions = Array.from(new Set(activityLogs.map(l => l.action))).sort();

  // Action counts for logs
  const actionCounts = activityLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalLogCount = activityLogs.length;

  // Action: Modify points for a sister
  const adjustPoints = (memberId: string, amount: number) => {
    if (memberId === currentUser.id) {
      setUserPoints(prev => Math.max(0, prev + amount));
      addPoints(amount, undefined, true);
    } else {
      setMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          const newPts = Math.max(0, m.points + amount);
          return { ...m, points: newPts };
        }
        return m;
      }));
    }
    
    setSyncLogs(prev => [
      `Adjusted points for member (${memberId}): ${amount > 0 ? '+' : ''}${amount} pts.`,
      ...prev
    ]);
  };

  // Action: Award/Revoke badge
  const toggleBadge = (memberId: string, badgeCode: string) => {
    if (memberId === currentUser.id) {
      setUserBadges(prev => {
        const hasBadge = prev.includes(badgeCode);
        const updated = hasBadge ? prev.filter(b => b !== badgeCode) : [...prev, badgeCode];
        return updated;
      });
    } else {
      setMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          const badges = m.badges || [];
          const hasBadge = badges.includes(badgeCode);
          const updated = hasBadge ? badges.filter(b => b !== badgeCode) : [...badges, badgeCode];
          return { ...m, badges: updated };
        }
        return m;
      }));
    }

    setSyncLogs(prev => [
      `Toggled badge "${badgeCode}" for member (${memberId}).`,
      ...prev
    ]);
  };

  // Action: Change Rank
  const updateMemberRank = (memberId: string, newRank: Member['rank']) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, rank: newRank };
      }
      return m;
    }));

    setSyncLogs(prev => [
      `Updated member (${memberId}) rank to ${newRank}.`,
      ...prev
    ]);
  };

  const toggleModerator = (memberId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const isMod = !m.isModerator;
        logActivity(
          isMod ? 'Promoted to Moderator' : 'Demoted from Moderator',
          `${m.name} has been ${isMod ? 'promoted to' : 'demoted from'} moderator status.`
        );
        return { ...m, isModerator: isMod };
      }
      return m;
    }));
    
    setSyncLogs(prev => [
      `Toggled moderator status for member (${memberId}).`,
      ...prev
    ]);
  };

  const toggleSuperAdmin = (memberId: string) => {
    // Safety check: Don't allow toggling own super admin status if you are the one doing it
    // But since this is a mock environment, we'll just implement the logic.
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const isAdmin = !m.isSuperAdmin;
        logActivity(
          isAdmin ? 'Promoted to Super Admin' : 'Demoted from Super Admin',
          `${m.name} has been ${isAdmin ? 'promoted to' : 'demoted from'} super admin status.`
        );
        return { ...m, isSuperAdmin: isAdmin };
      }
      return m;
    }));

    setSyncLogs(prev => [
      `Toggled super admin status for member (${memberId}).`,
      ...prev
    ]);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedMemberIds.length} sister accounts? This cannot be undone.`)) return;
    
    setMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
    logActivity('Bulk Delete', `Deleted ${selectedMemberIds.length} accounts.`);
    setSelectedMemberIds([]);
  };

  const handleBulkResetPermissions = () => {
    if (!window.confirm(`Reset ranks and award default points for ${selectedMemberIds.length} sisters?`)) return;

    setMembers(prev => prev.map(m => {
      if (selectedMemberIds.includes(m.id)) {
        return { ...m, rank: 'Member', points: 100, isModerator: false };
      }
      return m;
    }));
    
    logActivity('Bulk Reset', `Reset rank and points for ${selectedMemberIds.length} accounts.`);
    setSelectedMemberIds([]);
  };

  const handleBulkBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkBroadcastMessage.trim()) return;

    const targetNames = members
      .filter(m => selectedMemberIds.includes(m.id))
      .map(m => m.name)
      .join(', ');

    logActivity(
      'Targeted Broadcast', 
      `Sent private notification to ${selectedMemberIds.length} sisters: "${bulkBroadcastMessage}"`
    );

    setSyncLogs(prev => [
      `Sent bulk broadcast to: ${targetNames}`,
      ...prev
    ]);

    setBulkBroadcastMessage('');
    setShowBulkBroadcastModal(false);
    setSelectedMemberIds([]);
    alert(`Broadcast successfully delivered to ${selectedMemberIds.length} sisters!`);
  };

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filterableIds = filteredMembers.filter(m => m.id !== currentUser.id).map(m => m.id);
    if (selectedMemberIds.length === filterableIds.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filterableIds);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Title', 'Rank', 'City', 'Points', 'Role', 'Status'];
    const rows = members.map(m => [
      m.id,
      m.name,
      m.title,
      m.rank,
      m.city,
      m.points,
      m.isSuperAdmin ? 'Super Admin' : (m.isModerator ? 'Moderator' : 'Member'),
      'Active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `big_sisterhood_members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logActivity('Data Export', 'Exported member directory to CSV.');
  };

  const handleExportLogs = () => {
    const headers = ['UTC Timestamp', 'Local Date', 'Action', 'Description', 'Operator ID'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toISOString(),
      new Date(log.timestamp).toLocaleString(),
      log.action.toUpperCase(),
      log.details.replace(/"/g, '""'),
      log.userId || 'SYSTEM_CORE'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sis_audit_trail_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logActivity('Log Export', `Exported ${filteredLogs.length} system audit records to CSV.`);
    
    if (typeof setSyncLogs === 'function') {
      setSyncLogs(prev => [
        `System audit trail export completed. (${filteredLogs.length} records)`,
        ...prev
      ]);
    }
  };

  // Action: Create Member
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.title) return;

    const randomAvatar = [
      '/images/african_woman_portrait_1_1784708232425.jpg',
      '/images/african_woman_portrait_2_1784708246407.jpg',
      '/images/african_woman_portrait_3_1784708258772.jpg',
      '/images/african_woman_portrait_4_1784708270262.jpg',
      '/images/african_woman_entrepreneur_portrait_1784664054544.jpg'
    ][Math.floor(Math.random() * 5)];

    const generatedId = `member-custom-${Date.now()}`;
    const newMemberEntry: Member = {
      id: generatedId,
      name: newMember.name,
      avatar: randomAvatar,
      title: newMember.title,
      city: newMember.city || 'Nairobi',
      rank: newMember.rank,
      skills: newMember.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: newMember.interests.split(',').map(s => s.trim()).filter(Boolean),
      bio: newMember.bio || 'Cooperative sister on the Be Independent Gal platform.',
      points: newMember.points,
      badges: [],
      business_stage: newMember.businessStage,
      mentoring_capacity: newMember.mentoringCapacity
    };

    setMembers(prev => [...prev, newMemberEntry]);
    setShowAddMemberModal(false);
    
    // Create direct default greeting notification
    setNotifications(prev => [
      { id: `not-new-member-${Date.now()}`, title: `🤝 Welcoming our newest member ${newMember.name} as a ${newMember.rank}!`, read: false },
      ...prev
    ]);

    setSyncLogs(prev => [
      `Created new sister member profile: "${newMember.name}" with ID: ${generatedId}.`,
      ...prev
    ]);

    // Reset Form
    setNewMember({
      name: '',
      title: '',
      city: '',
      rank: 'Learner',
      bio: '',
      skills: '',
      interests: '',
      businessStage: 'Idea Stage',
      mentoringCapacity: 'Seeking Match',
      points: 100
    });
  };

  // Action: Delete/Deactivate Member
  const handleDeleteMember = (id: string, name: string) => {
    if (id === currentUser.id) {
      alert("Cannot delete your own active super admin profile!");
      return;
    }
    
    if (confirm(`Are you sure you want to deactivate and remove sister "${name}" from the network?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      setSyncLogs(prev => [
        `Deactivated and purged member "${name}" (ID: ${id}) from local database.`,
        ...prev
      ]);
    }
  };

  // Action: Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    const createdEvent: Event = {
      id: `event-custom-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time || '10:00 AM',
      location: newEvent.location || 'Online Virtual',
      type: newEvent.type,
      attendees: Math.floor(Math.random() * 20) + 5,
      rsvped: false,
      description: newEvent.description || 'Exclusive community interactive session.'
    };

    setEvents(prev => [...prev, createdEvent]);
    setShowAddEventModal(false);

    // Platform notification
    setNotifications(prev => [
      { id: `not-new-event-${Date.now()}`, title: `📅 New ${newEvent.type} scheduled: "${newEvent.title}" on ${newEvent.date}!`, read: false },
      ...prev
    ]);

    setSyncLogs(prev => [
      `Created platform-wide event: "${newEvent.title}" (Date: ${newEvent.date}).`,
      ...prev
    ]);

    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'workshop',
      description: ''
    });
  };

  // Action: Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Remove event "${title}" from the platform roster?`)) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setSyncLogs(prev => [
        `Removed event "${title}" from platform calendar.`,
        ...prev
      ]);
    }
  };

  // Action: Create Challenge
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description) return;

    const createdChallenge: Challenge = {
      id: `challenge-custom-${Date.now()}`,
      title: newChallenge.title,
      description: newChallenge.description,
      reward: newChallenge.reward,
      progress: 0,
      completed: false,
      badge: newChallenge.badge,
      category: newChallenge.category
    };

    setChallenges(prev => [...prev, createdChallenge]);
    setShowAddChallengeModal(false);

    setNotifications(prev => [
      { id: `not-new-challenge-${Date.now()}`, title: `🔥 New weekly challenge posted in the ${newChallenge.category} circle!`, read: false },
      ...prev
    ]);

    setSyncLogs(prev => [
      `Added weekly challenge: "${newChallenge.title}" with reward: ${newChallenge.reward}.`,
      ...prev
    ]);

    setNewChallenge({
      title: '',
      description: '',
      reward: '50 Pts',
      category: 'learn',
      badge: 'trailblazer'
    });
  };

  // Action: Delete Challenge
  const handleDeleteChallenge = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove weekly challenge "${title}"?`)) {
      setChallenges(prev => prev.filter(c => c.id !== id));
      setSyncLogs(prev => [
        `Deleted challenge "${title}" from the roster.`,
        ...prev
      ]);
    }
  };

  // Action: Send Broadcast Notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    // Build notification text
    const prefix = broadcastType === 'alert' ? '⚠️ SYSTEM ALERT: ' : broadcastType === 'badge' ? '🏆 SISTERHOOD AWARD: ' : '📣 BROADCAST: ';
    const fullTitle = `${prefix}${broadcastMessage}`;

    setNotifications(prev => [
      { id: `broadcast-${Date.now()}`, title: fullTitle, read: false },
      ...prev
    ]);

    // Log the activity to the global audit log
    logActivity(
      'Global Broadcast', 
      `Sent ${broadcastType} announcement to ${broadcastTarget}: "${broadcastMessage}"`
    );

    setBroadcastSuccess(true);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(false), 4000);

    setSyncLogs(prev => [
      `Pushed global system broadcast to notifications list. Type: ${broadcastType}.`,
      ...prev
    ]);
  };

  // Action: Download JSON Backup
  const handleDownloadBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      creator: currentUser.name,
      members: members.map(m => m.id === currentUser.id ? { ...m, points: userPoints, badges: userBadges } : m),
      events,
      challenges,
      posts,
      notifications
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `be_independent_gal_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);

    setSyncLogs(prev => [
      `Generated state backup JSON and prompted file download.`,
      ...prev
    ]);
  };

  // Action: Simulate Cloud Synchronization Refresh
  const handleSimulateSync = () => {
    if (isSimulatingSync) return;
    setIsSimulatingSync(true);

    const steps = [
      'Authenticating secure admin tunnel credentials...',
      'Initiating connection handshake with backend container node...',
      'Comparing local JSON schemas with active SQL metadata definitions...',
      `Uploading delta tables for ${members.length} members & ${events.length} events...`,
      'Synchronizing global points leaderboard metrics...',
      'Cloud Synchronization Complete! All tables are green and live.'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSyncLogs(prev => [step, ...prev]);
        if (index === steps.length - 1) {
          setIsSimulatingSync(false);
        }
      }, (index + 1) * 600);
    });
  };

  // Action: Reset platform defaults
  const handleResetDefaults = () => {
    if (confirm("Reset ALL local changes, members, custom events, and points back to initial seed data?")) {
      localStorage.removeItem('big_v2_members');
      localStorage.removeItem('big_v2_events');
      localStorage.removeItem('big_v2_challenges');
      localStorage.removeItem('big_v2_posts');
      localStorage.removeItem('big_v2_conversations');
      localStorage.removeItem('big_v2_user_points');
      localStorage.removeItem('big_v2_user_badges');
      localStorage.removeItem('big_v2_notifications');
      
      alert("Local Cache reset successfully! Refreshing view...");
      window.location.reload();
    }
  };

  // Action: Approve Circle Request
  const handleApproveCircleRequest = (requestId: string) => {
    const request = circleRequests.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === 'create') {
      const newCircle: Circle = {
        id: `circle-${Date.now()}`,
        name: request.circleName,
        description: request.description,
        category: request.category as any,
        memberCount: 1,
        image: '/images/african_women_community_circle_1784704135356.jpg',
        createdBy: request.userId,
        isJoined: true,
        moderators: [request.userId],
        rules: ['Respect sisters', 'No spam', 'Support each other'],
        permissions: {
          whoCanPost: 'anyone',
          whoCanInvite: 'anyone',
          isPrivate: false
        }
      };

      setCircles(prev => [...prev, newCircle]);
      setNotifications(prev => [
        { id: `not-circle-approved-${Date.now()}`, title: `🎉 Great news! The circle "${request.circleName}" has been approved and is now live!`, read: false },
        ...prev
      ]);
      logActivity('Circle Created', `Circle "${request.circleName}" created by ${request.userName}`);
      setSyncLogs(prev => [
        `Approved circle creation request: "${request.circleName}" by ${request.userName}.`,
        ...prev
      ]);
    } else if (request.type === 'join') {
      setCircles(prev => prev.map(c => c.id === request.circleId ? { ...c, memberCount: (c.memberCount || 0) + 1, isJoined: c.id === request.circleId && request.userId === currentUser.id ? true : c.isJoined } : c));
      setNotifications(prev => [
        { id: `not-join-approved-${Date.now()}`, title: `✅ ${request.userName}'s request to join ${request.circleName} has been approved.`, read: false },
        ...prev
      ]);
      logActivity('Circle Join Approved', `Join request for ${request.circleName} by ${request.userName} approved.`);
      setSyncLogs(prev => [
        `Approved join request for "${request.circleName}" by ${request.userName}.`,
        ...prev
      ]);
    }

    setCircleRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
  };

  // Action: Reject Circle Request
  const handleRejectCircleRequest = (requestId: string) => {
    setCircleRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    setSyncLogs(prev => [
      `Rejected circle request with ID: ${requestId}.`,
      ...prev
    ]);
  };

  // Action: Delete Circle
  const handleDeleteCircle = (circleId: string, name: string) => {
    if (confirm(`CRITICAL: Are you sure you want to PERMANENTLY DELETE the "${name}" circle? This will remove all posts and memberships.`)) {
      setCircles(prev => prev.filter(c => c.id !== circleId));
      setPosts(prev => prev.filter(p => p.circleId !== circleId));
      setSyncLogs(prev => [
        `Permanently deleted circle: "${name}" (ID: ${circleId}).`,
        ...prev
      ]);
    }
  };

  // Action: Suspend Circle
  const handleSuspendCircle = (circleId: string, name: string, isCurrentlySuspended: boolean) => {
    setCircles(prev => prev.map(c => c.id === circleId ? { ...c, isSuspended: !isCurrentlySuspended } : c));
    setSyncLogs(prev => [
      `${isCurrentlySuspended ? 'Restored' : 'Suspended'} circle: "${name}" (ID: ${circleId}).`,
      ...prev
    ]);
  };

  return (
    <div id="super-admin-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[150] bg-slate-900 border border-slate-800 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2.5 animate-slide-up">
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}
      
      {/* ADMING HEADER STRIP */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Abstract vector ring graphic */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary/20 border border-secondary/30 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Super Admin Authorized
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                supabaseConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {supabaseConnected ? 'Cloud Active' : 'Offline Mode'}
              </span>

              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                apiStatus === 'healthy' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 
                apiStatus === 'unhealthy' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                <Wifi className={`h-3 w-3 ${apiStatus === 'checking' ? 'animate-pulse' : ''}`} />
                API: {apiStatus === 'healthy' ? 'Healthy' : apiStatus === 'unhealthy' ? 'Down' : 'Checking...'}
              </span>

              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                dbStatus === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                dbStatus === 'unhealthy' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                <Database className={`h-3 w-3 ${dbStatus === 'checking' ? 'animate-pulse' : ''}`} />
                DB: {dbStatus === 'healthy' ? 'Connected' : dbStatus === 'unhealthy' ? 'Error' : 'Checking...'}
              </span>

              {apiLatency !== null && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-white/5 text-slate-400 border border-white/10">
                  <Activity className="h-3 w-3" />
                  {apiLatency}ms
                </span>
              )}

              {lastChecked && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-white/5 text-slate-400 border border-white/10">
                  <Clock className="h-3 w-3" />
                  Last check: {lastChecked}
                </span>
              )}
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight">
              Galactic Super Admin Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Platform-wide moderation and insights interface. Regulate point balances, add bespoke events & challenges, deploy site notices, and view system analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={handleDownloadBackup}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
            >
              <FileDown className="h-4 w-4" />
              <span>{backupSuccess ? 'Downloaded!' : 'JSON Backup'}</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="rounded-xl bg-secondary hover:brightness-110 px-4 py-2.5 text-xs font-bold text-white transition-all flex items-center gap-1"
            >
              <span>Exit Admin</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK METRICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Members</p>
            <p className="text-2xl font-black text-slate-900">{totalRegisteredMembers.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Posts Today</p>
            <p className="text-2xl font-black text-slate-900">{activePostsToday.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pending Requests</p>
            <p className="text-2xl font-black text-slate-900">{totalPendingRequests.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* SIGNUPS ANALYTICS CHART */}
      <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">New Signups</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last 7 Days Growth</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase">Live Analytics</span>
          </div>
        </div>
        
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signupsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="signups" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-8 space-y-1 rounded-3xl border border-slate-150 bg-white p-4 shadow-sm">
            <div className="mb-4 px-4 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Admin Control Panel</p>
            </div>
            
            <nav className="space-y-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-secondary text-white shadow-md shadow-secondary/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4.5 w-4.5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      activeTab === item.id ? 'bg-white text-secondary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-slate-100 px-4 pb-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Platform Health</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sync Status</p>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600">ONLINE</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total Points Circulating</p>
                  <p className="text-xl font-black text-primary">{totalPointsCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* SYSTEM ALERTS FOR ADMINS */}
          {circleRequests.filter(r => r.status === 'pending').length > 0 && (
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-amber-800">Automated System Notification</p>
                  <p className="text-[11px] font-bold text-amber-700">
                    There are {circleRequests.filter(r => r.status === 'pending').length} new circle creation requests awaiting your review.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('circles')}
                className="rounded-xl bg-amber-200 hover:bg-amber-300 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-900 transition-all"
              >
                Review Now
              </button>
            </div>
          )}

          {/* METRIC CARD ROW */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { 
                label: 'Total Members', 
                value: totalMembersCount, 
                trend: '↑ 12% this week', 
                isUp: true, 
                icon: Users,
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-100'
              },
              { 
                label: 'Active Circles', 
                value: circles.length, 
                trend: '↑ 2 new today', 
                isUp: true, 
                icon: CircleDot,
                color: 'text-rose-600',
                bgColor: 'bg-rose-50',
                borderColor: 'border-rose-100'
              },
              { 
                label: 'Pending Reports', 
                value: reportedUserIds.length, 
                trend: '↓ 5% vs last week', 
                isUp: false, 
                icon: AlertCircle,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-100'
              }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className={`group relative rounded-3xl border ${stat.borderColor} bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
              >
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-2xl ${stat.bgColor} p-3 ${stat.color} transition-transform group-hover:scale-110`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {stat.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{stat.trend.split(' ')[0]}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-heading text-3xl font-black text-slate-900">{stat.value}</p>
                      <span className="text-[10px] font-bold text-slate-400 lowercase">{stat.trend.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative background element */}
                <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${stat.bgColor} opacity-20 blur-2xl transition-all group-hover:scale-150`} />
              </div>
            ))}
          </div>

          {/* VIEWPORT AREA */}
          <div className="space-y-6">
        
        {/* TAB 1: ANALYTICS & INSIGHTS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: Circle Post distributions */}
            <div className="md:col-span-2 rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                <PieChart className="h-4.5 w-4.5 text-secondary" />
                <span>Discussion Forums & Circle Activity Rates</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Calculated by the ratio of posts, comments, and resources submitted across each specialized sisterhood hub.
              </p>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Learn', posts: postsByCircle.learn || 3, color: '#4f46e5' },
                      { name: 'Connect', posts: postsByCircle.connect || 4, color: '#f43f5e' },
                      { name: 'Earn', posts: postsByCircle.earn || 2, color: '#f59e0b' },
                      { name: 'Thrive', posts: postsByCircle.thrive || 2, color: '#ec4899' },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="posts" radius={[6, 6, 0, 0]}>
                      {[
                        { name: 'Learn', color: '#4f46e5' },
                        { name: 'Connect', color: '#f43f5e' },
                        { name: 'Earn', color: '#f59e0b' },
                        { name: 'Thrive', color: '#ec4899' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border-t pt-4 grid grid-cols-3 text-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">Total Posts</span>
                  <p className="font-heading text-lg font-black text-primary">{posts.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">Total Feed Comments</span>
                  <p className="font-heading text-lg font-black text-primary">
                    {posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">Avg Engagement Rate</span>
                  <p className="font-heading text-lg font-black text-emerald-600">84.2%</p>
                </div>
              </div>
            </div>

            {/* Right: Points Growth Area Chart */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-secondary" />
                <span>Points Generation Velocity</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Community-wide points accumulation trend over the past 7 active platform days.
              </p>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: 'Mon', pts: 400 },
                      { day: 'Tue', pts: 700 },
                      { day: 'Wed', pts: 600 },
                      { day: 'Thu', pts: 1100 },
                      { day: 'Fri', pts: 950 },
                      { day: 'Sat', pts: 1400 },
                      { day: 'Sun', pts: totalPointsCount / 10 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="pts" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Regional breakdown summary instead of long progress bars */}
              <div className="pt-2 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Regional Distribution</p>
                {[
                  { name: 'Nairobi', count: members.filter(m => m.city === 'Nairobi').length || 4, color: 'bg-primary' },
                  { name: 'Kampala', count: members.filter(m => m.city === 'Kampala').length || 2, color: 'bg-secondary' },
                  { name: 'Dar es Salaam', count: members.filter(m => m.city === 'Dar es Salaam').length || 1, color: 'bg-amber-500' },
                ].map((city, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                       <div className={`h-2 w-2 rounded-full ${city.color}`} />
                       <span className="font-bold text-primary">{city.name}</span>
                    </div>
                    <span className="font-black text-slate-500">{city.count} sisters</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MEMBERS & DIRECTORY MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Filter tool ribbon */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-primary">
                    Platform Sisterhood Registrations ({members.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify account stages, adjust points manually, add badges, or remove/deactivate spam accounts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={handleExportCSV}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="rounded-xl bg-secondary hover:brightness-110 text-white px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Register Sister</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search sister by name, email, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                  />
                </div>

                <select
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs text-primary font-semibold focus:border-secondary focus:outline-none bg-slate-50/50"
                >
                  <option value="all">🔍 Filter by Rank</option>
                  <option value="Learner">Learner</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Member">Member</option>
                  <option value="Connector">Connector</option>
                  <option value="Community Lead">Community Lead</option>
                </select>

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs text-primary font-semibold focus:border-secondary focus:outline-none bg-slate-50/50"
                >
                  <option value="all">📍 Filter by City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* BATCH ACTIONS TOOLBAR */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={selectedMemberIds.length > 0 && selectedMemberIds.length === filteredMembers.filter(m => m.id !== currentUser.id).length}
                      onChange={handleSelectAllFiltered}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:border-secondary checked:bg-secondary transition-all"
                    />
                    <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                    {selectedMemberIds.length > 0 ? `${selectedMemberIds.length} Selected` : 'Select All Sisters'}
                  </span>
                </label>

                {selectedMemberIds.length > 0 && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <button
                      onClick={() => setShowBulkBroadcastModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-secondary text-white shadow-sm hover:brightness-110 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Broadcast</span>
                    </button>
                    <button
                      onClick={handleBulkResetPermissions}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Reset Permissions</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Accounts</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BULK BROADCAST MODAL */}
            {showBulkBroadcastModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-heading text-xl font-black text-primary">Bulk Broadcast</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Messaging {selectedMemberIds.length} Selected Sisters
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowBulkBroadcastModal(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleBulkBroadcast} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Your Message</label>
                      <textarea
                        required
                        placeholder="Type your message to the selected sisters..."
                        value={bulkBroadcastMessage}
                        onChange={(e) => setBulkBroadcastMessage(e.target.value)}
                        className="w-full min-h-[120px] rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-primary focus:border-secondary focus:ring-0 transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkBroadcastModal(false)}
                        className="flex-1 rounded-2xl border-2 border-slate-100 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] rounded-2xl bg-secondary py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Deliver Message</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MEMBER REGISTER MODAL */}
            {showAddMemberModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-heading text-base font-extrabold text-primary flex items-center gap-1.5">
                      <PlusCircle className="h-5 w-5 text-secondary" />
                      <span>Register a New Sister Member</span>
                    </h3>
                    <button 
                      onClick={() => setShowAddMemberModal(false)}
                      className="rounded-full p-1 hover:bg-slate-100 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mercy Atieno"
                          value={newMember.name}
                          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Startup Title / Venture *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CEO of AgriTech Nairobi"
                          value={newMember.title}
                          onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Metropolitan City Hub</label>
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Kampala, Dar es Salaam"
                          value={newMember.city}
                          onChange={(e) => setNewMember({ ...newMember, city: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Community Network Rank</label>
                        <select
                          value={newMember.rank}
                          onChange={(e) => setNewMember({ ...newMember, rank: e.target.value as Member['rank'] })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        >
                          <option value="Learner">Learner</option>
                          <option value="Mentor">Mentor</option>
                          <option value="Member">Member</option>
                          <option value="Connector">Connector</option>
                          <option value="Community Lead">Community Lead</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Venture Business Stage</label>
                        <select
                          value={newMember.businessStage}
                          onChange={(e) => setNewMember({ ...newMember, businessStage: e.target.value as any })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        >
                          <option value="Idea Stage">Idea Stage</option>
                          <option value="Early Stage">Early Stage</option>
                          <option value="Growth Stage">Growth Stage</option>
                          <option value="Established">Established</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Mentoring Cohort Status</label>
                        <select
                          value={newMember.mentoringCapacity}
                          onChange={(e) => setNewMember({ ...newMember, mentoringCapacity: e.target.value as any })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                        >
                          <option value="Seeking Match">Seeking Match</option>
                          <option value="Open">Open</option>
                          <option value="Limited">Limited</option>
                          <option value="No Capacity">No Capacity</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Skills (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Marketing, Financial Modeling, Web Dev"
                        value={newMember.skills}
                        onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                        className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Personal Interests (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Organic farming, Green tech, Microloans"
                        value={newMember.interests}
                        onChange={(e) => setNewMember({ ...newMember, interests: e.target.value })}
                        className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Sister Biography</label>
                      <textarea
                        rows={3}
                        placeholder="Tell the sisterhood briefly about her venture and mission..."
                        value={newMember.bio}
                        onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                        className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Initial Welcome Points Balance</label>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={newMember.points}
                        onChange={(e) => setNewMember({ ...newMember, points: parseInt(e.target.value, 10) || 100 })}
                        className="w-full rounded-xl border p-2.5 bg-slate-50/50 text-xs focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-secondary hover:brightness-110 text-white font-bold py-2.5 text-center text-xs transition-all"
                      >
                        Register Sister & Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMemberModal(false)}
                        className="rounded-xl border border-slate-200 hover:bg-slate-50 font-bold py-2.5 px-4 text-center text-xs transition-all text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* DIRECTORY LIST FOR MODERATION */}
            <div className="grid grid-cols-1 gap-4">
              {filteredMembers.map((member) => {
                const isYou = member.id === currentUser.id;
                const displayName = isYou ? currentUser.name : member.name;
                const displayTitle = isYou ? currentUser.title : member.title;
                const displayCity = isYou ? currentUser.city : member.city;
                const displayRank = isYou ? currentUser.rank : member.rank;
                const displayPoints = isYou ? userPoints : member.points;
                const displayBadges = isYou ? userBadges : member.badges || [];

                return (
                  <div 
                    key={member.id}
                    className={`rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 sm:p-5 shadow-sm hover:shadow-md ${
                      selectedMemberIds.includes(member.id) 
                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/10' 
                        : 'border-slate-150 bg-white'
                    }`}
                  >
                    {/* Member Header Info */}
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="pt-1">
                        {!isYou ? (
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox"
                              checked={selectedMemberIds.includes(member.id)}
                              onChange={() => toggleMemberSelection(member.id)}
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:border-secondary checked:bg-secondary transition-all"
                            />
                            <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-lg border-2 border-slate-100 bg-slate-50 cursor-not-allowed" />
                        )}
                      </div>

                      <img 
                        src={member.avatar || null} 
                        alt={displayName}
                        className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-primary/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-extrabold text-primary flex items-center gap-1">
                            {displayName}
                            {isYou && (
                              <span className="rounded bg-slate-100 text-slate-800 text-[8px] font-extrabold uppercase px-1">You</span>
                            )}
                          </h4>
                          
                          <select
                            value={displayRank}
                            onChange={(e) => updateMemberRank(member.id, e.target.value as Member['rank'])}
                            className="bg-slate-50 hover:bg-slate-100 border text-[9px] font-black uppercase tracking-wider text-slate-600 rounded px-1 py-0.5 focus:outline-none shrink-0"
                          >
                            <option value="Learner">Learner</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Member">Member</option>
                            <option value="Connector">Connector</option>
                            <option value="Community Lead">Community Lead</option>
                          </select>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 leading-snug">{displayTitle}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-400 font-extrabold">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-secondary" />
                            {displayCity}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-primary">
                            <Award className="h-3 w-3 text-amber-500" />
                            {displayPoints} points
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member points & badge actions */}
                    <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                      
                      {/* Badge Selection Tray */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Sponsor Badges</span>
                        <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-md">
                          {AVAILABLE_BADGES.map(badge => {
                            const isAssigned = displayBadges.includes(badge);
                            return (
                              <button
                                key={badge}
                                onClick={() => toggleBadge(member.id, badge)}
                                className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase transition-colors border ${
                                  isAssigned 
                                    ? 'bg-secondary text-white border-secondary' 
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={`${isAssigned ? 'Revoke' : 'Award'} ${badge.replace('_', ' ')}`}
                              >
                                {badge.slice(0, 4)}..
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Points quick incrementer */}
                      <div className="space-y-1 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Award Points</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustPoints(member.id, 10)}
                            className="rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-150 font-bold px-2 py-1 text-[10px]"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => adjustPoints(member.id, 50)}
                            className="rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-150 font-bold px-2 py-1 text-[10px]"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => adjustPoints(member.id, -20)}
                            className="rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-150 font-bold px-2 py-1 text-[10px]"
                            title="Deduct 20 Points"
                          >
                            -20
                          </button>
                        </div>
                      </div>

                      {/* Purge member */}
                      <button
                        onClick={() => handleDeleteMember(member.id, displayName)}
                        className={`p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ${isYou ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Purge profile"
                        disabled={isYou}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400 bg-white text-xs font-semibold">
                  No sister accounts found matching your query.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PLATFORM EVENTS & CHALLENGES PLANNED */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Events management */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-secondary" />
                    <span>Manage Roster Events ({events.length})</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Add new workshops or summits that show up immediately inside the Events tab.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="rounded-xl bg-secondary hover:brightness-110 text-white p-2 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create</span>
                </button>
              </div>

              {/* EVENT MODAL */}
              {showAddEventModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-heading text-sm font-extrabold text-primary">
                        Schedule a Sisterhood Event
                      </h3>
                      <button onClick={() => setShowAddEventModal(false)} className="rounded-full p-1 hover:bg-slate-100 text-slate-400">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Event Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nairobi Agritech Pitch Workshop"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Date *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. July 24, 2026"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 2:00 PM EAT"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Virtual Zoom or Town Hall"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Event Type</label>
                          <select
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          >
                            <option value="workshop">workshop</option>
                            <option value="meetup">meetup</option>
                            <option value="webinar">webinar</option>
                            <option value="retreat">retreat</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Session Description</label>
                        <textarea
                          rows={3}
                          placeholder="What will sisters learn or discuss in this event..."
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-secondary text-white font-bold py-2.5 text-center text-xs"
                        >
                          Publish Event
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(false)}
                          className="rounded-xl border hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 text-center text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* EVENTS LIST */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {events.map(event => (
                  <div 
                    key={event.id}
                    className="border rounded-xl p-3.5 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded bg-primary text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5">
                          {event.type}
                        </span>
                        <h4 className="font-extrabold text-primary leading-tight">{event.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span>📅 {event.date} • {event.time}</span>
                        <span>|</span>
                        <span>📍 {event.location}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges management */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-secondary" />
                    <span>Circle Weekly Challenges ({challenges.length})</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Sponsor specialized metrics for the four pillars (Learn, Connect, Earn, Thrive).
                  </p>
                </div>
                <button
                  onClick={() => setShowAddChallengeModal(true)}
                  className="rounded-xl bg-secondary hover:brightness-110 text-white p-2 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Post Challenge</span>
                </button>
              </div>

              {/* CHALLENGE MODAL */}
              {showAddChallengeModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-heading text-sm font-extrabold text-primary">
                        Add Weekly Challenge Task
                      </h3>
                      <button onClick={() => setShowAddChallengeModal(false)} className="rounded-full p-1 hover:bg-slate-100 text-slate-400">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Challenge Goal/Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Schedule a co-working date with a new sister"
                          value={newChallenge.title}
                          onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Circle Category</label>
                          <select
                            value={newChallenge.category}
                            onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value as any })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          >
                            <option value="learn">learn</option>
                            <option value="connect">connect</option>
                            <option value="earn">earn</option>
                            <option value="thrive">thrive</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">Points Reward</label>
                          <input
                            type="text"
                            placeholder="e.g. 50 Pts"
                            value={newChallenge.reward}
                            onChange={(e) => setNewChallenge({ ...newChallenge, reward: e.target.value })}
                            className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-600 block">Associated Leaderboard Badge ID</label>
                        <select
                          value={newChallenge.badge}
                          onChange={(e) => setNewChallenge({ ...newChallenge, badge: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                        >
                          {AVAILABLE_BADGES.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Task Criteria & Guide</label>
                        <textarea
                          rows={3}
                          placeholder="Guide sisters how to achieve this task successfully..."
                          value={newChallenge.description}
                          onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                          className="w-full rounded-xl border p-2.5 bg-slate-50/50 focus:border-secondary focus:outline-none text-xs"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-secondary text-white font-bold py-2.5 text-center text-xs"
                        >
                          Publish Challenge
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddChallengeModal(false)}
                          className="rounded-xl border hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 text-center text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* CHALLENGES LIST */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {challenges.map(challenge => (
                  <div 
                    key={challenge.id}
                    className="border rounded-xl p-3.5 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded bg-secondary text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5">
                          {challenge.category}
                        </span>
                        <h4 className="font-extrabold text-primary leading-tight">{challenge.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{challenge.description}</p>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-secondary">
                        <span>🎁 Reward: {challenge.reward}</span>
                        <span>•</span>
                        <span>⭐ Badge: {challenge.badge}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteChallenge(challenge.id, challenge.title)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SYSTEM BROADCAST announcements */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Draft form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                      <Radio className="h-5 w-5 text-primary animate-pulse" />
                      <span>Global Command Center</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                      Dispatch platform-wide alerts & announcements
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    broadcastType === 'alert' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    broadcastType === 'badge' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {broadcastType === 'alert' ? 'High Priority' : broadcastType === 'badge' ? 'Achievement' : 'Standard Broadcast'}
                  </div>
                </div>

                {broadcastSuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-950 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm uppercase tracking-tight">Signal Broadcasted!</h5>
                      <p className="text-[11px] text-slate-600 font-medium">Every active terminal in the sisterhood network has received your transmission.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        Transmission Type
                      </label>
                      <select
                        value={broadcastType}
                        onChange={(e) => setBroadcastType(e.target.value as any)}
                        className="w-full rounded-2xl border-2 border-slate-100 p-3 bg-slate-50/50 focus:border-primary focus:bg-white focus:outline-none transition-all text-xs font-bold"
                      >
                        <option value="info">📢 General Announcement</option>
                        <option value="alert">⚠️ Urgent System Alert</option>
                        <option value="badge">🏆 Community Achievement</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        Target Audience
                      </label>
                      <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value as any)}
                        className="w-full rounded-2xl border-2 border-slate-100 p-3 bg-slate-50/50 focus:border-primary focus:bg-white focus:outline-none transition-all text-xs font-bold"
                      >
                        <option value="all">Global (All Sisters)</option>
                        <option value="mentors">Mentors Only</option>
                        <option value="learners">Learner Cohorts</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3" />
                        Message Payload
                      </span>
                      <span className={`${broadcastMessage.length > 100 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {broadcastMessage.length}/120
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      maxLength={120}
                      required
                      placeholder="Enter your transmission content here..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 p-4 bg-slate-50/50 focus:border-primary focus:bg-white focus:outline-none transition-all leading-relaxed text-sm font-medium"
                    />
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Activity className="h-20 w-20 text-white" />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Transmission Preview
                    </h4>
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        broadcastType === 'alert' ? 'bg-rose-500/20 text-rose-400' :
                        broadcastType === 'badge' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {broadcastType === 'alert' ? <AlertTriangle className="h-5 w-5" /> : 
                         broadcastType === 'badge' ? <Trophy className="h-5 w-5" /> : 
                         <Bell className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-white text-xs font-black uppercase tracking-tight">
                          {broadcastType === 'alert' ? 'System Alert' : 
                           broadcastType === 'badge' ? 'Achievement Unlocked' : 
                           'Admin Announcement'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1 font-medium italic">
                          "{broadcastMessage || 'Your message will appear here...'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-2xl bg-primary hover:bg-primary/90 text-white font-black py-4 px-8 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-[10px]"
                  >
                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Execute Broadcast
                  </button>
                </form>
              </div>
            </div>

            {/* Notification logs history */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-sm font-black text-slate-900 flex items-center gap-2 mb-6">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Transmission History</span>
                </h3>

                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300 mb-3">
                        <Radio className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No signals recorded</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                            {notif.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Sent: Just Now</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Delivered</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Shield className="h-32 w-32" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-2">Network Status</h4>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold opacity-80">Sisters Online</span>
                    <span className="font-black">1,248</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full w-[85%]" />
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed opacity-90">
                    Transmission efficiency is currently at 98.4%. All global nodes are responding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CIRCLES & REQUESTS */}
        {activeTab === 'circles' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Col: Pending Requests */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                      <PlusCircle className="h-4.5 w-4.5 text-secondary" />
                      <span>Pending Circle Creation Requests</span>
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                      {circleRequests.filter(r => r.status === 'pending').length} Action Required
                    </span>
                  </div>

                  <div className="space-y-4">
                    {circleRequests.filter(r => r.status === 'pending').length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                           <CheckCircle className="h-6 w-6" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium italic">No pending circle requests to review.</p>
                      </div>
                    ) : (
                      circleRequests.filter(r => r.status === 'pending').map((request) => (
                        <div key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-lg">
                                {request.circleName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-primary uppercase tracking-tight">{request.circleName}</h4>
                                <p className="text-[10px] text-slate-500 font-bold">Requested by {request.userName} • {request.timestamp}</p>
                              </div>
                            </div>
                            <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                              {request.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-100">
                            "{request.description}"
                          </p>

                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              onClick={() => handleRejectCircleRequest(request.id)}
                              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all"
                            >
                              Deny Request
                            </button>
                            <button
                              onClick={() => handleApproveCircleRequest(request.id)}
                              className="px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve & Deploy
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Past Requests History */}
                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-heading text-sm font-extrabold text-primary">Resolution History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b text-slate-400 font-black uppercase tracking-widest">
                          <th className="pb-3 pr-4">Circle Name</th>
                          <th className="pb-3 pr-4">Founder</th>
                          <th className="pb-3 pr-4">Decision</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {circleRequests.filter(r => r.status !== 'pending').slice(0, 5).map(r => (
                          <tr key={r.id}>
                            <td className="py-3 font-bold text-primary">{r.circleName}</td>
                            <td className="py-3 text-slate-500 font-semibold">{r.userName}</td>
                            <td className="py-3">
                              <span className={`rounded-full px-2 py-0.5 font-black uppercase tracking-tighter text-[9px] ${
                                r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 font-medium">{r.timestamp.split(',')[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Col: Active Circles Management */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <Radio className="h-4.5 w-4.5 text-secondary" />
                    <span>Global Circle Roster</span>
                  </h3>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search circles..."
                      value={circleSearchQuery}
                      onChange={(e) => setCircleSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:border-secondary focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    {circles
                      .filter(circle => 
                        circle.name.toLowerCase().includes(circleSearchQuery.toLowerCase()) || 
                        circle.description.toLowerCase().includes(circleSearchQuery.toLowerCase())
                      )
                      .map(circle => (
                      <div key={circle.id} className="p-4 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={circle.image || null} className="h-8 w-8 rounded-lg object-cover" alt="" />
                            <div>
                              <p className="text-xs font-black text-primary uppercase tracking-tight truncate max-w-[120px]">{circle.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold">{circle.memberCount} Sisters</p>
                            </div>
                          </div>
                          {circle.isSuspended && (
                            <span className="rounded bg-amber-100 text-amber-600 px-1.5 py-0.5 text-[8px] font-black uppercase">Suspended</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSuspendCircle(circle.id, circle.name, !!circle.isSuspended)}
                            className={`rounded-lg py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${
                              circle.isSuspended 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            {circle.isSuspended ? 'Restore' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteCircle(circle.id, circle.name)}
                            className="rounded-lg bg-rose-50 text-rose-600 border border-rose-100 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                          >
                            Purge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: DATABASE LOGS & SYNC */}
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Sync diagnostics */}
            <div className="md:col-span-2 rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <Database className="h-4.5 w-4.5 text-secondary" />
                    <span>Supabase SQL Diagnostics & Pipeline</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    View active synchronization transactions with regional backend nodes.
                  </p>
                </div>

                <button
                  onClick={handleSimulateSync}
                  disabled={isSimulatingSync}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                    isSimulatingSync 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-slate-800 text-white'
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSimulatingSync ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingSync ? 'Syncing...' : 'Force Sync'}</span>
                </button>
              </div>

              {/* LOG CONTAINER Terminal styled */}
              <div className="rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] p-4 space-y-2 max-h-80 overflow-y-auto shadow-inner border border-slate-800">
                <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-slate-800/80 pb-1.5">
                  <span>TRANS_ID: BIG_TUNNEL_71A</span>
                  <span>NODE: EU-WEST2</span>
                </div>
                {syncLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start leading-relaxed">
                    <span className="text-secondary select-none font-bold">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-slate-50 border p-4 space-y-2">
                <h4 className="font-extrabold text-xs text-primary flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>State Protection Layer (RLS)</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Row Level Security policies prevent unauthorized modifications. The Super Admin authorization key bypasses table policies via the high-trust API proxy layer, guaranteeing transactional consistency.
                </p>
              </div>
            </div>

            {/* Log Retention */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-secondary" />
                <span>Log Retention Policy</span>
              </h3>
              <p className="text-[10px] text-slate-500">Automatically delete logs older than the selected duration.</p>
              <div className="flex flex-wrap gap-2">
                {[30, 60, 90].map(days => (
                  <button 
                    key={days} 
                    onClick={() => setLogRetentionDays(days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${logRetentionDays === days ? 'bg-secondary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    {days} Days
                  </button>
                ))}
                <button 
                    onClick={() => setLogRetentionDays(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${logRetentionDays === null ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    Off
                </button>
              </div>
            </div>

            {/* Quick Maintenance Actions */}
            <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-secondary" />
                <span>System Purge Utilities</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Dangerous actions to purge local client-side memory or trigger clean seed states. Proceed with caution.
              </p>

              <div className="space-y-3.5 pt-1">
                <div className="rounded-xl border border-slate-150 p-4 space-y-2.5 bg-slate-50/50">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Local Storage Purge</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Revert all points, events, and newly created members back to default. This deletes your customized mock members instantly.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="w-full rounded-xl bg-rose-50 border border-rose-150 hover:bg-rose-100 text-rose-700 font-extrabold py-2.5 text-xs transition-colors"
                  >
                    Purge All Local Cache
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-heading text-lg font-black text-primary">Blocked Users</h3>
            <div className="bg-white rounded-2xl border border-slate-150 p-6">
              {blockedUserIds.length === 0 ? <p className="text-sm text-slate-500">No blocked users.</p> : (
                <ul className="space-y-2">
                  {blockedUserIds.map(id => <li key={id} className="p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex justify-between items-center">{id} <button className="text-rose-600 text-[10px] font-bold" onClick={() => setBlockedUserIds(prev => prev.filter(u => u !== id))}>Unblock</button></li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {/* Moderation Settings Panel */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900">Safety & Moderation Policy</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Configure automated guidelines to protect the community. Filter out inappropriate, off-topic, or flagged posts instantly.
                  </p>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    {/* Auto-hide Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Auto-hide reported posts</span>
                        <span className="text-[10px] text-slate-400 font-medium">Filter flagged posts from the timeline automatically</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoHideReported(!autoHideReported);
                          logActivity(
                            'Updated Moderation Settings',
                            `Set 'Auto-hide reported posts' to ${!autoHideReported ? 'Enabled' : 'Disabled'}.`
                          );
                          triggerToast(`Auto-hide reported posts ${!autoHideReported ? 'enabled' : 'disabled'}`, 'info');
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoHideReported ? 'bg-rose-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            autoHideReported ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Report Threshold Counter */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Hiding Report Threshold</span>
                        <span className="text-[10px] text-slate-400 font-medium">Hides post after this number of unique reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (reportThreshold > 1) {
                              setReportThreshold(reportThreshold - 1);
                              logActivity('Updated Moderation Settings', `Set 'Report Threshold' to ${reportThreshold - 1}.`);
                              triggerToast(`Hiding threshold set to ${reportThreshold - 1}`, 'info');
                            }
                          }}
                          disabled={reportThreshold <= 1}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-50 disabled:opacity-50 text-slate-700"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-900 w-5 text-center">{reportThreshold}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReportThreshold(reportThreshold + 1);
                            logActivity('Updated Moderation Settings', `Set 'Report Threshold' to ${reportThreshold + 1}.`);
                            triggerToast(`Hiding threshold set to ${reportThreshold + 1}`, 'info');
                          }}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-50 text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Tabs Selection */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setReportsSubTab('posts')}
                className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  reportsSubTab === 'posts'
                    ? 'border-rose-500 text-rose-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Reported Posts ({posts.filter(p => (p as any).isReported).length})</span>
              </button>
              <button
                onClick={() => setReportsSubTab('users')}
                className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  reportsSubTab === 'users'
                    ? 'border-rose-500 text-rose-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Reported Users ({reportedUserIds.length})</span>
              </button>
            </div>

            {/* Tab content */}
            {reportsSubTab === 'users' ? (
              <div className="bg-white rounded-2xl border border-slate-150 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-slate-800">Flagged Members</h4>
                  {reportedUserIds.length > 0 && (
                    <button
                      onClick={() => {
                        setReportedUserIds([]);
                        logActivity('Cleared User Reports', 'Cleared all reported users logs.');
                        triggerToast('All user reports cleared', 'success');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                    >
                      Clear All Reports
                    </button>
                  )}
                </div>
                {reportedUserIds.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="h-11 w-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <Users className="h-5.5 w-5.5" />
                    </div>
                    <p className="text-xs text-slate-500">No reported users currently. All sisters are behaving wonderfully!</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {reportedUserIds.map((id, index) => {
                      const matchedMember = members.find(m => m.id === id);
                      return (
                        <li key={`${id}-${index}`} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {matchedMember?.name.charAt(0) || id.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800">{matchedMember?.name || id}</span>
                              <span className="text-[10px] text-slate-400 block">{matchedMember?.title || 'Sisterhood Member'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setReportedUserIds(prev => prev.filter(u => u !== id));
                                logActivity('Dismissed User Report', `Dismissed reports for user: ${id}.`);
                                triggerToast('User report dismissed', 'success');
                              }}
                              className="text-slate-500 text-[10px] font-bold px-2.5 py-1.5 hover:bg-slate-200/50 rounded-lg"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => {
                                setBlockedUserIds(prev => [...prev, id]);
                                setReportedUserIds(prev => prev.filter(u => u !== id));
                                logActivity('Blocked Reported User', `Blocked user: ${id} following community report review.`);
                                triggerToast('Member blocked successfully', 'success');
                              }}
                              className="text-rose-600 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg"
                            >
                              Block Member
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              // Reported Posts Section
              <div className="space-y-4">
                {posts.filter(p => (p as any).isReported).length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Feed Moderation Clear</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      No posts have been reported by community members. Our sisterhood network remains clean and supportive!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.filter(p => (p as any).isReported).map((post) => {
                      const reportsList = (post as any).reports || [];
                      const count = (post as any).reportCount || (reportsList.length > 0 ? reportsList.length : 1);
                      const isPostHidden = autoHideReported && count >= reportThreshold;

                      return (
                        <div key={post.id} className={`bg-white rounded-3xl border ${isPostHidden ? 'border-rose-200/60 bg-rose-50/5' : 'border-slate-150'} overflow-hidden shadow-xs transition-all`}>
                          {/* Visibility Banner if Hidden */}
                          {isPostHidden && (
                            <div className="bg-rose-50 px-6 py-2 border-b border-rose-100 flex items-center justify-between">
                              <span className="text-[10px] font-black text-rose-700 tracking-wider uppercase flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" />
                                Automatically Hidden (Exceeded Threshold of {reportThreshold} reports)
                              </span>
                              <span className="text-[10px] text-rose-500 font-bold bg-rose-100/40 px-2 py-0.5 rounded-full">
                                {count} {count === 1 ? 'Report' : 'Reports'}
                              </span>
                            </div>
                          )}

                          <div className="p-6">
                            {/* Author Row */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={post.author.avatar || '/images/african_woman_portrait_1_1784708232425.jpg'}
                                  alt={post.author.name}
                                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <span className="text-xs font-black text-slate-900 block">{post.author.name}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{post.author.rank} • {post.timestamp}</span>
                                </div>
                              </div>
                              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${isPostHidden ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                {count} {count === 1 ? 'Report' : 'Reports'}
                              </span>
                            </div>

                            {/* Post Content */}
                            <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                              <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                                "{post.content}"
                              </p>
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt="Post Attachment"
                                  className="mt-3 rounded-xl max-h-40 object-cover border border-slate-200"
                                />
                              )}
                            </div>

                            {/* Reports List breakdown */}
                            <div className="mt-4 space-y-2">
                              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reports Breakdown</h5>
                              
                              {reportsList.length === 0 ? (
                                <div className="p-3 bg-rose-50/30 border border-rose-100/50 rounded-xl">
                                  <span className="text-xs font-bold text-rose-950 block">Reason: {(post as any).reportReason || 'Unspecified'}</span>
                                  <span className="text-[10px] text-rose-800/80 mt-0.5 block italic">"{(post as any).reportDetails || 'No additional details provided'}"</span>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-44 overflow-y-auto">
                                  {reportsList.map((rep: any) => (
                                    <div key={rep.id || rep.timestamp} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl flex items-start gap-2.5">
                                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-rose-900 leading-tight">{rep.reason}</span>
                                          <span className="text-[9px] text-slate-400 font-medium">{rep.timestamp}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 italic font-medium">"{rep.details || 'No additional comment'}"</p>
                                        <span className="text-[9px] text-slate-400 font-bold block mt-1">Reporter: {rep.reporterName}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions bar */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setPosts(prev => prev.map(p => p.id === post.id ? {
                                    ...p,
                                    isReported: false,
                                    reportReason: undefined,
                                    reportDetails: undefined,
                                    reportCount: 0,
                                    reports: []
                                  } as any : p));
                                  logActivity('Dismissed Post Reports', `Dismissed reports for post by ${post.author.name}.`);
                                  triggerToast('Post reports dismissed', 'success');
                                }}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200"
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Dismiss Reports</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPosts(prev => prev.filter(p => p.id !== post.id));
                                  logActivity('Deleted Reported Post', `Permanently deleted reported post from ${post.author.name}.`);
                                  triggerToast('Post deleted permanently', 'success');
                                }}
                                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <Trash2 className="h-3.5 w-3.5 fill-current" />
                                <span>Delete Post</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-black text-primary">Role Management</h3>
                <p className="text-sm text-slate-500">Promote trusted sisters to moderator status to help manage community reports.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sisters by name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-primary placeholder:text-slate-400"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Sister</th>
                      <th className="px-6 py-4">Current Rank</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Access Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={member.avatar || '/images/african_woman_portrait_3_1784708258772.jpg'} 
                              alt={member.name} 
                              className="h-10 w-10 rounded-full object-cover border-2 border-slate-100"
                            />
                            <div>
                              <p className="text-sm font-bold text-primary">{member.name}</p>
                              <p className="text-[10px] text-slate-500">{member.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            member.rank === 'Mentor' || member.rank === 'Coach' ? 'bg-indigo-50 text-indigo-600' : 
                            member.rank === 'Learner' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {member.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {member.isSuperAdmin && (
                              <div className="flex items-center gap-1.5 text-primary">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span className="text-[10px] font-black uppercase">Super Admin</span>
                              </div>
                            )}
                            {member.isModerator && (
                              <div className="flex items-center gap-1.5 text-secondary">
                                <Shield className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase">Moderator</span>
                              </div>
                            )}
                            {!member.isSuperAdmin && !member.isModerator && (
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Regular Member</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Moderator */}
                            <button
                              onClick={() => toggleModerator(member.id)}
                              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                                member.isModerator 
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100' 
                                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {member.isModerator ? 'Revoke Mod' : 'Add Mod'}
                            </button>

                            {/* Toggle Super Admin */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to change Super Admin status for ${member.name}?`)) {
                                  toggleSuperAdmin(member.id);
                                }
                              }}
                              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                                member.isSuperAdmin 
                                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                  : 'bg-white text-primary border-2 border-primary/20 hover:border-primary/40'
                              }`}
                            >
                              {member.isSuperAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-black text-primary">Activity Logs</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  System Audit Trail & Monitoring
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <input 
                    type="date"
                    value={logStartDate}
                    onChange={(e) => setLogStartDate(e.target.value)}
                    className="bg-transparent border-none p-1 text-[10px] font-bold text-primary focus:ring-0"
                  />
                  <span className="text-[10px] font-bold text-slate-300">to</span>
                  <input 
                    type="date"
                    value={logEndDate}
                    onChange={(e) => setLogEndDate(e.target.value)}
                    className="bg-transparent border-none p-1 text-[10px] font-bold text-primary focus:ring-0"
                  />
                </div>

                {(logActionFilter !== 'all' || logStartDate || logEndDate) && (
                  <button
                    onClick={() => {
                      setLogActionFilter('all');
                      setLogStartDate('');
                      setLogEndDate('');
                    }}
                    className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                    title="Reset Filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {filteredLogs.length > 0 && (
                  <button
                    onClick={handleExportLogs}
                    className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 hover:bg-secondary hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <FileDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Export {filteredLogs.length} Records</span>
                  </button>
                )}
              </div>
            </div>

            {/* ACTION FILTER BUTTONS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setLogActionFilter('all')}
                className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  logActionFilter === 'all' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                <span>All Logs</span>
                <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black ${
                  logActionFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {totalLogCount}
                </span>
              </button>

              {uniqueActions.map(action => (
                <button
                  key={action}
                  onClick={() => setLogActionFilter(action)}
                  className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    logActionFilter === action 
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                      : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <span>{action}</span>
                  <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black ${
                    logActionFilter === action ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {actionCounts[action]}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="relative mb-6">
                              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm">
                                <Activity className="h-10 w-10 text-slate-200" />
                              </div>
                              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-100">
                                <Search className="h-5 w-5 text-slate-400" />
                              </div>
                            </div>
                            
                            <h4 className="text-lg font-black text-primary tracking-tight mb-2">No activity records found</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                              We couldn't find any audit logs matching your current filter criteria. Try adjusting the date range or action type to see more results.
                            </p>
                            
                            <button 
                              onClick={() => {
                                setLogActionFilter('all');
                                setLogStartDate('');
                                setLogEndDate('');
                              }}
                              className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 hover:bg-secondary hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                              <span>Reset Audit Filters</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-indigo-700">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
    </div>
  );
}
