import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  MessageSquare, 
  Search,
  Menu, 
  X, 
  Sparkles, 
  ChevronDown, 
  LogOut, 
  User, 
  Shield, 
  Globe,
  Camera,
  Settings,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  Users,
  BookOpen,
  Compass,
  Briefcase,
  Award,
  Trophy,
  Calendar,
  GraduationCap,
  Home,
  Target,
  Bookmark,
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { Member, Post, Event as CommunityEvent, Circle } from '../data';
import { PUBLIC_LINKS, PRIVATE_LINKS, NAVIGATION_CATEGORIES } from '../lib/navigation';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string, mode?: 'login' | 'register') => void;
  unreadCount: number;
  notifications: Array<{ id: string; title: string; read: boolean }>;
  markNotificationsRead: () => void;
  userPoints: number;
  currentUser: Member;
  setSelectedProfileId?: (id: string | null) => void;
  isAuthenticated?: boolean;
  setIsAuthenticated?: (auth: boolean) => void;
  themePref?: 'light' | 'dark' | 'auto';
  isDark?: boolean;
  toggleTheme?: () => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  members?: Member[];
  posts?: Post[];
  events?: CommunityEvent[];
  circles?: Circle[];
  setCircleTab?: (tab: any) => void;
  setCurrentCircleId?: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ 
  currentView, 
  setCurrentView, 
  unreadCount, 
  notifications, 
  markNotificationsRead,
  userPoints,
  currentUser,
  setSelectedProfileId,
  isAuthenticated = true,
  setIsAuthenticated,
  themePref = 'auto',
  isDark = false,
  toggleTheme,
  notificationsOpen,
  setNotificationsOpen,
  profileOpen,
  setProfileOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  members = [],
  posts = [],
  events = [],
  circles = [],
  setCircleTab,
  setCurrentCircleId,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { members: [], posts: [], events: [], circles: [] };
    const q = searchQuery.toLowerCase();
    return {
      members: (members || []).filter(m => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)).slice(0, 3),
      posts: (posts || []).filter(p => p.content.toLowerCase().includes(q)).slice(0, 3),
      events: (events || []).filter(e => e.title.toLowerCase().includes(q)).slice(0, 3),
      circles: (circles || []).filter(c => c.name.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [searchQuery, members, posts, events, circles]);

  const hasResults = Object.values(searchResults).some(arr => (arr as any[]).length > 0);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = isAuthenticated ? PRIVATE_LINKS : PUBLIC_LINKS;

  return (
    <header id="site-header" className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-6 lg:px-10">
        
        {/* LEFT: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-primary/70 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary md:hidden transition-all active:scale-95"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView(isAuthenticated ? 'feeds' : 'home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <img src="/images/logo.png" alt="BIG logo" className="h-full w-full object-cover" />
            </div>
            <span className="hidden sm:block font-black text-lg text-primary dark:text-white tracking-tighter transition-colors group-hover:text-secondary">
              BIG
            </span>
          </div>
        </div>

        {/* CENTER NAVIGATION: PUBLIC & AUTHENTICATED TOP MENU */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 mx-6">
          {!isAuthenticated ? (
            // ==================== PUBLIC MENU ====================
            <>
              {/* Home */}
              <button
                onClick={() => setCurrentView('home')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'home'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Home</span>
                {currentView === 'home' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* About Us */}
              <button
                onClick={() => setCurrentView('about')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'about'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>About Us</span>
                {currentView === 'about' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Programs */}
              <button
                onClick={() => setCurrentView('programs')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'programs'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Programs</span>
                {currentView === 'programs' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* BIG Fund */}
              <button
                onClick={() => setCurrentView('big-fund')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'big-fund'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>BIG Fund</span>
                {currentView === 'big-fund' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Circles */}
              <button
                onClick={() => setCurrentView('circles')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'circles'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Circles</span>
                {currentView === 'circles' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Academy */}
              <button
                onClick={() => setCurrentView('academy')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'academy'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Academy</span>
                {currentView === 'academy' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Opportunities */}
              <button
                onClick={() => setCurrentView('directory')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'directory'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Opportunities</span>
                {currentView === 'directory' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Contact Us */}
              <button
                onClick={() => setCurrentView('contact')}
                className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'contact'
                    ? 'text-secondary font-black'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>Contact Us</span>
                {currentView === 'contact' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            </>
          ) : (
            // ==================== AUTHENTICATED MENU ====================
            <>
              {/* Dashboard */}
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'dashboard'
                    ? 'text-secondary font-black'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
                {currentView === 'dashboard' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-3 right-3 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Community (Community Feeds) */}
              <button
                onClick={() => setCurrentView('feeds')}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'feeds'
                    ? 'text-secondary font-black'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
                {currentView === 'feeds' && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-3 right-3 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Circles Hub */}
              <button
                onClick={() => setCurrentView('circles')}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentView === 'circles' || currentView === 'circle-hub'
                    ? 'text-secondary font-black'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Circles Hub</span>
                {(currentView === 'circles' || currentView === 'circle-hub') && (
                  <motion.div layoutId="header-active-pill" className="absolute bottom-0 left-3 right-3 h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Growth & Capital Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('private-growth')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                    ['academy', 'big-fund', 'resource-library', 'goal-tracker'].includes(currentView)
                      ? 'text-secondary font-black'
                      : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Growth & Capital</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'private-growth' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'private-growth' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-1.5 w-80 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <button
                          onClick={() => { setCurrentView('academy'); setActiveDropdown(null); }}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">BIG Academy</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Vocational courses, quizzes, certs</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('big-fund'); setActiveDropdown(null); }}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                            <Award className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">BIG Fund</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Apply for matching grants & crowdfunding</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('resource-library'); setActiveDropdown(null); }}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Resource Library</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Legal contracts, finance guides, toolkits</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('goal-tracker'); setActiveDropdown(null); }}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Goal Tracker</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Map your personal and business growth</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sisterhood & Engagement Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('private-sisterhood')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                    ['directory', 'mentorship', 'job-board', 'events', 'leaderboard', 'my-sisters'].includes(currentView)
                      ? 'text-secondary font-black'
                      : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Sisterhood</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'private-sisterhood' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'private-sisterhood' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 lg:left-0 mt-1.5 w-[460px] max-w-lg rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => { setCurrentView('directory'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 shrink-0 mt-0.5">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sisters Directory</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Connect with local sisters</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('mentorship'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 shrink-0 mt-0.5">
                            <HeartHandshake className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mentorship</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">1-on-1 coaching pairing</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('job-board'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Job Board</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Jobs, gigs & hire options</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('events'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 mt-0.5">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Events Hub</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Masterclasses & physical mixers</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('leaderboard'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0 mt-0.5">
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Leaderboard</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Points standings & badge tiers</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setCurrentView('my-sisters'); setActiveDropdown(null); }}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">My Sisters</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Your connected partner network</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </nav>

        {/* RIGHT: SEARCH & ACTIONS */}
        <div className="flex-1 flex items-center justify-end gap-3 px-2 ml-auto">
          {isAuthenticated && !['home', 'about', 'programs', 'contact', 'auth'].includes(currentView) && (
            <div className="relative w-full max-w-xs transition-all duration-300">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-11 pr-10 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-white dark:focus:bg-slate-850 shadow-inner focus:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all shrink-0"
          >
            {themePref === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
        
        {/* RIGHT: PROFILE ACTIONS */}
        <div className="flex items-center gap-4 shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('auth', 'login')} className="rounded-full border border-slate-200 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 transition-colors">
                Log In
              </button>
              <button onClick={() => setCurrentView('auth', 'register')} className="rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-primary/95 transition-colors shadow-sm">
                Join BIG
              </button>
            </div>
          ) : (
             <div className="flex items-center gap-2 sm:gap-4">
    
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="relative p-2.5 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white transition-all"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary border-2 border-white dark:border-slate-900 text-[9px] font-black text-white shadow-sm">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute -right-16 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl animate-fade-in z-50 overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    </div>
                    <div className="max-h-[28rem] overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">No new notifications.</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {notifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                setCurrentView('notifications');
                                setNotificationsOpen(false);
                              }}
                              className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-start gap-3 cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <Bell className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{n.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                      <button 
                        onClick={() => { setCurrentView('notifications'); setNotificationsOpen(false); }}
                        className="w-full py-2 text-xs font-bold text-primary dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-sm overflow-hidden">
                    {currentUser.avatar?.trim() ? (
                      <img src={currentUser.avatar || null} className="h-full w-full object-cover" alt="" />
                    ) : (
                      currentUser.name[0]
                    )}
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl animate-fade-in z-50">
                    <div className="border-b border-slate-100 dark:border-slate-700 px-3 py-2.5">
                      <p className="font-heading text-xs font-bold text-primary dark:text-primary-foreground">{currentUser.name || 'Sarah Jenkins'}</p>
                      <p className="text-[10px] text-primary/60 dark:text-primary-foreground/60 truncate">{currentUser.title || 'Aspiring Fashion Founder'}</p>
                    </div>
                    <button onClick={() => { setCurrentView('profile'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <User className="h-4 w-4" /> My Profile
                    </button>
                    <button onClick={() => { setCurrentView('my-sisters'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <Users className="h-4 w-4" /> My Sisters
                    </button>
                    <button onClick={() => { setCurrentView('dashboard'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </button>
                    <button onClick={() => { setCurrentView('bookmarks'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <Bookmark className="h-4 w-4" /> Bookmarks
                    </button>
                    <button onClick={() => { setCurrentView('settings'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                    <button onClick={() => { setCurrentView('leaderboard'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <Trophy className="h-4 w-4" /> Leaderboard
                    </button>
                    {currentUser?.isSuperAdmin && (
                      <button onClick={() => { setCurrentView('admin'); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <Shield className="h-4 w-4" /> Admin Dashboard
                      </button>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                    <button onClick={() => { if (setIsAuthenticated) { setIsAuthenticated(false); localStorage.setItem('big_v2_is_auth', 'false'); setCurrentView('home'); } setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50">
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Desktop Right Spacer or other actions could go here */}
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl md:hidden flex flex-col justify-between overflow-hidden border-r border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                <div 
                  onClick={() => {
                    setCurrentView(isAuthenticated ? 'feeds' : 'home');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
                    <img src="/images/logo.png" alt="BIG logo" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="font-black text-base text-primary dark:text-white tracking-tight block">
                      BE INDEPENDENT GAL
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-0.5">
                      Be Unstoppable Woman
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* ================= MAIN NAVIGATION LINKS ================= */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 px-3">
                    Main Navigation
                  </h4>
                  <nav className="space-y-1">
                    <button
                      onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'home'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Home className="h-4 w-4 text-primary" />
                      <span>Home</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'about'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>About Us</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('programs'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'programs'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Award className="h-4 w-4 text-purple-500" />
                      <span>Programs</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('big-fund'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'big-fund'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Trophy className="h-4 w-4 text-emerald-500" />
                      <span>BIG Fund</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('circles'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'circles'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Compass className="h-4 w-4 text-teal-500" />
                      <span>Circles</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('academy'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'academy'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      <span>Academy</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('directory'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'directory'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Briefcase className="h-4 w-4 text-pink-500" />
                      <span>Opportunities</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('contact'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentView === 'contact'
                          ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>Contact Us</span>
                    </button>
                  </nav>
                </div>

                {!isAuthenticated ? (
                  /* Member Login / Join CTA */
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/50 dark:from-slate-800/80 dark:to-purple-950/20 border border-slate-200/80 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Join BIG Sisterhood</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Access masterclasses, funding, mentorship & local circles.</p>
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      <button
                        onClick={() => { setCurrentView('auth', 'register'); setMobileMenuOpen(false); }}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 hover:bg-primary/95 text-center transition-all active:scale-[0.98]"
                      >
                        Join BIG
                      </button>
                      <button
                        onClick={() => { setCurrentView('auth', 'login'); setMobileMenuOpen(false); }}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs text-center hover:bg-slate-50 transition-all"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                ) : (
                  /* AUTHENTICATED MEMBER HUB SECTIONS */
                  <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* User Profile Summary */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                        {currentUser?.avatar?.trim() ? (
                          <img src={currentUser.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          currentUser?.name?.[0] || 'M'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Member'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || ''}</p>
                      </div>
                    </div>

                    {NAVIGATION_CATEGORIES.map((category) => (
                      <div key={category.title}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-3">
                          {category.title}
                        </h4>
                        <nav className="space-y-0.5">
                          {category.links.map((link) => {
                            if (link.adminOnly && !currentUser?.isSuperAdmin) return null;
                            const Icon = link.icon;
                            const active = currentView === link.id;
                            return (
                              <button
                                key={link.id}
                                onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                  active
                                    ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="h-4 w-4" />
                                  <span>{link.label}</span>
                                </div>
                                {link.badge && unreadCount ? (
                                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </nav>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      if (setIsAuthenticated) {
                        setIsAuthenticated(false);
                        localStorage.setItem('big_v2_is_auth', 'false');
                        setCurrentView('home');
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-center font-bold uppercase tracking-wider text-slate-400">
                    Be Independent Gal
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
