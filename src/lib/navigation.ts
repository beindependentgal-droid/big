import { 
  Home, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Compass, 
  MessageSquare, 
  Calendar, 
  Trophy,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Target,
  Shield,
  HeartHandshake,
  Settings,
  User,
  List,
  Bookmark,
  LogOut,
  UserCheck
} from 'lucide-react';

export interface NavLink {
  id: string;
  label: string;
  icon: any;
  badge?: boolean;
  adminOnly?: boolean;
}

export interface NavCategory {
  title: string;
  links: NavLink[];
}

export const PUBLIC_LINKS: NavLink[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: Sparkles },
  { id: 'academy', label: 'Academy', icon: GraduationCap },
  { id: 'circles', label: 'Circles', icon: Compass },
  { id: 'directory', label: 'Find opportunities', icon: Briefcase },
  { id: 'programs', label: 'Programs', icon: Award },
  { id: 'big-fund', label: 'BIG Fund', icon: Trophy },
  { id: 'contact', label: 'Contact', icon: MessageSquare }
];

export const PRIVATE_LINKS: NavLink[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'feeds', label: 'Builders community', icon: Users },
  { id: 'circles', label: 'Circles', icon: Compass },
  { id: 'directory', label: 'Directory', icon: Briefcase }
];

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    title: 'Core Platform',
    links: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'feeds', label: 'Builders community', icon: Users },
      { id: 'circles', label: 'Circles Hub', icon: Compass },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: true },
    ]
  },
  {
    title: 'Growth & Capital',
    links: [
      { id: 'academy', label: 'BIG Academy', icon: GraduationCap },
      { id: 'big-fund', label: 'BIG Fund', icon: Award },
      { id: 'resource-library', label: 'Resource Library', icon: BookOpen },
    ]
  },
  {
    title: 'Engagement',
    links: [
      { id: 'job-board', label: 'Work opportunities', icon: Briefcase },
      { id: 'mentorship', label: 'Mentorship', icon: HeartHandshake },
      { id: 'goal-tracker', label: 'Goal Tracker', icon: Target },
      { id: 'directory', label: 'Directory', icon: Users },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ]
  },
  {
    title: 'Administration',
    links: [
      { id: 'admin', label: 'Admin Dashboard', icon: Shield, adminOnly: true },
    ]
  }
];

export const BOTTOM_NAV_LINKS: NavLink[] = [
  { id: 'feeds', label: 'Builders community', icon: Users },
  { id: 'circles', label: 'Circles', icon: Compass },
  { id: 'my-sisters', label: 'My Sisters', icon: UserCheck },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];
