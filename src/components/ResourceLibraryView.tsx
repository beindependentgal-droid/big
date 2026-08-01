import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Download, 
  Star, 
  Search, 
  Filter, 
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus,
  X,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Resource, Member } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface ResourceLibraryViewProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  onBack?: () => void;
  addPoints: (pts: number) => void;
  currentUser: Member;
}

export function ResourceLibraryView({ 
  resources, 
  setResources, 
  onBack,
  addPoints,
  currentUser
}: ResourceLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [ratingResource, setRatingResource] = useState<Resource | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  const [recentResourceIds, setRecentResourceIds] = useState<string[]>([]);
  const [readLaterIds, setReadLaterIds] = useState<string[]>([]);
  
  useEffect(() => {
    const savedRecent = localStorage.getItem('recent_resources');
    if (savedRecent) {
      try {
        setRecentResourceIds(JSON.parse(savedRecent));
      } catch (e) {}
    }
    const savedReadLater = localStorage.getItem('read_later_resources');
    if (savedReadLater) {
      try {
        setReadLaterIds(JSON.parse(savedReadLater));
      } catch (e) {}
    }
  }, []);

  const addToRecent = (id: string) => {
    setRecentResourceIds(prev => {
      const filtered = prev.filter(p => p !== id);
      const next = [id, ...filtered].slice(0, 3);
      localStorage.setItem('recent_resources', JSON.stringify(next));
      return next;
    });
  };

  const toggleReadLater = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReadLaterIds(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [id, ...prev];
      localStorage.setItem('read_later_resources', JSON.stringify(next));
      return next;
    });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceDesc, setNewResourceDesc] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState<'pdf' | 'link' | 'video' | 'guide'>('pdf');

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle || !newResourceUrl) return;

    const newResource: Resource = {
      id: `res-${Date.now()}`,
      title: newResourceTitle,
      description: newResourceDesc,
      type: newResourceType,
      url: newResourceUrl,
      rating: 5,
      ratingsCount: 1,
      downloadCount: 0
    };

    setResources([newResource, ...resources]);
    setShowAddModal(false);
    setNewResourceTitle('');
    setNewResourceDesc('');
    setNewResourceUrl('');
    setNewResourceType('pdf');
  };

  const filteredResources = resources.filter(res => {
    const matchesQuery = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || res.type === selectedType;
    return matchesQuery && matchesType;
  });

  const handleDownload = (resId: string, url?: string) => {
    setDownloadingId(resId);
    if (url) {
      window.open(url, '_blank');
    }
    
    addToRecent(resId);
    
    setResources(prev => prev.map(res => 
      res.id === resId 
        ? { ...res, downloadCount: (res.downloadCount || 0) + 1 } 
        : res
    ));

    addPoints(10);
    setTimeout(() => setDownloadingId(null), 2000);
  };

  const handleRate = (resId: string, rating: number) => {
    setResources(prev => prev.map(res => {
      if (res.id === resId) {
        const currentRating = res.rating || 0;
        const currentCount = res.ratingsCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        return {
          ...res,
          rating: Number(newRating.toFixed(1)),
          ratingsCount: newCount
        };
      }
      return res;
    }));
    setRatingResource(null);
    addPoints(5);
  };

  const resourceTypes = [
    { id: 'all', label: 'All Resources' },
    { id: 'guide', label: 'Guides' },
    { id: 'pdf', label: 'PDF Documents' },
    { id: 'video', label: 'Video Tutorials' },
    { id: 'link', label: 'External Links' }
  ];

  const recentResources = recentResourceIds
    .map(id => resources.find(r => r.id === id))
    .filter(Boolean) as Resource[];

  const renderResourceCard = (res: Resource) => {
    const Icon = res.type === 'video' ? Video : res.type === 'link' ? ExternalLink : FileText;
    return (
      <motion.div
        key={res.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] border border-slate-150 p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all group flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              res.type === 'video' ? 'bg-sky-50 text-sky-600' :
              res.type === 'pdf' ? 'bg-rose-50 text-rose-600' :
              res.type === 'guide' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex items-start gap-3">
              {res.type === 'pdf' && (
                <button
                  onClick={(e) => toggleReadLater(e, res.id)}
                  className={`p-2 rounded-xl transition-all ${
                    readLaterIds.includes(res.id)
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                  title={readLaterIds.includes(res.id) ? "Remove from Read Later" : "Read Later"}
                >
                  {readLaterIds.includes(res.id) ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              )}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-black">{res.rating || 'N/A'}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {res.ratingsCount || 0} reviews
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                {res.title}
              </h3>
              {res.category && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {res.category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
              {res.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{res.duration || res.size || res.readTime || 'Varies'}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span className="uppercase tracking-widest">{res.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{res.downloadCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => setRatingResource(res)}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-secondary hover:bg-secondary/5 transition-all flex items-center gap-1"
          >
            <Star className="h-3.5 w-3.5" />
            Rate
          </button>
          <button
            onClick={() => handleDownload(res.id, res.url)}
            className={`flex-grow rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              downloadingId === res.id 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-primary text-white shadow-md hover:bg-slate-900 active:scale-95'
            }`}
          >
            {downloadingId === res.id ? (
              <>
                <div className="h-3 w-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>{res.type === 'link' ? 'Opening...' : 'Downloading...'}</span>
              </>
            ) : (
              <>
                {res.type === 'link' ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                <span>{res.type === 'link' ? 'Open Resource' : 'Download Now'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-heading font-black text-primary">Resource Library</h1>
            <p className="text-sm text-slate-500 font-medium">Expert guides, templates, and masterclasses for your growth.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-secondary focus:ring-1 focus:ring-secondary outline-none w-full sm:w-64 transition-all"
            />
          </div>
          {currentUser?.isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
          <Filter className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filter Resources:</span>
        </div>
        {resourceTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedType === t.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-white border border-slate-150 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* RECENTLY VIEWED */}
      {recentResources.length > 0 && searchQuery === '' && selectedType === 'all' && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentResources.map(renderResourceCard)}
          </div>
        </div>
      )}

      {/* RESOURCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(renderResourceCard)}
      </div>

      {/* RATING MODAL */}
      <AnimatePresence>
        {ratingResource && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6"
            >
              <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                <Star className="h-8 w-8 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary uppercase tracking-tight">Rate this Resource</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Your feedback helps sisters find the best content!</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(ratingResource.id, star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${
                        (hoverRating || 0) >= star || (ratingResource.rating || 0) >= star
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setRatingResource(null)}
                  className="w-full py-3 rounded-2xl border border-slate-150 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredResources.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <Search className="h-8 w-8" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matching resources found</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
            className="text-secondary font-black uppercase tracking-widest text-[10px] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-black text-primary">Add External Resource</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-secondary focus:outline-none"
                    placeholder="e.g. Q3 Startup Funding Guide"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newResourceDesc}
                    onChange={(e) => setNewResourceDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-secondary focus:outline-none resize-none"
                    placeholder="Brief description of the resource..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Resource Type</label>
                  <select
                    value={newResourceType}
                    onChange={(e) => setNewResourceType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-secondary focus:outline-none"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="link">External Link</option>
                    <option value="video">Video Tutorial</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL (Link to PDF/External Resource)</label>
                  <input
                    type="url"
                    required
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-secondary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-slate-800 transition-colors"
                  >
                    Add Resource
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
