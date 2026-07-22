import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Send, 
  Search, 
  Sparkles, 
  PlusCircle, 
  Compass, 
  Users, 
  Flame, 
  Filter, 
  Check, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Award,
  CircleDot,
  Share2,
  Tag,
  AlertCircle,
  Megaphone,
  Download,
  Lock,
  Unlock,
  ExternalLink,
  FileText,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Clock,
  Ban,
  Trash2,
  UserMinus,
  Shield,
  X,
  Flag,
  AlertTriangle
} from 'lucide-react';
import { Member, Post, Circle, CircleRequest, Event as CommunityEvent, Story, INITIAL_STORIES } from '../data';
import { DiscussionForum } from './DiscussionForum';
import { Stories } from './Stories';
import { FeedWidgets } from './FeedWidgets';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';

import { motion, AnimatePresence } from 'motion/react';

interface CommunityFeedsViewProps {
  members: Member[];
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  circleRequests: CircleRequest[];
  setCircleRequests: React.Dispatch<React.SetStateAction<CircleRequest[]>>;
  events: CommunityEvent[];
  currentUser: Member;
  addPoints: (pts: number, badge?: string) => void;
  setCurrentView: (view: string) => void;
  followingIds: string[];
  toggleFollow: (id: string) => void;
  bookmarkedPostIds: string[];
  toggleBookmarkPost: (id: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  handleViewProfile?: (id: string) => void;
  logActivity?: (action: string, details: string, userId?: string) => void;
  autoHideReported?: boolean;
  reportThreshold?: number;
}

export function CommunityFeedsView({
  members,
  posts,
  setPosts,
  circles,
  setCircles,
  circleRequests,
  setCircleRequests,
  events,
  currentUser,
  addPoints,
  setCurrentView,
  followingIds,
  toggleFollow,
  bookmarkedPostIds,
  toggleBookmarkPost,
  setSelectedConversationMember,
  handleViewProfile,
  logActivity,
  autoHideReported = false,
  reportThreshold = 2
}: CommunityFeedsViewProps) {
  console.log('CommunityFeedsView rendering with posts:', posts.length);
  
  // Sub-navigation tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'discussion'>('feed');
  
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  // Track circle request and moderation states
  const [circleStates, setCircleStates] = useState<Record<string, {
    status: 'none' | 'pending' | 'approved' | 'rejected' | 'on_hold';
    moderation: 'active' | 'restricted' | 'suspended' | 'banned';
    requestMessage?: string;
    updatedAt?: string;
  }>>(() => {
    const saved = localStorage.getItem('big_v2_circle_states_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      learn: { status: 'approved', moderation: 'active', requestMessage: 'Joined automatically during onboarding.', updatedAt: new Date().toLocaleString() },
      connect: { status: 'approved', moderation: 'active', requestMessage: 'Joined automatically during onboarding.', updatedAt: new Date().toLocaleString() },
      earn: { status: 'none', moderation: 'active' },
      thrive: { status: 'none', moderation: 'active' },
    };
  });

  // Persist circle states
  useEffect(() => {
    localStorage.setItem('big_v2_circle_states_v2', JSON.stringify(circleStates));
  }, [circleStates]);

  // Derive joinedCircleIds for backward compatibility
  const joinedCircleIds = useMemo(() => {
    return Object.keys(circleStates).filter(circleId => {
      const state = circleStates[circleId];
      return state && state.status === 'approved' && state.moderation !== 'banned';
    });
  }, [circleStates]);

  // Request drafting state
  const [requestDrafts, setRequestDrafts] = useState<Record<string, string>>({
    earn: 'I am looking forward to seeking cooperative fundraising advice, micro-loans, and venture capital readiness tools to scale my agribusiness.',
    thrive: 'I want to build deep confidence, develop a sustainable self-care routine with other female founders, and access wellness guidelines.'
  });

  // State to track which circle request form is actively being filled out
  const [activeRequestingCircleId, setActiveRequestingCircleId] = useState<string | null>(null);

  // Status logs or simulation feedback for alerts
  const [simulationNotice, setSimulationNotice] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info' | 'danger';
  } | null>(null);

  const triggerSimulationNotice = (message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'info') => {
    setSimulationNotice({ message, type });
    setTimeout(() => {
      setSimulationNotice(null);
    }, 6000);
  };

  const [downloadingResource, setDownloadingResource] = useState<string | null>(null);
  const [joinSuccessCircle, setJoinSuccessCircle] = useState<string | null>(null);

