import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  UserCheck, 
  BookOpen, 
  Clock, 
  Compass, 
  CheckCircle,
  PlusCircle,
  X,
  FileText,
  Share2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, MentorshipPair } from '../data';
import { copyToClipboard } from '../lib/utils';

interface MentorshipViewProps {
  members: Member[];
  mentorshipPairs: MentorshipPair[];
  setMentorshipPairs: Dispatch<SetStateAction<MentorshipPair[]>>;
  proposedMentor: Member | null;
  setProposedMentor: (member: Member | null) => void;
  addPoints: (pts: number, badge?: string) => void;
  currentUser: Member;
}

function MentorCard({ mentor, setMentorId }: { mentor: Member; setMentorId: (id: string) => void; key?: string }) {
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}/?view=profile&id=${mentor.id}`;
    await copyToClipboard(profileUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3 cursor-default transition-colors hover:border-secondary/20"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img 
            src={mentor.avatar} 
            alt={mentor.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-xs font-extrabold text-primary">{mentor.name}</h4>
            <p className="text-[10px] text-slate-500 font-semibold">{mentor.title}</p>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`relative p-2 rounded-full border transition-all ${
            shareCopied 
              ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
              : 'text-slate-400 border-slate-100 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50'
          }`}
          title="Share Profile"
        >
          <AnimatePresence mode="wait">
            {shareCopied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-3 w-3" />
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Share2 className="h-3 w-3" />
              </motion.div>
            )}
          </AnimatePresence>
          {shareCopied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest rounded shadow-xl whitespace-nowrap z-20">
              Copied!
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mt-1">
        {mentor.business_stage && (
          <span className="inline-flex items-center rounded-md bg-pink-50 px-1 py-0.5 text-[8px] font-bold text-pink-700 ring-1 ring-inset ring-pink-700/10">
            {mentor.business_stage}
          </span>
        )}
        {mentor.mentoring_capacity && (
          <span className={`inline-flex items-center rounded-md px-1 py-0.5 text-[8px] font-bold ring-1 ring-inset ${
            mentor.mentoring_capacity === 'Open'
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
              : mentor.mentoring_capacity === 'Limited'
              ? 'bg-amber-50 text-amber-700 ring-amber-600/10'
              : 'bg-rose-50 text-rose-700 ring-rose-600/10'
          }`}>
            Capacity: {mentor.mentoring_capacity}
          </span>
        )}
        {mentor.interests.some(interest => ['Sustainable Fashion', 'E-Commerce', 'FinTech', 'Branding', 'Trade', 'Marketing'].some(myInterest => interest.toLowerCase().includes(myInterest.toLowerCase()))) && (
          <span className="inline-flex items-center rounded-md bg-pink-50 px-1 py-0.5 text-[8px] font-bold text-pink-700 ring-1 ring-inset ring-pink-700/10">
            ✨ Core Alignment
          </span>
        )}
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed">
        {mentor.bio}
      </p>

      <div className="flex flex-wrap gap-1">
        {mentor.skills.map((skill, sIdx) => (
          <span 
            key={sIdx}
            className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-150"
          >
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={() => {
          setMentorId(mentor.id);
          const el = document.getElementById('site-header');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="w-full rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 text-primary py-2 text-[10px] font-extrabold uppercase tracking-wider text-center"
      >
        Select this mentor above
      </button>
    </motion.div>
  );
}

export function MentorshipView({
  members,
  mentorshipPairs,
  setMentorshipPairs,
  proposedMentor,
  setProposedMentor,
  addPoints,
  currentUser
}: MentorshipViewProps) {
  const [mentorId, setMentorId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-matching states
  const [requestMode, setRequestMode] = useState<'direct' | 'match'>('direct');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  // Get available mentors
  const mentors = members.filter(m => m.rank === 'Mentor');

  // Sync proposed mentor from directory
  useEffect(() => {
    if (proposedMentor) {
      setMentorId(proposedMentor.id);
      setRequestMode('direct');
    }
  }, [proposedMentor]);

  // Compute unique skills and interests of mentors dynamically for matching dropdowns
  const uniqueMentorSkills = React.useMemo(() => {
    const skillsSet = new Set<string>();
    mentors.forEach(m => {
      if (m.skills) {
        m.skills.forEach(s => skillsSet.add(s));
      }
    });
    return Array.from(skillsSet).sort();
  }, [mentors]);

  const uniqueMentorInterests = React.useMemo(() => {
    const interestsSet = new Set<string>();
    mentors.forEach(m => {
      if (m.interests) {
        m.interests.forEach(i => interestsSet.add(i));
      }
    });
    return Array.from(interestsSet).sort();
  }, [mentors]);

  // Scoring-based real-time matched mentor
  const bestMatchMentor = React.useMemo(() => {
    if (!selectedSkill && !selectedInterest) return null;
    
    let best: Member | null = null;
    let maxScore = -1;
    
    mentors.forEach(mentor => {
      let score = 0;
      if (selectedSkill && mentor.skills?.includes(selectedSkill)) {
        score += 3;
      }
      if (selectedInterest && mentor.interests?.includes(selectedInterest)) {
        score += 2;
      }
      if (mentor.mentoring_capacity === 'Open') {
        score += 1;
      }
      
      if (score > maxScore) {
        maxScore = score;
        best = mentor;
      }
    });
    
    return best;
  }, [selectedSkill, selectedInterest, mentors]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    let selectedMentor: Member | null = null;
    let actualTopic = topic;

    if (requestMode === 'direct') {
      if (!mentorId || !topic.trim()) {
        alert('Please select a mentor and specify your learning goals.');
        return;
      }
      selectedMentor = mentors.find(m => m.id === mentorId) || null;
      if (!selectedMentor) {
        alert('Selected mentor not found.');
        return;
      }
    } else {
      if (!selectedSkill && !selectedInterest) {
        alert('Please select at least one skill or industry interest for matching.');
        return;
      }
      if (!topic.trim()) {
        alert('Please specify your learning goals for this matching request.');
        return;
      }

      if (bestMatchMentor) {
        selectedMentor = bestMatchMentor;
      } else {
        selectedMentor = {
          id: `virtual-pool-${Date.now()}`,
          name: 'BIG Mombasa Mentor Pool',
          avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
          title: 'Auto-Matched Mentor Specialist',
          city: 'Mombasa',
          rank: 'Mentor',
          skills: selectedSkill ? [selectedSkill] : [],
          interests: selectedInterest ? [selectedInterest] : [],
          bio: 'Our community coordinators will pair you with a matching mentor within 24 hours.',
          points: 1000,
          badges: ['mentor']
        };
      }

      const matchDetails: string[] = [];
      if (selectedSkill) matchDetails.push(`Skill: ${selectedSkill}`);
      if (selectedInterest) matchDetails.push(`Interest: ${selectedInterest}`);
      actualTopic = `[Skills Match: ${matchDetails.join(' & ')}] ${topic}`;
    }

    const newPair: MentorshipPair = {
      id: `pair-custom-${Date.now()}`,
      mentor: selectedMentor,
      mentee: currentUser,
      topic: actualTopic,
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0]
    };

    setMentorshipPairs([newPair, ...mentorshipPairs]);
    setTopic('');
    setSelectedSkill('');
    setSelectedInterest('');
    setMentorId('');
    setProposedMentor(null);
    setSuccessMessage(`Success! Your mentorship request has been sent to ${selectedMentor.name}.`);
    addPoints(50); // Give points for taking action on your goals!

    setTimeout(() => {
      setSuccessMessage('');
    }, 6000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
          1-on-1 Guidance
        </p>
        <h1 className="mt-2 text-3xl font-heading font-black text-primary sm:text-4xl">
          Mentorship Hub
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          At BIG, we believe no woman should build her future alone. Connect with veteran mentors, manage your active coaching relationships, and submit structured learning requests.
        </p>
      </div>

      {successMessage && (
        <div className="mb-8 rounded-2xl bg-emerald-50 border border-emerald-150 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* THREE MODULE CONTAINER GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: REQUEST FORM */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-heading text-sm font-bold text-primary flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-secondary" />
              Request a Mentor
            </h3>
            
            {/* Request Method Tabs */}
            <div className="flex border-b border-slate-100 pb-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestMode('direct')}
                className={`flex-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider border-b-2 text-center transition-all ${
                  requestMode === 'direct' 
                    ? 'border-secondary text-secondary font-black' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Direct Selection
              </button>
              <button
                type="button"
                onClick={() => setRequestMode('match')}
                className={`flex-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider border-b-2 text-center transition-all ${
                  requestMode === 'match' 
                    ? 'border-secondary text-secondary font-black' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Match by Skills
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              
              {requestMode === 'direct' ? (
                /* Select Mentor directly */
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Select Proposed Coach
                  </label>
                  <select
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-primary font-semibold focus:border-secondary focus:outline-none bg-slate-50/50"
                  >
                    <option value="">-- Choose a Verified Coach --</option>
                    {mentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.title})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Auto-match by skills or industry interests */
                <div className="space-y-3 animate-fade-in">
                  {/* Skill Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Required Mentor Skill
                    </label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs text-primary font-semibold focus:border-secondary focus:outline-none bg-slate-50/50"
                    >
                      <option value="">-- Choose a Specific Skill --</option>
                      {uniqueMentorSkills.map(skill => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Interest Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Industry / Area of Interest
                    </label>
                    <select
                      value={selectedInterest}
                      onChange={(e) => setSelectedInterest(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs text-primary font-semibold focus:border-secondary focus:outline-none bg-slate-50/50"
                    >
                      <option value="">-- Choose an Interest Area --</option>
                      {uniqueMentorInterests.map(interest => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Match Recommendation Card */}
                  {(selectedSkill || selectedInterest) && (
                    <div className="rounded-xl border border-dashed border-secondary/20 bg-secondary/5 p-3.5 space-y-2 animate-fade-in">
                      <p className="text-[9px] font-black uppercase tracking-wider text-secondary flex items-center gap-1">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Recommended Mentor
                      </p>
                      {bestMatchMentor ? (
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={bestMatchMentor.avatar} 
                            alt={bestMatchMentor.name}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-secondary/25"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-primary truncate">{bestMatchMentor.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{bestMatchMentor.title}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-medium">
                          No direct coach match found. We will connect you to a matching mentor from our global roster shortly.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Topic / Learning Goals */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {requestMode === 'direct' ? 'Learning Goals & Focus Area' : 'Request Context & Learning Goals'}
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    requestMode === 'direct' 
                      ? "Specify what you want to achieve, your business runway, or areas where you require structured guidance..."
                      : "Provide some details about your venture, why you are requesting these skills, and what goals you hope to reach with your matched mentor..."
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Meeting Cadence Preferred
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'biweekly', label: 'Bi-Weekly' },
                    { id: 'monthly', label: 'Monthly' }
                  ].map((cad) => (
                    <button
                      key={cad.id}
                      type="button"
                      onClick={() => setFrequency(cad.id)}
                      className={`rounded-xl border p-2 text-center text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                        frequency === cad.id 
                          ? 'border-secondary bg-secondary/5 text-secondary' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {cad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-full bg-secondary hover:bg-secondary/95 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-secondary/15 flex items-center justify-center gap-1.5"
              >
                <HeartHandshake className="h-4 w-4" />
                <span>{requestMode === 'direct' ? 'Submit structured request' : 'Submit skills match request'}</span>
              </button>

              <div className="text-center">
                <span className="text-[9px] font-medium text-slate-400">
                  🏆 +50 points awarded upon request submission
                </span>
              </div>

            </form>
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMN: LISTS OF PAIRS & DISCOVERING MENTORS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active / Pending Mentorship connections */}
          <div>
            <h3 className="font-heading text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-secondary" />
              Active Coaching Connections
            </h3>

            <div className="space-y-4">
              {mentorshipPairs.map((pair) => (
                <div 
                  key={pair.id}
                  className="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm animate-fade-in"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* People in Pair */}
                    <div className="flex items-center gap-3">
                      {/* Mentor Avatar */}
                      <div className="relative">
                        <img 
                          src={pair.mentor.avatar} 
                          alt={pair.mentor.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/5"
                        />
                        <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border border-white flex items-center justify-center text-[7px] text-white ${
                          pair.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}>
                          {pair.status === 'Active' ? '✓' : '⏳'}
                        </span>
                      </div>
                      
                      {/* Connection Label */}
                      <div>
                        <div className="text-xs font-extrabold text-primary">
                          {pair.mentor.name} ➡️ {pair.mentee.name}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Topic: <span className="font-semibold text-slate-600">{pair.topic}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status & Details */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                          Started
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold">
                          {pair.startDate}
                        </span>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                        pair.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pair.status}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Mentors */}
          <div>
            <h3 className="font-heading text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-primary/70" />
              Verified Community Mentors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <MentorCard 
                  key={mentor.id}
                  mentor={mentor}
                  setMentorId={setMentorId}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
