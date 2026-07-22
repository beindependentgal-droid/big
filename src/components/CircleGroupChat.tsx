import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Hash, 
  MessageSquare, 
  Sparkles, 
  Smile, 
  Award,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Lock,
  MessageCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { Member } from '../data';
import { formatTimeAgo } from '../lib/utils';

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
}

interface CircleGroupChatProps {
  activeTab: 'learn' | 'connect' | 'earn' | 'thrive';
  currentUser: Member;
  members: Member[];
  addPoints: (pts: number, badge?: string) => void;
  setSelectedConversationMember: (member: Member | null) => void;
  setCurrentView: (view: string) => void;
}

// Prepopulated historic group messages for realistic context
const INITIAL_GROUP_MESSAGES: GroupMessage[] = [
  // LEARN
  {
    id: 'gmsg-l1',
    circleId: 'learn',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
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
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
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
      avatar: '/src/assets/images/african_woman_portrait_2_1784708246407.jpg',
      rank: 'Community Lead'
    },
    content: "I'd love to join a mock sales practice session too! Maybe we can organize a group huddle on Zoom this Friday?",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },

  // CONNECT
  {
    id: 'gmsg-c1',
    circleId: 'connect',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/src/assets/images/african_woman_portrait_2_1784708246407.jpg',
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
      avatar: '/src/assets/images/african_woman_portrait_2_1784708246407.jpg',
      rank: 'Community Lead'
    },
    content: "Joy! I wish I were in Kampala, I am in Accra right now. But let's definitely coordinate for our Saturday Bi-Weekly Standup. We have 12 sisters RSVP'd so far!",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-c3',
    circleId: 'connect',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Learner'
    },
    content: "I will be there Hawa! Saturday stands as my favorite day of the week because of these connects.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },

  // EARN
  {
    id: 'gmsg-e1',
    circleId: 'earn',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
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
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Learner'
    },
    content: "Fatima, you are a lifesaver! I plugged in my apparel numbers and realized my net margins on our Ankara dresses were only 8%. After adjusting with your template, I raised it to 22% safely. Thank you so much!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-e3',
    circleId: 'earn',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/src/assets/images/african_woman_portrait_2_1784708246407.jpg',
      rank: 'Member'
    },
    content: "This is huge Amina! Proper pricing is where our power lies. We shouldn't undersell our artisanal crafts.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },

  // THRIVE
  {
    id: 'gmsg-t1',
    circleId: 'thrive',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
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
      avatar: '/src/assets/images/african_woman_portrait_2_1784708246407.jpg',
      rank: 'Member'
    },
    content: "We hear you, Amina. Please give yourself some grace. You are running a full enterprise AND raising a family. Both are full-time jobs. Take a 15-minute tea break and step away from the workbench. We support you!",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gmsg-t3',
    circleId: 'thrive',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/src/assets/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Mentor'
    },
    content: "Spot on Joy. Amina, delegation isn't failure, it is scale. Is there a sister in your local hub who can handle the dispatch pickups for you today?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export function CircleGroupChat({
  activeTab,
  currentUser,
  members,
  addPoints,
  setSelectedConversationMember,
  setCurrentView
}: CircleGroupChatProps) {
  // Load message logs from local storage or defaults
  const [messages, setMessages] = useState<GroupMessage[]>(() => {
    const saved = localStorage.getItem('big_v2_circle_group_messages');
    return saved ? JSON.parse(saved) : INITIAL_GROUP_MESSAGES;
  });

  const [messageInput, setMessageInput] = useState('');
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
      setMessageInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };
  const [isTyping, setIsTyping] = useState(false);
  const [typingSister, setTypingSister] = useState<{ name: string; avatar: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('big_v2_circle_group_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Active circle description details
  const circleDetails = {
    learn: {
      lounge: "Learn Academy Lounge",
      topic: "Course reflections, grant guidelines & AfCFTA custom protocols",
      members: ['m1', 'm2', 'm3', 'm6'] // Amina, Fatima, Hawa, Nia
    },
    connect: {
      lounge: "Connect Network Lounge",
      topic: "Partner discovery, local micro-hubs & Saturday accountability standups",
      members: ['m4', 'm3', 'm1', 'm6'] // Joy, Hawa, Amina, Nia
    },
    earn: {
      lounge: "Earn Scaling Lounge",
      topic: "Pricing audits, angel investor pitching & export volume checklists",
      members: ['m2', 'm8', 'm5', 'm1'] // Fatima, Tsitsi, Zuri, Amina
    },
    thrive: {
      lounge: "Thrive Well-being Safe Space",
      topic: "Burnout release, mental recovery, child-care balance & joyful wins",
      members: ['m1', 'm4', 'm2', 'm7'] // Amina, Joy, Fatima, Mariama
    }
  };

  const activeCircleInfo = circleDetails[activeTab as keyof typeof circleDetails] || {
    lounge: `${activeTab} Lounge`,
    topic: "General Discussion",
    members: members.slice(0, 3).map(m => m.id)
  };

  // Filter messages specifically for the active circle
  const activeCircleMessages = messages.filter(m => m.circleId === activeTab);

  // Active participating sisters in this circle who are currently "online"
  const onlineSisters = members.filter(m => activeCircleInfo.members.includes(m.id));

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const userMessageContent = messageInput;
    const newMsg: GroupMessage = {
      id: `gmsg-user-${Date.now()}`,
      circleId: activeTab,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rank: currentUser.rank || 'Learner'
      },
      content: userMessageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
    
    // Add Points reward for contributing to the circle group chat
    addPoints(3);

    // Trigger simulated real-time response after 1.5 seconds
    simulateSisterResponse(userMessageContent);
  };

  const simulateSisterResponse = (userInput: string) => {
    // Pick a random sister from the active online sisters to type
    if (onlineSisters.length === 0) return;
    const randomSister = onlineSisters[Math.floor(Math.random() * onlineSisters.length)];

    setIsTyping(true);
    setTypingSister({ name: randomSister.name, avatar: randomSister.avatar });

    setTimeout(() => {
      setIsTyping(false);
      setTypingSister(null);

      // Construct a highly customized contextual response based on the input text
      let responseContent = "";
      const text = userInput.toLowerCase();

      // Question mark detection
      const isQuestion = text.includes('?');

      // Theme matching
      if (activeTab === 'learn') {
        if (text.includes('grant') || text.includes('seed') || text.includes('money') || text.includes('capital') || text.includes('fund')) {
          responseContent = `That is extremely important! For our BIG Academy Seed Grant, make sure you outline exactly how that capital acts as an operational catalyst. Don't worry, the checklist in the Action Hub makes the steps very clear!`;
        } else if (text.includes('course') || text.includes('lesson') || text.includes('module') || text.includes('learn')) {
          responseContent = `Yes! I highly recommend going through the 'Confident Sales' module. It has a beautiful formula for handling price queries that literally doubled my conversion rate!`;
        } else if (isQuestion) {
          responseContent = `That is an excellent question, sister! I recommend we bring this up during our study circle on Friday so our facilitators can elaborate. What do you think?`;
        } else {
          responseContent = `Absolutely! Continuous learning is where our power comes from. Let's make sure we complete our active modules before the weekend checkout!`;
        }
      } else if (activeTab === 'connect') {
        if (text.includes('collab') || text.includes('partner') || text.includes('co-founder') || text.includes('team')) {
          responseContent = `I am super passionate about cross-cooperative partnerships! Let's connect directly via Direct Message to share coordinates and map out a simple pilot together.`;
        } else if (text.includes('saturday') || text.includes('meeting') || text.includes('zoom') || text.includes('standup')) {
          responseContent = `I will definitely be online this Saturday! The fortnightly standup keeps me completely aligned. It's so beautiful to hear everyone's direct focus and weekly blockages.`;
        } else if (isQuestion) {
          responseContent = `I was wondering about that exact same challenge! Let's check if Hawa or Fatima has a template we can reuse so we don't have to reinvent the wheel.`;
        } else {
          responseContent = `Completely agree! We can go so much further when we pool our networks and share regional trade tips. Keep pushing, sister!`;
        }
      } else if (activeTab === 'earn') {
        if (text.includes('price') || text.includes('cost') || text.includes('charge') || text.includes('sell') || text.includes('margin')) {
          responseContent = `Price for value, sister, never just for cost! If you are handcrafting with natural ingredients, your story is premium. Our clients will gladly pay for genuine sustainability!`;
        } else if (text.includes('pitch') || text.includes('investor') || text.includes('deck') || text.includes('angel')) {
          responseContent = `For pitching, a 2-minute personal video is incredibly powerful before sharing slides. Investors want to trust the founder's resilience and vision first!`;
        } else if (isQuestion) {
          responseContent = `That's a tricky scaling question! Fatima Adebayo has a lot of experience with microfinance structures—maybe we can ask her to do an audit session on this soon?`;
        } else {
          responseContent = `Yes! Let's focus on raising our average order value this quarter. Protecting our gross profit margins is the key to independent survival!`;
        }
      } else if (activeTab === 'thrive') {
        if (text.includes('burnout') || text.includes('tired') || text.includes('exhausted') || text.includes('overwhelmed') || text.includes('stress') || text.includes('hard')) {
          responseContent = `I hear you so deeply, sister. Please shut your laptop, step away from the phone, and take a gentle 15-minute screen break. Your business is built to support your life, not consume it!`;
        } else if (text.includes('win') || text.includes('success') || text.includes('happy') || text.includes('launch') || text.includes('yay') || text.includes('sold')) {
          responseContent = `Woohooo! 🎉 Such beautiful news! Hearing your success keeps all of us moving forward. Celebrate your hard work today—you earned this moment!`;
        } else if (isQuestion) {
          responseContent = `It is totally normal to feel conflicted about this. Balancing business timelines and maternal care is a daily dance. Give yourself some grace, you are doing great.`;
        } else {
          responseContent = `Sending you a warm virtual hug, sister! Remember to inhale confidence, exhale the pressure. We are walking this path together.`;
        }
      }

      // Fallback
      if (!responseContent) {
        responseContent = `This is beautiful, sister. Thanks for sharing this in our active lounge! Let's keep sharing resources and supporting each other's weekly goals.`;
      }

      const simMsg: GroupMessage = {
        id: `gmsg-sim-${Date.now()}`,
        circleId: activeTab,
        author: {
          id: randomSister.id,
          name: randomSister.name,
          avatar: randomSister.avatar,
          rank: randomSister.rank
        },
        content: responseContent,
        timestamp: "Just now"
      };

      setMessages(prev => [...prev, simMsg]);
    }, 1500);
  };

  // Switch to personal direct messaging if clicking a sister
  const handleSisterAvatarClick = (sisterName: string) => {
    if (sisterName.includes('Sarah Jenkins')) {
      setCurrentView('profile');
      return;
    }
    const memberObj = members.find(m => m.name === sisterName);
    if (memberObj) {
      setSelectedConversationMember(memberObj);
      setCurrentView('messages');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-150 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row h-[550px] animate-fade-in">
      
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/20">
        
        {/* Chat Channel Header */}
        <div className="border-b border-slate-150 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <Hash className="h-4.5 w-4.5 font-extrabold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading text-xs sm:text-sm font-extrabold text-primary">
                  {activeCircleInfo.lounge}
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider animate-pulse">
                  ● Live Group
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1">
                Active Topic: {activeCircleInfo.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors"
              title={soundEnabled ? "Mute Group Notifications" : "Unmute Group Notifications"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
            </button>
            <div className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150">
              <Users className="h-3 w-3" />
              <span>{onlineSisters.length + 1} online</span>
            </div>
          </div>
        </div>

        {/* Group Conversation Feed Window */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* Welcome Card banner */}
          <div className="rounded-xl border border-dashed border-slate-150 p-3.5 bg-white space-y-1.5 text-center shadow-sm">
            <span className="inline-block p-1.5 rounded-full bg-secondary/15 text-secondary">
              <MessageCircle className="h-4.5 w-4.5" />
            </span>
            <h4 className="text-xs font-extrabold text-primary">
              Welcome to the #{activeTab}-circle Real-time Lounge!
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold max-w-md mx-auto leading-normal">
              This space is open to all registered {activeTab} circle members. Share instant thoughts, answer active questions, or check on Saturday goals in real time!
            </p>
            <div className="text-[9px] font-extrabold text-emerald-600 flex items-center justify-center gap-1 pt-1">
              <Award className="h-3.5 w-3.5" />
              <span>Participating in the lounge chats earns you <strong className="font-extrabold">+3 Points</strong>!</span>
            </div>
          </div>

          {/* Group Message Items */}
          {activeCircleMessages.map((msg) => {
            const isMe = msg.author.id === currentUser.id;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <img
                  src={msg.author.avatar}
                  alt={msg.author.name}
                  onClick={() => handleSisterAvatarClick(msg.author.name)}
                  className="h-8 w-8 rounded-full object-cover border border-slate-100 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                />

                <div className="space-y-1">
                  {/* Name and rank header */}
                  <div className={`flex items-center gap-1.5 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                    <span 
                      onClick={() => handleSisterAvatarClick(msg.author.name)}
                      className="font-extrabold text-primary hover:underline cursor-pointer"
                    >
                      {msg.author.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wider text-slate-500">
                      {msg.author.rank}
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                      isMe 
                        ? 'bg-primary text-white border-primary/10 rounded-tr-none' 
                        : 'bg-white text-primary border-slate-150 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && typingSister && (
            <div className="flex gap-2 items-center text-[10px] text-slate-400 font-bold bg-white/70 backdrop-blur-sm p-2 rounded-xl border border-slate-150 max-w-[200px] shadow-sm animate-pulse">
              <img
                src={typingSister.avatar}
                alt={typingSister.name}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="truncate">{typingSister.name} is typing...</span>
              <span className="flex gap-0.5 ml-1">
                <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}
        </div>

        {/* Messaging Input Area */}
        <form 
          onSubmit={handleSendMessage}
          className="border-t border-slate-150 p-3.5 bg-white flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              required
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Send message to #${activeTab}-circle-lounge...`}
              disabled={isTyping}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-10 text-xs text-primary focus:border-primary focus:outline-none bg-slate-50/50 placeholder-slate-400 font-semibold"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-primary transition-colors">
              <Smile className="h-4.5 w-4.5" />
            </span>
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-100 text-rose-500 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-primary'
            }`}
            title={isListening ? 'Stop voice input' : 'Voice-to-text input'}
          >
            {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
          </button>

          <button
            type="submit"
            disabled={isTyping || !messageInput.trim()}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

      {/* SIDEBAR: ACTIVE MEMBERS LIST */}
      <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-150 bg-white p-4 flex flex-col h-1/3 md:h-full shrink-0">
        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-secondary" />
          <span>Active Sisters ({onlineSisters.length + 1})</span>
        </h4>

        {/* Online Members List */}
        <div className="flex-1 overflow-y-auto space-y-2.5">
          {/* User herself */}
          <div 
            onClick={() => handleSisterAvatarClick(currentUser.name)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full object-cover border border-slate-150"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-primary truncate group-hover:text-secondary">
                {currentUser.name} <span className="text-slate-400 font-bold">(You)</span>
              </p>
              <p className="text-[9px] text-slate-400 font-extrabold truncate">
                {currentUser.rank || 'Learner'}
              </p>
            </div>
          </div>

          {/* Active online sisters */}
          {onlineSisters.map((sis) => (
            <div 
              key={sis.id}
              onClick={() => handleSisterAvatarClick(sis.name)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              title={`Click to privately message ${sis.name}`}
            >
              <div className="relative">
                <img
                  src={sis.avatar}
                  alt={sis.name}
                  className="h-7 w-7 rounded-full object-cover border border-slate-150"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-primary truncate group-hover:text-secondary">
                  {sis.name}
                </p>
                <p className="text-[9px] text-slate-400 font-extrabold truncate">
                  {sis.rank}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-150 mt-2 text-[9px] text-slate-400 font-bold leading-relaxed space-y-1">
          <p className="flex items-center gap-1 text-slate-500">
            <Lock className="h-3 w-3 text-secondary shrink-0" />
            <span>Circle Privacy Guard Active</span>
          </p>
          <p>
            Conversations in this lounge remain strictly safe, supportive and private to this specific circle.
          </p>
        </div>
      </div>
      
    </div>
  );
}
