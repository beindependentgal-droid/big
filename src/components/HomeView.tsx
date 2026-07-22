import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  CalendarDays, 
  HeartHandshake, 
  Sparkles, 
  TrendingUp, 
  Users, 
  BriefcaseBusiness,
  MoveDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Member } from '../data';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  setCircleTab: (tab: 'learn' | 'connect' | 'earn' | 'thrive') => void;
  members: Member[];
}

const slides = [
  {
    image: '/images/african_women_tech_collaboration_1784664040784.jpg',
    alt: 'Diverse African women collaborating in a modern tech office',
    title: 'Be Independent.',
    subtitle: 'Be Unstoppable.'
  },
  {
    image: '/images/african_women_community_circle_1784704135356.jpg',
    alt: 'African women supporting one another in an uplifting community setting',
    title: 'Rising Together,',
    subtitle: 'Every Single Day.'
  },
  {
    image: '/images/african_woman_entrepreneur_portrait_1784664054544.jpg',
    alt: 'Confident African woman entrepreneur in her workspace',
    title: 'Unlock Your Vision.',
    subtitle: 'Build Your Business.'
  }
];

const trustItems = [
  {
    icon: Users,
    title: 'Growing community of women',
    description: 'Real sisters, real stories, and rising together every day across East & West Africa.',
  },
  {
    icon: BookOpen,
    title: 'Live learning sessions',
    description: 'Practical workshops, masterclasses, and coaching modules built for immediate business impact.',
  },
  {
    icon: HeartHandshake,
    title: 'Trusted Circles',
    description: 'Small, confidential groups where deep belonging, accountability, and real trust are nurtured.',
  },
  {
    icon: CalendarDays,
    title: 'Community events',
    description: 'In-person gatherings and digital experiences that spark connection and momentum.',
  },
  {
    icon: Sparkles,
    title: 'Annual retreats',
    description: 'Restorative weekend gatherings that refresh purpose, creative energy, and spiritual focus.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Business networking',
    description: 'A powerful, collaborative ecosystem for partnership, mutual funding, and professional progress.',
  },
];

const pillars = [
  {
    id: 'learn',
    title: 'Learn',
    icon: BookOpen,
    color: 'border-primary',
    desc: 'Build skills and confidence through practical academy programs, peer reviews, and mentoring guides.',
  },
  {
    id: 'connect',
    title: 'Connect',
    icon: HeartHandshake,
    color: 'border-secondary',
    desc: 'Meet ambitious women who understand your path, process life events together, and keep you accountable.',
  },
  {
    id: 'earn',
    title: 'Earn',
    icon: BriefcaseBusiness,
    color: 'border-amber-400',
    desc: 'Discover job openings, secure retail partnerships, draft pitch statements, and meet cooperative backers.',
  },
  {
    id: 'thrive',
    title: 'Thrive',
    icon: TrendingUp,
    color: 'border-orange-500',
    desc: 'Establish healthy lifestyle routines, set balanced goals, and log daily emotional reflections securely.',
  },
];

const communityPosts = [
  {
    image: '/images/african_women_community_circle_1784704135356.jpg',
    title: 'Real conversations, raw support',
    desc: 'Women showing up for one another in circles shaped by vulnerability, confidentiality, and deep care.',
  },
  {
    image: '/images/african_women_mentorship_discussion_1784664078314.jpg',
    title: 'Mentorship that moves things',
    desc: 'Experienced industry leaders guiding younger sisters with complete clarity, strategy, and heart.',
  },
  {
    image: '/images/african_woman_leading_masterclass_1784704151649.jpg',
    title: 'Moments that spark momentum',
    desc: 'Immersive regional meetups that turn abstract ideas into community cooperatives and live opportunities.',
  },
  {
    image: '/images/african_mother_and_child_wellness_1784704199174.jpg',
    title: 'Annual retreats of sisterhood',
    desc: 'Restorative weekend gatherings that refresh purpose, creative energy, and spiritual focus in pristine settings.',
  },
  {
    image: '/images/african_woman_learning_laptop_1784664067278.jpg',
    title: 'Practical localized masterclasses',
    desc: 'Hands-on training, interactive circles, and expert guidance built to move from ideation to execution.',
  },
  {
    image: '/images/african_women_tech_collaboration_1784664040784.jpg',
    title: 'Ecosystems of financial autonomy',
    desc: 'A robust collaborative network designed for partnership, mutual investment, and cooperative growth.',
  }
];

