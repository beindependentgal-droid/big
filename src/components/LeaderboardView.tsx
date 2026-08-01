import { 
  Award, 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  HeartHandshake, 
  Search,
  CheckCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { Member } from '../data';

interface LeaderboardViewProps {
  members: Member[];
  userPoints: number;
  userBadges: string[];
  currentUser: Member;
}

export function LeaderboardView({
  members,
  userPoints,
  userBadges,
  currentUser
}: LeaderboardViewProps) {
  
  // Construct list of all leaderboard candidates (predefined + you!)
  const youMember: Member = {
    ...currentUser,
    name: `${currentUser.name} (You)`,
    points: userPoints,
    badges: userBadges
  };

  const allLeaderboard = [youMember, ...members.filter(m => m.id !== currentUser.id)];

  // Sort by points descending
  const sortedLeaderboard = [...allLeaderboard].sort((a, b) => b.points - a.points);

  const badgeDescriptions: Record<string, { title: string; color: string; desc: string }> = {
    confidence: { title: 'Confidence Pillar', color: 'bg-slate-100 text-slate-800 border-slate-200', desc: 'Sisters who completed the 7-day Confidence challenge.' },
    pioneer: { title: 'Founder Pioneer', color: 'bg-violet-100 text-violet-800 border-violet-200', desc: 'Awarded to early-stage builders who launched in 2026.' },
    trailblazer: { title: 'Trailblazer Status', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Granted for continuous academy module excellence.' },
    mentor: { title: 'Verified Coach', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Registered mentors guiding other young sisters.' },
    wealth_pioneer: { title: 'Wealth Pioneer', color: 'bg-rose-150 text-rose-800 border-rose-200', desc: 'Completed the pitch planning and financial modeling reviews.' },
    network: { title: 'Network Hub', color: 'bg-pink-100 text-pink-800 border-pink-200', desc: 'Connected with sisters outside of their default home city.' },
    community_star: { title: 'Community Star', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', desc: 'Contributed 10+ circle feed posts or peer comments.' },
    entrepreneur: { title: 'Active Entrepreneur', color: 'bg-orange-100 text-orange-800 border-orange-200', desc: 'Currently running active regional retail projects.' },
    green_champion: { title: 'Green Champion', color: 'bg-teal-100 text-teal-800 border-teal-200', desc: 'Focused on ecological sourcing or organic local materials.' },
    field_hero: { title: 'Field Specialist', color: 'bg-lime-100 text-lime-800 border-lime-200', desc: 'Experienced in agriculture supply-chains and food cooperatives.' },
    coder: { title: 'Digital Coder', color: 'bg-pink-100 text-pink-800 border-pink-200', desc: 'Actively building software tools or developer bootcamps.' },
    connector: { title: 'Ecosystem Connector', color: 'bg-sky-100 text-sky-800 border-sky-200', desc: 'Helped coordinate regional meetups and retail partnerships.' },
    thrive_star: { title: 'Thrive Star', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', desc: 'Completed daily emotional logs and mindful routines.' }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-secondary">
          BIG Club
        </p>
        <h1 className="mt-2 text-3xl font-heading font-black text-primary sm:text-4xl">
          Sisters Leaderboard
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Sisters thrive on mutual accountability, shared growth, and celebrating each other's achievements. Complete academy exercises and support comments to earn points and claim specialized badges.
        </p>
      </div>

      {/* DOUBLE BOX GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: THE GAMIFICATION RATING LIST */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-heading text-sm font-bold text-primary flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              Live Leaderboard standings
            </h3>

            <div className="space-y-4">
              {sortedLeaderboard.map((member, index) => {
                const isTopThree = index < 3;
                const isYou = member.id === currentUser.id;

                return (
                  <div 
                    key={member.id}
                    className={`rounded-2xl border p-4 transition-all flex items-center justify-between gap-4 ${
                      isYou 
                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' 
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    {/* Rank indicator and sister */}
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold font-heading ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                          : index === 1
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        #{index + 1}
                      </div>

                      {/* Avatar & Info */}
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                      />

                      <div>
                        <h4 className="text-xs font-extrabold text-primary flex items-center gap-1">
                          {member.name}
                          {isYou && (
                            <span className="rounded-full bg-secondary text-[8px] font-bold text-white px-1.5 py-0.5 uppercase tracking-wide">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {member.title} • <span className="font-semibold text-slate-600">{member.city}</span>
                        </p>
                      </div>
                    </div>

                    {/* Points and Badges Earned */}
                    <div className="flex items-center gap-5">
                      {/* Badges preview */}
                      <div className="hidden sm:flex items-center gap-1">
                        {member.badges.slice(0, 3).map((bg) => {
                          const det = badgeDescriptions[bg] || { 
                            title: bg, 
                            color: 'bg-slate-100 text-slate-600 border-slate-200',
                            desc: 'A special community recognition badge.' 
                          };
                          return (
                            <span 
                              key={bg} 
                              title={det.desc}
                              className={`rounded-full border px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${det.color}`}
                            >
                              {det.title.split(' ')[0]}
                            </span>
                          );
                        })}
                        {member.badges.length > 3 && (
                          <span className="text-[9px] font-extrabold text-slate-400">
                            +{member.badges.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Points counter */}
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-heading font-black text-primary leading-none">
                          {member.points}
                        </span>
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                          points
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REWARDS / BADGES EXPLANATIONS */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-primary flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-secondary" />
              BIG Club Badges Index
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hover over badges in active standings or review requirements below to complete actions and claim yours.
            </p>

            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {Object.entries(badgeDescriptions).map(([key, details]) => (
                <div key={key} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-1">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${details.color}`}>
                    {details.title}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    {details.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
