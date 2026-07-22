import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Sparkles, 
  Check,
  CheckCircle,
  Video,
  Bookmark,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Mail,
  BookOpen,
  Clock,
  Award,
  Download,
  Info,
  Bell,
  BellOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Event, Member } from '../data';

interface EventsViewProps {
  members: Member[];
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  addPoints: (pts: number, badge?: string) => void;
}

const ORGANIZER_INFO: Record<string, {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  contact: string;
  topics: string[];
  agenda: string[];
}> = {
  e1: {
    name: 'Wanjiku Kamau',
    role: 'Principal, Cooperative Impact Kenya',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    bio: 'Wanjiku is a cooperative finance veteran with 15+ years helping rural and urban business collectives establish secure capital reservoirs across East Africa.',
    contact: 'wanjiku@coopimpact.ke',
    topics: ['Group Sinking Funds', 'Cooperative Registration Act', 'Seed Equity Preservation'],
    agenda: [
      '18:00 - Welcome & Member Roll Call',
      '18:15 - Core Foundations of Sinking Cooperatives',
      '18:45 - Live Case Studies: Nairobi & Mombasa Circles',
      '19:15 - Q&A on Legal & Regulatory Structures'
    ]
  },
  e2: {
    name: 'Fatma Juma',
    role: 'Founder, Nyali Voicing Lab',
    avatar: '/images/african_woman_portrait_3_1784708258772.jpg',
    bio: 'Fatma is a performance coach, mental wellbeing researcher, and speech therapist dedicated to elevating the voices of pioneering female founders.',
    contact: 'fatma@nyalivoice.org',
    topics: ['Assertive Speech Loops', 'Overcoming Imposter Echoes', 'Mutual Mastermind Trust'],
    agenda: [
      '17:30 - Safe Welcomes & Ice-breaking circle',
      '18:00 - Interactive assertiveness vocal workshop',
      '18:45 - Sharing circles & mutual feedback',
      '19:15 - Networking & light refreshments'
    ]
  },
  e3: {
    name: 'Dr. Amina Osei',
    role: 'Director of Trade, AfCFTA Advisory Group',
    avatar: '/images/african_woman_portrait_4_1784708270262.jpg',
    bio: 'Dr. Amina advises continental logistics hubs and ministries of commerce on tariff structures, border logistics, and single-currency payment gateways.',
    contact: 'amina.osei@afcfta-advisory.org',
    topics: ['Customs Declarations', 'East Africa Tariff Exemptions', 'Multicurrency Mobile Pay'],
    agenda: [
      '10:00 - Opening: Navigating the continental legal frame',
      '10:30 - Logistics strategies: Real shipping case examples',
      '11:15 - Mobile money gateway APIs & settlement mechanisms',
      '11:45 - Round-table discussion & workshop assignments'
    ]
  },
  e4: {
    name: 'Sienna Nandi',
    role: 'Lead Healing Therapist, Sienna Retreats',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    bio: 'Sienna has practiced therapeutic counseling and mindfulness coaching for over a decade, specializing in burnout restoration for high-impact leaders.',
    contact: 'sienna@siennasanctuary.com',
    topics: ['Mindful Somatic Grounding', 'Restorative Boundary Mapping', 'Therapeutic Group Circles'],
    agenda: [
      'Day 1 - Arrivals, sanctuary clearing, and orientation',
      'Day 2 - Group therapy circles & somatic rest routines',
      'Day 3 - Strategic personal goal-mapping & closing circles'
    ]
  },
  e5: {
    name: 'Grace Mutua',
    role: 'Head of Sourcing, Retail Launchpad Lab',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    bio: 'Grace is an industrial designer and supply chain architect who has guided hundreds of consumer product brands from small garages to major supermarket shelves.',
    contact: 'grace.mutua@launchpadlab.com',
    topics: ['Shelf-Ready Packaging Standards', 'Sourcing Ethics & Local Supply', 'UPC Barcodes & Scaling'],
    agenda: [
      '14:00 - Introduction to modern shelf requirements',
      '14:30 - Package material choices & supply integrity',
      '15:00 - Barcoding, certifications, and compliance',
      '15:30 - Critique of attendee packaging drafts'
    ]
  }
};