  // Filter expired stories (24h)
  useEffect(() => {
    const filterExpired = () => {
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      setStories(prev => {
        const filtered = prev.filter(story => {
          const storyTime = new Date(story.timestamp).getTime();
          return now - storyTime < twentyFourHours;
        });
        
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    };

    filterExpired();
    const interval = setInterval(filterExpired, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Tab/Filter states
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const activeCircle = circles.find(c => c.id === selectedCircle);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [feedSearchQuery, setFeedSearchQuery] = useState<string>('');
  const [feedScope, setFeedScope] = useState<'all' | 'following' | 'bookmarks'>('all');
  
  // Pagination & Loading States for Feed
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(5);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filter parameters change to keep UI tidy
  useEffect(() => {
    setVisiblePostsCount(5);
  }, [selectedCircle, selectedTag, feedSearchQuery, feedScope]);

  // Load More logic
  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // Simulate slight network delay for premium visual feedback
    setTimeout(() => {
      setVisiblePostsCount(prev => prev + 5);
      setIsLoadingMore(false);
    }, 600);
  };
  
  // Post input states
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCircle, setNewPostCircle] = useState<string>('connect');
  const [newPostTag, setNewPostTag] = useState<string>('general');
  const [postSuccessMessage, setPostSuccessMessage] = useState<boolean>(false);
  
  // Muted users state
  const [mutedUserIds, setMutedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('big_v2_muted_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('big_v2_muted_users', JSON.stringify(mutedUserIds));
  }, [mutedUserIds]);

  const toggleMuteUser = (userId: string) => {
    if (!userId) return;
    setMutedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    const isMuting = !mutedUserIds.includes(userId);
    triggerSimulationNotice(isMuting ? 'User muted. You will no longer see their posts.' : 'User unmuted.', isMuting ? 'warning' : 'info');
  };

  // Post reporting states
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('Spam, scam, or commercial advertisement');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [revealedReportedPostIds, setRevealedReportedPostIds] = useState<string[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  const handleReportPostSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reportingPostId || isSubmittingReport) return;

    if (reportReason === 'Other (please specify below)' && !reportDetails.trim()) {
      triggerSimulationNotice('Please provide additional details when selecting "Other".', 'warning');
      return;
    }

    setIsSubmittingReport(true);

    // Simulate database delay for an incredible UX feel
    setTimeout(() => {
      const postObj = posts.find(p => p.id === reportingPostId);
      const postAuthor = postObj ? postObj.author.name.replace(/\s*\(You\)/gi, '') : 'Unknown';
      const postSnippet = postObj ? (postObj.content.length > 50 ? `${postObj.content.substring(0, 50)}...` : postObj.content) : '';

      setPosts(prev => prev.map(p => {
        if (p.id === reportingPostId) {
          const oldReports = (p as any).reports || [];
          const newReport = {
            id: `rep-${Date.now()}`,
            reason: reportReason,
            details: reportDetails,
            reporterName: currentUser.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const updatedReports = [...oldReports, newReport];
          return {
            ...p,
            isReported: true,
            reportReason,
            reportDetails,
            reportCount: updatedReports.length,
            reports: updatedReports
          } as any;
        }
        return p;
      }));

      if (logActivity) {
        logActivity(
          'Post Reported',
          `Post by ${postAuthor} reported for "${reportReason}". Reason/Details: ${reportDetails || 'None provided'}. Content: "${postSnippet}"`,
          currentUser.id
        );
      }

      triggerSimulationNotice(
        `🛡️ Post reported successfully for "${reportReason}". The Sisterhood Council has been notified.`, 
        'success'
      );

      setIsSubmittingReport(false);
      setReportingPostId(null);
      setReportReason('Spam, scam, or commercial advertisement');
      setReportDetails('');
    }, 1200);
  };
  
  // Post edit states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState<string>('');
  const [confirmingDeletePostId, setConfirmingDeletePostId] = useState<string | null>(null);

  const postToDelete = useMemo(() => {
    return posts.find(p => p.id === confirmingDeletePostId);
  }, [posts, confirmingDeletePostId]);
  
  const handleEditPostStart = (post: Post) => {
    setEditingPostId(post.id);
    setEditPostContent(post.content);
  };

  const handleEditPostCancel = () => {
    setEditingPostId(null);
    setEditPostContent('');
  };

  const handleEditPostSave = (postId: string) => {
    if (!editPostContent.trim()) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          content: editPostContent,
          tags: extractHashtags(editPostContent)
        };
      }
      return p;
    }));
    setEditingPostId(null);
    setEditPostContent('');
  };

  const handleDeletePost = (postId: string) => {
    setConfirmingDeletePostId(postId);
  };

  const handleHidePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    triggerSimulationNotice('Post hidden from your feed.', 'success');
  };

  const handleConfirmDeletePost = () => {
    if (confirmingDeletePostId) {
      setPosts(prev => prev.filter(p => p.id !== confirmingDeletePostId));
      triggerSimulationNotice('Post permanently deleted.', 'success');
      setConfirmingDeletePostId(null);
    }
  };
  
  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentLikes = Array.isArray(p.likes) ? p.likes : [];
        const isCurrentlyLiked = currentLikes.includes(currentUser.id);
        const updatedLikes = isCurrentlyLiked
          ? currentLikes.filter(id => id !== currentUser.id)
          : [...currentLikes, currentUser.id];
        return {
          ...p,
          liked: !isCurrentlyLiked,
          likes: updatedLikes
        };
      }
      return p;
    }));
  };

  // Comment states
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');

  const toggleCommentsDisabled = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newState = !post.commentsDisabled;
        triggerSimulationNotice(newState ? 'Comments turned off for this post.' : 'Comments turned on for this post.', newState ? 'warning' : 'success');
        return { ...post, commentsDisabled: newState };
      }
      return post;
    }));
  };

  const handleEditCommentStart = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleEditCommentSave = (postId: string, commentId: string) => {
    if (!editCommentContent.trim()) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(c => 
            c.id === commentId ? { ...c, content: editCommentContent } : c
          )
        };
      }
      return post;
    }));
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    const isPostOwner = post && (post.author.id === currentUser.id || post.author.name.includes('(You)'));
    
    if (confirm(isPostOwner ? 'Delete this comment from your post?' : 'Delete this comment?')) {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(c => c.id !== commentId)
          };
        }
        return post;
      }));
    }
  };

  // Circle Details
  const CIRCLES = [
    { id: 'all', label: '📢 All Circles', color: 'bg-slate-100 text-slate-800 border-slate-200', desc: 'Central connection space for all BIG members.' },
    { id: 'learn', label: '📚 Learn Circle', color: 'bg-pink-50 text-pink-800 border-pink-200', desc: 'Practical skills development, study groups, and digital toolkits.' },
    { id: 'connect', label: '🔌 Connect Circle', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', desc: 'Chapter organization, safe vocal training, and peer networking.' },
    { id: 'earn', label: '💼 Earn Circle', color: 'bg-amber-50 text-amber-800 border-amber-200', desc: 'Venture fundraising, cooperative registration, and micro-leasing.' },
    { id: 'thrive', label: '💖 Thrive Circle', color: 'bg-rose-50 text-rose-800 border-rose-200', desc: 'Founder mental health, self-care routines, and emotional resilience.' },
  ];


  // Tag details
  const [POST_TAGS, setPOST_TAGS] = useState([
    { id: 'all', label: '✨ All Categories' },
    { id: 'Marketing', label: '📈 Marketing' },
    { id: 'Tech', label: '💻 Tech' },
    { id: 'Funding', label: '💰 Funding' },
    { id: 'win', label: '🏆 Celebration Win' },
    { id: 'question', label: '💡 Sisterly Question' },
    { id: 'general', label: '📣 General Update' },
  ]);

  // Tag badge helper
  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'win':
        return <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">🏆 Win</span>;
      case 'question':
        return <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">💡 Question</span>;
      case 'Marketing':
        return <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">📈 Marketing</span>;
      case 'Tech':
        return <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[9px] font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1">💻 Tech</span>;
      case 'Funding':
        return <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">💰 Funding</span>;
      default:
        return <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">📣 General</span>;
    }
  };

  // Submit join request
  const submitJoinRequest = (circleId: string, message: string) => {
    setCircleStates(prev => ({
      ...prev,
      [circleId]: {
        status: 'pending',
        moderation: 'active',
        requestMessage: message,
        updatedAt: new Date().toLocaleString()
      }
    }));
    addPoints(10); // Reward points for application initiative!
    triggerSimulationNotice(`Submitted Join Request for ${CIRCLES.find(c => c.id === circleId)?.label || circleId}! Sisterhood Gatekeepers have been notified.`, 'success');
    setActiveRequestingCircleId(null);
  };

  // Cancel join request
  const cancelJoinRequest = (circleId: string) => {
    setCircleStates(prev => ({
      ...prev,
      [circleId]: {
        status: 'none',
        moderation: 'active',
        requestMessage: '',
        updatedAt: new Date().toLocaleString()
      }
    }));
    triggerSimulationNotice(`Cancelled Join Request for ${CIRCLES.find(c => c.id === circleId)?.label || circleId}.`, 'info');
  };

  // Administrative / Sandbox moderation actions
  const adminModerateCircle = (
    circleId: string,
    status: 'none' | 'pending' | 'approved' | 'rejected' | 'on_hold',
    moderation: 'active' | 'restricted' | 'suspended' | 'banned'
  ) => {
    setCircleStates(prev => {
      const existing = prev[circleId] || { status: 'none', moderation: 'active' };
      return {
        ...prev,
        [circleId]: {
          ...existing,
          status,
          moderation,
          updatedAt: new Date().toLocaleString()
        }
      };
    });

    const circleName = CIRCLES.find(c => c.id === circleId)?.label || circleId;

    if (status === 'approved') {
      addPoints(40); // complete reward points
      triggerSimulationNotice(`🎉 Simulation: Request to join ${circleName} has been APPROVED! You are now an active member.`, 'success');
    } else if (status === 'rejected') {
      triggerSimulationNotice(`❌ Simulation: Request to join ${circleName} has been REJECTED by the Sisterhood council.`, 'danger');
    } else if (status === 'on_hold') {
      triggerSimulationNotice(`⚠️ Simulation: Request to join ${circleName} has been put ON HOLD.`, 'warning');
    } else if (moderation === 'restricted') {
      triggerSimulationNotice(`🔒 Simulation: Your privileges in ${circleName} are now RESTRICTED (read-only).`, 'warning');
    } else if (moderation === 'suspended') {
      triggerSimulationNotice(`🚫 Simulation: Your membership in ${circleName} is now SUSPENDED. Content is hidden.`, 'danger');
    } else if (moderation === 'banned') {
      triggerSimulationNotice(`🚫 Simulation: You have been BANNED from ${circleName} by the council.`, 'danger');
    } else if (status === 'none') {
      triggerSimulationNotice(`🗑️ Simulation: Removed from ${circleName}. Status reset to visitor.`, 'info');
    }
  };

  // Toggle Circle Membership or start Join Request draft flow
  const handleToggleJoinCircle = (circleId: string) => {
    if (circleId === 'all') return;
    const isJoined = joinedCircleIds.includes(circleId);
    const circleState = circleStates[circleId] || { status: 'none', moderation: 'active' };

    if (isJoined) {
      setCircleStates(prev => ({
        ...prev,
        [circleId]: { status: 'none', moderation: 'active', requestMessage: '', updatedAt: new Date().toLocaleString() }
      }));
      addPoints(-25); // balancing subtraction
      triggerSimulationNotice(`You have left the ${CIRCLES.find(c => c.id === circleId)?.label || circleId}.`, 'info');
    } else if (circleState.status === 'pending' || circleState.status === 'on_hold') {
      cancelJoinRequest(circleId);
    } else if (circleState.moderation === 'banned') {
      triggerSimulationNotice(`Cannot request to join. You are currently BANNED from ${CIRCLES.find(c => c.id === circleId)?.label || circleId}.`, 'danger');
    } else {
      // Open inline request input
      setActiveRequestingCircleId(circleId);
    }
  };

  // Download Circle Resource (simulated)
  const handleDownloadResource = (resource: any) => {
    setDownloadingResource(resource.id);
    addPoints(10); // Reward 10 Pts for self-learning
    setTimeout(() => {
      setDownloadingResource(null);
    }, 2000);
  };

  // Add a story
  const handleAddStory = (storyData: Partial<Story>) => {
    const newStory: Story = {
      id: `s-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      circleId: activeCircle?.id,
      imageUrl: storyData.imageUrl || '',
      timestamp: storyData.timestamp || new Date().toISOString(),
      privacy: storyData.privacy || 'public',
      viewers: []
    };
    setStories(prev => [newStory, ...prev]);
    addPoints(5);
  };

  // Like a post
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentLikes = Array.isArray(post.likes) ? post.likes : [];
        const isCurrentlyLiked = currentLikes.includes(currentUser.id);
        const updatedLikes = isCurrentlyLiked
          ? currentLikes.filter(id => id !== currentUser.id)
          : [...currentLikes, currentUser.id];
        
        if (!isCurrentlyLiked) {
          addPoints(2);
        }

        return { 
          ...post, 
          likes: updatedLikes, 
          liked: !isCurrentlyLiked 
        };
      }
      return post;
    }));
  };

  // Submit a comment
  const handleCommentSubmit = (postId: string, text: string) => {
    if (!text.trim()) return;

    const newComment = {
      id: `comm-custom-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      content: text,
      timestamp: 'Just now',
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    // Award points
    addPoints(5);

    // Clear comment input
    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  // Extract hashtags from content
  const extractHashtags = (text: string) => {
    const matches = text.match(/#\w+/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  // Create a new post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPostObj: Post = {
      id: `post-custom-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank
      },
      content: newPostContent,
      timestamp: 'Just now',
      likes: [],
      comments: [],
      liked: false,
      circleId: newPostCircle,
      tag: newPostTag,
      tags: extractHashtags(newPostContent)
    };

    setPosts(prev => [newPostObj, ...prev]);
    setNewPostContent('');
    setPostSuccessMessage(true);
    addPoints(10); // Award 10 points for sharing an update

    setTimeout(() => {
      setPostSuccessMessage(false);
    }, 4000);
  };

  // Compose post via the custom PostComposer
  const handleComposePost = (content: string, tag: string, scheduledFor?: string) => {
    if (!content.trim()) return;

    const newPostObj: Post = {
      id: `post-custom-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank
      },
      content: content,
      timestamp: scheduledFor ? 'Scheduled' : 'Just now',
      likes: [],
      comments: [],
      liked: false,
      circleId: activeCircle?.id || 'connect',
      tag: tag || 'general',
      tags: extractHashtags(content),
      scheduledFor: scheduledFor,
      status: scheduledFor ? 'scheduled' : 'published'
    };

    setPosts(prev => [newPostObj, ...prev]);
    addPoints(10); // Award 10 points for sharing an update
    
    if (scheduledFor) {
      const dateStr = new Date(scheduledFor).toLocaleString();
      triggerSimulationNotice(`📅 Post scheduled for ${dateStr}! +10 Sisterhood Points`, 'success');
    } else {
      triggerSimulationNotice('✨ Post published successfully! +10 Sisterhood Points', 'success');
    }
  };

  // Share post logic
  const handleSharePost = (title: string, customUrl?: string, sharedViaWebShare?: boolean) => {
    const url = customUrl || window.location.href;
    const cleanTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    
    if (sharedViaWebShare) {
      triggerSimulationNotice(`Shared via Web Share: "${cleanTitle}"`, 'success');
    } else {
      triggerSimulationNotice(`Copied unique link to clipboard! Share the inspiration: "${cleanTitle}"`, 'success');
    }
  };

  // Handle reposting a post onto the feed
  const handleRepostPost = (postId: string, thoughts?: string) => {
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    // Increment repostsCount in the original post
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentCount = p.repostsCount || 3;
        return { ...p, repostsCount: currentCount + 1 };
      }
      return p;
    }));

    // Create a new post representing the repost
    const originalAuthorClean = originalPost.author.name.replace(/\s*\(You\)/gi, '');
    const compiledContent = thoughts 
      ? `${thoughts}\n\n♻️ Reposted from ${originalAuthorClean}:\n"${originalPost.content}"`
      : `♻️ Reposted from ${originalAuthorClean}:\n"${originalPost.content}"`;

    const newPostObj: Post = {
      id: `post-repost-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank
      },
      content: compiledContent,
      timestamp: 'Just now',
      likes: [],
      comments: [],
      liked: false,
      circleId: originalPost.circleId,
      tag: 'general',
      tags: originalPost.tags || [],
      repostsCount: 0
    };

    setPosts(prev => [newPostObj, ...prev]);
    addPoints(15); // Award points for circulating knowledge
    triggerSimulationNotice(
      thoughts 
        ? `Quote post published successfully! +15 Points`
        : `Reposted successfully to your feed! +15 Points`,
      'success'
    );
  };

  // Handle sending/sharing a post in DM
  const handleSendPost = (postId: string, recipientName: string, message?: string) => {
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    const detailMsg = message ? ` with note: "${message}"` : '';
    triggerSimulationNotice(
      `Shared post with ${recipientName}${detailMsg}!`,
      'success'
    );
    addPoints(5); // Reward points for connection
  };

  // Filter logic
  const filteredPosts = posts.filter(post => {
    // Hide posts from muted users
    if (post.author.id && mutedUserIds.includes(post.author.id)) return false;

    // Auto-hide reported posts if option is enabled and report threshold is met or exceeded
    if (autoHideReported && (post as any).isReported) {
      const reportsList = (post as any).reports || [];
      const count = (post as any).reportCount || (reportsList.length > 0 ? reportsList.length : 1);
      if (count >= reportThreshold) {
        return false;
      }
    }

    // Hide scheduled posts if they are for the future
    if (post.status === 'scheduled' && post.scheduledFor) {
      if (new Date(post.scheduledFor).getTime() > Date.now()) return false;
    }

    // Circle Tab selection
    const matchesCircle = selectedCircle === 'all' || post.circleId === selectedCircle;
    
    // Custom tag selection
    const postActualTag = post.tag || (post.id === 'post-1' ? 'win' : post.id === 'post-2' ? 'general' : 'question');
    const hasMatchingHashtag = post.tags ? post.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()) : false;
    const matchesTag = selectedTag === 'all' || postActualTag === selectedTag || hasMatchingHashtag;

    // Search query matched with post content, author name, or tags
    const lowerQuery = feedSearchQuery.toLowerCase();
    const matchesSearch = 
      post.content.toLowerCase().includes(lowerQuery) ||
      post.author.name.toLowerCase().includes(lowerQuery) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(lowerQuery)));

    // Scope selection (All, Following, Bookmarks)
    const authorMember = members.find(m => m.name === post.author.name);
    const matchesScope = 
      feedScope === 'all' ||
      (feedScope === 'following' && authorMember && followingIds.includes(authorMember.id)) ||
      (feedScope === 'bookmarks' && bookmarkedPostIds.includes(post.id));

    return matchesCircle && matchesTag && matchesSearch && matchesScope;
  });

  const slicedPosts = filteredPosts.slice(0, visiblePostsCount);

  // IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    if (!infiniteScrollEnabled) return;

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoadingMore && filteredPosts.length > visiblePostsCount) {
        handleLoadMore();
      }
    }, {
      rootMargin: '120px', // Trigger load before reaching the absolute bottom
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [infiniteScrollEnabled, isLoadingMore, filteredPosts.length, visiblePostsCount]);

  return (
    <div className="bg-[#f4f2ee] dark:bg-slate-950 min-h-screen -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 transition-colors">
      <div id="community-feeds-view" className="mx-auto max-w-7xl animate-fade-in">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* MIDDLE COLUMN: STORIES, POST CREATOR, FEED */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* STORIES TRAY */}
            <Stories 
              stories={stories.filter(s => activeCircle ? s.circleId === activeCircle.id : s.privacy === 'public')}
              members={members} 
              currentUser={currentUser} 
              onAddStory={handleAddStory}
              isCircleContext={!!activeCircle}
            />

            {/* POST COMPOSER - Desktop Only */}
            <div className="hidden lg:block">
              <PostComposer 
                currentUser={currentUser} 
                onPost={handleComposePost} 
                members={members} 
              />
            </div>

            {/* SIMULATION NOTIFICATION */}
            {simulationNotice && (
              <div className={`rounded-xl border p-4 flex items-start gap-3 shadow-sm animate-fade-in ${
                simulationNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                simulationNotice.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                simulationNotice.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span>🛡️ Council Simulation Notice</span>
                  </p>
                  <p className="text-xs font-bold leading-relaxed">{simulationNotice.message}</p>
                </div>
                <button 
                  onClick={() => setSimulationNotice(null)}
                  className="text-xs font-bold opacity-60 hover:opacity-100 uppercase"
                >
                  Dismiss
                </button>
              </div>
            )}

             {/* DYNAMIC FEED */}
            <div className="space-y-4">
              {/* Cohesive Filter & Segmented Control Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5 mt-4">
                {/* Row 1: Feed Scope Toggles & Category Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                    {[
                      { id: 'all', label: 'All Feed', count: posts.length },
                      { id: 'following', label: 'Following', count: posts.filter(p => {
                        const auth = members.find(m => m.name === p.author.name);
                        return auth && followingIds.includes(auth.id);
                      }).length },
                      { id: 'bookmarks', label: 'Saved', count: posts.filter(p => bookmarkedPostIds.includes(p.id)).length }
                    ].map((scope) => {
                      const isActive = feedScope === scope.id;
                      return (
                        <button
                          key={scope.id}
                          onClick={() => setFeedScope(scope.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{scope.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {scope.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>


              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center max-w-xl mx-auto shadow-sm"
                  >
                    {/* Dynamic Icon Indicator */}
                    {(() => {
                      let IconComponent = Compass;
                      let bgClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400";
                      
                      if (feedScope === 'bookmarks') {
                        IconComponent = Bookmark;
                        bgClass = "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400";
                      } else if (feedScope === 'following') {
                        IconComponent = Users;
                        bgClass = "bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400";
                      } else if (feedSearchQuery !== '') {
                        IconComponent = Search;
                        bgClass = "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
                      } else if (selectedTag !== 'all') {
                        IconComponent = Tag;
                        bgClass = "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400";
                      } else if (selectedCircle !== 'all') {
                        IconComponent = CircleDot;
                        bgClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400";
                      }

                      return (
                        <div className={`h-16 w-16 rounded-2xl ${bgClass} flex items-center justify-center mb-6 shadow-sm`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                      );
                    })()}

                    {/* Dynamic Title */}
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {(() => {
                        if (feedScope === 'bookmarks') return "No Bookmarked Updates";
                        if (feedScope === 'following') return "Feed is Quiet Right Now";
                        if (feedSearchQuery !== '') return "No Matches Found";
                        if (selectedTag !== 'all') return "No Category Highlights";
                        if (selectedCircle !== 'all') {
                          const name = CIRCLES.find(c => c.id === selectedCircle)?.label || selectedCircle;
                          return `Quiet in ${name.replace(/[^a-zA-Z\s]/g, '').trim()}`;
                        }
                        return "No Sisterhood Updates";
                      })()}
                    </h3>

                    {/* Dynamic Description */}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed max-w-md">
                      {(() => {
                        if (feedScope === 'bookmarks') {
                          return "You haven't bookmarked any updates yet. Explore the community feed and bookmark posts to save important funding tips, study resources, or stories!";
                        }
                        if (feedScope === 'following') {
                          return "Updates from sisters you follow will appear here. Try following more members of the sisterhood or switch back to the 'All Feed' to discover amazing leaders!";
                        }
                        if (feedSearchQuery !== '') {
                          return `We couldn't find any discussion posts or resources matching "${feedSearchQuery}". Try adjusting your keywords or look into trending tags.`;
                        }
                        if (selectedTag !== 'all') {
                          const tagName = POST_TAGS.find(t => t.id === selectedTag)?.label || selectedTag;
                          return `There are currently no active posts tagged under ${tagName.replace(/[^a-zA-Z\s]/g, '').trim()}. Be the first one to write about this!`;
                        }
                        if (selectedCircle !== 'all') {
                          const name = CIRCLES.find(c => c.id === selectedCircle)?.label || selectedCircle;
                          return `No posts have been published in the ${name.replace(/[^a-zA-Z\s]/g, '').trim()} circle yet. Start a sisterly conversation today!`;
                        }
                        return "There are no community updates available under this combination of filters. Check back soon or start the conversation yourself!";
                      })()}
                    </p>

                    {/* CTA Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full">
                      {/* Button to clear specific filters / reset */}
                      {(selectedTag !== 'all' || selectedCircle !== 'all' || feedSearchQuery !== '' || feedScope !== 'all') && (
                        <button
                          onClick={() => {
                            setSelectedTag('all');
                            setSelectedCircle('all');
                            setFeedSearchQuery('');
                            setFeedScope('all');
                            triggerSimulationNotice('✨ All filters reset! Explore the full feed.', 'success');
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <span>Clear All Filters</span>
                        </button>
                      )}

                      {/* Scope-specific fast transition CTA */}
                      {feedScope !== 'all' && (
                        <button
                          onClick={() => setFeedScope('all')}
                          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span>Explore All Feed</span>
                        </button>
                      )}

                      {/* Specific Search CTA */}
                      {feedSearchQuery !== '' && (
                        <button
                          onClick={() => setFeedSearchQuery('')}
                          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span>Reset Search</span>
                        </button>
                      )}

                      {/* Default: Share Update / Post Composer focus trigger */}
                      <button
                        onClick={() => {
                          const element = document.getElementById('post-composer-input') || document.querySelector('textarea');
                          if (element) {
                            element.focus();
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            triggerSimulationNotice('✏️ Type your update in the composer!', 'info');
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            triggerSimulationNotice('✏️ Scroll to the top to share an update!', 'info');
                          }
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 rounded-xl transition-all flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-900/40"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Share an Update</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {slicedPosts.map((post) => {
                      const isReported = (post as any).isReported;
                      const isRevealed = revealedReportedPostIds.includes(post.id);

                      if (isReported && !isRevealed) {
                        return (
                          <div key={post.id} className="bg-white border border-rose-100 rounded-xl p-5 shadow-sm mb-4 animate-fade-in flex flex-col items-center text-center space-y-3.5">
                            <div className="h-11 w-11 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                              <AlertTriangle className="h-5.5 w-5.5" />
                            </div>
                            <div className="max-w-md">
                              <p className="text-sm font-bold text-slate-800">You flagged this post for review</p>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Reason: <span className="font-semibold text-rose-600">{(post as any).reportReason}</span>
                                {(post as any).reportDetails && (
                                  <span className="block italic text-slate-400 mt-1 font-medium">"{(post as any).reportDetails}"</span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-2">
                                The Sisterhood Council is checking this post to keep our network supportive and safe.
                              </p>
                            </div>
                            <div className="flex justify-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isReported: false } as any : p));
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                              >
                                Cancel Report
                              </button>
                              <button
                                onClick={() => setRevealedReportedPostIds(prev => [...prev, post.id])}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-all"
                              >
                                Reveal Post
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isBookmarked={bookmarkedPostIds.includes(post.id)}
                          onToggleLike={handleLike}
                          onToggleBookmark={toggleBookmarkPost}
                          onToggleMute={toggleMuteUser}
                          onDelete={handleDeletePost}
                          onHidePost={handleHidePost}
                          onEdit={handleEditPostStart}
                          onShare={handleSharePost}
                          onViewProfile={handleViewProfile}
                          isEditing={editingPostId === post.id}
                          editContent={editPostContent}
                          onEditContentChange={setEditPostContent}
                          onSaveEdit={handleEditPostSave}
                          onCancelEdit={handleEditPostCancel}
                          isMuted={mutedUserIds.includes(post.author.id || '')}
                          onCommentSubmit={handleCommentSubmit}
                          onDeleteComment={handleDeleteComment}
                          onEditComment={handleEditCommentStart}
                          editingCommentId={editingCommentId}
                          editCommentContent={editCommentContent}
                          onEditCommentChange={setEditCommentContent}
                          onSaveCommentEdit={handleEditCommentSave}
                          onCancelCommentEdit={handleEditCommentCancel}
                          commentsDisabled={post.commentsDisabled}
                          onToggleCommentsDisabled={toggleCommentsDisabled}
                          onRepost={handleRepostPost}
                          members={members}
                          onReportPost={setReportingPostId}
                        />
                      );
                    })}

                    {/* Pagination control */}
                    {filteredPosts.length > 0 && (
                      <div className="pt-6 pb-4 flex flex-col items-center gap-4">
                        {/* Status tracker */}
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Showing <span className="font-extrabold text-slate-900 dark:text-white">{Math.min(visiblePostsCount, filteredPosts.length)}</span> of <span className="font-extrabold text-slate-900 dark:text-white">{filteredPosts.length}</span> sisterhood updates
                        </div>

                        {/* Loader element */}
                        {visiblePostsCount < filteredPosts.length ? (
                          <div ref={loaderRef} className="w-full flex justify-center pt-2">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold py-3">
                              <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent rounded-full animate-spin" />
                              <span>Loading more posts from the sisterhood...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-bold py-3 flex items-center gap-1.5 mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 px-4 py-2 rounded-xl">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>You are completely caught up! No more updates to load.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WIDGETS */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28">
             <FeedWidgets 
               events={events} 
               members={members} 
               onConnect={(id) => triggerSimulationNotice(`Connection request sent to sister.`, 'success')}
               onViewEvent={(id) => triggerSimulationNotice(`Viewing event details...`, 'info')}
             />
          </div>

        </div>

        {/* Sub-tabs navigation fallback for logic consistency if needed elsewhere */}
        {/* activeTab === 'discussion' && <DiscussionForum ... /> */}

        {/* REPORT MODAL */}
        <AnimatePresence>
          {reportingPostId && (() => {
            const reportedPost = posts.find(p => p.id === reportingPostId);
            const wordCount = reportDetails.trim().split(/\s+/).filter(Boolean).length;
            
            return (
              <div className="fixed inset-0 z-[100] overflow-y-auto" id="report-modal">
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isSubmittingReport && setReportingPostId(null)}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                />

                {/* Modal Container */}
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="relative transform rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-slate-100 overflow-hidden"
                  >
                    {/* Top Accent line */}
                    <div className="h-1.5 bg-rose-500 w-full shrink-0" />

                    {/* Header */}
                    <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-50 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                          <Flag className="h-5.5 w-5.5 fill-rose-100" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">Report Inappropriate Content</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Help keep our safe sisterhood network supportive, positive, and constructive.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => !isSubmittingReport && setReportingPostId(null)}
                        disabled={isSubmittingReport}
                        className="rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Loading Overlay */}
                    {isSubmittingReport && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-10 flex flex-col items-center justify-center space-y-4">
                        <div className="relative flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" />
                          <Flag className="h-5 w-5 text-rose-600 absolute animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900">Filing Confidential Report...</p>
                          <p className="text-xs text-slate-400 mt-1">Notifying the Sisterhood Council for review</p>
                        </div>
                      </div>
                    )}

                    {/* Body Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleReportPostSubmit(); }} className="p-6 space-y-5">
                      {/* Post Preview Box */}
                      {reportedPost && (
                        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-3">
                          <img 
                            src={reportedPost.author.avatar} 
                            alt={reportedPost.author.name} 
                            className="h-8 w-8 rounded-full shrink-0 object-cover border border-slate-200" 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                {reportedPost.author.name.replace(/\s*\(You\)/gi, '')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">• {reportedPost.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed italic">
                              "{reportedPost.content}"
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Reason for Flagging
                        </label>
                        <p className="text-xs text-slate-500 leading-normal">
                          Please select the option that best describes what is wrong with this post:
                        </p>
                        
                        {/* Interactive Reason Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {[
                            {
                              value: 'Spam, scam, or commercial advertisement',
                              title: 'Spam or Advertisement',
                              desc: 'Commercial links, marketing, repetitive posts, or get-rich-quick scams.',
                              icon: Ban,
                              color: 'text-amber-500 bg-amber-50 border-amber-100',
                            },
                            {
                              value: 'Harassment, hate speech, or bullying',
                              title: 'Harassment & Bullying',
                              desc: 'Personal attacks, discrimination, hate speech, or abusive/hostile language.',
                              icon: AlertCircle,
                              color: 'text-rose-500 bg-rose-50 border-rose-100',
                            },
                            {
                              value: 'Inappropriate media, violence, or sensitive content',
                              title: 'Inappropriate Content',
                              desc: 'Graphic images, violence, sexually explicit media, or sensitive triggers.',
                              icon: AlertTriangle,
                              color: 'text-orange-500 bg-orange-50 border-orange-100',
                            },
                            {
                              value: 'Misinformation or political/religious debate',
                              title: 'Misinformation & Debate',
                              desc: 'Deceptive fake news, conspiracy theories, or political/religious fighting.',
                              icon: Shield,
                              color: 'text-pink-500 bg-pink-50 border-pink-100',
                            },
                            {
                              value: 'Unrelated to women\'s empowerment / off-topic',
                              title: 'Off-Topic or Irrelevant',
                              desc: 'Completely unrelated to our community mission, mentoring, or goals.',
                              icon: Compass,
                              color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
                            },
                            {
                              value: 'Other (please specify below)',
                              title: 'Other Reason',
                              desc: 'Any other issue that doesn\'t fit the categories above (describe below).',
                              icon: HelpCircle,
                              color: 'text-slate-500 bg-slate-100 border-slate-200',
                            }
                          ].map((item) => {
                            const isSelected = reportReason === item.value;
                            const IconComp = item.icon;
                            
                            return (
                              <button
                                type="button"
                                key={item.value}
                                onClick={() => setReportReason(item.value)}
                                className={`flex items-start text-left gap-3 p-3 rounded-xl border transition-all duration-200 outline-none ${
                                  isSelected
                                    ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500 shadow-xs'
                                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-rose-950' : 'text-slate-800'}`}>
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                                    {item.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Additional details text area */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Additional Details / Context {reportReason === 'Other (please specify below)' && <span className="text-rose-500">*</span>}
                          </label>
                          <span className={`text-[10px] font-semibold ${reportDetails.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {reportDetails.length}/500
                          </span>
                        </div>
                        <textarea
                          value={reportDetails}
                          onChange={(e) => setReportDetails(e.target.value.substring(0, 500))}
                          placeholder={
                            reportReason === 'Other (please specify below)'
                              ? 'Please explain the issue clearly here (required for Other reasons)...'
                              : 'Provide any extra context, post URLs, comments, or helpful details for our moderators...'
                          }
                          rows={3}
                          className="w-full text-xs text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-xl p-3.5 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                        />
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
                        <Shield className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 leading-normal font-medium">
                          Your safety is our priority. Reports are kept completely confidential and anonymous. Members of our Sisterhood Council will review this content within 24 hours.
                        </p>
                      </div>
                    </form>

                    {/* Actions footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                      <button
                        type="button"
                        onClick={() => !isSubmittingReport && setReportingPostId(null)}
                        disabled={isSubmittingReport}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportPostSubmit()}
                        disabled={isSubmittingReport}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Flag className="h-3.5 w-3.5 fill-current" />
                        <span>Submit Report</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* DELETE POST CONFIRMATION MODAL */}
        <AnimatePresence>
          {confirmingDeletePostId && (
            <div className="fixed inset-0 z-50 overflow-y-auto" id="delete-post-modal">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmingDeletePostId(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              />

              {/* Modal Container */}
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: 'spring', duration: 0.4 }}
                  className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100"
                >
                  {/* Top Bar Accent */}
                  <div className="h-1.5 bg-rose-500 w-full" />

                  {/* Header */}
                  <div className="p-6 pb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 leading-tight">Delete Post</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to permanently delete this?</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmingDeletePostId(null)}
                      className="rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="px-6 py-2 space-y-3.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This action is permanent and cannot be undone. The post will be immediately and irreversibly removed from your profile and the Sisterhood network.
                    </p>

                    {postToDelete && (
                      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 font-medium leading-relaxed italic line-clamp-3 relative">
                        "{postToDelete.content}"
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="px-6 py-4 mt-4 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setConfirmingDeletePostId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeletePost}
                      className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm hover:shadow transition-all"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
