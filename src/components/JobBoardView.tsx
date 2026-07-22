import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Users, ChevronRight, PlusCircle, Search, X, Bell, CheckCircle2 } from 'lucide-react';
import { Job, Member } from '../data';

interface JobBoardViewProps {
  currentUser: Member;
  addPoints?: (pts: number) => void;
  logActivity?: (action: string, details: string) => void;
}

export function JobBoardView({ currentUser, addPoints, logActivity }: JobBoardViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my-jobs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingToJobId, setApplyingToJobId] = useState<string | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales'];

  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    category: 'Engineering',
    description: '',
    requirements: [],
    salary: ''
  });
  
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      company: 'TechFlow',
      location: 'Remote',
      type: 'full-time',
      category: 'Engineering',
      description: 'Looking for an experienced React developer to lead our frontend team.',
      requirements: ['React', 'TypeScript', 'Tailwind CSS'],
      postedBy: 'system',
      timestamp: '2 hours ago',
      status: 'open',
      salary: '$120k - $150k',
      applicationsCount: 12
    },
    {
      id: 'job-2',
      title: 'Technical Co-founder',
      company: 'HealthSync AI',
      location: 'London, UK / Remote',
      type: 'co-founder',
      category: 'Product',
      description: 'Building an AI powered health assistant. Need a technical co-founder with ML experience.',
      requirements: ['Python', 'Machine Learning', 'Startup Experience'],
      postedBy: 'system',
      timestamp: '1 day ago',
      status: 'open',
      salary: 'Equity only',
      applicationsCount: 5
    }
  ]);

  const handleQuickApplyConfirm = () => {
    if (applyingToJobId) {
      if (logActivity) {
        const job = jobs.find(j => j.id === applyingToJobId);
        logActivity('applied to a job', job?.title || 'a new opportunity');
      }
      if (addPoints) {
        addPoints(20);
      }
      // Increment applications count
      setJobs(jobs.map(j => j.id === applyingToJobId ? { ...j, applicationsCount: (j.applicationsCount || 0) + 1 } : j));
      setApplyingToJobId(null);
    }
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) return;
    
    const job: Job = {
      id: `job-${Date.now()}`,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || 'Remote',
      type: newJob.type as any || 'full-time',
      category: newJob.category || 'Engineering',
      description: newJob.description,
      requirements: newJob.requirements || [],
      salary: newJob.salary,
      postedBy: currentUser.id,
      timestamp: 'Just now',
      status: 'open',
      applicationsCount: 0
    };
    
    setJobs([job, ...jobs]);
    setShowPostModal(false);
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      category: 'Engineering',
      description: '',
      requirements: [],
      salary: ''
    });
  };

  const filteredJobs = jobs.filter(job => 
    (selectedCategory === 'All' || job.category === selectedCategory) &&
    (job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary">Job & Opportunity Board</h1>
          <p className="text-slate-500 text-sm mt-1">Find your next role or co-founder within the sisterhood.</p>
        </div>
        
        <div className="flex-1 max-w-md w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => {
              setAlertsEnabled(!alertsEnabled);
              if (!alertsEnabled && logActivity) {
                logActivity('enabled job alerts', 'for matching opportunities');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              alertsEnabled 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {alertsEnabled ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {alertsEnabled ? 'Alerts On' : 'Job Alerts'}
          </button>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            Post Opportunity
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 shrink-0 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'all' ? 'text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          All Opportunities
          {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('my-jobs')}
          className={`pb-3 shrink-0 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'my-jobs' ? 'text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Applications
          {activeTab === 'my-jobs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-t-full" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedCategory === cat 
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-secondary hover:shadow-lg transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">{job.title}</h3>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {job.type.replace('-', ' ')}
                  </span>
                  {job.category && (
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {job.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                  {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {job.salary}</span>}
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="px-2 py-1 bg-secondary/10 text-secondary rounded-md text-[10px] font-bold">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between min-w-[140px] shrink-0">
                <span className="text-xs text-slate-400 font-medium">{job.timestamp}</span>
                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Users className="h-4 w-4" /> {job.applicationsCount} applied
                  </span>
                  <button 
                    onClick={() => setApplyingToJobId(job.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-secondary hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Quick Apply <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary">No opportunities found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-black text-primary">Post New Opportunity</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostJob} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                  <input 
                    type="text" 
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="e.g. Remote or London"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type *</label>
                  <select 
                    value={newJob.type}
                    onChange={(e) => setNewJob({...newJob, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="co-founder">Co-founder</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category *</label>
                  <select 
                    value={newJob.category}
                    onChange={(e) => setNewJob({...newJob, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salary Range</label>
                  <input 
                    type="text" 
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g. $100k - $120k (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description *</label>
                <textarea 
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium min-h-[120px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Requirements (comma separated)</label>
                <input 
                  type="text" 
                  value={newJob.requirements?.join(', ')}
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  placeholder="e.g. React, TypeScript, 3+ years experience"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-md shadow-secondary/20"
                >
                  Post Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {applyingToJobId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6">
              <Briefcase className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-primary mb-2">Quick Apply</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to apply for <strong>{jobs.find(j => j.id === applyingToJobId)?.title}</strong> at <strong>{jobs.find(j => j.id === applyingToJobId)?.company}</strong>? Your profile will be shared with the poster.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setApplyingToJobId(null)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleQuickApplyConfirm}
                className="flex-1 py-3 rounded-xl font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-md shadow-secondary/20"
              >
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
