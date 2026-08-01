import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  Send, 
  Search, 
  MapPin, 
  Sparkles, 
  CheckCircle,
  MessageSquare,
  AlertCircle,
  SmilePlus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Info,
  X,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Briefcase,
  CircleDot,
  ExternalLink,
  Lock,
  Volume2,
  VolumeX,
  Users,
  UserPlus,
  Hash,
  ChevronLeft,
  Smile,
  Trash2,
  Plus,
  ArrowRight,
  Download,
  Award
} from 'lucide-react';
import { Member, Conversation, Message, INITIAL_MEMBERS } from '../data';
import { copyToClipboard, formatTimeAgo } from '../lib/utils';

interface MessagesViewProps {
  conversations: Conversation[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
  addPoints: (pts: number, badge?: string) => void;
  initialDraftMessage?: string;
  clearDraftMessage?: () => void;
  currentUser: Member;
}

export interface GroupMessage {
  id: string;
  circleId: 'learn' | 'connect' | 'earn' | 'thrive';
  author: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  content: string;
  timestamp: string;
  attachment?: {
    type: 'image' | 'document' | 'audio' | 'video';
    name: string;
    url?: string;
    size?: string;
    duration?: string;
  };
}

const INITIAL_GROUP_MESSAGES: GroupMessage[] = [
  {
    id: 'gmsg-l1',
    circleId: 'learn',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Learner'
    },
    content: "Assalamu alaikum sisters! Has anyone started the new practical module on 'Confident Sales Conversations'? The section on objection handling is so detailed!",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-l2',
    circleId: 'learn',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Mentor'
    },
    content: "Waalaykumussalam Amina! Yes, I helped structure that course. Remember that an objection is never a rejection—it is simply a buyer asking for more evidence. Let me know if you want to practice mock pitches!",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-l3',
    circleId: 'learn',
    author: {
      id: 'm3',
      name: 'Hawa Keita',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Community Lead'
    },
    content: "I'd love to join a mock sales practice session too! Maybe we can organize a group huddle on Zoom this Friday?",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-c1',
    circleId: 'connect',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Member'
    },
    content: "Good morning sisters! I am currently visiting the Kampala tech hub. If any sister is in town, let us grab a tea and talk shop!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-c2',
    circleId: 'connect',
    author: {
      id: 'm3',
      name: 'Hawa Keita',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Community Lead'
    },
    content: "Joy! I wish I were in Kampala, I am in Accra right now. But let's definitely coordinate for our Saturday Bi-Weekly Standup. We have 12 sisters RSVP'd so far!",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-e1',
    circleId: 'earn',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Mentor'
    },
    content: "Hello everyone! I just updated our shared Google Drive with the automated pricing calculator template. It accounts for logistics, local taxation, and packaging overheads. Check it out!",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-e2',
    circleId: 'earn',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Learner'
    },
    content: "Fatima, you are a lifesaver! I plugged in my apparel numbers and realized my net margins on our Ankara dresses were only 8%. After adjusting with your template, I raised it to 22% safely. Thank you so much!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-t1',
    circleId: 'thrive',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Learner'
    },
    content: "Feeling a bit overwhelmed today sisters. The pressure of hitting our monthly cooperative delivery targets while handling my kids' exams is intense. Just wanted to vent in a safe place.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-t2',
    circleId: 'thrive',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/images/african_woman_portrait.jpg',
      rank: 'Member'
    },
    content: "We hear you, Amina. Please give yourself some grace. You are running a full enterprise AND raising a family. Both are full-time jobs. Take a 15-minute tea break and step away from the workbench. We support you!",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_BLUEPRINTS = [
  { name: 'Business_Roadmap_2026.pdf', size: '1.4 MB', type: 'document' as const },
  { name: 'Runway_Forecast_Cooperative.xlsx', size: '850 KB', type: 'document' as const },
  { name: 'Mombasa_Logistics_Blueprint.pdf', size: '2.1 MB', type: 'document' as const },
  { name: 'Pitch_Deck_BIG_Academy_v2.pdf', size: '4.2 MB', type: 'document' as const }
];

const MOCK_PHOTOS = [
  { name: 'artisan_weaving_workshop.jpg', size: '2.4 MB', type: 'image' as const, url: '/images/african_tech_collaboration.jpg' },
  { name: 'shea_butter_packaging.jpg', size: '1.8 MB', type: 'image' as const, url: '/images/african_woman_founder_portrait.jpg' },
  { name: 'mombasa_export_logistics.jpg', size: '3.1 MB', type: 'image' as const, url: '/images/african_tech_collaboration.jpg' }
];

const QUICK_REPLIES = [
  "Let's rise together, sister! ✊",
  "Proud of your progress! 🌟",
  "Let's sync up this Saturday! ☕",
  "Can you review my financial plan? 📊",
  "Sending you positive energy! ✨"
];