const DEFAULT_ORGANIZER = {
  name: 'BIG Experience Team',
  role: 'Community Lead, BIG Sisterhood Hub',
  avatar: '/images/african_woman_portrait_4_1784708270262.jpg',
  bio: 'The core experience design team at Be Independent Gal, committed to creating secure, empowering spaces for women across Africa to rise collectively.',
  contact: 'hello@beindependentgal.com',
  topics: ['Growth Accelerators', 'Peer Mentoring Circles', 'Emotional Resilience'],
  agenda: [
    '00 mins - Warm intros and circle connections',
    '20 mins - Key insights session',
    '50 mins - Open floor feedback & group photo',
    '60 mins - Interactive breakout chats'
  ]
};

export function EventsView({
  members,
  events,
  setEvents,
  addPoints
}: EventsViewProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [rsvpNotification, setRsvpNotification] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleExportAttendees = (event: Event) => {
    if (!event.attendeeNames || event.attendeeNames.length === 0) return;

    const csvContent = [
      ['Attendee Name'],
      ...event.attendeeNames.map(name => [name])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_Attendees.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRSVP = (eventId: string) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        const attendeeNames = ev.attendeeNames || [];
        if (ev.rsvped) {
          // Un-rsvp
          return {
            ...ev,
            rsvped: false,
            attendees: Math.max(0, ev.attendees - 1),
            attendeeNames: attendeeNames.filter(name => name !== 'You')
          };
        } else {
          // RSVP
          setRsvpNotification(`Amazing! You have successfully RSVP'd for "${ev.title}".`);
          addPoints(30); // Award points for community participation!
          setTimeout(() => setRsvpNotification(''), 5500);
          return {
            ...ev,
            rsvped: true,
            attendees: ev.attendees + 1,
            attendeeNames: [...attendeeNames, 'You']
          };
        }
      }
      return ev;
    }));
  };

  const filteredEvents = events.filter(ev => {
    return selectedType === 'all' || ev.type === selectedType;
  });

  const eventTypes = [
    { id: 'all', label: 'All Events' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'meetup', label: 'Local Meetups' },
    { id: 'webinar', label: 'Webinars' },
    { id: 'retreat', label: 'Retreats' }
  ];

  const activeEvent = selectedEventId ? events.find(ev => ev.id === selectedEventId) : null;
  const organizer = activeEvent ? (ORGANIZER_INFO[activeEvent.id] || DEFAULT_ORGANIZER) : DEFAULT_ORGANIZER;

  const toggleReminder = (eventId: string) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        const newState = !ev.reminded;
        if (newState) {
          if (Notification.permission !== 'granted') {
            Notification.requestPermission();
          }
          setRsvpNotification(`Reminder set! We will notify you 10 minutes before "${ev.title}".`);
          setTimeout(() => setRsvpNotification(''), 4000);
        }
        return { ...ev, reminded: newState };
      }
      return ev;
    }));
  };

  // Check for upcoming events every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(ev => {
        if (ev.reminded && ev.rsvped) {
          const eventTime = new Date(`${ev.date}T${ev.time}`);
          const diff = eventTime.getTime() - now.getTime();
          const tenMinutesInMs = 10 * 60 * 1000;
          const oneMinuteInMs = 60 * 1000;

          // If within the 10-11 minute window before the event
          if (diff > tenMinutesInMs - oneMinuteInMs && diff <= tenMinutesInMs) {
            if (Notification.permission === 'granted') {
              new Notification(`Upcoming Event: ${ev.title}`, {
                body: `Starts in 10 minutes at ${ev.time}!`,
                icon: '/favicon.ico'
              });
            } else {
              alert(`🔔 Reminder: "${ev.title}" starts in 10 minutes!`);
            }
            
            // Auto-disable reminder after firing to prevent multiple alerts
            setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, reminded: false } : e));
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, setEvents]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* EVENT DETAILS MODAL */}
      <AnimatePresence>
        {selectedEventId && activeEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEventId(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col border border-slate-100"
            >
              {/* Header Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-primary to-accent shrink-0" />

              {/* Modal Header */}
              <div className="p-6 pb-4 flex flex-col space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                      activeEvent.type === 'webinar' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                        : activeEvent.type === 'workshop'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : activeEvent.type === 'retreat'
                        ? 'bg-orange-50 text-orange-700 border border-orange-100'
                        : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {activeEvent.type}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border ${
                      activeEvent.rsvped 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' 
                        : 'bg-slate-50 text-slate-500 border-slate-150'
                    }`}>
                      {activeEvent.rsvped ? "Status: RSVP'd" : 'Status: Not Registered'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedEventId(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <h2 className="text-xl font-heading font-black text-primary leading-tight">
                  {activeEvent.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary/60 shrink-0" />
                    <span>{activeEvent.date} at {activeEvent.time} UTC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeEvent.type === 'webinar' ? (
                      <Video className="h-4 w-4 text-primary/60 shrink-0" />
                    ) : (
                      <MapPin className="h-4 w-4 text-primary/60 shrink-0" />
                    )}
                    <span className="truncate">{activeEvent.location}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 border-y border-slate-100 bg-slate-50/20">
                
                {/* Event Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-secondary shrink-0" />
                    About this Event
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {activeEvent.description}
                  </p>
                </div>

                {/* Topics Tags */}
                {organizer.topics && organizer.topics.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-secondary shrink-0" />
                      Key Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {organizer.topics.map((topic, idx) => (
                        <span 
                          key={idx}
                          className="bg-white border border-slate-150 rounded-full px-3 py-1 text-[10px] font-bold text-slate-600"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizer Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-secondary shrink-0" />
                    Session Organizer & Host
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-150 p-4 flex flex-col sm:flex-row gap-4 items-start">
                    <img 
                      src={organizer.avatar || null} 
                      alt={organizer.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div>
                        <h4 className="text-xs font-black text-primary leading-tight">
                          {organizer.name}
                        </h4>
                        <p className="text-[10px] text-secondary font-extrabold">
                          {organizer.role}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-medium">
                        {organizer.bio}
                      </p>
                      <a 
                        href={`mailto:${organizer.contact}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-secondary transition-colors pt-1"
                      >
                        <Mail className="h-3 w-3" />
                        <span>Contact Host ({organizer.contact})</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Event Agenda */}
                {organizer.agenda && organizer.agenda.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-secondary shrink-0" />
                      Event Agenda
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-150 p-4 space-y-3">
                      {organizer.agenda.map((agendaItem, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                          <div className="h-5 w-5 rounded-full bg-slate-50 text-slate-400 font-bold text-[9px] flex items-center justify-center border border-slate-150 shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="leading-relaxed">{agendaItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendee List */}
                <div className="space-y-4 pb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary shrink-0" />
                      Sisters Attending
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold">{activeEvent.attendees} total</span>
                      {activeEvent.attendeeNames && activeEvent.attendeeNames.length > 0 && (
                        <button 
                          onClick={() => handleExportAttendees(activeEvent)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-primary transition-all border border-slate-100"
                          title="Export Attendee List"
                        >
                          <Download className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Export</span>
                        </button>
                      )}
                    </div>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeEvent.attendeeNames && activeEvent.attendeeNames.length > 0 ? (
                      activeEvent.attendeeNames.map((name, idx) => {
                        const member = members.find(m => m.name === name);
                        const isMe = name === 'You';
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-2 p-2 rounded-2xl border transition-all relative group ${
                              isMe 
                                ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100' 
                                : 'bg-white border-slate-100 hover:border-secondary/30'
                            }`}
                          >
                            {/* RSVP Badge */}
                            <div className="absolute -top-1 -right-1 z-10">
                              <div className={`h-3 w-3 rounded-full border border-white shadow-sm flex items-center justify-center ${isMe ? 'bg-emerald-500' : 'bg-emerald-400'}`}>
                                <Check className="h-1.5 w-1.5 text-white" />
                              </div>
                            </div>

                            {member?.avatar ? (
                              <img src={member.avatar || null} alt={name} className="h-7 w-7 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                                isMe ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}>
                                {name.charAt(0)}
                              </div>
                            )}
                            <span className={`text-[10px] font-bold truncate ${isMe ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {name}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-6 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No RSVPs yet</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">Reward Points</p>
                    <p className="text-xs font-black text-primary">✨ Earn +30 sisterhood points</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={() => handleRSVP(activeEvent.id)}
                    className={`flex-1 sm:flex-initial rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 ${
                      activeEvent.rsvped 
                        ? 'bg-rose-50 text-rose-700 border border-rose-150 hover:bg-rose-100' 
                        : 'bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10'
                    }`}
                  >
                    {activeEvent.rsvped ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-rose-600" />
                        <span>Cancel Registration</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <span>Confirm RSVP Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
          Community Experience
        </p>
        <h1 className="mt-2 text-3xl font-heading font-black text-primary sm:text-4xl">
          Upcoming Events Board
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Sisters that gather together grow together. RSVP to expert webinars, local in-person meetups, hands-on masterclasses, and restorative annual retreats.
        </p>
      </div>

      {rsvpNotification && (
        <div className="mb-8 rounded-2xl bg-emerald-50 border border-emerald-150 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{rsvpNotification}</span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
          <Filter className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filter Events:</span>
        </div>
        {eventTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedType === t.id 
                ? 'bg-primary text-accent shadow-sm' 
                : 'bg-white border border-slate-150 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* EVENTS CARD LIST */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No events found matching this classification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((ev) => {
            const isWebinar = ev.type === 'webinar';
            return (
              <div 
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  
                  {/* Event Type & User Status badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                        ev.type === 'webinar' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                          : ev.type === 'workshop'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : ev.type === 'retreat'
                          ? 'bg-orange-50 text-orange-700 border border-orange-100'
                          : 'bg-pink-50 text-pink-700 border border-pink-100'
                      }`}>
                        {ev.type}
                      </span>

                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border transition-all duration-350 ${
                        ev.rsvped 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' 
                          : 'bg-slate-50 text-slate-500 border-slate-150'
                      }`}>
                        {ev.rsvped ? "Status: RSVP'd" : 'Status: Not Registered'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-secondary" />
                      <span>{ev.attendees} Attending</span>
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-heading font-extrabold text-primary leading-tight group-hover:text-secondary transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {ev.description}
                    </p>
                  </div>

                  {/* Date & Location */}
                  <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary/60 shrink-0" />
                      <span>{ev.date} at {ev.time} UTC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWebinar ? (
                        <Video className="h-4 w-4 text-primary/60 shrink-0" />
                      ) : (
                        <MapPin className="h-4 w-4 text-primary/60 shrink-0" />
                      )}
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>

                  {/* See Attendees Avatar Stack */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEventId(ev.id);
                    }}
                    className="group/attendees flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-secondary/30 transition-all cursor-pointer"
                  >
                    <div className="flex -space-x-2 overflow-hidden">
                      {ev.attendeeNames?.slice(0, 4).map((name, i) => {
                        const member = members.find(m => m.name === name);
                        return (
                          <div key={i} className="relative">
                            {member?.avatar ? (
                              <img 
                                src={member.avatar || null} 
                                alt={name} 
                                className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm group-hover/attendees:scale-110 transition-transform" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm ${
                                name === 'You' ? 'bg-emerald-500' : ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-purple-400'][i % 4]
                              }`}>
                                {name.charAt(0)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {ev.attendeeNames && ev.attendeeNames.length > 4 && (
                        <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                          +{ev.attendeeNames.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-tight group-hover/attendees:text-secondary transition-colors">
                        See Attendees
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {ev.attendees} sisters registered
                      </span>
                    </div>
                  </div>

                </div>

                {/* RSVP Action */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        ✨ Earn +30 points
                      </span>
                      <span className="text-[10px] font-extrabold text-primary flex items-center gap-0.5 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        Read details <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    {ev.rsvped && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReminder(ev.id);
                        }}
                        className={`p-2 rounded-full border transition-all ${
                          ev.reminded 
                            ? 'bg-amber-50 border-amber-200 text-amber-600' 
                            : 'bg-white border-slate-100 text-slate-400 hover:text-amber-500 hover:border-amber-100'
                        }`}
                        title={ev.reminded ? "Disable Reminder" : "Remind Me (10m before)"}
                      >
                        {ev.reminded ? <Bell className="h-4 w-4 fill-current" /> : <BellOff className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRSVP(ev.id);
                    }}
                    className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                      ev.rsvped 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-150 transition-colors' 
                        : 'bg-primary hover:bg-primary/95 text-white shadow-md'
                    }`}
                    title={ev.rsvped ? "Click to cancel RSVP" : "Click to RSVP"}
                  >
                    {ev.rsvped ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                        <span>Cancel RSVP</span>
                      </>
                    ) : (
                      <span>RSVP Now</span>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
