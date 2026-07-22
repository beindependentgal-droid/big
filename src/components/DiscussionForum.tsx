import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  Tag, 
  Filter, 
  MessageCircle, 
  User, 
  Plus, 
  Award,
  Send,
  Sparkles,
  Bookmark,
  TrendingUp,
  UserCheck,
  BarChart,
  Check,
  Lock,
  Ban,
  Clock,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { Member } from '../data';
import { CircleGroupChat } from './CircleGroupChat';
import { Users, Hash, AlertCircle } from 'lucide-react';
import { copyToClipboard, formatTimeAgo, formatDisplayDate } from '../lib/utils';

export interface ForumReply {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
}

export interface ForumPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface ForumPoll {
  question: string;
  options: ForumPollOption[];
  votedOptionIds?: Record<string, string>; // memberId -> optionId
}

export interface ForumThread {
  id: string;
  circleId: 'learn' | 'connect' | 'earn' | 'thrive';
  title: string;
  content: string;
  tag: 'Question' | 'Advice' | 'Collaboration' | 'Struggle' | 'Idea' | 'Poll';
  author: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  timestamp: string;
  likes: number;
  liked?: boolean;
  replies: ForumReply[];
  isPinned?: boolean;
  poll?: ForumPoll;
}

interface DiscussionForumProps {
  activeTab: 'learn' | 'connect' | 'earn' | 'thrive';
  currentUser: Member;
  members: Member[];
  addPoints: (pts: number, badge?: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  setCurrentView: (view: string) => void;
}

// Initial seed discussions matching member IDs
const INITIAL_FORUM_THREADS: ForumThread[] = [
  // LEARN THREADS
  {
    id: 'thread-learn-1',
    circleId: 'learn',
    title: 'How to apply for the BIG Academy Seed Grant for female micro-businesses?',
    content: 'Hello sisters! I am preparing my application for the upcoming BIG Academy Seed Grant cycle. Has anyone here successfully received it in previous cohorts? I would love to know what the selection committee prioritizes most. Is it the social impact story, our operational margins, or the digital innovation element? Any tips would mean the world! Thanks!',
    tag: 'Poll',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
      rank: 'Learner'
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    liked: false,
    isPinned: true,
    poll: {
      question: 'Which element of the seed grant proposal is hardest for you to structure?',
      options: [
        { id: 'opt-1', text: 'Financial projections & allocation budgets', votes: 15 },
        { id: 'opt-2', text: 'Social impact narrative & story scaling', votes: 8 },
        { id: 'opt-3', text: 'Market sizing & competitor matrix', votes: 11 },
        { id: 'opt-4', text: 'Digital transformation or tech-enablement plan', votes: 5 }
      ],
      votedOptionIds: {
        'm2': 'opt-1',
        'm3': 'opt-1',
        'm4': 'opt-2',
        'm5': 'opt-3'
      }
    },
    replies: [
      {
        id: 'reply-l1-1',
        author: {
          id: 'm2',
          name: 'Fatima Adebayo',
          avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
          rank: 'Mentor'
        },
        content: 'Amina, as someone who sat on the evaluation advisory last year, the most critical part is the Clarity of Fund Allocation. Tell us exactly how that seed grant acts as a catalyst (e.g. buying 1 specific manufacturing sewing machine or setting up an e-commerce gateway). Avoid generic claims like "using it for marketing". Be highly numerical!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        likes: 9,
        liked: false
      },
      {
        id: 'reply-l1-2',
        author: {
          id: 'm3',
          name: 'Hawa Keita',
          avatar: '/src/assets/images/african_woman_portrait_4_1784708270262.jpg',
          rank: 'Community Lead'
        },
        content: 'I agree with Fatima! When I applied, I detailed exactly how a 350,000 NGN grant would increase our textile dye batch volume by 40%. The judges loved the direct operational linkage. Keep it simple and focus on your core scaling milestone.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
        likes: 6,
        liked: false
      }
    ]
  },

  // CONNECT THREADS
  {
    id: 'thread-connect-1',
    circleId: 'connect',
    title: 'Looking for a technical co-founder with a Tech/AI background in West/East Africa',
    content: 'Hi sisters! I am scale-testing an organic cosmetics brand and we want to launch a simple AI-powered skincare advisor app that matches natural skin oil profiles to artisan formulation recipes. I have the entire cooperative supply chain locked down, but need a sister with React Native/Node.js or Python background to help lead tech. Let us hop on a virtual coffee chat!',
    tag: 'Collaboration',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/src/assets/images/african_woman_portrait_4_1784708270262.jpg',
      rank: 'Member'
    },
    timestamp: '2 days ago',
    likes: 12,
    liked: false,
    replies: [
      {
        id: 'reply-c1-1',
        author: {
          id: 'm1',
          name: 'Amina Bello',
          avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
          rank: 'Learner'
        },
        content: 'Wow, Joy! This sounds amazing. I have been building our local EdTech app with a solid React/Node.js stack and I also know two girls in my STEM academy who are incredibly proficient in building mobile apps. Let us connect via direct message so I can make the introductions.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        likes: 5,
        liked: false
      }
    ]
  },
  {
    id: 'thread-connect-2',
    circleId: 'connect',
    title: 'Join our Bi-Weekly Business Goals Accountability Circle!',
    content: 'I find that working as a solo-founder can be incredibly isolating, making it easy to drop our weekly targets. I am setting up a micro-accountability circle of 5 sisters. We will meet on Zoom every other Saturday at 10 AM (EAT) for a quick, strict 20-minute standup: 1 win from the fortnight, 1 blockage, and 1 specific metric for the next two weeks. Drop a comment below if you want to commit!',
    tag: 'Advice',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
      rank: 'Mentor'
    },
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 27,
    liked: false,
    replies: [
      {
        id: 'reply-c2-1',
        author: {
          id: 'you',
          name: 'Sarah Jenkins',
          avatar: '/src/assets/images/african_woman_portrait_4_1784708270262.jpg',
          rank: 'Learner'
        },
        content: 'Sister Fatima, I would love to join this circle! My main focus is launching my Lagos apparel checklist this month, and having your structured check-in will keep me totally focused. Count me in!',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        liked: true
      }
    ]
  },

  // EARN THREADS
  {
    id: 'thread-earn-1',
    circleId: 'earn',
    title: 'How to pitch your business story to international angel networks on a local budget',
    content: 'Sisters, global VC and angel investor groups are increasingly searching for genuine sustainable impact in Africa. But we do not need expensive PR agencies to get in front of them! In this thread, I am breaking down how I pitched my cooperative micro-finance model to European backers using a 10-slide deck, a 2-minute Loom screen share, and highly targeted LinkedIn outreach. Let us discuss what makes an investor response rates high.',
    tag: 'Advice',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
      rank: 'Mentor'
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    liked: false,
    isPinned: true,
    replies: [
      {
        id: 'reply-e1-1',
        author: {
          id: 'm1',
          name: 'Amina Bello',
          avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
          rank: 'Learner'
        },
        content: 'This breakdown is pure gold! The Loom recording trick is so smart because it builds personal trust instantly. They can see our passion, our voice, and our authenticity before they even schedule a calendar invite.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        liked: false
      }
    ]
  },

  // THRIVE THREADS
  {
    id: 'thread-thrive-1',
    circleId: 'thrive',
    title: 'Handling founder burnout, imposter feelings, and local retail friction',
    content: 'Yesterday was a very heavy day. I faced serious logistic issues with custom inspections and local transport, and it made me question if I was fit to lead this sustainable textile dream. How do you deal with the crushing weight of everything going wrong at once, especially when your peers think you have it all under control? Let us open up a raw, safe space in this thread.',
    tag: 'Struggle',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
      rank: 'Learner'
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 38,
    liked: false,
    replies: [
      {
        id: 'reply-t1-1',
        author: {
          id: 'm4',
          name: 'Joy Namubiru',
          avatar: '/src/assets/images/african_woman_portrait_4_1784708270262.jpg',
          rank: 'Member'
        },
        content: 'Amina, I am sending you a warm virtual hug. Last week, we lost a whole cargo batch of glass cosmetic bottles to accidental damage. I cried for hours. But I realized that our resilience is not about not crying; it is about washing our face and letting ourselves start again. You are not alone, sister.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        likes: 14,
        liked: false
      },
      {
        id: 'reply-t1-2',
        author: {
          id: 'm2',
          name: 'Fatima Adebayo',
          avatar: '/src/assets/images/african_woman_portrait_3_1784708258772.jpg',
          rank: 'Mentor'
        },
        content: 'Beautifully said Joy. Amina, please remember that custom officers and transit delays are external noise—they do not define your internal capabilities. Take a 24-hour digital detox. Your vision is worth the brief pause.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 10,
        liked: false
      }
    ]
  }
];

