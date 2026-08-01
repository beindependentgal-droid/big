import { Sparkles, Trophy, BookOpen, HeartHandshake, Briefcase, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface ProgramsViewProps {
  setCurrentView: (view: string, mode?: 'login' | 'register') => void;
}

export function ProgramsView({ setCurrentView }: ProgramsViewProps) {
  const programs = [
    {
      icon: BookOpen,
      title: 'BIG Launchpad',
      duration: '8-Week Accelerator',
      desc: 'An intensive business blueprint and launch program for aspiring entrepreneurs, taking ideas from concept to revenue.',
      color: 'border-secondary bg-secondary/5 text-secondary'
    },
    {
      icon: Sparkles,
      title: 'Tech & High-Income Mastery',
      duration: 'Ongoing Training',
      desc: 'Interactive software development, technical bootcamps, copy-writing, sales, and modern business logistics designed for the digital economy.',
      color: 'border-primary bg-primary/5 text-primary'
    },
    {
      icon: HeartHandshake,
      title: 'Peer Mentorship Circles',
      duration: '6-Month Cohorts',
      desc: 'Small, intentional accountability circles paired directly with experienced industry guides for deep feedback and support.',
      color: 'border-amber-500 bg-amber-500/5 text-amber-600'
    },
    {
      icon: Trophy,
      title: 'Sovereign Leader Summit',
      duration: 'Annual Retreat',
      desc: 'A premium gathering designed for leadership training, financial strategic planning, and restorative network building.',
      color: 'border-orange-500 bg-orange-500/5 text-orange-600'
    }
  ];

  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            Curated Pathways
          </span>
          <SectionHeading
            title="Our Growth Programs"
            description="High-impact learning, mentorship, and business development cohorts built to guide women toward financial and personal sovereignty."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {programs.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <div 
                key={idx} 
                className="group flex flex-col justify-between p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:border-secondary/20 transition-all cursor-pointer"
                onClick={() => setCurrentView('auth', 'register')}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 ${prog.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                      {prog.duration}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Cohort Applications Open
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary group-hover:translate-x-1 transition-transform">
                    Apply to Join <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center max-w-xl mx-auto rounded-3xl bg-slate-50 p-8 border border-slate-100">
          <h4 className="text-sm font-black text-primary uppercase tracking-tight mb-2">Want a custom cohort track?</h4>
          <p className="text-xs text-slate-500 mb-6">Connect with our support team to explore tailored mentoring paths for high-ticket skills.</p>
          <button 
            onClick={() => setCurrentView('contact')}
            className="rounded-full bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-secondary transition-colors"
          >
            Contact Admissions
          </button>
        </div>
      </div>
    </div>
  );
}