const stories = [
  {
    quote: "BIG gave me the practical business planning and community encouragement to step into full-time leadership and scale my organic craft cosmetics brand with absolute intention.",
    name: 'Joy Namubiru, Skincare Founder',
    city: 'Kampala'
  },
  {
    quote: "The trusted connection circles became my safe haven. I found my voices, my initial business partnerships, and sisters who keep me accountable to my emotional and mental peace.",
    name: 'Sarah Jenkins, Aspiring Fashion Founder',
    city: 'Lagos'
  },
];

export function HomeView({ setCurrentView, setCircleTab, members }: HomeViewProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Spotlight Logic: Select a member based on the week of the year
  const getSpotlightMember = () => {
    if (!members || members.length === 0) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const week = Math.floor(day / 7);
    const index = week % members.length;
    return members[index];
  };

  const spotlight = getSpotlightMember();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] flex items-center bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -mr-48 -mt-48 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -ml-24 -mb-24 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT: TEXT CONTENT */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              Africa's Premium Growth Accelerator
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.95]">
                {slides[activeSlide].title}
                <span className="block text-secondary mt-2">{slides[activeSlide].subtitle}</span>
              </h1>
            </div>

            <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              A space where ambitious women rise together. Circles, masterclasses, and real connections built for the complexity of your journey.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => setCurrentView('directory')}
                className="rounded-full bg-primary px-10 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-primary/95 hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                Join a Circle
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('about');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full border-2 border-slate-200 bg-white dark:bg-slate-900 px-10 py-4 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Discover BIG
              </button>
            </div>
          </div>

          {/* RIGHT: VISUAL FRAME */}
          <div className="relative w-full aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
            <img referrerPolicy="no-referrer"
              src={slides[activeSlide].image}
              alt={slides[activeSlide].alt}
              className="w-full h-full object-cover transition-all duration-1000"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-xs font-black uppercase tracking-widest text-accent mb-2">Active community moments</p>
              <p className="text-2xl font-heading font-black">{slides[activeSlide].alt}</p>
              
              <div className="flex gap-2 mt-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-10 bg-accent' : 'w-2 bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMINENT QUICK CTA */}
      <section className="relative z-20 -mt-10 sm:-mt-12 mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 animate-slide-up">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-primary dark:text-primary-foreground uppercase tracking-tight">
              Ready to find your tribe?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Jump into the core platform features and start growing with sisters today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            <button
              id="cta-home-join-circle"
              onClick={() => setCurrentView('directory')}
              className="group flex items-center justify-center gap-3 rounded-full bg-primary px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/95"
            >
              Join Your First Circle
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setCurrentView('mentorship')}
              className="flex items-center justify-center gap-3 rounded-full border-2 border-slate-100 bg-white px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary transition-all hover:border-secondary/30 hover:bg-slate-50"
            >
              Find a Mentor
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-12 sm:py-20 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
              <img referrerPolicy="no-referrer" loading="lazy" decoding="async"
                src="/images/african_women_mentorship_discussion_1784664078314.jpg"
                alt="Ambitious Women in Business Circle"
                className="w-full object-cover aspect-[4/3] max-h-[350px] sm:max-h-none"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-2xl bg-accent p-4 text-primary sm:block">
              <span className="block text-4xl font-heading font-black">4</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Growth Pillars</span>
            </div>
          </div>
 
          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
                Who We Are
              </p>
              <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-heading font-bold text-primary dark:text-primary-foreground lg:text-4xl leading-tight">
                A grassroots movement of women building independent futures
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Be Independent Gal (BIG) is Africa's premium community and growth accelerator created specifically to inspire and equip women to build financially autonomous, emotionally resilient lives.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              By combining high-quality practical masterclasses, automatic mentor matching, in-person and digital circles, and active career opportunities, we empower sisters to step into their ultimate potential.
            </p>
            <div className="pt-2 sm:pt-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary/95 hover:translate-x-0.5"
              >
                Access Academy & Circles
                <ArrowRight className="h-4 w-4 text-accent" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* THE FOUR PILLARS */}
      <section className="py-20 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">
              Core Framework
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              The Four BIG Pillars
            </h2>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  onClick={() => {
                    setCircleTab(pillar.id as any);
                    setCurrentView('dashboard');
                  }}
                  className="cursor-pointer group flex flex-col rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border-2 ${pillar.color} text-slate-900 dark:text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
                    {pillar.desc}
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2 group-hover:gap-3 transition-all">
                    Enter Circle <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEMBER SPOTLIGHT CAROUSEL */}
      <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                Our Thriving Network
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Member Spotlight
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Meet the incredible sisters building independent futures.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const el = document.getElementById('member-carousel');
                  if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="p-4 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('member-carousel');
                  if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="p-4 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Area */}
          <div 
            id="member-carousel"
            className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {members.map((member) => (
              <div 
                key={member.id}
                onClick={() => setCurrentView('directory')}
                className="flex-none w-[320px] snap-start group cursor-pointer"
              >
                <div className="relative rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Member Image with Aspect Ratio */}
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img referrerPolicy="no-referrer" loading="lazy" decoding="async" 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                      {member.rank}
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-tight mb-1">
                      {member.name}
                    </h3>
                    <p className="text-xs font-black uppercase tracking-widest text-accent mb-6">
                      {member.title}
                    </p>
                    <div className="flex items-center gap-6 pt-6 border-t border-white/20">
                      <div className="text-center">
                        <p className="text-xl font-black">{member.points}</p>
                        <p className="text-[9px] uppercase font-bold text-white/60 tracking-tighter">Points</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black">{member.badges.length}</p>
                        <p className="text-[9px] uppercase font-bold text-white/60 tracking-tighter">Badges</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-primary px-4 py-2 rounded-xl text-white">
                        📍 {member.city || 'Africa'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Card */}
            <div className="flex-none w-[320px] snap-start">
              <button 
                onClick={() => setCurrentView('directory')}
                className="w-full h-full rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all group"
              >
                <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black uppercase tracking-widest">View Directory</p>
                  <p className="text-xs font-bold text-slate-400">Discover {members.length}+ Sisters</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMY PREVIEW */}
      <section className="py-24 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* CONTENT */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary ring-1 ring-secondary/20">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Practical Learning</span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-[0.95]">
                  The <span className="text-secondary">Academy</span> for High-Income Mastery
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  We don't do theory. Our academy is packed with practical, localized masterclasses designed to give you the exact technical and financial skills required to dominate your industry.
                </p>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'High-Ticket Sales', desc: 'Confidence & Negotiation' },
                  { title: 'Capital Raising', desc: 'Grants & Equity' },
                  { title: 'Full-Stack Dev', desc: 'Software Engineering' },
                  { title: 'Logistics Architecture', desc: 'Regional Supply Chains' }
                ].map((skill, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white font-black text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{skill.title}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">{skill.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentView('academy')}
                className="inline-flex items-center justify-center gap-4 rounded-full bg-primary px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/95"
              >
                Explore BIG Academy
                <ArrowRight className="h-5 w-5 text-accent" />
              </button>
            </div>

            {/* IMAGE */}
            <div className="relative">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <img referrerPolicy="no-referrer" loading="lazy" decoding="async" 
                  src="/images/african_woman_learning_laptop_1784664067278.jpg" 
                  alt="Academy students collaborating"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 border border-white/20">
                    <p className="text-xl font-black text-white italic leading-snug">"The Academy modules gave me the exact pricing strategy I needed to double my artisan exports in six months."</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent text-primary flex items-center justify-center font-black text-lg">H</div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider">Hawa Keita</p>
                        <p className="text-xs font-black text-accent uppercase tracking-widest">Supply Chain Architect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-10 -right-10 h-60 w-60 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 h-80 w-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </section>

      {/* SISTER SPOTLIGHT OF THE WEEK */}
      {spotlight && (
        <section className="py-24 bg-primary text-white px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full bg-accent/20 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent ring-1 ring-accent/30">
                  <Sparkles className="h-4 w-4" />
                  <span>Sister Spotlight of the Week</span>
                </div>
                <h2 className="text-6xl font-black uppercase tracking-tight text-white leading-[0.9]">
                  Meet <span className="text-accent">{spotlight.name.split(' ')[0]}</span>
                </h2>
                <p className="text-xl font-medium text-white/80 leading-relaxed italic border-l-4 border-accent pl-8 py-2">
                  "{spotlight.bio || `Building an unstoppable future in ${spotlight.city}...`}"
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {spotlight.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="px-5 py-2.5 rounded-2xl bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 border border-white/10">
                      {interest}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setCurrentView('directory')}
                    className="rounded-full bg-accent px-10 py-5 text-sm font-black uppercase tracking-wider text-primary transition-all hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => setCurrentView('mentorship')}
                    className="rounded-full border border-white/20 bg-white/5 px-10 py-5 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/10"
                  >
                    Connect
                  </button>
                </div>
              </div>
  
              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl">
                  <img referrerPolicy="no-referrer" loading="lazy" decoding="async" 
                    src={spotlight.avatar} 
                    className="w-full h-full object-cover" 
                    alt={spotlight.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                     <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
                        <p className="text-2xl font-black text-white uppercase tracking-tight">{spotlight.name}</p>
                        <p className="text-xs font-black text-accent uppercase tracking-[0.2em] mt-1">{spotlight.title}</p>
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20">
                           <div className="text-center">
                             <p className="text-xl font-black text-white">{spotlight.points}</p>
                             <p className="text-[9px] font-black uppercase text-white/60">Points</p>
                           </div>
                           <div className="text-center">
                             <p className="text-xl font-black text-white">{spotlight.badges.length}</p>
                             <p className="text-[9px] font-black uppercase text-white/60">Badges</p>
                           </div>
                           <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-[10px] font-black uppercase tracking-widest">
                             <TrendingUp className="h-4 w-4" />
                             {spotlight.rank}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WHAT WE SERVE (THE TRUST GRID) */}
      <section className="py-24 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">
              Community Offerings
            </p>
            <h2 className="mt-4 text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Practical Support for Every Sister
            </h2>
          </div>
 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 text-primary dark:text-white mb-8 border border-slate-100 dark:border-slate-800 group-hover:bg-primary group-hover:text-white transition-all">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIFE IN BIG (HIGHLIGHTS) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">
              Life In BIG
            </p>
            <h2 className="mt-4 text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Moments of Sisterhood & Support
            </h2>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communityPosts.map((post, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentView('events')}
                className="group cursor-pointer rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-2"
              >
                <div className="overflow-hidden aspect-[4/3] relative">
                  <img referrerPolicy="no-referrer" loading="lazy" decoding="async"
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {post.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">
              Sisters' Stories
            </p>
            <h2 className="mt-4 text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Lived Experiences
            </h2>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story, idx) => (
              <div
                key={idx}
                className="relative rounded-[2rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1 bg-white dark:bg-slate-900"
              >
                <span className="text-6xl text-primary/10 dark:text-primary-foreground/10 font-serif leading-none mb-6 block">“</span>
                <p className="text-lg italic leading-relaxed text-slate-700 dark:text-slate-300 mb-10 font-medium">
                  {story.quote}
                </p>
                <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-black text-white">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{story.name}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">📍 {story.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative overflow-hidden bg-primary py-16 sm:py-24 text-white px-4 sm:px-6 lg:px-8 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-secondary filter blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent filter blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-heading font-extrabold leading-snug sm:leading-tight text-white">
            We are more than a platform. We are a <span className="text-accent italic">movement</span> of sisters building financially sovereign, unstoppable futures.
          </h2>
          <p className="mx-auto max-w-2xl text-[10px] sm:text-xs md:text-sm text-white/80 leading-relaxed px-2">
            Whether you are launching your startup in Lagos, polishing your software skills in Kigali, or organizing cooperative agriculture in Nairobi, BIG is your safe, powerful ecosystem.
          </p>
          <div className="pt-2 sm:pt-4 flex flex-col justify-center gap-3 sm:flex-row max-w-sm sm:max-w-none mx-auto w-full">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full sm:w-auto rounded-full bg-secondary px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-secondary/90"
            >
              Become a BIG Member Now
            </button>
            <button
              onClick={() => setCurrentView('directory')}
              className="w-full sm:w-auto rounded-full border border-white/30 bg-transparent px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10"
            >
              Discover Members
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