export function DiscussionForum({
  activeTab,
  currentUser,
  members,
  addPoints,
  setSelectedConversationMember,
  setCurrentView
}: DiscussionForumProps) {
  // Forums local state backup on localStorage
  const [threads, setThreads] = useState<ForumThread[]>(() => {
    const saved = localStorage.getItem('big_v2_forum_threads');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [forumTab, setForumTab] = useState<'threads' | 'chat'>('threads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [threadFilter, setThreadFilter] = useState<'Most Recent' | 'Popular' | 'Unanswered'>('Most Recent');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Form states for new thread
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<'Question' | 'Advice' | 'Collaboration' | 'Struggle' | 'Idea' | 'Poll'>('Question');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Reply text input state
  const [replyInput, setReplyInput] = useState('');

  // Load forum threads and circle states from backend on mount
  useEffect(() => {
    async function loadForumData() {
      try {
        const threadsRes = await fetch('/api/forum-threads');
        if (threadsRes.ok) {
          const threadsData = await threadsRes.json();
          if (threadsData && threadsData.length > 0) {
            setThreads(threadsData);
          }
        }
      } catch (err) {
        console.warn('Failed to load forum threads from backend:', err);
      }

      try {
        const statesRes = await fetch('/api/circle-states');
        if (statesRes.ok) {
          const statesData = await statesRes.json();
          if (statesData && Object.keys(statesData).length > 0) {
            setInternalCircleStates(statesData);
            localStorage.setItem('big_v2_circle_states_v2', JSON.stringify(statesData));
          }
        }
      } catch (err) {
        console.warn('Failed to load circle states from backend:', err);
      }
    }
    loadForumData();
  }, []);

  // Persist threads to localStorage and Express backend
  useEffect(() => {
    localStorage.setItem('big_v2_forum_threads', JSON.stringify(threads));
    fetch('/api/forum-threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threads)
    }).catch(err => console.warn('Failed to save forum threads to backend:', err));
  }, [threads]);

  // Load current circle state
  const [internalCircleStates, setInternalCircleStates] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('big_v2_circle_states_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const forceSyncCircleState = () => {
    try {
      const saved = localStorage.getItem('big_v2_circle_states_v2');
      setInternalCircleStates(saved ? JSON.parse(saved) : {});
    } catch {
      // ignore
    }
  };

  const adminModerateCircleInForum = (circleId: string, status: string, moderation: string) => {
    try {
      const saved = localStorage.getItem('big_v2_circle_states_v2');
      const current = saved ? JSON.parse(saved) : {};
      current[circleId] = { status, moderation };
      localStorage.setItem('big_v2_circle_states_v2', JSON.stringify(current));
      
      // Save to Express backend
      fetch('/api/circle-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [circleId]: { status, moderation } })
      }).catch(err => console.warn('Failed to save circle state to backend:', err));
      
      // Also update joinedCircleIds array to keep in sync if approved
      const savedJoined = localStorage.getItem('big_v2_joined_circles_v2');
      let joined = savedJoined ? JSON.parse(savedJoined) : ['learn'];
      if (status === 'approved') {
        if (!joined.includes(circleId)) {
          joined.push(circleId);
        }
      } else {
        joined = joined.filter((id: string) => id !== circleId);
      }
      localStorage.setItem('big_v2_joined_circles_v2', JSON.stringify(joined));
      
      // Dispatch storage event to let other parts of the app know
      window.dispatchEvent(new Event('storage'));
      
      setInternalCircleStates(current);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      forceSyncCircleState();
    };
    window.addEventListener('storage', handleStorageChange);
    // Periodically sync just in case
    const interval = setInterval(forceSyncCircleState, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const cState = internalCircleStates[activeTab] || { status: 'none', moderation: 'active' };
  const circleLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  // 1. BANNED STATE
  if (cState.moderation === 'banned') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/10 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm animate-bounce">
          <Ban className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-rose-950 uppercase tracking-widest">
            🚫 Access Terminated (Banned)
          </h3>
          <p className="text-xs text-rose-800 leading-relaxed font-semibold">
            You have been banned from participating in the {circleLabel} Circle Discussion Board by the Mombasa Chapter Gatekeepers due to violation of community trust guidelines.
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Contact your local regional director to appeal this suspension or submit a chapter review request.
          </p>
        </div>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
            className="w-full text-xs font-black py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            Pardon & Lift Ban (Restore Active Member)
          </button>
        </div>
      </div>
    );
  }

  // 2. SUSPENDED STATE
  if (cState.moderation === 'suspended') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/10 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
          <Clock className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-amber-950 uppercase tracking-widest">
            ⏳ Membership Suspended
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed font-semibold">
            Your membership in the {circleLabel} Circle has been temporarily suspended. Your discussion privileges are frozen and threads are locked.
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            This suspension is scheduled to be reviewed in 7 days.
          </p>
        </div>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
            className="w-full text-xs font-black py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            Lift Suspension (Restore Active Member)
          </button>
        </div>
      </div>
    );
  }

  // 3. NONE / VISITOR STATE
  if (cState.status === 'none') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/5 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-slate-950 uppercase tracking-widest">
            🔒 {circleLabel.toUpperCase()} Threaded Forum Locked
          </h3>
          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
            The {circleLabel} Q&A Board and group discussions are reserved strictly for registered circle members. Submit a request to join this circle to read and start threaded topics!
          </p>
        </div>

        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'pending', 'active')}
            className="rounded-xl bg-primary hover:brightness-110 text-white px-5 py-2.5 text-xs font-black transition-all shadow-md"
          >
            Submit Request to Join
          </button>
        </div>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
            className="w-full text-xs font-black py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            Directly Approve & Join (Sandbox Bypass)
          </button>
        </div>
      </div>
    );
  }

  // 4. PENDING STATE
  if (cState.status === 'pending') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/5 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm animate-pulse">
          <Clock className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-slate-950 uppercase tracking-widest">
            ⏳ Request Pending Approval
          </h3>
          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
            Your application to join the {circleLabel} Circle is currently being audited by the Chapter facilitators.
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Join requests are typically reviewed within 24 hours. Once approved, you will have complete access to the board.
          </p>
        </div>

        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'none', 'active')}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 text-xs font-black transition-all border border-slate-300"
          >
            Cancel Join Request
          </button>
        </div>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
              className="text-xs font-black py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Approve Join
            </button>
            <button
              type="button"
              onClick={() => adminModerateCircleInForum(activeTab, 'rejected', 'active')}
              className="text-xs font-black py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all"
            >
              Reject Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. ON HOLD STATE
  if (cState.status === 'on_hold') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/5 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm">
          <Clock className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-slate-950 uppercase tracking-widest">
            ⏳ Membership On Hold
          </h3>
          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
            Your application is on hold. A virtual chat alignment with our regional directors is required to complete your enrollment.
          </p>
        </div>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
              className="text-xs font-black py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Approve Join
            </button>
            <button
              type="button"
              onClick={() => adminModerateCircleInForum(activeTab, 'none', 'active')}
              className="text-xs font-black py-2 px-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              Cancel application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. REJECTED STATE
  if (cState.status === 'rejected') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/5 p-8 text-center space-y-5 animate-fade-in shadow-sm max-w-2xl mx-auto my-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-sm font-black text-rose-950 uppercase tracking-widest">
            ❌ Application Declined
          </h3>
          <p className="text-xs text-rose-800 leading-relaxed font-semibold">
            Your request to join the {circleLabel} Circle has been declined. Ensure your profile metrics are complete before re-applying.
          </p>
        </div>

        <button
          type="button"
          onClick={() => adminModerateCircleInForum(activeTab, 'pending', 'active')}
          className="rounded-xl bg-primary hover:brightness-110 text-white px-5 py-2.5 text-xs font-black transition-all shadow-md mx-auto animate-pulse"
        >
          Re-Submit Join Request
        </button>

        {/* Sandbox Admin Console */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">
            🛡️ Council Administrative Action (Forum Sandbox)
          </p>
          <button
            type="button"
            onClick={() => adminModerateCircleInForum(activeTab, 'approved', 'active')}
            className="w-full text-xs font-black py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            Override & Approve Join
          </button>
        </div>
      </div>
    );
  }

  // Current selected thread details
  const activeThread = threads.find(t => t.id === activeThreadId);

  // Filter threads for the active circle tab
  const circleThreads = threads.filter(t => t.circleId === activeTab);

  // Filter based on search and selected tag
  const filteredThreads = circleThreads.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || t.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  // Filter/Sort based on selected filter state ('Most Recent', 'Popular', 'Unanswered')
  const processedThreads = (() => {
    let result = [...filteredThreads];

    if (threadFilter === 'Unanswered') {
      result = result.filter(t => !t.replies || t.replies.length === 0);
    } else if (threadFilter === 'Popular') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (threadFilter === 'Most Recent') {
      result.sort((a, b) => {
        const aTimeMatch = a.id.match(/\d+$/);
        const bTimeMatch = b.id.match(/\d+$/);
        if (aTimeMatch && bTimeMatch) {
          return parseInt(bTimeMatch[0]) - parseInt(aTimeMatch[0]);
        }
        return circleThreads.indexOf(a) - circleThreads.indexOf(b);
      });
    }

    // Keep pinned threads at the very top for non-unanswered lists
    if (threadFilter !== 'Unanswered') {
      result.sort((a, b) => {
        const aPinned = a.isPinned ? 1 : 0;
        const bPinned = b.isPinned ? 1 : 0;
        return bPinned - aPinned;
      });
    }

    return result;
  })();

  const handleVote = (threadId: string, optionId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId && t.poll) {
        const poll = t.poll;
        const votedOptionIds = poll.votedOptionIds || {};
        const previousVotedOptionId = votedOptionIds[currentUser.id];

        if (previousVotedOptionId === optionId) {
          // Unvote
          const updatedOptions = poll.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            }
            return opt;
          });
          const nextVotedOptionIds = { ...votedOptionIds };
          delete nextVotedOptionIds[currentUser.id];

          return {
            ...t,
            poll: {
              ...poll,
              options: updatedOptions,
              votedOptionIds: nextVotedOptionIds
            }
          };
        } else {
          // Vote for new option
          const updatedOptions = poll.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            if (previousVotedOptionId && opt.id === previousVotedOptionId) {
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            }
            return opt;
          });
          const nextVotedOptionIds = {
            ...votedOptionIds,
            [currentUser.id]: optionId
          };

          return {
            ...t,
            poll: {
              ...poll,
              options: updatedOptions,
              votedOptionIds: nextVotedOptionIds
            }
          };
        }
      }
      return t;
    }));

    addPoints(5);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let attachedPoll: ForumPoll | undefined = undefined;
    if (newTag === 'Poll') {
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (validOptions.length >= 2) {
        attachedPoll = {
          question: newTitle.trim(),
          options: validOptions.map((text, idx) => ({
            id: `opt-${idx}-${Date.now()}`,
            text: text.trim(),
            votes: 0
          })),
          votedOptionIds: {}
        };
      }
    }

    const newThread: ForumThread = {
      id: `thread-${activeTab}-${Date.now()}`,
      circleId: activeTab,
      title: newTitle,
      content: newContent,
      tag: newTag,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank || 'Learner'
      },
      timestamp: 'Just now',
      likes: 0,
      liked: false,
      replies: [],
      poll: attachedPoll
    };

    setThreads([newThread, ...threads]);
    
    // Clear and close
    setNewTitle('');
    setNewContent('');
    setNewTag('Question');
    setPollOptions(['', '']);
    setIsCreatingTopic(false);
    
    // Point award for starting a positive community conversation!
    addPoints(15);
  };

  const handleThreadLike = (threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const liked = !t.liked;
        const likes = liked ? t.likes + 1 : t.likes - 1;
        return { ...t, liked, likes };
      }
      return t;
    }));

    // Alert or subtle reward
    addPoints(2);
  };

  const handleReplyLike = (threadId: string, replyId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.map(r => {
            if (r.id === replyId) {
              const liked = !r.liked;
              const likes = liked ? r.likes + 1 : r.likes - 1;
              return { ...r, liked, likes };
            }
            return r;
          })
        };
      }
      return t;
    }));
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeThreadId) return;

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank || 'Learner'
      },
      content: replyInput,
      timestamp: 'Just now',
      likes: 0,
      liked: false
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          replies: [...t.replies, newReply]
        };
      }
      return t;
    }));

    setReplyInput('');
    addPoints(5); // 5 points reward for positive contribution
  };

  // Utility to find the corresponding member object to jump to profiles
  const handleAuthorClick = (authorName: string) => {
    if (authorName.includes('(You)') || authorName.includes('Sarah Jenkins')) {
      setCurrentView('profile');
      return;
    }
    const memberObj = members.find(m => m.name === authorName);
    if (memberObj) {
      setSelectedConversationMember(memberObj);
      setCurrentView('messages');
    }
  };

  const handleShareThread = async (thread: ForumThread) => {
    const threadUrl = `${window.location.origin}/discussion/${activeTab}/thread/${thread.id}`;
    const shareData = {
      title: `Discussion: ${thread.title}`,
      text: thread.content.substring(0, 100) + '...',
      url: threadUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    }

    // Fallback to clipboard
    const success = await copyToClipboard(threadUrl);
    if (success) {
      if (addPoints) addPoints(1); // Small reward for sharing
    } else {
      console.error('Failed to copy link');
    }
  };

  // Tag visual styles
  const tagColors: Record<string, string> = {
    Question: 'bg-rose-50 text-rose-700 border-rose-200/50',
    Advice: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    Collaboration: 'bg-violet-50 text-violet-700 border-violet-200/50',
    Struggle: 'bg-amber-50 text-amber-700 border-amber-200/50',
    Idea: 'bg-orange-50 text-orange-700 border-orange-200/50',
    Poll: 'bg-sky-50 text-sky-700 border-sky-200/50',
  };

  // If we are in the Live Circle Chat tab
  if (forumTab === 'chat') {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Forum & Group Chat Switcher Row */}
        <div className="flex bg-slate-100/70 p-1 rounded-xl border border-slate-150 max-w-sm">
          <button
            type="button"
            onClick={() => { setForumTab('threads'); setActiveThreadId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-extrabold rounded-lg transition-all ${
              forumTab === 'threads'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Threaded Q&A Board</span>
          </button>
          <button
            type="button"
            onClick={() => { setForumTab('chat'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-extrabold rounded-lg transition-all ${
              forumTab === 'chat'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Hash className="h-3.5 w-3.5 text-secondary" />
            <span>Live Circle Chat</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        <CircleGroupChat
          activeTab={activeTab}
          currentUser={currentUser}
          members={members}
          addPoints={addPoints}
          setSelectedConversationMember={setSelectedConversationMember}
          setCurrentView={setCurrentView}
        />
      </div>
    );
  }

  // If a single thread is active and being explored
  if (activeThread) {
    return (
      <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-6 animate-fade-in">
        {/* Back Button and Pinned Indicator */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setActiveThreadId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Discussions</span>
          </button>
          {activeThread.isPinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider">
              📌 Pinned Topic
            </span>
          )}
        </div>

        {/* Main Thread Content Card */}
        <div className="border-b border-slate-100 pb-5 space-y-4">
          <div className="flex items-start gap-3">
            <img 
              src={activeThread.author.avatar} 
              alt={activeThread.author.name}
              onClick={() => handleAuthorClick(activeThread.author.name)}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/5 cursor-pointer hover:opacity-85 transition-opacity"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 
                  onClick={() => handleAuthorClick(activeThread.author.name)}
                  className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
                >
                  {activeThread.author.name}
                </h4>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  {activeThread.author.rank}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColors[activeThread.tag]}`}>
                  #{activeThread.tag}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{formatTimeAgo(activeThread.timestamp)}</p>
            </div>
          </div>

          <h3 className="font-heading text-base font-extrabold text-primary leading-tight">
            {activeThread.title}
          </h3>

          <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {activeThread.content}
          </p>

          {/* Render Poll If Exists */}
          {activeThread.poll && (
            <div className="bg-slate-50/70 border border-slate-150 p-5 rounded-2xl space-y-4 shadow-sm my-4">
              <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                <BarChart className="h-4.5 w-4.5 text-secondary shrink-0" />
                <h4 className="text-xs font-heading font-extrabold text-primary">
                  Community Poll: {activeThread.poll.question}
                </h4>
              </div>

              <div className="space-y-3">
                {(() => {
                  const totalVotes = activeThread.poll.options.reduce((sum, o) => sum + o.votes, 0);
                  const userVoteOptionId = activeThread.poll.votedOptionIds?.[currentUser.id];

                  return activeThread.poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    const hasVotedThis = userVoteOptionId === option.id;

                    return (
                      <div 
                        key={option.id}
                        onClick={() => handleVote(activeThread.id, option.id)}
                        className={`relative overflow-hidden rounded-xl border p-3.5 cursor-pointer transition-all ${
                          hasVotedThis 
                            ? 'border-secondary bg-secondary/5 font-bold shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        {/* Background progress bar fill */}
                        <div 
                          className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out ${
                            hasVotedThis ? 'bg-secondary/10' : 'bg-slate-100'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex items-center justify-between text-xs text-primary font-bold">
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                              hasVotedThis ? 'border-secondary text-secondary bg-white' : 'border-slate-300 bg-white'
                            }`}>
                              {hasVotedThis && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                            </div>
                            <span>{option.text}</span>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            {option.votes} {option.votes === 1 ? 'vote' : 'votes'} ({percentage}% 🎉)
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <p className="text-[9px] text-slate-400 font-extrabold text-right uppercase tracking-wider">
                🗳️ {activeThread.poll.options.reduce((sum, o) => sum + o.votes, 0)} total community votes cast
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleThreadLike(activeThread.id)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                activeThread.liked ? 'text-rose-500 bg-rose-50/50' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
              } px-3 py-1.5 rounded-full`}
            >
              <Heart className={`h-4 w-4 ${activeThread.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{activeThread.likes} Sister-Upvotes</span>
            </button>

            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {activeThread.replies.length} replies
            </span>

            <button
              type="button"
              onClick={() => handleShareThread(activeThread)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary hover:bg-slate-50 px-3 py-1.5 rounded-full transition-all"
              title="Share this discussion"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* List of Replies */}
        <div className="space-y-4">
          <h4 className="font-heading text-xs font-bold text-primary uppercase tracking-wider text-slate-400">
            Replies ({activeThread.replies.length})
          </h4>

          {activeThread.replies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-100 py-6 text-center text-slate-400 bg-slate-50/30">
              <p className="text-xs font-semibold">No replies yet, sister.</p>
              <p className="text-[10px] mt-0.5">Share your voice and offer advice or a constructive question below!</p>
            </div>
          ) : (
            <div className="space-y-3.5 pl-2 sm:pl-4 border-l border-slate-100">
              {activeThread.replies.map((reply) => (
                <div 
                  key={reply.id} 
                  className="rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 space-y-2.5 hover:bg-slate-50/55 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <img 
                      src={reply.author.avatar} 
                      alt={reply.author.name}
                      onClick={() => handleAuthorClick(reply.author.name)}
                      className="h-8.5 w-8.5 rounded-full object-cover cursor-pointer hover:opacity-85 transition-opacity"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 
                          onClick={() => handleAuthorClick(reply.author.name)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          {reply.author.name}
                        </h5>
                        <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                          {reply.author.rank}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold">{formatTimeAgo(reply.timestamp)}</p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 pl-1">
                    {reply.content}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleReplyLike(activeThread.id, reply.id)}
                      className={`flex items-center gap-1 text-[10px] font-extrabold transition-all ${
                        reply.liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${reply.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{reply.likes} Likes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post a Reply Form */}
        {cState.moderation === 'restricted' ? (
          <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 text-center flex items-center gap-3 animate-fade-in text-xs text-amber-900 font-semibold my-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-left leading-relaxed">
              <p className="font-extrabold uppercase text-[10px] tracking-wider text-amber-950">⚠️ Posting privileges restricted</p>
              <p className="text-amber-800 text-[11px] mt-0.5">Your account has been restricted to read-only privileges inside this circle. Starting new updates or posting replies is locked.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddReply} className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-start gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover hidden sm:block"
              />
              <div className="flex-1 relative">
                <textarea
                  required
                  rows={2}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Write your thoughtful advice, resource reference or response here, sister..."
                  className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-xs text-primary focus:border-primary focus:outline-none bg-white placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 bottom-3 p-1.5 rounded-lg text-primary hover:bg-slate-50 hover:text-secondary transition-colors"
                  title="Send Reply"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-bold text-right">
              ✨ Answering threads builds community bonds and earns you <strong className="text-emerald-600">+5 Points</strong>!
            </p>
          </form>
        )}
      </div>
    );
  }

  // If we are currently starting a new discussion topic
  if (isCreatingTopic) {
    return (
      <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
            <PlusCircle className="h-5 w-5 text-secondary" />
            <span>Create New Discussion Topic</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsCreatingTopic(false)}
            className="text-xs font-bold text-slate-400 hover:text-primary py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Discussion Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., What are your favorite zero-waste dye supply shops in East Africa?"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-primary focus:border-primary focus:outline-none bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Category/Tag
              </label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-primary focus:border-primary focus:outline-none bg-white font-bold"
              >
                <option value="Question">❓ Question</option>
                <option value="Advice">💡 Advice</option>
                <option value="Collaboration">🤝 Collaboration</option>
                <option value="Struggle">💔 Struggle / Safe Space</option>
                <option value="Idea">💡 Idea / Innovation</option>
                <option value="Poll">📊 Polling / Vote Topic</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="rounded-xl bg-slate-50 border border-slate-150 p-2.5 w-full flex items-center gap-2 text-[10px] font-bold text-slate-500 leading-tight">
                <Award className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Publishing a thread will earn you <strong className="text-emerald-600">+15 Points</strong> and open it up to community mentorship.</span>
              </div>
            </div>
          </div>

          {newTag === 'Poll' && (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Poll Options (Minimum 2)
              </label>
              <div className="space-y-2">
                {pollOptions.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-extrabold w-5 text-right">{index + 1}.</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[index] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Enter option ${index + 1}`}
                      className="flex-1 rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-primary focus:border-primary focus:outline-none bg-white font-semibold"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== index))}
                        className="text-rose-500 hover:text-rose-600 p-1.5 text-xs font-extrabold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-xs font-extrabold text-secondary hover:text-secondary/95 flex items-center gap-1 pl-7 pt-1"
                >
                  + Add Another Option
                </button>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Discussion Details / Body
            </label>
            <textarea
              required
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide context, share what you have researched, and explain exactly how sisters can help or give opinions..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-primary focus:border-primary focus:outline-none bg-white leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingTopic(false)}
              className="rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary hover:bg-primary/95 text-white px-6 py-2 text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Topic</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Forum Threads Main List View
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Forum & Group Chat Switcher Row */}
      <div className="flex bg-slate-100/70 p-1 rounded-xl border border-slate-150 max-w-sm">
        <button
          type="button"
          onClick={() => { setForumTab('threads'); setActiveThreadId(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-extrabold rounded-lg transition-all ${
            forumTab === 'threads'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-primary'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Threaded Q&A Board</span>
        </button>
        <button
          type="button"
          onClick={() => { setForumTab('chat'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-extrabold rounded-lg transition-all ${
            forumTab === 'chat'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-primary'
          }`}
        >
          <Hash className="h-3.5 w-3.5 text-secondary" />
          <span>Live Circle Chat</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm space-y-4">
      
      {/* Forum Header with search & start topic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-sm font-extrabold text-primary flex items-center gap-1.5">
            <MessageCircle className="h-4.5 w-4.5 text-secondary" />
            <span>Circle Forum Board</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Start or browse deep discussion threads with peers in this circle
          </p>
        </div>

        {cState.moderation === 'restricted' ? (
          <span 
            className="rounded-full bg-slate-100 text-slate-400 border border-slate-200 px-4 py-2 text-xs font-extrabold cursor-not-allowed flex items-center gap-1.5" 
            title="Posting restricted"
          >
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Posting Restricted</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreatingTopic(true)}
            className="rounded-full bg-secondary hover:bg-secondary/95 text-white px-4 py-2 text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Topic (+15 Pts)</span>
          </button>
        )}
      </div>

      {/* SEARCH AND TAG FILTERS */}
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussion titles, topics, or authors..."
            className="w-full rounded-xl border border-slate-150 py-2.5 pl-9 pr-4 text-xs focus:border-primary focus:outline-none bg-slate-50/50 placeholder-slate-400 font-semibold"
          />
        </div>

        {/* Thread Status Filters: Most Recent, Popular, Unanswered */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider hidden sm:inline">Filter Threads:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200 w-fit self-start sm:self-auto">
            {[
              { id: 'Most Recent', label: 'Most Recent', icon: Clock },
              { id: 'Popular', label: 'Popular', icon: TrendingUp },
              { id: 'Unanswered', label: 'Unanswered', icon: MessageSquare }
            ].map((option) => {
              const Icon = option.icon;
              const isActive = threadFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  id={`thread-filter-${option.id.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setThreadFilter(option.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-850 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${isActive ? 'text-secondary' : 'text-slate-400'}`} />
                  <span>{option.label}</span>
                  {option.id === 'Unanswered' && (
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[8px] font-black ${
                      isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {circleThreads.filter(t => !t.replies || t.replies.length === 0).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Buttons Filter Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Tags:</span>
          <button
            type="button"
            id="tag-filter-all"
            onClick={() => setSelectedTag('all')}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
              selectedTag === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Threads ({circleThreads.length})
          </button>
          {['Question', 'Advice', 'Collaboration', 'Struggle', 'Idea', 'Poll'].map((tag) => {
            const count = circleThreads.filter(t => t.tag === tag).length;
            return (
              <button
                key={tag}
                type="button"
                id={`tag-filter-${tag.toLowerCase()}`}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  selectedTag === tag
                    ? 'bg-primary/90 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* THREADS GRID/LIST */}
      {processedThreads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-slate-500 bg-slate-50/20">
          <p className="text-xs font-extrabold text-slate-600">No discussions found matching criteria</p>
          <p className="text-[10px] text-slate-400 mt-1">Be the first to post a new topic and invite sisters to comment!</p>
          <button
            type="button"
            onClick={() => setIsCreatingTopic(true)}
            className="mt-3.5 inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 text-[10px] font-bold text-slate-700"
          >
            <Plus className="h-3 w-3" />
            <span>Start a Conversation</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {processedThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className="rounded-xl border border-slate-150 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group space-y-3 relative"
            >
              {/* Header: Title and tag */}
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-heading text-xs sm:text-sm font-extrabold text-primary group-hover:text-secondary transition-colors leading-tight">
                  {thread.title}
                </h4>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${tagColors[thread.tag]}`}>
                  {thread.tag}
                </span>
              </div>

              {/* Snippet */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {thread.content}
              </p>

              {thread.poll && (
                <div className="flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-100 px-2.5 py-1 text-sky-800 text-[10px] font-bold w-fit">
                  <BarChart className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span>Interactive Poll: {thread.poll.options.reduce((sum, o) => sum + o.votes, 0)} votes cast</span>
                </div>
              )}

              {/* Bottom footer bar: Author, Replies count, Upvotes */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                <div 
                  className="flex items-center gap-2"
                  onClick={(e) => { e.stopPropagation(); handleAuthorClick(thread.author.name); }}
                >
                  <img
                    src={thread.author.avatar}
                    alt={thread.author.name}
                    className="h-6 w-6 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <span className="font-extrabold text-primary hover:underline">{thread.author.name}</span>
                    <span className="text-slate-400 ml-1 font-semibold">({thread.author.rank})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-slate-400 font-bold">
                  <button
                    type="button"
                    onClick={(e) => handleThreadLike(thread.id, e)}
                    className={`flex items-center gap-1 hover:text-rose-500 ${thread.liked ? 'text-rose-500 font-extrabold' : ''}`}
                    title="Upvote Discussion"
                  >
                    <Heart className={`h-3 w-3 ${thread.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{thread.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                    <MessageSquare className="h-3 w-3" />
                    <span>{thread.replies.length} replies</span>
                  </div>

                  <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">
                    {formatTimeAgo(thread.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
