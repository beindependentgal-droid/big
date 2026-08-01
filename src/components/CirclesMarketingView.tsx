import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Target, 
  Heart, 
  Users, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Laptop, 
  Baby, 
  Globe, 
  Search, 
  UserPlus, 
  MessageSquare, 
  MessageCircle, 
  MessagesSquare, 
  Calendar, 
  FileText, 
  Trophy, 
  Megaphone, 
  Lock, 
  Compass, 
  Shield, 
  Award, 
  HeartHandshake, 
  Smile, 
  ArrowUpRight, 
  CheckSquare, 
  ThumbsUp, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CirclesMarketingViewProps {
  setCurrentView?: (view: string, mode?: 'login' | 'register') => void;
  isAuthenticated?: boolean;
}

export function CirclesMarketingView({ setCurrentView, isAuthenticated = false }: CirclesMarketingViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleJoinAction = () => {
    if (isAuthenticated) {
      setCurrentView?.('feeds');
    } else {
      setCurrentView?.('auth', 'register');
    }
  };

  const scrollToCircles = () => {
    const el = document.getElementById('explore-popular-circles');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const whyCircles = [
    {
      icon: Heart,
      title: "Sisterhood",
      desc: "Build genuine friendships and support systems that understand your path.",
      color: "bg-pink-500/10 text-pink-600 border-pink-500/20"
    },
    {
      icon: Target,
      title: "Accountability",
      desc: "Stay motivated through shared goals, structured weekly reviews, and sisterly encouragement.",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    {
      icon: BookOpen,
      title: "Learning",
      desc: "Exchange peer-tested ideas, direct resources, templates, and hands-on experiences.",
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
    },
    {
      icon: Briefcase,
      title: "Opportunities",
      desc: "Discover vetted jobs, matches for grant funds, creative collaborations, and partner leads.",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    }
  ];

  const popularCircles = [
    {
      icon: DollarSign,
      title: "Financial Independence",
      desc: "Build better money habits, understand cash flow templates, and establish independent wealth channels.",
      cover: "/images/african_tech_collaboration.jpg",
      members: "1,240 Sisters",
      topics: ["Wealth Plans", "Budgeting", "Sovereign Credit"],
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
    },
    {
      icon: Briefcase,
      title: "Career Women",
      desc: "Unlock structural career growth, corporate ladder guidance, interview readiness, and negotiation skills.",
      cover: "/images/african_tech_collaboration.jpg",
      members: "980 Sisters",
      topics: ["Negotiations", "CV Design", "Public Speaking"],
      color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-700"
    },
    {
      icon: TrendingUp,
      title: "Women Entrepreneurs",
      desc: "Plan, register, coordinate, and scale female-led companies through peer blueprints and match funding.",
      cover: "/images/african_woman_founder_portrait.jpg",
      members: "1,550 Sisters",
      topics: ["LLC Launch", "Customer Acquisition", "Pitch Decks"],
      color: "border-rose-500/20 bg-rose-500/5 text-rose-700"
    },
    {
      icon: Heart,
      title: "Wellness Circle",
      desc: "Prioritize mental clarity, emotional boundaries, confidence builders, and physical wellness tracking.",
      cover: "/images/african_women_community.jpg",
      members: "850 Sisters",
      topics: ["Mindfulness", "Stress Management", "Healthy Routines"],
      color: "border-pink-500/20 bg-pink-500/5 text-pink-700"
    },
    {
      icon: GraduationCap,
      title: "Students & Graduates",
      desc: "Transition smoothly from university lectures straight into specialized, sovereign career execution.",
      cover: "/images/african_women_mentorship_lounge.jpg",
      members: "720 Sisters",
      topics: ["Internships", "Skill Building", "First Retainers"],
      color: "border-amber-500/20 bg-amber-500/5 text-amber-700"
    },
    {
      icon: Laptop,
      title: "Women in Tech",
      desc: "Accelerate tech literacy, software engineering frameworks, AI leverages, and design collaboration.",
      cover: "/images/african_woman_keynote_speaker.jpg",
      members: "1,120 Sisters",
      topics: ["Tech Portfolio", "AI Prompting", "Design Engineering"],
      color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-700"
    },
    {
      icon: Baby,
      title: "Mothers Circle",
      desc: "Anchor your motherhood journey in supportive environments, sharing tips on work-life synergy.",
      cover: "/images/african_women_business_meeting.jpg",
      members: "640 Sisters",
      topics: ["Synergy Plans", "Parenting Guides", "Self Care"],
      color: "border-teal-500/20 bg-teal-500/5 text-teal-700"
    },
    {
      icon: Globe,
      title: "Diaspora Women",
      desc: "Connect back home while optimizing global opportunities. Network with African women globally.",
      cover: "/images/african_women_community.jpg",
      members: "910 Sisters",
      topics: ["Cross-Border Trade", "Global Network", "Alumni Circles"],
      color: "border-purple-500/20 bg-purple-500/5 text-purple-700"
    }
  ];

  const timelineSteps = [
    {
      id: "01",
      title: "Discover",
      desc: "Browse beautifully filtered circles representing diverse industries, professional paths, and balance focuses."
    },
    {
      id: "02",
      title: "Join",
      desc: "Instantly claim your space as an official circle member with immediate dashboard and channel integration."
    },
    {
      id: "03",
      title: "Introduce Yourself",
      desc: "Share your short professional bio, primary skill strengths, and what you're excited to contribute."
    },
    {
      id: "04",
      title: "Participate",
      desc: "Post thoughts, ask specific questions, respond to threads, and engage in high-trust discussions."
    },
    {
      id: "05",
      title: "Build Relationships",
      desc: "Form deep individual connections with sisters through high-integrity interactions and private channels."
    },
    {
      id: "06",
      title: "Grow Together",
      desc: "Celebrate mutual career milestones, match with grant opportunities, and leverage peer accountability."
    }
  ];

  const insideCircleFeatures = [
    {
      icon: MessagesSquare,
      title: "Community discussions",
      desc: "Share high-context, threaded conversations free of algorithmic feeds and advertisements."
    },
    {
      icon: Calendar,
      title: "Live events",
      desc: "Access structured, virtual study huddles and local, physical meetups with neighborhood sisters."
    },
    {
      icon: FileText,
      title: "Resources",
      desc: "Download high-utility Notion hubs, Excel cash flow planners, marketing templates, and study guides."
    },
    {
      icon: GraduationCap,
      title: "Mentorship",
      desc: "Access certified female leaders and industry practitioners who provide direct critique on assignments."
    },
    {
      icon: Trophy,
      title: "Challenges",
      desc: "Join collaborative savings marathons, portfolio building prompts, and 30-day health checks."
    },
    {
      icon: Megaphone,
      title: "Announcements",
      desc: "Stay locked into critical grant submission timelines, matches, workshops, and exclusive benefits."
    },
    {
      icon: Lock,
      title: "Private messaging",
      desc: "Message any verified circle member directly and safely in our end-to-end encrypted chat widget."
    },
    {
      icon: Compass,
      title: "Networking",
      desc: "Discover potential co-founders, joint venture partners, and digital collaborators."
    }
  ];

  const communityHighlights = [
    {
      type: "Upcoming Event",
      title: "Financial Freedom Workshop",
      meta: "45 attending • Online Zoom • July 25th",
      badge: "Virtual Huddle",
      color: "border-emerald-500/10 bg-emerald-500/5 text-emerald-800"
    },
    {
      type: "Weekly Discussion",
      title: "How did you land your first high-ticket client?",
      meta: "24 active replies • 18 bookmarks",
      badge: "Trending Topic",
      color: "border-indigo-500/10 bg-indigo-500/5 text-indigo-800"
    },
    {
      type: "Trending Resource",
      title: "One-Page Professional Business Plan Template",
      meta: "84 downloads • Google Docs & PDF format",
      badge: "Notion & PDF",
      color: "border-amber-500/10 bg-amber-500/5 text-amber-800"
    },
    {
      type: "Challenge",
      title: "30-Day Sovereign Savings Challenge",
      meta: "112 participants active • Target: $200",
      badge: "Active Quest",
      color: "border-rose-500/10 bg-rose-500/5 text-rose-800"
    },
    {
      type: "Member Spotlight",
      title: "Meet Sarah, who launched her first retail brand!",
      meta: "Secured local supply match via the BIG Fund",
      badge: "Sister Win 🎉",
      color: "border-purple-500/10 bg-purple-500/5 text-purple-800"
    }
  ];

  const amazingWomen = [
    {
      name: "Grace M.",
      profession: "UI/UX Designer",
      location: "Accra, Ghana",
      bio: "Crafting beautiful, inclusive digital workspaces. Leading design sprints in the Tech Circle.",
      avatar: "/images/african_woman_portrait.jpg"
    },
    {
      name: "Sienna N.",
      profession: "E-Commerce Founder",
      location: "Cape Town, SA",
      bio: "Sovereign merchant scaling direct-to-consumer apparel. Active in the Entrepreneurs Circle.",
      avatar: "/images/african_woman_portrait.jpg"
    },
    {
      name: "Wanjiku K.",
      profession: "Growth Marketer",
      location: "Nairobi, Kenya",
      bio: "Helping brands rank organically on search results. Facilitating live copywriting reviews.",
      avatar: "/images/african_woman_portrait.jpg"
    }
  ];

  const successStories = [
    {
      quote: "I found my accountability partner in the Career Circle. We set weekly study hours and helped each other negotiate a 35% salary increase in our tech roles.",
      name: "Njeri W.",
      country: "Kenya",
      occupation: "Senior Systems Analyst"
    },
    {
      quote: "I met my business co-founder through the Entrepreneurs Circle. We combined our marketing and logistics skills to launch our brand with absolute clarity.",
      name: "Aisha O.",
      country: "Nigeria",
      occupation: "Co-Founder, Retail Flow"
    },
    {
      quote: "Thanks to the matches shared inside the Financial Circle, I submitted a solid business plan and secured a match grant. The feedback was life-changing.",
      name: "Fatoumata B.",
      country: "Senegal",
      occupation: "Agri-Tech Pioneer"
    }
  ];

  const communityGuidelines = [
    { icon: Award, label: "Respect", desc: "Always maintain high regard for sister boundaries, professional goals, and diverse backgrounds." },
    { icon: HeartHandshake, label: "Support", desc: "Acknowledge achievements and lift up sisters during moments of professional friction." },
    { icon: Smile, label: "Kindness", desc: "Speak with constructive, uplifting terminology. We build confidence, not self-doubt." },
    { icon: ArrowUpRight, label: "Growth", desc: "Commit to continuous practical improvement, and share high-quality templates/lessons freely." },
    { icon: Lock, label: "Privacy", desc: "What is shared in the sisterhood stays in the sisterhood. Keep custom business models secure." },
    { icon: Shield, label: "No Judgment", desc: "Establish safe spaces where sisters can share real financial gaps or failures without shame." },
    { icon: CheckSquare, label: "Professionalism", desc: "Submit course outputs, review assignments, and attend huddles with high-standard punctuality." },
    { icon: ThumbsUp, label: "Encouragement", desc: "Celebrate minor milestones. Every step toward financial independence is a victory." }
  ];

  const stats = [
    { val: "100+", label: "Verified Members" },
    { val: "25+", label: "Active Circles" },
    { val: "40+", label: "Community Events" },
    { val: "500+", label: "Conversations Monthly" },
    { val: "Across Africa", label: "Growing Daily" }
  ];

  const faqs = [
    {
      q: "Do I need to pay to join BIG Circles?",
      a: "No! Access to our official community circles is completely free for all registered Be Independent Gal members. Certain high-ticket specialized circles or mentor masterminds may require minimum activity points to unlock, encouraging authentic contribution."
    },
    {
      q: "Can I join multiple circles at once?",
      a: "Absolutely. You are encouraged to explore multiple pathways—for instance, joining the Career Circle to accelerate corporate goals while participating in the Wellness Circle to manage stress."
    },
    {
      q: "Are the circles moderated to ensure safety?",
      a: "Yes, 100%. Every single circle is assigned dedicated, verified community leads and certified moderators. We enforce strict guidelines and offer reporting utilities to keep all communications high-integrity, respectful, and completely safe."
    },
    {
      q: "Can I create my own circle?",
      a: "Yes! Active member-scholars who have accumulated 100+ Sisterhood Points by reviewing courses, commenting, and helping others can submit custom circle requests to our admin panel to build their own local clusters."
    },
    {
      q: "Can I leave a circle anytime?",
      a: "Of course. There are zero binding timelines. You can join or leave any circle with a single click, completely customizable to your changing seasonal goals."
    },
    {
      q: "Is BIG only for business owners?",
      a: "Not at all. BIG Circles support all aspects of personal sovereignty: career analysts seeking promotions, tech students building portfolios, mothers designing balance guides, and women building strong personal savings."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased selection:bg-secondary selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-primary to-slate-950 text-white py-16 lg:py-24">
        {/* Dynamic Abstract Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.07] [background-size:20px_20px]" />
        <div className="absolute top-1/4 -left-48 h-[500px] w-[500px] bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-48 h-[500px] w-[500px] bg-amber-500/10 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                <Sparkles className="h-4 w-4 text-glow-sm" />
                BIG Circles Experience
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black uppercase tracking-tight leading-none text-white">
                Find Your Circle. <br />
                <span className="text-secondary text-glow-sm">Build Your Future.</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium">
                Meaningful communities where African women learn together, support one another, share opportunities, and grow with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleJoinAction}
                  className="rounded-full bg-secondary hover:bg-white hover:text-primary transition-all px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/20 active:scale-95 cursor-pointer text-center"
                >
                  Join BIG
                </button>
                <button
                  onClick={scrollToCircles}
                  className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer text-center"
                >
                  Explore Circles
                </button>
              </div>

              {/* Floating Badges */}
              <div className="pt-8 flex flex-wrap gap-3">
                {[
                  { label: "Safe Communities", icon: ShieldCheck },
                  { label: "Mentorship", icon: GraduationCap },
                  { label: "Accountability", icon: Target },
                  { label: "Real Connections", icon: Heart }
                ].map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-200">
                      <Icon className="h-3.5 w-3.5 text-secondary" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Image Section with Multi-photo Stack and Ambient Glow */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-800 border border-white/10 shadow-2xl relative group">
                <img 
                  src="/images/african_tech_collaboration.jpg" 
                  alt="African Women Networking" 
                  className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-left">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Global Sisterhood</p>
                  <p className="text-lg font-heading font-black text-white uppercase tracking-tight">Active peer collaboration in real-time spaces</p>
                </div>
              </div>

              {/* Float Cards */}
              <div className="absolute -top-6 -left-6 bg-white text-primary rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                <div className="h-9 w-9 bg-pink-500/10 text-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Belonging</p>
                  <p className="text-xs font-black text-primary">High Trust Circles</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 bg-white text-primary rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Vetted Space</p>
                  <p className="text-xs font-black text-primary">100% Moderated</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY BIG CIRCLES */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Designed For Growth
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-primary uppercase tracking-tight leading-tight max-w-3xl mx-auto">
            More Than Groups. <br />Communities That Move You Forward.
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Unlike noisy social networks, BIG Circles are structured around direct outcomes, shared accountability, and personal sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyCircles.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 rounded-[2.2rem] p-8 shadow-xl shadow-slate-100/30 flex flex-col items-start gap-6 hover:-translate-y-1.5 transition-all text-left group"
              >
                <div className={`h-12 w-12 rounded-2xl ${card.color} flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EXPLORE POPULAR CIRCLES */}
      <section id="explore-popular-circles" className="py-20 sm:py-28 bg-white border-y border-slate-100 scroll-mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Explore Active Clusters</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-primary uppercase tracking-tight">Explore Popular Circles</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Join specialized ecosystems built around your specific aspirations. Click join to secure your official placement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCircles.map((circle, idx) => {
              const Icon = circle.icon;
              return (
                <div 
                  key={idx}
                  className="group bg-slate-50/50 border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    {/* Cover image */}
                    <div className="h-44 overflow-hidden relative border-b border-slate-100 bg-slate-100">
                      <img 
                        src={circle.cover} 
                        alt={circle.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center border bg-white shadow-sm`}>
                          <Icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/95 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full shadow-sm">
                          {circle.members}
                        </span>
                      </div>
                    </div>

                    {/* Meta contents */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                        {circle.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                        {circle.desc}
                      </p>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {circle.topics.map((t, tIdx) => (
                          <span key={tIdx} className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button 
                      onClick={handleJoinAction}
                      className="w-full text-center py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-secondary hover:border-secondary hover:text-white text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer font-bold"
                    >
                      Join Circle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* HOW CIRCLES WORK */}
      <section className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4 mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Sovereign Pathways</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">How Circles Work</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            A simple visual timeline from curious discoverer to independent, highly collaborative graduate.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {timelineSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-100 rounded-[2.2rem] p-8 shadow-md relative text-left group hover:-translate-y-1 transition-all"
            >
              <div className="absolute top-6 right-6 font-serif text-5xl text-secondary/10 font-bold select-none">
                {step.id}
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">Step {step.id}</span>
                <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSIDE EVERY CIRCLE */}
      <section className="py-20 sm:py-28 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-4 mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Specialized Utilities</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Inside Every Circle</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              We coordinate precise professional toolkits to guarantee that every sister-scholar experiences comprehensive support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {insideCircleFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 hover:bg-white hover:shadow-xl transition-all text-left flex gap-4 items-start group"
                >
                  <div className="h-10 w-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/10 shrink-0 transition-transform group-hover:scale-115">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-heading font-black text-primary uppercase tracking-tight">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* COMMUNITY HIGHLIGHTS & SISTER CORNER */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Highlights Feed */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Happening Now</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-primary uppercase tracking-tight">Community Highlights</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Here is a brief glimpse into real-time collaborative activity happening within BIG Circle dashboards this week.
              </p>
            </div>

            <div className="space-y-4">
              {communityHighlights.map((hl, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">{hl.type}</span>
                    <h4 className="text-sm font-black text-primary uppercase tracking-tight">{hl.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{hl.meta}</p>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${hl.color}`}>
                      {hl.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meet Amazing Women */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Sister Directory</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-primary uppercase tracking-tight">Meet Amazing Women</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Connect directly with certified practitioners, builders, and supportive leaders worldwide.
              </p>
            </div>

            <div className="space-y-4">
              {amazingWomen.map((woman, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img src={woman.avatar} alt={woman.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-primary uppercase tracking-tight">{woman.name}</h4>
                      <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Verified Sister</span>
                    </div>
                    <p className="text-[9px] font-black text-secondary uppercase tracking-widest leading-none">{woman.profession} • {woman.location}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-1">{woman.bio}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleJoinAction}
              className="w-full text-center py-4 bg-slate-900 hover:bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
            >
              Connect With Sisters
            </button>
          </div>

        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-20 sm:py-28 bg-white border-y border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="space-y-4 mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Sovereign Spotlights</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Success Stories</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              See how verified members leveraged peer circles to establish structural credit, secure co-founders, and expand their impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, idx) => (
              <div 
                key={idx}
                className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-left relative flex flex-col justify-between"
              >
                <span className="text-7xl font-serif text-secondary/5 absolute -top-4 left-6 select-none pointer-events-none">“</span>
                <p className="text-sm text-primary font-bold italic leading-relaxed relative z-10 mb-6">
                  {story.quote}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-heading font-black text-sm uppercase">
                    {story.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-tight">{story.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{story.occupation} • {story.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SAFETY & POLICIES SECTION */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
              <Shield className="h-4 w-4" />
              Sovereignty First
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight leading-none">
              A Safe Space <br />Designed for Women.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              We deploy absolute moderation parameters to ensure that every discussion stays healthy, private, encouraging, and highly productive.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Moderated communities",
                "Verified members",
                "Community standards",
                "Reporting tools",
                "Privacy controls",
                "Respect-first culture"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-black text-primary uppercase tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Cards Grid */}
          <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-100/50">
            <div className="text-left mb-6">
              <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">Community Guidelines</h3>
              <p className="text-xs text-slate-400">Our code of conduct that guarantees healthy, long-term synergy.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {communityGuidelines.slice(0, 6).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-secondary" />
                      <h4 className="text-xs font-black text-primary uppercase tracking-tight">{item.label}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 sm:py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-heading font-black text-secondary text-glow-sm">{s.val}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 border border-secondary/10 px-3.5 py-1 rounded-full">Common Queries</span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Clear, transparent answers about circles structure, privacy setups, and user moderation.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer hover:bg-slate-100/50"
                  >
                    <span className="text-xs sm:text-sm font-black text-primary uppercase tracking-tight">{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-200/55">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-br from-primary to-slate-900 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.05] [background-size:24px_24px]" />
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-amber-500/5 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight leading-none text-white">
            You Don't Have To Build <br />Your Future Alone.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Every woman deserves a community that believes in her. Join BIG today and discover the circle that helps you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={handleJoinAction}
              className="rounded-full bg-secondary hover:bg-white hover:text-primary transition-all px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/15 active:scale-95 cursor-pointer"
            >
              Join BIG Today
            </button>
            <button
              onClick={scrollToCircles}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            >
              Explore Circles Directory
            </button>
          </div>
        </div>
      </section>

      {/* SUB-FOOTER LINKS */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Explore</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><button onClick={() => setCurrentView?.('circles')} className="hover:text-white transition-colors cursor-pointer text-left">Circles</button></li>
                <li><button onClick={() => setCurrentView?.('academy')} className="hover:text-white transition-colors cursor-pointer text-left">Academy</button></li>
                <li><button onClick={() => setCurrentView?.('events')} className="hover:text-white transition-colors cursor-pointer text-left">Events</button></li>
                <li><button onClick={() => setCurrentView?.('directory')} className="hover:text-white transition-colors cursor-pointer text-left">Opportunities</button></li>
                <li><button onClick={() => setCurrentView?.('big-club')} className="hover:text-white transition-colors cursor-pointer text-left">BIG Club</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Support</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><button onClick={() => setCurrentView?.('contact')} className="hover:text-white transition-colors cursor-pointer text-left">Contact Us</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Settings</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Legal</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Standards</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">About Be Independent Gal</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                BIG is a sovereign, self-paced study sanctuary designed to empower African women with direct high-income expertise, credentials, match funds, and high-trust accountability sister circles.
              </p>
            </div>
          </div>
          <div className="pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <p>© 2026 Be Independent Gal. All rights reserved.</p>
            <p>Designed with absolute dedication to female financial sovereignty.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