export function MessagesView({
  conversations,
  setConversations,
  selectedMember,
  setSelectedMember,
  addPoints,
  initialDraftMessage,
  clearDraftMessage,
  currentUser
}: MessagesViewProps) {
  // Navigation & Sizing States
  const [sidebarTab, setSidebarTab] = useState<'dm' | 'circles'>('dm');
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [activeCircleId, setActiveCircleId] = useState<'learn' | 'connect' | 'earn' | 'thrive' | null>(null);
  const [mobileShowList, setMobileShowList] = useState(true);
  
  // Text & Interaction States
  const [messageText, setMessageText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setMessageText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [reactionPopupId, setReactionPopupId] = useState<string | null>(null);
  const [typingConvIds, setTypingConvIds] = useState<Record<string, boolean>>({});
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Group conversations state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Group chats local persistence state
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(() => {
    const saved = localStorage.getItem('big_circle_group_messages');
    return saved ? JSON.parse(saved) : INITIAL_GROUP_MESSAGES;
  });

  // Active sister typing in group chat
  const [isCircleTyping, setIsCircleTyping] = useState(false);
  const [circleTypingSister, setCircleTypingSister] = useState<{ name: string; avatar: string } | null>(null);

  // Mock Upload Progress State
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    size: string;
    progress: number;
    type: 'image' | 'document';
    url?: string;
  } | null>(null);

  // Audio Voice Notes State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activePlayingAudioId, setActivePlayingAudioId] = useState<string | null>(null);
  const [audioPlaybackPercent, setAudioPlaybackPercent] = useState<Record<string, number>>({});
  const [audioPlaybackSeconds, setAudioPlaybackSeconds] = useState<Record<string, number>>({});
  const [voiceNoteDraft, setVoiceNoteDraft] = useState<{
    url: string;
    duration: string;
    blob: Blob;
  } | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    url: string;
    type: 'image' | 'document' | 'video';
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  // Message Delivery Status Map
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});

  // Refs for auto-scroll and background timers
  const scrollRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Load all members from localstorage or seed list
  const [allMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('big_members');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : INITIAL_MEMBERS;
  });

  // Circle Lounge Specifications
  const circleDetails = {
    learn: {
      name: "Learn Academy Lounge",
      topic: "Course reflections, grant guidelines & AfCFTA custom protocols",
      description: "Discuss curriculum details, exchange study notes, and check eligibility for the BIG Academy Seed Grants.",
      onlineCount: 4,
      members: ['m1', 'm2', 'm3', 'm6'], // Amina, Fatima, Hawa, Nia
      guidelines: [
        "Be constructive when commenting on other sisters' homework outlines.",
        "Share resources under creative commons/peer-sharing conventions.",
        "Keep technical queries safe and encouraging."
      ]
    },
    connect: {
      name: "Connect Network Lounge",
      topic: "Partner discovery, local micro-hubs & Saturday accountability standups",
      description: "Co-founder matching, finding localized physical micro-hubs, and registering for the Saturday accountability circles.",
      onlineCount: 5,
      members: ['m4', 'm3', 'm1', 'm6'], // Joy, Hawa, Amina, Nia
      guidelines: [
        "Respect geographic locations and boundaries.",
        "Ensure all RSVP details are logged cleanly.",
        "Do not pitch products directly in this lounge—use the Earn lounge."
      ]
    },
    earn: {
      name: "Earn Scaling Lounge",
      topic: "Pricing audits, angel investor pitching & export volume checklists",
      description: "Audit pricing formulations, refine pitch decks, coordinate wholesale shipping logs, and discuss investment channels.",
      onlineCount: 4,
      members: ['m2', 'm8', 'm5', 'm1'], // Fatima, Tsitsi, Zuri, Amina
      guidelines: [
        "Protect proprietary pricing metrics.",
        "Be professional when testing elevator pitches.",
        "Collaborate on bulk logistics and regional exports."
      ]
    },
    thrive: {
      name: "Thrive Well-being Safe Space",
      topic: "Burnout release, mental recovery, child-care balance & joyful wins",
      description: "A secure, judgment-free space to talk about stress, celebrate micro-successes, and share childcare/workload tips.",
      onlineCount: 4,
      members: ['m1', 'm4', 'm2', 'm7'], // Amina, Joy, Fatima, Mariama
      guidelines: [
        "Complete confidentiality is mandatory—nothing leaves this space.",
        "Offer soft ears and warm encouragement first.",
        "Venting is natural; keep space safe and free of toxic positivity."
      ]
    }
  };

  // Sync group messages to local storage whenever modified
  useEffect(() => {
    localStorage.setItem('big_circle_group_messages', JSON.stringify(groupMessages));
  }, [groupMessages]);

  // Dynamic Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConvId, activeCircleId, conversations, groupMessages, typingConvIds, isCircleTyping, uploadingFile]);

  // Sync selected partner if redirected from directory
  useEffect(() => {
    if (selectedMember) {
      setSidebarTab('dm');
      const existingConv = conversations.find(c => c.member.id === selectedMember.id);
      if (existingConv) {
        setActiveConvId(existingConv.id);
        setActiveCircleId(null);
        setMobileShowList(false);
      } else {
        // Create new blank conversation
        const newConvId = `conv-custom-${Date.now()}`;
        const newConv: Conversation = {
          id: newConvId,
          member: selectedMember,
          messages: [
            { id: `msg-ini-${Date.now()}`, senderId: selectedMember.id, content: `Hi! It is wonderful to connect with you. Let me know what you are working on or if you have any questions!`, timestamp: 'Just now' }
          ],
          unread: false
        };
        setConversations([newConv, ...conversations]);
        setActiveConvId(newConvId);
        setActiveCircleId(null);
        setMobileShowList(false);
      }

      if (initialDraftMessage) {
        setMessageText(initialDraftMessage);
        if (clearDraftMessage) clearDraftMessage();
      }
    } else if (conversations.length > 0 && !activeConvId && !activeCircleId) {
      setActiveConvId(conversations[0].id);
      setActiveCircleId(null);
    }
  }, [selectedMember, conversations, activeConvId, initialDraftMessage, clearDraftMessage]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeCircleInfo = activeCircleId ? (circleDetails[activeCircleId as keyof typeof circleDetails] || {
    name: `${activeCircleId} Lounge`,
    topic: "General Discussion",
    description: "A community space to discuss and share ideas.",
    onlineCount: 3,
    members: allMembers.slice(0, 3).map(m => m.id),
    guidelines: ["Be respectful and encouraging."]
  }) : null;

  // Mark active conv read
  useEffect(() => {
    if (activeConv && activeConv.unread) {
      setConversations(conversations.map(c => {
        if (c.id === activeConvId) {
          return { ...c, unread: false };
        }
        return c;
      }));
    }
  }, [activeConvId, conversations]);

  // Voice Recording Timer hook
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Cleanup audio intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(audioIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const handleReaction = (convId: string, msgId: string, emoji: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      return {
        ...conv,
        messages: conv.messages.map(msg => {
          if (msg.id !== msgId) return msg;
          const reactions = msg.reactions || {};
          const users = reactions[emoji] || [];
          const hasReacted = users.includes(currentUser.id);
          const nextUsers = hasReacted ? users.filter(id => id !== currentUser.id) : [...users, currentUser.id];
          
          const newReactions = { ...reactions, [emoji]: nextUsers };
          if (nextUsers.length === 0) {
            delete newReactions[emoji];
          }
          
          return {
            ...msg,
            reactions: Object.keys(newReactions).length > 0 ? newReactions : undefined
          };
        })
      };
    }));
    setReactionPopupId(null);
  };

  const handleGroupReaction = (msgId: string, emoji: string) => {
    setGroupMessages(prev => prev.map(msg => {
      if (msg.id !== msgId) return msg;
      // Add simple reactions to group messages
      return {
        ...msg,
        content: msg.content // placeholder for updates
      };
    }));
  };

  // Sound cue simulation
  const playSoundCue = () => {
    if (!soundEnabled) return;
    try {
      // Safe, silent fallback using browser synthesizer if audio cues are toggled
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high note
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignored if browser blocks context
    }
  };

  // Helper to update message status and trigger state/storage syncing
  const updateMessageStatus = (msgId: string, newStatus: 'sent' | 'delivered' | 'read') => {
    setMessageStatuses(prev => ({ ...prev, [msgId]: newStatus }));
    setConversations(prevConvs => prevConvs.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === msgId ? { ...m, status: newStatus } : m)
        };
      }
      return c;
    }));
  };

  // Simulated double check ticks timeline with randomized realistic delays
  const triggerMessageReceiptUpdates = (msgId: string) => {
    updateMessageStatus(msgId, 'sent');
    
    // Turn to delivered after 800ms - 1.5s
    const deliveredDelay = 800 + Math.random() * 700;
    setTimeout(() => {
      updateMessageStatus(msgId, 'delivered');
      
      // Turn to read (blue ticks) after 2-5 seconds
      const readDelay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        updateMessageStatus(msgId, 'read');
      }, readDelay);
    }, deliveredDelay);
  };

  // Audio Playback Player controller
  const handleToggleVoicePlay = (msgId: string, durationStr: string, audioUrl?: string) => {
    const totalSec = parseInt(durationStr.split(':')[1] || '15', 10);
    
    // If we have a real audio URL, use a real audio element
    if (audioUrl) {
      let audio = audioElementsRef.current[msgId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audioElementsRef.current[msgId] = audio;
        
        audio.ontimeupdate = () => {
          const percent = (audio.currentTime / audio.duration) * 100;
          setAudioPlaybackPercent(prev => ({ ...prev, [msgId]: percent }));
          setAudioPlaybackSeconds(prev => ({ ...prev, [msgId]: audio.currentTime }));
        };
        
        audio.onended = () => {
          setActivePlayingAudioId(null);
          setAudioPlaybackPercent(prev => ({ ...prev, [msgId]: 0 }));
          setAudioPlaybackSeconds(prev => ({ ...prev, [msgId]: 0 }));
          playSoundCue();
        };
      }

      if (activePlayingAudioId === msgId) {
        audio.pause();
        setActivePlayingAudioId(null);
      } else {
        // Stop currently playing
        if (activePlayingAudioId) {
          const prevAudio = audioElementsRef.current[activePlayingAudioId];
          if (prevAudio) prevAudio.pause();
          
          if (audioIntervalsRef.current[activePlayingAudioId]) {
            clearInterval(audioIntervalsRef.current[activePlayingAudioId]);
            delete audioIntervalsRef.current[activePlayingAudioId];
          }
        }

        audio.play().catch(console.error);
        setActivePlayingAudioId(msgId);
      }
      return;
    }

    // Fallback to mock behavior if no URL (for seed data)
    if (activePlayingAudioId === msgId) {
      // Pause
      if (audioIntervalsRef.current[msgId]) {
        clearInterval(audioIntervalsRef.current[msgId]);
        delete audioIntervalsRef.current[msgId];
      }
      setActivePlayingAudioId(null);
    } else {
      // Stop currently playing
      if (activePlayingAudioId) {
        if (audioElementsRef.current[activePlayingAudioId]) {
          audioElementsRef.current[activePlayingAudioId].pause();
        }
        if (audioIntervalsRef.current[activePlayingAudioId]) {
          clearInterval(audioIntervalsRef.current[activePlayingAudioId]);
          delete audioIntervalsRef.current[activePlayingAudioId];
        }
      }

      const initialSec = audioPlaybackSeconds[msgId] || 0;
      let currentSec = initialSec >= totalSec ? 0 : initialSec;
      
      setActivePlayingAudioId(msgId);
      
      audioIntervalsRef.current[msgId] = setInterval(() => {
        currentSec += 0.1;
        if (currentSec >= totalSec) {
          clearInterval(audioIntervalsRef.current[msgId]);
          delete audioIntervalsRef.current[msgId];
          setAudioPlaybackPercent(prev => ({ ...prev, [msgId]: 100 }));
          setAudioPlaybackSeconds(prev => ({ ...prev, [msgId]: totalSec }));
          setActivePlayingAudioId(null);
          playSoundCue();
        } else {
          const percent = (currentSec / totalSec) * 100;
          setAudioPlaybackPercent(prev => ({ ...prev, [msgId]: percent }));
          setAudioPlaybackSeconds(prev => ({ ...prev, [msgId]: currentSec }));
        }
      }, 100);
    }
  };

  // Quick Spark template send trigger
  const handleSendQuickReply = (text: string) => {
    if (activeConv) {
      sendDirectMessage(text);
    } else if (activeCircleId) {
      sendCircleMessage(text);
    }
  };

  // Direct message sending function
  const sendDirectMessage = (contentStr: string, attachmentObj?: any) => {
    if (!activeConv) return;

    const msgId = `msg-custom-${Date.now()}`;
    const newMessage: Message = {
      id: msgId,
      senderId: currentUser.id,
      content: contentStr,
      timestamp: new Date().toISOString(),
      ...(attachmentObj && { attachment: attachmentObj })
    };

    const updatedMessages = [...activeConv.messages, newMessage];

    setConversations(conversations.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: updatedMessages
        };
      }
      return c;
    }));

    addPoints(5); // Reward sisterly communication!
    triggerMessageReceiptUpdates(msgId);

    const targetConvId = activeConvId;

    // Direct reply simulator
    const typingTimeout = setTimeout(() => {
      setTypingConvIds(prev => ({ ...prev, [targetConvId]: true }));
    }, 600);

    setTimeout(() => {
      clearTimeout(typingTimeout);
      setTypingConvIds(prev => ({ ...prev, [targetConvId]: false }));
           // Choose partner/sender for mock reply (exclude yourself if group)
      const groupOthers = activeConv.isGroup 
        ? (activeConv.groupMembers || []).filter(m => m.id !== currentUser.id)
        : [];
      const partner = activeConv.isGroup
        ? (groupOthers[Math.floor(Math.random() * groupOthers.length)] || activeConv.member)
        : activeConv.member;

      let responseContent = "";

      // Contextual responses based on content type or text keyword
      if (attachmentObj) {
        if (attachmentObj.type === 'document') {
          responseContent = `Wow Sarah! I just opened your "${attachmentObj.name}" blueprint document. Your layout looks extremely professional and solid. Let me take some notes and give you specific review pointers by tonight!`;
        } else if (attachmentObj.type === 'image') {
          responseContent = `Oh my goodness, Sarah! This product image is absolutely beautiful. The packaging style is so clean and authentic. This will grab immediate attention on retail shelves!`;
        } else if (attachmentObj.type === 'audio') {
          responseContent = `Thank you so much for the voice note, Sarah! It is so lovely to hear your voice. I totally align with your thoughts. Let's draft a simple next action step for our Saturday check-in.`;
        }
      } else {
        const text = contentStr.toLowerCase();
        if (text.includes('roadmap') || text.includes('plan') || text.includes('business')) {
          responseContent = `That sounds very focused, Sarah! Creating a business roadmap is where our direction stays clear. I'd love to review your milestone checkpoints.`;
        } else if (text.includes('price') || text.includes('cost') || text.includes('finance') || text.includes('runway')) {
          responseContent = `Pricing and runway formulation are where our financial power resides. Let's make sure we buffer for raw logistics cost and local taxation early!`;
        } else if (text.includes('coffee') || text.includes('meet') || text.includes('sync')) {
          responseContent = `I would love a virtual coffee meetup! Let's lock in Saturday morning right before the Connection Circle. Does 9:30 AM work for you?`;
        } else {
          const defaultResponses = activeConv.isGroup 
            ? [
                `I absolutely agree with that point! Collaborative support inside this thread is amazing.`,
                `Thank you for sharing, Sarah! How does this affect our scaling milestones?`,
                `This is a fantastic development! Let's discuss this together during the weekend session.`,
                `So inspired by this discussion, sisters! Keep up the brilliant work.`
              ]
            : [
                `Thank you so much sister! I got your message and will review it closely. Let's follow up on our coaching goals. Together we rise!`,
                `That sounds beautiful, Sarah! Having you in the BIG network is an absolute honor. Let's discuss this further in our next Connection Circle.`,
                `Amazing work on your business roadmap! Keep pushing forward and logging your challenge progress. Let me know how I can support you.`,
                `Thank you for reaching out! I will be online later tonight after my logistics session and will give you a full response.`
              ];
          responseContent = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
      }

      const sisterReply: Message = {
        id: `msg-reply-${Date.now()}`,
        senderId: partner.id,
        content: responseContent,
        timestamp: 'Just now'
      };

      setConversations(currentConversations => currentConversations.map(c => {
        if (c.id === targetConvId) {
          return {
            ...c,
            unread: activeConvId !== targetConvId,
            messages: [...c.messages, sisterReply]
          };
        }
        return c;
      }));
    }, 2500);
  };

  // Group Conversation Creators & Controllers
  const handleCreateGroupChat = (groupNameStr: string, memberIds: string[]) => {
    if (!groupNameStr.trim() || memberIds.length === 0) return;

    // Resolve member objects from IDs
    const resolvedMembers = allMembers.filter(m => memberIds.includes(m.id));
    
    // Add currentUser.id to the list
    const youMember: Member = {
      id: currentUser.id,
      name: 'Sarah Jenkins',
      avatar: '/images/african_woman_portrait.jpg',
      title: 'Aspiring Fashion Founder',
      city: 'Nairobi',
      rank: 'Learner',
      skills: ['Apparel Design', 'Creative Direction'],
      interests: ['Sustainable Fashion', 'E-Commerce'],
      bio: 'Fashion designer looking to scale my artisan-made brand globally.',
      points: 320,
      badges: ['confidence']
    };

    const finalGroupMembers = [youMember, ...resolvedMembers];

    const newConvId = `conv-group-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      member: resolvedMembers[0] || youMember, // Fallback first partner
      isGroup: true,
      groupName: groupNameStr,
      groupMembers: finalGroupMembers,
      messages: [
        {
          id: `msg-group-init-${Date.now()}`,
          senderId: 'system',
          content: `Group "${groupNameStr}" started with ${finalGroupMembers.map(m => m.name).join(', ')}.`,
          timestamp: 'Just now'
        }
      ],
      unread: false
    };

    setConversations([newConv, ...conversations]);
    setActiveConvId(newConvId);
    setActiveCircleId(null);
    addPoints(15); // Reward group dynamic!
  };

  const handleAddMemberToGroup = (memberId: string) => {
    if (!activeConv || !activeConv.isGroup) return;

    const memberToAdd = allMembers.find(m => m.id === memberId);
    if (!memberToAdd) return;

    // Avoid duplicating
    const alreadyInGroup = activeConv.groupMembers?.some(m => m.id === memberId);
    if (alreadyInGroup) return;

    const updatedGroupMembers = [...(activeConv.groupMembers || []), memberToAdd];
    const systemMsg: Message = {
      id: `msg-group-add-${Date.now()}`,
      senderId: 'system',
      content: `${memberToAdd.name} was added to the group.`,
      timestamp: 'Just now'
    };

    setConversations(conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          groupMembers: updatedGroupMembers,
          messages: [...c.messages, systemMsg]
        };
      }
      return c;
    }));

    addPoints(5); // Reward inclusion!
  };

  // Circle Message sending function
  const sendCircleMessage = (contentStr: string, attachmentObj?: any) => {
    if (!activeCircleId) return;

    const newMsg: GroupMessage = {
      id: `gmsg-user-${Date.now()}`,
      circleId: activeCircleId,
      author: {
        id: currentUser.id,
        name: 'Sarah Jenkins',
        avatar: '/images/african_woman_portrait.jpg',
        rank: 'Learner'
      },
      content: contentStr,
      timestamp: "Just now",
      ...(attachmentObj && { attachment: attachmentObj })
    };

    setGroupMessages(prev => [...prev, newMsg]);
    addPoints(3); // Reward group lounge contribution!

    const currentCircle = activeCircleId;
    const circleInfo = circleDetails[currentCircle as keyof typeof circleDetails] || {
      name: `${currentCircle} Lounge`,
      topic: "General Discussion",
      description: "A community space to discuss and share ideas.",
      onlineCount: 3,
      members: allMembers.slice(0, 3).map(m => m.id),
      guidelines: ["Be respectful and encouraging."]
    };
    
    // Pick active online sister to reply
    const activeSistersInCircle = allMembers.filter(m => circleInfo.members.includes(m.id));
    const randomSister = activeSistersInCircle.length > 0 
      ? activeSistersInCircle[Math.floor(Math.random() * activeSistersInCircle.length)]
      : { name: 'Amina Bello', avatar: '/images/african_woman_portrait.jpg', id: 'm1', rank: 'Learner' };

    // Group reply simulator
    setIsCircleTyping(true);
    setCircleTypingSister({ name: randomSister.name, avatar: randomSister.avatar });

    setTimeout(() => {
      setIsCircleTyping(false);
      setCircleTypingSister(null);
      playSoundCue();

      let responseContent = "";
      
      if (attachmentObj) {
        if (attachmentObj.type === 'document') {
          responseContent = `Thanks for uploading ${attachmentObj.name} here in the #${currentCircle} lounge, Sarah! Sharing blueprints with the sisterhood is how we accelerate our collective knowledge. Let's do a review session on this!`;
        } else {
          responseContent = `Wow, look at that! Beautiful packaging and aesthetic framing. Thanks for sharing this sourcing snapshot, Sarah. Together we rise!`;
        }
      } else {
        const text = contentStr.toLowerCase();
        if (currentCircle === 'learn') {
          if (text.includes('grant') || text.includes('money') || text.includes('fund')) {
            responseContent = `Absolutely critical points, Sarah! For our BIG Academy Seed Grants, the evaluation checklist is in the Academy hub. Focus on scaling operational value.`;
          } else {
            responseContent = `So true, Sarah! Continuous training is where our leverage lies. Let's lock in and complete our active modules before Saturday!`;
          }
        } else if (currentCircle === 'connect') {
          responseContent = `I am so passionate about regional cooperation! Let's connect directly via Direct Message to share logistics blueprints and coordinate!`;
        } else if (currentCircle === 'earn') {
          responseContent = `Spot on, Sarah! Sells for value, never just for cost. Your artisanal narrative is premium!`;
        } else {
          responseContent = `Sending you a warm virtual hug, Sarah! Give yourself some maternal grace—you are doing amazing work balancing both.`;
        }
      }

      const simMsg: GroupMessage = {
        id: `gmsg-sim-${Date.now()}`,
        circleId: currentCircle,
        author: {
          id: randomSister.id,
          name: randomSister.name,
          avatar: randomSister.avatar,
          rank: (randomSister as any).rank || 'Member'
        },
        content: responseContent,
        timestamp: "Just now"
      };

      setGroupMessages(prev => [...prev, simMsg]);
    }, 2000);
  };

  // Combined Unified submit form handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const textToSend = messageText;
    setMessageText('');
    clearDraft();

    if (activeConv) {
      sendDirectMessage(textToSend);
    } else if (activeCircleId) {
      sendCircleMessage(textToSend);
    }
  };

  // Draft Auto-Save Logic
  useEffect(() => {
    const draftKey = activeCircleId ? `draft_circle_${activeCircleId}` : activeConv ? `draft_conv_${activeConv.id}` : null;
    if (draftKey) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setMessageText(savedDraft);
      } else {
        setMessageText('');
      }
    }
  }, [activeConv?.id, activeCircleId]);

  useEffect(() => {
    const draftKey = activeCircleId ? `draft_circle_${activeCircleId}` : activeConv ? `draft_conv_${activeConv.id}` : null;
    if (draftKey) {
      if (messageText) {
        localStorage.setItem(draftKey, messageText);
      } else {
        localStorage.removeItem(draftKey);
      }
    }
  }, [messageText, activeConv?.id, activeCircleId]);

  const clearDraft = () => {
    const draftKey = activeCircleId ? `draft_circle_${activeCircleId}` : activeConv ? `draft_conv_${activeConv.id}` : null;
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

  // Real File Upload Handler
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentMenuOpen(false);
    
    let type: 'image' | 'document' | 'video' = 'document';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    }

    const url = URL.createObjectURL(file);

    setPendingAttachment({
      file,
      url,
      type
    });

    // Reset input so the same file can be selected again if discarded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDiscardPendingAttachment = () => {
    if (pendingAttachment) {
      URL.revokeObjectURL(pendingAttachment.url);
      setPendingAttachment(null);
    }
  };

  const handleSendPendingAttachment = () => {
    if (!pendingAttachment) return;

    const attachmentPayload = {
      type: pendingAttachment.type,
      name: pendingAttachment.file.name,
      size: `${(pendingAttachment.file.size / 1024).toFixed(1)} KB`,
      url: pendingAttachment.url
    };

    if (activeConv) {
      sendDirectMessage(`Shared blueprint asset: ${pendingAttachment.file.name}`, attachmentPayload);
    } else if (activeCircleId) {
      sendCircleMessage(`Shared circle asset: ${pendingAttachment.file.name}`, attachmentPayload);
    }

    setPendingAttachment(null);
  };

  // Mock Upload Progress Simulator
  const handleTriggerMockUpload = (fileObj: { name: string; size: string; type: 'image' | 'document'; url?: string }) => {
    setAttachmentMenuOpen(false);
    setUploadingFile({
      name: fileObj.name,
      size: fileObj.size,
      progress: 0,
      type: fileObj.type,
      url: fileObj.url
    });

    let currentProgress = 0;
    const uploadInterval = setInterval(() => {
      currentProgress += 10;
      setUploadingFile(prev => prev ? { ...prev, progress: currentProgress } : null);

      if (currentProgress >= 100) {
        clearInterval(uploadInterval);
        setTimeout(() => {
          // Send complete attachment
          const attachmentPayload = {
            type: fileObj.type,
            name: fileObj.name,
            size: fileObj.size,
            url: fileObj.url || '#'
          };

          if (activeConv) {
            sendDirectMessage(`Shared blueprint asset: ${fileObj.name}`, attachmentPayload);
          } else if (activeCircleId) {
            sendCircleMessage(`Shared circle asset: ${fileObj.name}`, attachmentPayload);
          }
          setUploadingFile(null);
        }, 300);
      }
    }, 120);
  };

  // Real Voice Recording Activator
  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // If we already have a draft, discard it first (or we could prevent recording)
      if (voiceNoteDraft) {
        handleDiscardVoiceDraft();
      }
      
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Use a ref-like approach or capture the duration correctly
          // Since recordingDuration is updated in state, we capture it here
          // However, state might be stale in this closure. 
          // Let's use a temporary variable or the last value.
          setRecordingDuration(currentDuration => {
            const minutes = Math.floor(currentDuration / 60);
            const seconds = currentDuration % 60;
            const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            setVoiceNoteDraft({
              url: audioUrl,
              duration: durationFormatted,
              blob: audioBlob
            });
            return currentDuration;
          });

          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const handleDiscardVoiceDraft = () => {
    if (voiceNoteDraft) {
      URL.revokeObjectURL(voiceNoteDraft.url);
      setVoiceNoteDraft(null);
    }
    if (activePlayingAudioId === 'voice-draft') {
      if (audioElementsRef.current['voice-draft']) {
        audioElementsRef.current['voice-draft'].pause();
        delete audioElementsRef.current['voice-draft'];
      }
      setActivePlayingAudioId(null);
      setAudioPlaybackPercent(prev => ({ ...prev, ['voice-draft']: 0 }));
      setAudioPlaybackSeconds(prev => ({ ...prev, ['voice-draft']: 0 }));
    }
  };

  const handleSendVoiceDraft = () => {
    if (!voiceNoteDraft) return;

    const audioAttachment = {
      type: 'audio' as const,
      name: `Voice_Note_${Date.now().toString().slice(-4)}.mp3`,
      duration: voiceNoteDraft.duration,
      size: `${(voiceNoteDraft.blob.size / 1024).toFixed(1)} KB`,
      url: voiceNoteDraft.url
    };

    if (activeConv) {
      sendDirectMessage(`Voice message (${voiceNoteDraft.duration})`, audioAttachment);
    } else if (activeCircleId) {
      sendCircleMessage(`Voice message (${voiceNoteDraft.duration})`, audioAttachment);
    }

    setVoiceNoteDraft(null);
    if (activePlayingAudioId === 'voice-draft') {
      if (audioElementsRef.current['voice-draft']) {
        audioElementsRef.current['voice-draft'].pause();
        delete audioElementsRef.current['voice-draft'];
      }
      setActivePlayingAudioId(null);
    }
  };

  // Filter conversations based on sidebar tabs and query search
  const filteredConvs = conversations.filter(c => {
    const term = searchTerm.toLowerCase();
    const nameMatch = c.member.name.toLowerCase().includes(term);
    const titleMatch = c.member.title.toLowerCase().includes(term);
    const msgMatch = c.messages.some(m => m.content.toLowerCase().includes(term));
    return nameMatch || titleMatch || msgMatch;
  });

  const filteredCircles = Object.entries(circleDetails).filter(([id, details]) => {
    const term = searchTerm.toLowerCase();
    return details.name.toLowerCase().includes(term) || details.topic.toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="mb-6 text-center max-w-2xl mx-auto space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
            Communications Hub
          </p>
          <h1 className="mt-1.5 text-2xl font-heading font-black text-primary sm:text-3xl">
            BIG Sisterhood Communications
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Chat securely with mentors, coaches, and peer sisters, or contribute inside active circle lounges in real-time.
          </p>
        </div>

        {/* TOP LEVEL GLOBAL SEARCH */}
        <div className="relative max-w-md mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-secondary transition-colors" />
          </div>
          <input
            type="text"
            placeholder={sidebarTab === 'dm' ? "Search sisters or message keywords..." : "Search circle lounges..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* CHAT INTERFACE SPLIT GRID */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-4 rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm h-[680px]">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <div className={`lg:col-span-1 border-r border-slate-100 flex flex-col h-full bg-slate-50/15 ${mobileShowList ? 'block' : 'hidden lg:block'}`}>
          
          {/* Sidebar Navigation Tabs */}
          <div className="p-3 border-b border-slate-100 bg-white space-y-2.5">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setSidebarTab('dm');
                }}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  sidebarTab === 'dm' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-primary'
                }`}
              >
                Direct Messages
              </button>
              <button
                onClick={() => {
                  setSidebarTab('circles');
                }}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  sidebarTab === 'circles' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-primary'
                }`}
              >
                Circle Lounges
              </button>
            </div>

            {/* Sidebar Controls (Add Group only for DM) */}
            {sidebarTab === 'dm' && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sister Conversations
                </span>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm shrink-0"
                  title="Create Group Chat"
                >
                  <Users className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {sidebarTab === 'circles' && (
              <div className="px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Active Lounges
                </span>
              </div>
            )}
          </div>

          {/* Sidebar List (Scrollable) */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100/60 p-2 space-y-1.5">
            
            {/* Direct Messages List */}
            {sidebarTab === 'dm' && (
              filteredConvs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No active conversations.
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const isActive = conv.id === activeConvId && !activeCircleId;
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const status = lastMsg && lastMsg.senderId === currentUser.id ? (messageStatuses[lastMsg.id] || 'read') : null;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setActiveCircleId(null);
                        setSelectedMember(null);
                        setMobileShowList(false);
                      }}
                      className={`rounded-2xl p-3 cursor-pointer flex items-start gap-2.5 transition-colors ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {conv.isGroup ? (
                          <div className="h-9.5 w-9.5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/25 shadow-sm">
                            <Users className="h-5 w-5" />
                          </div>
                        ) : (
                          <img 
                            src={conv.member.avatar} 
                            alt={conv.member.name}
                            className="h-9.5 w-9.5 rounded-full object-cover border border-slate-150"
                          />
                        )}
                        {conv.unread && (
                          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-white animate-bounce" />
                        )}
                        {!conv.isGroup && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white border border-white" />
                        )}
                      </div>

                      <div className="flex-grow min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-[11px] font-extrabold truncate ${isActive ? 'text-white' : 'text-primary'}`}>
                            {conv.isGroup ? conv.groupName : conv.member.name}
                          </h4>
                          <span className={`text-[8.5px] shrink-0 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                            {lastMsg ? formatTimeAgo(lastMsg.timestamp) : ''}
                          </span>
                        </div>
                        <p className={`text-[9.5px] truncate font-bold leading-none ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
                          {conv.isGroup ? `${conv.groupMembers?.length || 0} Members` : conv.member.title}
                        </p>
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <p className={`text-[10.5px] truncate leading-normal flex-grow ${isActive ? 'text-white/85' : 'text-slate-600 font-medium'}`}>
                            {lastMsg ? (
                              conv.isGroup && lastMsg.senderId !== currentUser.id && lastMsg.senderId !== 'system' ? (
                                `${allMembers.find(m => m.id === lastMsg.senderId)?.name || 'Sister'}: ${lastMsg.content}`
                              ) : lastMsg.content
                            ) : 'No messages yet...'}
                          </p>
                          {status && (
                            <span className="shrink-0 ml-1" title={status === 'sent' ? 'Sent' : status === 'delivered' ? 'Delivered' : 'Read'}>
                              {status === 'sent' && <Check className={`h-3 w-3 ${isActive ? 'text-white/50' : 'text-slate-400'}`} />}
                              {status === 'delivered' && <CheckCheck className={`h-3 w-3 ${isActive ? 'text-white/70' : 'text-slate-400'}`} />}
                              {status === 'read' && <CheckCheck className={`h-3 w-3 ${isActive ? 'text-sky-200' : 'text-sky-500'}`} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {/* Circle lounges list */}
            {sidebarTab === 'circles' && (
              filteredCircles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No circle lounges matches.
                </div>
              ) : (
                filteredCircles.map(([id, details]) => {
                  const isActive = activeCircleId === id;
                  const lastCircleMsg = groupMessages.filter(m => m.circleId === id).slice(-1)[0];

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        setActiveCircleId(id as any);
                        setActiveConvId('');
                        setSelectedMember(null);
                        setMobileShowList(false);
                      }}
                      className={`rounded-2xl p-3 cursor-pointer flex items-start gap-2.5 transition-colors ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl shrink-0 bg-secondary/10 text-secondary transition-all">
                        <Hash className="h-4.5 w-4.5 font-extrabold" />
                      </div>

                      <div className="flex-grow min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-[11px] font-extrabold truncate ${isActive ? 'text-white' : 'text-primary'}`}>
                            #{id}-circle
                          </h4>
                          <span className={`text-[8px] font-extrabold rounded-full px-1.5 py-0.2 shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {details.onlineCount} online
                          </span>
                        </div>
                        <p className={`text-[9.5px] truncate font-bold leading-none ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
                          Topic: {details.topic}
                        </p>
                        <p className={`text-[10.5px] truncate leading-normal pt-1 ${isActive ? 'text-white/85' : 'text-slate-600 font-medium'}`}>
                          {lastCircleMsg ? `${lastCircleMsg.author.name}: ${lastCircleMsg.content}` : 'No lounge discussion yet...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CHAT BOX FRAME */}
        <div className={`lg:col-span-3 flex flex-row h-full bg-white overflow-hidden relative ${!mobileShowList ? 'flex' : 'hidden lg:flex'}`}>
          
          <div className="flex-1 flex flex-col h-full bg-white relative justify-between min-w-0">
            
            {/* 1. DIRECT MESSAGE MAIN HEADER PANEL */}
            {activeConv && !activeCircleId && (
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button 
                    onClick={() => setMobileShowList(true)}
                    className="p-1 text-slate-400 hover:text-primary lg:hidden shrink-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="relative shrink-0">
                    {activeConv.isGroup ? (
                      <div className="h-9.5 w-9.5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/25 shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                    ) : (
                      <img 
                        src={activeConv.member.avatar} 
                        alt={activeConv.member.name}
                        className="h-9.5 w-9.5 rounded-full object-cover border border-slate-150"
                      />
                    )}
                    {!activeConv.isGroup && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11.5px] font-black text-primary truncate leading-tight">
                      {activeConv.isGroup ? activeConv.groupName : activeConv.member.name}
                    </h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary/70 block w-max mt-0.5">
                      {activeConv.isGroup ? `${activeConv.groupMembers?.length || 0} Members in Thread` : `${activeConv.member.rank} • ${activeConv.member.city}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {activeConv.isGroup && (
                    <button 
                      onClick={() => setShowAddMemberModal(true)}
                      className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all" 
                      title="Add Members to Thread"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all" title="Simulate voice call">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all" title="Simulate video checkin">
                    <Video className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setInfoPanelOpen(!infoPanelOpen)}
                    className={`p-2 rounded-xl transition-all ${infoPanelOpen ? 'bg-secondary/15 text-secondary' : 'hover:bg-slate-50 text-slate-400 hover:text-primary'}`} 
                    title="Toggle Info Drawer"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. CIRCLE LOUNGE CHAT HEADER PANEL */}
            {!activeConv && activeCircleId && activeCircleInfo && (
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button 
                    onClick={() => setMobileShowList(true)}
                    className="p-1 text-slate-400 hover:text-primary lg:hidden shrink-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0">
                    <Hash className="h-4 w-4 font-extrabold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[11.5px] font-black text-primary truncate leading-none">
                        #{activeCircleId}-circle-lounge
                      </h4>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[7.5px] font-extrabold text-emerald-600 uppercase tracking-widest animate-pulse">
                        ● Live
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block truncate leading-tight pt-0.5">
                      Topic: {activeCircleInfo.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all"
                    title={soundEnabled ? "Mute Lounge Alerts" : "Unmute Lounge Alerts"}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
                  </button>
                  <button 
                    onClick={() => setInfoPanelOpen(!infoPanelOpen)}
                    className={`p-2 rounded-xl transition-all ${infoPanelOpen ? 'bg-secondary/15 text-secondary' : 'hover:bg-slate-50 text-slate-400 hover:text-primary'}`} 
                    title="Toggle Info Panel"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CHAT FEED PANEL AREA (Scrollable messages) */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/20"
            >
              
              {/* If Direct Conversation is Active */}
              {activeConv && !activeCircleId && (
                <>
                  {activeConv.isGroup ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 bg-white space-y-1.5 text-center shadow-sm max-w-md mx-auto mb-4 animate-fade-in">
                      <div className="inline-block p-2 rounded-full bg-secondary/15 text-secondary">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-[11px] font-extrabold text-primary">
                        Sisterhood Group Discussion Thread
                      </h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                        This is a collaborative private space for shared learning and growth with other sisters. All messages, resources, and attachments are synchronized in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 bg-white space-y-1.5 text-center shadow-sm max-w-md mx-auto mb-4 animate-fade-in">
                      <div className="inline-block p-2 rounded-full bg-secondary/15 text-secondary">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-[11px] font-extrabold text-primary">
                        Secure Sisterhood DM Protected
                      </h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                        This chat represents a secure direct pipeline between you and {activeConv.member.name}. All blueprints, contracts, and guidelines shared remain private.
                      </p>
                    </div>
                  )}

                  {activeConv.messages.map((msg) => {
                    if (msg.senderId === 'system') {
                      return (
                        <div key={msg.id} className="flex justify-center my-3 animate-fade-in">
                          <span className="rounded-full bg-slate-100/90 px-3.5 py-1 text-[9px] font-bold text-slate-500/90 border border-slate-200/50 shadow-sm flex items-center gap-1">
                            ℹ️ {msg.content}
                          </span>
                        </div>
                      );
                    }

                    const isMe = msg.senderId === currentUser.id;
                    const status = isMe ? (messageStatuses[msg.id] || msg.status || 'read') : null;
                    const senderObj = isMe 
                      ? { name: 'Sarah Jenkins', avatar: '/images/african_woman_portrait.jpg' }
                      : (activeConv.isGroup 
                          ? (allMembers.find(m => m.id === msg.senderId) || activeConv.member) 
                          : activeConv.member);

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-2.5 max-w-[85%] mb-4 ${isMe ? 'ml-auto flex-row-reverse' : 'justify-start'} group relative`}
                      >
                        {activeConv.isGroup && !isMe && (
                          <img 
                            src={senderObj.avatar} 
                            alt={senderObj.name}
                            className="h-7.5 w-7.5 rounded-full object-cover border border-slate-150 shrink-0 self-end shadow-sm"
                          />
                        )}
                        <div className="space-y-0.5 flex-grow min-w-0">
                          {activeConv.isGroup && (
                            <div className={`flex items-center gap-1.5 text-[9px] font-bold text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                              <span className="text-primary font-black">{senderObj.name}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                          )}

                          <div className={`rounded-2xl p-3 shadow-sm space-y-1 relative inline-block text-left ${
                            isMe 
                              ? 'bg-secondary text-white rounded-br-none' 
                              : 'bg-white border border-slate-150 text-slate-700 rounded-bl-none'
                          }`}>
                            
                            {/* Render Attachment Card if exists */}
                            {msg.attachment && (
                              <div className="mb-2">
                                {msg.attachment.type === 'document' && (
                                  <div className={`rounded-xl p-2.5 flex items-center justify-between gap-3 border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-primary'}`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-7 w-7 text-secondary shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold truncate">{msg.attachment.name}</p>
                                        <span className="text-[8px] opacity-75">{msg.attachment.size} • PDF Document</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => addPoints(10)}
                                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-current transition-all shrink-0"
                                      title="Download asset"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}

                                {msg.attachment.type === 'video' && (
                                  <div className="relative rounded-xl overflow-hidden border border-slate-150 group/vid shadow-sm bg-black/5">
                                    <video 
                                      src={msg.attachment.url} 
                                      className="w-full max-h-48 object-cover"
                                      controls
                                    />
                                    <div className="p-2 bg-slate-50/80 border-t border-slate-150 flex items-center justify-between text-[8px] font-bold text-slate-500">
                                      <span className="truncate">{msg.attachment.name}</span>
                                      <span>{msg.attachment.size}</span>
                                    </div>
                                  </div>
                                )}

                                {msg.attachment.type === 'image' && (
                                  <div className="relative rounded-xl overflow-hidden border border-slate-150 group/img shadow-sm bg-black/5">
                                    <img 
                                      src={msg.attachment.url} 
                                      alt={msg.attachment.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full max-h-40 object-cover hover:scale-105 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <button 
                                        onClick={() => addPoints(10)}
                                        className="p-2 rounded-full bg-white text-primary hover:scale-110 transition-all font-bold text-[10px] flex items-center gap-1"
                                      >
                                        <Download className="h-3.5 w-3.5 text-secondary" /> Download
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {msg.attachment.type === 'audio' && (
                                  <div className={`rounded-xl p-2.5 flex items-center gap-3 border ${isMe ? 'bg-white/15 border-white/25' : 'bg-slate-50 border-slate-200 text-primary'}`}>
                                    <button
                                      onClick={() => handleToggleVoicePlay(msg.id, msg.attachment?.duration || '0:15', msg.attachment?.url)}
                                      className={`p-2 rounded-full shrink-0 transition-all ${isMe ? 'bg-white text-secondary hover:scale-105' : 'bg-secondary text-white hover:scale-105'}`}
                                    >
                                      {activePlayingAudioId === msg.id ? (
                                        <Pause className="h-3.5 w-3.5" />
                                      ) : (
                                        <Play className="h-3.5 w-3.5 pl-0.5" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-grow space-y-1">
                                      {/* Simulated audio waveform */}
                                      <div className="flex items-center gap-[2px] h-4">
                                        {[10, 4, 18, 12, 16, 6, 14, 8, 20, 10, 12, 6, 16, 10].map((h, i) => {
                                          const percent = audioPlaybackPercent[msg.id] || 0;
                                          const barPassed = (i / 14) * 100 < percent;
                                          return (
                                            <span 
                                              key={i} 
                                              className="w-[3px] rounded-full transition-colors" 
                                              style={{ 
                                                height: `${h}px`,
                                                backgroundColor: barPassed 
                                                  ? (isMe ? '#ffffff' : '#f43f5e') 
                                                  : (isMe ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.15)')
                                              }} 
                                            />
                                          );
                                        })}
                                      </div>
                                      <div className="flex justify-between items-center text-[7.5px] opacity-75">
                                        <span>
                                          {audioPlaybackSeconds[msg.id] 
                                            ? `0:${Math.floor(audioPlaybackSeconds[msg.id]).toString().padStart(2, '0')}` 
                                            : '0:00'}
                                        </span>
                                        <span>{msg.attachment.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <p className="text-[11.5px] leading-relaxed break-words">{msg.content}</p>
                            <div className="flex items-center justify-end gap-1 text-[8px] opacity-70 font-semibold">
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <div className="ml-1 flex items-center gap-1" title={status === 'sent' ? 'Sent' : status === 'delivered' ? 'Delivered' : 'Read'}>
                                  {status === 'read' && (
                                    <span className="text-[7px] font-black uppercase tracking-tighter text-sky-100/90 animate-fade-in">Read</span>
                                  )}
                                  <span className="shrink-0">
                                    {status === 'sent' && <Check className="h-2.5 w-2.5 text-white/50" />}
                                    {status === 'delivered' && <CheckCheck className="h-2.5 w-2.5 text-white/70" />}
                                    {status === 'read' && <CheckCheck className="h-2.5 w-2.5 text-sky-200" />}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Reaction Overlay display */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-1 z-10`}>
                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(activeConv.id, msg.id, emoji)}
                                    className={`flex items-center gap-1 text-[9px] bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm hover:bg-slate-50 transition-colors ${users.includes(currentUser.id) ? 'border-secondary bg-secondary/5 text-secondary' : 'text-slate-500'}`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="font-extrabold">{users.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Reaction Add popup trigger */}
                          <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-[calc(100%+0.5rem)]' : 'left-[calc(100%+0.5rem)]'} opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                            <button
                              onClick={() => setReactionPopupId(reactionPopupId === msg.id ? null : msg.id)}
                              className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm transition-all hover:scale-110"
                            >
                              <SmilePlus className="h-3.5 w-3.5" />
                            </button>
                            
                            {/* Horizontal Emojis Panel */}
                            {reactionPopupId === msg.id && (
                              <div className={`absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'} flex gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-lg z-30`}>
                                {['❤️', '👍', '🎉', '👏', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(activeConv.id, msg.id, emoji)}
                                    className="hover:bg-slate-100 hover:scale-110 rounded-full p-1.5 text-xs transition-all"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Animated typing sister check */}
                  {typingConvIds[activeConv.id] && (
                    <div className="flex justify-start items-end gap-2 mb-4 animate-fade-in">
                      <img 
                        src={activeConv.isGroup 
                          ? ((activeConv.groupMembers || []).find(m => m.id !== currentUser.id)?.avatar || activeConv.member.avatar)
                          : activeConv.member.avatar
                        } 
                        alt="typing"
                        className="h-7.5 w-7.5 rounded-full object-cover shrink-0"
                      />
                      <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-bl-none px-3.5 py-2 shadow-sm flex flex-col space-y-0.5 max-w-[80%]">
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 leading-none">
                          {activeConv.isGroup 
                            ? ((activeConv.groupMembers || []).find(m => m.id !== currentUser.id)?.name || activeConv.member.name)
                            : activeConv.member.name
                          }
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 leading-none">Typing</span>
                          <span className="flex gap-1 items-center h-2 pt-1">
                            <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* If Circle Group Lounge is Active */}
              {!activeConv && activeCircleId && activeCircleInfo && (
                <>
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 bg-white space-y-1.5 text-center shadow-sm max-w-md mx-auto mb-4">
                    <span className="inline-block p-1.5 rounded-full bg-secondary/15 text-secondary">
                      <Users className="h-4 w-4" />
                    </span>
                    <h4 className="text-[11px] font-extrabold text-primary">
                      Welcome to the #{activeCircleId} Circle Lounge Chat!
                    </h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                      This space is shared with all registered members of this circle. Chat, ask questions, or review Saturday standups.
                    </p>
                  </div>

                  {groupMessages.filter(m => m.circleId === activeCircleId).map((msg) => {
                    const isMe = msg.author.id === currentUser.id;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-2.5 max-w-[85%] mb-4 ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <img
                          src={msg.author.avatar}
                          alt={msg.author.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-150 shrink-0 shadow-sm"
                        />

                        <div className="space-y-0.5">
                          {/* User tag and timestamp header */}
                          <div className={`flex items-center gap-1.5 text-[9.5px] ${isMe ? 'justify-end' : ''}`}>
                            <span className="font-black text-primary">
                              {msg.author.name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider text-slate-500">
                              {msg.author.rank}
                            </span>
                            <span className="text-[7.5px] text-slate-400 font-medium">
                              {formatTimeAgo(msg.timestamp)}
                            </span>
                          </div>

                          {/* Message bubble */}
                          <div 
                            className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm border ${
                              isMe 
                                ? 'bg-primary text-white border-primary/10 rounded-tr-none' 
                                : 'bg-white text-primary border-slate-150 rounded-tl-none'
                            }`}
                          >
                            {/* Attachment rendering */}
                            {msg.attachment && (
                              <div className="mb-2">
                                {msg.attachment.type === 'document' && (
                                  <div className={`rounded-xl p-2.5 flex items-center justify-between gap-3 border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-primary'}`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-7 w-7 text-secondary shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold truncate">{msg.attachment.name}</p>
                                        <span className="text-[8px] opacity-75">{msg.attachment.size} • PDF Document</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => addPoints(10)}
                                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-current transition-all shrink-0"
                                      title="Download asset"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}

                                {msg.attachment.type === 'video' && (
                                  <div className="relative rounded-xl overflow-hidden border border-slate-150 group/vid shadow-sm bg-black/5">
                                    <video 
                                      src={msg.attachment.url} 
                                      className="w-full max-h-48 object-cover"
                                      controls
                                    />
                                    <div className="p-2 bg-slate-50/80 border-t border-slate-150 flex items-center justify-between text-[8px] font-bold text-slate-500">
                                      <span className="truncate">{msg.attachment.name}</span>
                                      <span>{msg.attachment.size}</span>
                                    </div>
                                  </div>
                                )}

                                {msg.attachment.type === 'image' && (
                                  <div className="relative rounded-xl overflow-hidden border border-slate-150 group/img shadow-sm bg-black/5">
                                    <img 
                                      src={msg.attachment.url} 
                                      alt={msg.attachment.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full max-h-40 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                      onClick={() => addPoints(10)}
                                      className="p-2 rounded-full bg-white text-primary hover:scale-110 transition-all font-bold text-[10px] flex items-center gap-1"
                                    >
                                        <Download className="h-3.5 w-3.5 text-secondary" /> Download
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {msg.attachment.type === 'audio' && (
                                  <div className={`rounded-xl p-2.5 flex items-center gap-3 border ${isMe ? 'bg-white/15 border-white/25' : 'bg-slate-50 border-slate-200 text-primary'}`}>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVoicePlay(msg.id, msg.attachment?.duration || '0:15', msg.attachment?.url)}
                                      className={`p-2 rounded-full shrink-0 transition-all ${isMe ? 'bg-white text-secondary hover:scale-105' : 'bg-secondary text-white hover:scale-105'}`}
                                    >
                                      {activePlayingAudioId === msg.id ? (
                                        <Pause className="h-3.5 w-3.5" />
                                      ) : (
                                        <Play className="h-3.5 w-3.5 pl-0.5" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-grow space-y-1">
                                      {/* Simulated audio waveform */}
                                      <div className="flex items-center gap-[2px] h-4">
                                        {[10, 4, 18, 12, 16, 6, 14, 8, 20, 10, 12, 6, 16, 10].map((h, i) => {
                                          const percent = audioPlaybackPercent[msg.id] || 0;
                                          const barPassed = (i / 14) * 100 < percent;
                                          return (
                                            <span 
                                              key={i} 
                                              className="w-[3px] rounded-full transition-colors" 
                                              style={{ 
                                                height: `${h}px`,
                                                backgroundColor: barPassed 
                                                  ? (isMe ? '#ffffff' : '#f43f5e') 
                                                  : (isMe ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.15)')
                                              }} 
                                            />
                                          );
                                        })}
                                      </div>
                                      <div className="flex justify-between items-center text-[7.5px] opacity-75">
                                        <span>
                                          {audioPlaybackSeconds[msg.id] 
                                            ? `0:${Math.floor(audioPlaybackSeconds[msg.id]).toString().padStart(2, '0')}` 
                                            : '0:00'}
                                        </span>
                                        <span>{msg.attachment.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing check inside active circles */}
                  {isCircleTyping && circleTypingSister && (
                    <div className="flex gap-2 items-center text-[9.5px] text-slate-400 font-bold bg-white p-2 rounded-xl border border-slate-150 max-w-[200px] shadow-sm animate-pulse">
                      <img
                        src={circleTypingSister.avatar}
                        alt={circleTypingSister.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span className="truncate">{circleTypingSister.name} is typing...</span>
                      <span className="flex gap-0.5 ml-1">
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Uploading Progress Overlay Check */}
              {uploadingFile && (
                <div className="rounded-2xl border border-slate-150 p-4 bg-white shadow-sm flex items-center justify-between gap-4 max-w-sm ml-auto animate-fade-in mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-secondary/10 rounded-xl text-secondary shrink-0">
                      {uploadingFile.type === 'document' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-[10.5px] font-bold text-primary truncate leading-tight">{uploadingFile.name}</p>
                      <span className="text-[8.5px] text-slate-400 block leading-none">{uploadingFile.size} • Uploading...</span>
                      
                      {/* Progress Line */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className="bg-secondary h-full transition-all duration-150" 
                          style={{ width: `${uploadingFile.progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-black text-secondary">{uploadingFile.progress}%</span>
                    <button 
                      onClick={() => setUploadingFile(null)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-rose-400 block mt-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Fallback frame if no conversation selected */}
              {!activeConv && !activeCircleId && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <h4 className="font-heading text-sm font-bold text-primary">No Active Conversation Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Choose a sister partner from DMs, or explore a Circle Lounge to participate in secure discussions!
                  </p>
                </div>
              )}
            </div>

            {/* INTERACTIVE INPUT BAR & TEMP REPLIES */}
            {(activeConv || activeCircleId) && (
              <div className="border-t border-slate-100 bg-white">
                
                {/* Scrollable Quick Replier */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-50/50">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mr-1.5">Quick Sparks:</span>
                  {QUICK_REPLIES.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleSendQuickReply(text)}
                      className="rounded-full bg-white border border-slate-200/80 px-3 py-1 text-[10.5px] font-extrabold text-slate-600 hover:border-secondary hover:text-secondary transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {/* Form or Voice Recording Controller */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3.5 flex items-center gap-2 bg-white relative"
                >
                  
                  {/* Paperclip Button for attachments dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                      className={`p-2.5 rounded-full transition-all ${attachmentMenuOpen ? 'bg-secondary/15 text-secondary' : 'bg-slate-50 text-slate-400 hover:text-primary'}`}
                      title="Attach assets"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>

                    {/* Popover attachment choices */}
                    {attachmentMenuOpen && (
                      <div className="absolute bottom-full mb-2.5 left-0 w-64 bg-white border border-slate-150 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Attach Blueprint Asset</span>
                          <button onClick={() => setAttachmentMenuOpen(false)} className="text-slate-400 hover:text-primary">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Real Upload Action */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all border border-secondary/10 group"
                        >
                          <div className="p-1.5 rounded-lg bg-secondary text-white shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10.5px] font-bold text-primary leading-tight">Upload from device</p>
                            <p className="text-[8.5px] text-slate-500 font-medium">Images, PDF, or Docs</p>
                          </div>
                        </button>

                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleRealFileUpload}
                          className="hidden"
                          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />
                        
                        {/* Documents section */}
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-extrabold text-secondary flex items-center gap-1 uppercase tracking-widest">
                            <FileText className="h-3 w-3" /> Documents & Forms
                          </p>
                          {MOCK_BLUEPRINTS.map((doc) => (
                            <button
                              key={doc.name}
                              type="button"
                              onClick={() => handleTriggerMockUpload(doc)}
                              className="w-full text-left p-1.5 rounded-xl hover:bg-slate-50 transition-all text-[10.5px] font-semibold text-primary truncate block border border-transparent hover:border-slate-150"
                            >
                              📁 {doc.name} <span className="text-slate-400 text-[8.5px]">({doc.size})</span>
                            </button>
                          ))}
                        </div>

                        {/* Images section */}
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[9px] font-extrabold text-secondary flex items-center gap-1 uppercase tracking-widest">
                            <ImageIcon className="h-3 w-3" /> Workshop Photos
                          </p>
                          {MOCK_PHOTOS.map((photo) => (
                            <button
                              key={photo.name}
                              type="button"
                              onClick={() => handleTriggerMockUpload(photo)}
                              className="w-full text-left p-1.5 rounded-xl hover:bg-slate-50 transition-all text-[10.5px] font-semibold text-primary truncate block border border-transparent hover:border-slate-150"
                            >
                              🖼️ {photo.name} <span className="text-slate-400 text-[8.5px]">({photo.size})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TEXT INPUT FIELD or RECORDING BAR or DRAFT PREVIEW */}
                  {voiceNoteDraft ? (
                    <div className="flex-grow flex items-center gap-3 bg-slate-50/80 rounded-full px-4 py-1.5 border border-secondary/20 animate-fade-in shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleToggleVoicePlay('voice-draft', voiceNoteDraft.duration, voiceNoteDraft.url)}
                        className="p-2 rounded-full bg-secondary text-white hover:scale-105 transition-all shadow-sm"
                      >
                        {activePlayingAudioId === 'voice-draft' ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        )}
                      </button>
                      
                      <div className="flex-grow flex flex-col gap-1">
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary transition-all duration-300"
                            style={{ width: `${audioPlaybackPercent['voice-draft'] || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center px-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-mono font-bold text-secondary">
                              {audioPlaybackSeconds['voice-draft'] ? `0:${Math.floor(audioPlaybackSeconds['voice-draft']).toString().padStart(2, '0')}` : '0:00'} / {voiceNoteDraft.duration}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                            Preview Draft
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDiscardVoiceDraft}
                        className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
                        title="Discard and Re-record"
                      >
                        <Trash2 className="h-4.5 w-4.5 group-hover:scale-110" />
                      </button>
                    </div>
                  ) : pendingAttachment ? (
                    <div className="flex-grow flex items-center gap-3 bg-slate-50/80 rounded-2xl px-3 py-2 border border-secondary/20 animate-fade-in shadow-sm relative">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-150 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                        {pendingAttachment.type === 'image' ? (
                          <img src={pendingAttachment.url} alt="preview" className="h-full w-full object-cover" />
                        ) : pendingAttachment.type === 'video' ? (
                          <div className="relative h-full w-full bg-slate-900 flex items-center justify-center">
                            <Video className="h-5 w-5 text-white/50" />
                            <div className="absolute inset-0 bg-secondary/10" />
                          </div>
                        ) : (
                          <FileText className="h-6 w-6 text-secondary" />
                        )}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="text-[10.5px] font-bold text-primary truncate">{pendingAttachment.file.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          {(pendingAttachment.file.size / 1024).toFixed(1)} KB • Ready to send
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDiscardPendingAttachment}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        title="Remove attachment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : isRecording ? (
                    <div className="flex-grow flex items-center justify-between bg-rose-50/50 border border-rose-150/60 rounded-full px-4 py-2 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-rose-600 text-[11px] font-bold">
                          Recording Voice Note... 0:{recordingDuration.toString().padStart(2, '0')}
                        </span>
                        
                        {/* CSS equalizer wave */}
                        <div className="flex items-center gap-0.5 h-3 ml-2">
                          {[6, 12, 18, 10, 4, 14, 8, 18, 6, 10].map((h, i) => (
                            <span 
                              key={i} 
                              className="w-[2px] bg-rose-400 rounded-full animate-bounce" 
                              style={{ 
                                height: `${h}px`,
                                animationDuration: `${500 + i * 80}ms`
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecording(false);
                          setRecordingDuration(0);
                        }}
                        className="text-rose-500 hover:text-rose-700 text-[10px] font-extrabold uppercase mr-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={activeConv ? "Type a secure sisterhood message..." : "Contribute inside circle lounge..."}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-grow rounded-full border border-slate-200 px-4 py-2.5 text-[11px] font-semibold text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                    />
                  )}

                  {/* VOICE RECORDING FEEDBACK & BUTTON */}
                  {!voiceNoteDraft && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecording}
                        className={`p-2.5 rounded-full transition-all shrink-0 ${
                          isRecording 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 scale-110' 
                            : 'bg-slate-50 text-slate-400 hover:text-primary'
                        }`}
                        title={isRecording ? "Stop Recording" : "Record Voice Note"}
                      >
                        {isRecording ? <Square className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  )}

                  {/* SEND TEXT/DRAFT BUTTON */}
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (voiceNoteDraft) {
                        e.preventDefault();
                        handleSendVoiceDraft();
                      } else if (pendingAttachment) {
                        e.preventDefault();
                        handleSendPendingAttachment();
                      }
                    }}
                    disabled={(!messageText.trim() && !voiceNoteDraft && !pendingAttachment) || isRecording}
                    className="rounded-full bg-secondary hover:bg-secondary/95 text-white p-2.5 shadow-md shadow-secondary/15 shrink-0 disabled:opacity-40 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* 3. COLLAPSIBLE RIGHT INFO PANEL PANEL */}
          {infoPanelOpen && (
            <div className="w-72 border-l border-slate-100 bg-slate-50/35 h-full overflow-y-auto p-4 shrink-0 hidden md:block animate-fade-in space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lounge / Member Profile</span>
                <button 
                  onClick={() => setInfoPanelOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Render contact details if DM is active */}
              {activeConv && !activeCircleId && (
                activeConv.isGroup ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-1.5 pt-2 animate-fade-in">
                      <div className="p-3.5 bg-secondary/15 text-secondary rounded-full w-max mx-auto border border-secondary/25 shadow-sm">
                        <Users className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-primary leading-tight">{activeConv.groupName}</h4>
                        <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wide mt-0.5">
                          {activeConv.groupMembers?.length || 0} Sisters in Chat
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sisters in Chat</span>
                        <button
                          onClick={() => setShowAddMemberModal(true)}
                          className="text-[9px] font-bold text-secondary hover:underline flex items-center gap-0.5"
                        >
                          <UserPlus className="h-3 w-3" /> Add
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {activeConv.groupMembers?.map((sis) => (
                          <div key={sis.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/50 transition-colors">
                            <img 
                              src={sis.avatar} 
                              alt={sis.name}
                              className="h-8 w-8 rounded-full object-cover border border-slate-150 shadow-sm"
                            />
                            <div className="min-w-0 flex-grow text-left">
                              <p className="text-[10.5px] font-bold text-primary truncate leading-tight">{sis.name}</p>
                              <p className="text-[8.5px] text-slate-400 truncate leading-none mt-0.5">{sis.title}</p>
                            </div>
                            {sis.id !== currentUser.id && (
                              <span className="h-2 w-2 bg-emerald-500 rounded-full shrink-0 ring-2 ring-emerald-100" title="Online" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shared Drive Files */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Shared Drive Files ({activeConv.messages.filter(m => m.attachment).length})</span>
                      <div className="space-y-1.5">
                        {activeConv.messages.filter(m => m.attachment).length === 0 ? (
                          <span className="text-[9px] text-slate-400 italic block">No files shared yet.</span>
                        ) : (
                          activeConv.messages.filter(m => m.attachment).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 border border-slate-200/50 text-[10px] font-semibold text-primary">
                              <span className="truncate flex-grow mr-2 text-left">{m.attachment?.name}</span>
                              <button 
                                onClick={() => addPoints(10)}
                                className="text-secondary hover:text-primary transition-colors shrink-0"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-1.5 pt-2">
                      <img 
                        src={activeConv.member.avatar} 
                        alt={activeConv.member.name}
                        className="h-16 w-16 rounded-full object-cover mx-auto border-2 border-secondary shadow-sm"
                      />
                      <div>
                        <h4 className="text-[12px] font-black text-primary leading-tight">{activeConv.member.name}</h4>
                        <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wide">{activeConv.member.rank}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider">
                        ● Active Online
                      </span>
                    </div>

                    <div className="text-[10px] space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-extrabold uppercase">City:</span>
                        <span className="font-semibold text-primary">{activeConv.member.city}, Kenya</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-extrabold uppercase">Stage:</span>
                        <span className="font-semibold text-primary">{activeConv.member.business_stage || 'Early Stage'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-extrabold uppercase">Mentoring:</span>
                        <span className="font-semibold text-primary">{activeConv.member.mentoring_capacity || 'Open'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bio Description</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        {activeConv.member.bio}
                      </p>
                    </div>

                    {/* Skills tags */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Skills & Coordinates</span>
                      <div className="flex flex-wrap gap-1">
                        {activeConv.member.skills.map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5 text-[8.5px] font-extrabold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mutual assets list */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Shared Drive Files ({activeConv.messages.filter(m => m.attachment).length})</span>
                      <div className="space-y-1.5">
                        {activeConv.messages.filter(m => m.attachment).length === 0 ? (
                          <span className="text-[9px] text-slate-400 italic block">No files shared yet.</span>
                        ) : (
                          activeConv.messages.filter(m => m.attachment).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 border border-slate-200/50 text-[10px] font-semibold text-primary">
                              <span className="truncate flex-grow mr-2 text-left">{m.attachment?.name}</span>
                              <button 
                                onClick={() => addPoints(10)}
                                className="text-secondary hover:text-primary transition-colors shrink-0"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Render Circle specs if Circle Lounge is active */}
              {!activeConv && activeCircleId && activeCircleInfo && (
                <div className="space-y-4">
                  <div className="space-y-1 bg-white border border-slate-150 rounded-xl p-3 shadow-sm text-center">
                    <div className="p-3 bg-secondary/10 text-secondary rounded-full w-max mx-auto">
                      <Hash className="h-5 w-5 font-extrabold" />
                    </div>
                    <h5 className="text-[11.5px] font-black text-primary">#{activeCircleId}-circle</h5>
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">{activeCircleInfo.topic}</p>
                  </div>

                  <div className="text-[10px] leading-relaxed space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Lounge Description</span>
                    <p className="text-slate-500 font-medium">
                      {activeCircleInfo.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Lounge Conduct Rules</span>
                    <ul className="space-y-1.5">
                      {activeCircleInfo.guidelines.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[9.5px] text-slate-500 font-medium leading-relaxed">
                          <Check className="h-3 w-3 text-secondary shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Active Online Sisters avatars list */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Active Sisters Online ({activeCircleInfo.members.length})</span>
                    <div className="grid grid-cols-4 gap-2">
                      {allMembers.filter(m => activeCircleInfo.members.includes(m.id)).map(sis => (
                        <div key={sis.id} className="text-center group cursor-pointer relative" title={sis.name}>
                          <img 
                            src={sis.avatar} 
                            alt={sis.name}
                            className="h-10 w-10 rounded-full object-cover mx-auto border-2 border-emerald-400 group-hover:scale-105 transition-all"
                          />
                          <span className="absolute bottom-0 right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full border border-white ring-2 ring-white" />
                        </div>
                      ))}
                    </div>
                  </div>


                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-[13px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-secondary" />
                  Create Sisterhood Group Chat
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Start a collaborative private thread</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName('');
                  setSelectedGroupMemberIds([]);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-grow">
              {/* Group Name input */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kenya Artisan Founders, Nairobi Sync"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-[11px] font-bold text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              {/* Members selection list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Select Sisters ({selectedGroupMemberIds.length})</label>
                  {selectedGroupMemberIds.length > 0 && (
                    <button 
                      onClick={() => setSelectedGroupMemberIds([])}
                      className="text-[9px] font-bold text-secondary hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="border border-slate-150 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {allMembers.filter(m => m.id !== currentUser.id).map((member) => {
                    const isSelected = selectedGroupMemberIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGroupMemberIds(selectedGroupMemberIds.filter(id => id !== member.id));
                          } else {
                            setSelectedGroupMemberIds([...selectedGroupMemberIds, member.id]);
                          }
                        }}
                        className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors hover:bg-slate-50/80 ${isSelected ? 'bg-secondary/5' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent onClick
                          className="rounded text-secondary focus:ring-secondary h-3.5 w-3.5 shrink-0 border-slate-300"
                        />
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-150 shrink-0"
                        />
                        <div className="min-w-0 flex-grow text-left">
                          <p className="text-[10.5px] font-extrabold text-primary truncate leading-tight">{member.name}</p>
                          <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{member.title} • {member.city}</p>
                        </div>
                        <span className="text-[8.5px] font-black text-secondary uppercase bg-secondary/5 px-2 py-0.5 rounded-lg shrink-0">
                          {member.rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5 justify-end">
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName('');
                  setSelectedGroupMemberIds([]);
                }}
                className="px-4 py-2 rounded-xl text-[10.5px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={!newGroupName.trim() || selectedGroupMemberIds.length === 0}
                onClick={() => {
                  handleCreateGroupChat(newGroupName, selectedGroupMemberIds);
                  setShowCreateGroupModal(false);
                  setNewGroupName('');
                  setSelectedGroupMemberIds([]);
                }}
                className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-[10.5px] font-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider flex items-center gap-1"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && activeConv && activeConv.isGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-[13px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-secondary" />
                  Add Sisters to Group
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Invite others to join "{activeConv.groupName}"</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content list */}
            <div className="p-5 overflow-y-auto flex-grow max-h-[60vh] divide-y divide-slate-100">
              {allMembers
                .filter(m => !activeConv.groupMembers?.some(gm => gm.id === m.id))
                .length === 0 ? (
                <div className="py-8 text-center text-[10px] text-slate-400 italic">
                  All available sisters are already members of this group!
                </div>
              ) : (
                allMembers
                  .filter(m => !activeConv.groupMembers?.some(gm => gm.id === m.id))
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8.5 w-8.5 rounded-full object-cover border border-slate-150 shrink-0"
                      />
                      <div className="min-w-0 flex-grow text-left">
                        <p className="text-[10.5px] font-extrabold text-primary truncate leading-tight">{member.name}</p>
                        <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{member.title} • {member.city}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleAddMemberToGroup(member.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-[9.5px] font-extrabold transition-all shadow-sm shrink-0"
                      >
                        Add Sister
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-[10.5px] font-black shadow-sm transition-all uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
