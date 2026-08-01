import { Plus, Award, Calendar, Briefcase, BookOpen, Star, TrendingUp, X, ChevronLeft, ChevronRight, Send, Image as ImageIcon, Video, Heart, CircleDot, Camera as CameraIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, Story } from '../data';
import React, { useState, useEffect, useRef } from 'react';
import { CaptureMedia } from './CaptureMedia';
import { getSafeSrc } from '../lib/utils';

interface StoriesProps {
  stories: Story[];
  members: Member[];
  currentUser: Member;
  onAddStory: (story: Partial<Story>) => void;
  isCircleContext?: boolean;
}

interface StoryData {
  title: string;
  icon: React.ReactNode;
  color: string;
  content?: string;
  isCurrentUser: boolean;
  mediaType: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export function Stories({ stories, members, currentUser, onAddStory, isCircleContext }: StoriesProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [selectedColor, setSelectedColor] = useState('from-indigo-500 to-purple-600');
  
  const [createMediaType, setCreateMediaType] = useState<'text' | 'image' | 'video' | 'camera'>('text');
  const [selectedMediaFile, setSelectedMediaFile] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'circle'>(isCircleContext ? 'circle' : 'public');

  // Update default privacy when context changes
  useEffect(() => {
    if (isCreating) {
      setPrivacy(isCircleContext ? 'circle' : 'public');
    }
  }, [isCircleContext, isCreating]);

  const colorOptions = [
    'from-indigo-500 to-purple-600',
    'from-rose-400 to-red-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-pink-500',
    'from-pink-500 to-rose-500'
  ];

  // Auto-advance story
  useEffect(() => {
    if (activeStoryIdx === null) return;
    
    const activeStory = stories[activeStoryIdx];

    // If it's a video, rely on the video timeupdate instead of setInterval
    if (activeStory && activeStory.imageUrl && (activeStory.imageUrl.endsWith('.mp4') || activeStory.imageUrl.includes('mov_bbb'))) {
      const videoEl = videoRef.current;
      if (videoEl) {
        const handleTimeUpdate = () => {
          if (videoEl.duration) {
            setProgress((videoEl.currentTime / videoEl.duration) * 100);
          }
        };
        videoEl.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
          videoEl.removeEventListener('timeupdate', handleTimeUpdate);
        };
      }
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx(activeStoryIdx + 1);
            return 0;
          } else {
            setActiveStoryIdx(null);
            return 0;
          }
        }
        return prev + 1.5; // Slightly faster progress
      });
    }, 60);

    return () => clearInterval(timer);
  }, [activeStoryIdx, stories]);

  const handleNext = (e?: React.MouseEvent | React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (activeStoryIdx !== null && activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx(activeStoryIdx + 1);
      setProgress(0);
    } else {
      setActiveStoryIdx(null);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx(activeStoryIdx - 1);
      setProgress(0);
    }
  };

  const handlePostStory = () => {
    if (createMediaType === 'text' && !newStoryText.trim()) return;
    if (createMediaType !== 'text' && !selectedMediaFile) return;
    
    onAddStory({
      imageUrl: selectedMediaFile || `text-story:${selectedColor}:${newStoryText}`,
      timestamp: new Date().toISOString(),
      privacy: privacy
    });
    
    setNewStoryText('');
    setCreateMediaType('text');
    setSelectedMediaFile(null);
    setIsCreating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedMediaFile(url);
    }
  };

  const parseStoryMedia = (story: Story) => {
    if (story.imageUrl.startsWith('text-story:')) {
      const parts = story.imageUrl.split(':');
      return {
        type: 'text' as const,
        color: parts[1] || 'from-indigo-500 to-purple-600',
        content: parts[2] || ''
      };
    }
    const isVideo = story.imageUrl.endsWith('.mp4') || story.imageUrl.includes('mov_bbb');
    return {
      type: isVideo ? 'video' as const : 'image' as const,
      url: story.imageUrl
    };
  };

  return (
    <React.Fragment>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <CircleDot className="h-4 w-4 text-secondary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Circle Stories</h3>
        </div>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar px-2 -mx-2">
          {/* Current User "Add Story" */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="relative h-44 w-28 shrink-0 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 cursor-pointer overflow-hidden group flex flex-col border border-slate-100 dark:border-slate-800"
          >
            <div className="h-full w-full relative">
              {getSafeSrc(currentUser.avatar) ? (
                <img src={getSafeSrc(currentUser.avatar)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-white font-bold text-2xl opacity-60">
                  {currentUser.name[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-secondary shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 stroke-[3px]" />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Share Your Day</span>
              </div>
            </div>
          </motion.div>

          {/* Member Stories */}
          {stories.map((story, idx) => {
            const media = parseStoryMedia(story);
            return (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveStoryIdx(idx);
                  setProgress(0);
                }}
                className="relative h-44 w-28 shrink-0 rounded-[1.5rem] cursor-pointer overflow-hidden group shadow-sm border border-slate-100 dark:border-slate-800"
              >
                {/* Background */}
                {media.type === 'image' ? (
                  <img src={media.url} className="absolute inset-0 h-full w-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
                ) : media.type === 'video' ? (
                  <video src={media.url} className="absolute inset-0 h-full w-full object-cover z-0" muted loop autoPlay playsInline />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${media.color} opacity-90 group-hover:opacity-100 transition-opacity z-0`} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                <div className="absolute inset-0 z-20 p-3 flex flex-col justify-between">
                  <div className="h-8 w-8 rounded-full border-2 border-secondary p-0.5 bg-white overflow-hidden shadow-lg">
                    <img src={story.userAvatar} className="h-full w-full rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  
                  <h4 className="text-[10px] font-black text-white leading-tight truncate drop-shadow-md">{story.userName.split(' ')[0]}</h4>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

        {/* Fullscreen Story Viewer */}
        <AnimatePresence>
          {activeStoryIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
              onClick={() => setActiveStoryIdx(null)}
            >
              <div 
                className="relative w-full max-w-md h-[100dvh] sm:h-[85vh] sm:rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
              >
                {/* Story Content Background */}
                {(() => {
                  const story = stories[activeStoryIdx];
                  if (!story) return null;
                  const media = parseStoryMedia(story);
                  
                  return (
                    <>
                      {/* Background Image / Video / Gradient */}
                      {media.type === 'image' ? (
                        <img src={media.url} className="absolute inset-0 h-full w-full object-cover z-0" alt="" referrerPolicy="no-referrer" />
                      ) : media.type === 'video' ? (
                        <video ref={videoRef} src={media.url} className="absolute inset-0 h-full w-full object-cover z-0" autoPlay playsInline onEnded={handleNext} />
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${media.color} opacity-90 z-0`} />
                          {story.userAvatar && (
                            <img src={story.userAvatar} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40" alt="" referrerPolicy="no-referrer" />
                          )}
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl mb-6 mx-auto">
                              <Star className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                              {media.content}
                            </h3>
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 z-10 pointer-events-none" />
                      <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5 pointer-events-none">
                        {stories.map((_, idx) => (
                          <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white transition-all duration-75"
                              style={{ 
                                width: idx === activeStoryIdx ? `${progress}%` : idx < activeStoryIdx ? '100%' : '0%' 
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Header */}
                      <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full border-2 border-secondary p-0.5 bg-white overflow-hidden shrink-0 pointer-events-auto">
                            {story.userAvatar ? (
                              <img src={story.userAvatar} alt={story.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="h-full w-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                {story.userName[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-black text-sm">{story.userName}</p>
                            <p className="text-white/70 text-[9px] font-black uppercase tracking-widest">Circle Story</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveStoryIdx(null)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors pointer-events-auto"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Tap Areas for Navigation */}
                      <div className="absolute inset-y-20 left-0 w-1/3 z-30 cursor-pointer flex items-center group" onClick={handlePrev}>
                        <div className="ml-4 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <ChevronLeft className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="absolute inset-y-20 right-0 w-2/3 z-30 cursor-pointer flex items-center justify-end group" onClick={handleNext}>
                        <div className="mr-4 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <ChevronRight className="h-6 w-6" />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Story Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsCreating(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 shrink-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Create Story</h3>
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Preview Area */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 flex-1 overflow-y-auto min-h-0 flex flex-col items-center justify-center">
                  <div className="relative aspect-[9/16] h-[300px] sm:h-[360px] rounded-2xl overflow-hidden shadow-lg group bg-slate-900 shrink-0">
                    {createMediaType === 'text' ? (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${selectedColor} opacity-90`} />
                        {currentUser.avatar && (
                          <img src={currentUser.avatar} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40" alt="" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                          <h3 className="text-xl font-black text-white break-words w-full">
                            {newStoryText || 'Type your story here...'}
                          </h3>
                        </div>
                      </>
                    ) : createMediaType === 'image' && selectedMediaFile ? (
                      <img src={selectedMediaFile} className="absolute inset-0 h-full w-full object-cover" alt="" />
                    ) : createMediaType === 'video' && selectedMediaFile ? (
                      <video src={selectedMediaFile} className="absolute inset-0 h-full w-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                        {createMediaType === 'image' ? <ImageIcon className="h-10 w-10 mb-2 opacity-50" /> : <Video className="h-10 w-10 mb-2 opacity-50" />}
                        <span className="text-[10px] uppercase tracking-widest font-black">No Media Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-white dark:bg-slate-900 shrink-0 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2 mb-4 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                    {(['text', 'image', 'video', 'camera'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          if (type === 'camera') {
                            setIsCapturing(true);
                          } else {
                            setCreateMediaType(type);
                            setSelectedMediaFile(null);
                          }
                        }}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${createMediaType === type ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        {type === 'camera' ? <CameraIcon className="h-3 w-3 mx-auto" /> : type}
                      </button>
                    ))}
                  </div>

                  {createMediaType === 'text' ? (
                    <>
                      <div className="mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Theme Color</p>
                        <div className="flex gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`h-8 w-8 rounded-full bg-gradient-to-br ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'} transition-all`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          autoFocus
                          value={newStoryText}
                          onChange={(e) => setNewStoryText(e.target.value)}
                          placeholder="What's on your mind?"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 resize-none h-24"
                          maxLength={100}
                        />
                        <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400">
                          {newStoryText.length}/100
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-4">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          {createMediaType === 'image' ? <ImageIcon className="h-6 w-6 mb-2 opacity-50" /> : <Video className="h-6 w-6 mb-2 opacity-50" />}
                          <p className="text-[10px] font-bold uppercase tracking-widest text-center">Click to upload {createMediaType}</p>
                        </div>
                        <input type="file" accept={createMediaType === 'image' ? 'image/*' : 'video/*'} className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Who can see this?</p>
                    <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <button
                        onClick={() => setPrivacy('public')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${privacy === 'public' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        <Star className={`h-3 w-3 ${privacy === 'public' ? 'fill-primary' : ''}`} /> Public
                      </button>
                      <button
                        onClick={() => setPrivacy('circle')}
                        disabled={!isCircleContext}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${privacy === 'circle' ? 'bg-white dark:bg-slate-700 text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'} ${!isCircleContext ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <CircleDot className={`h-3 w-3 ${privacy === 'circle' ? 'fill-secondary' : ''}`} /> Circle Only
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePostStory}
                    disabled={(createMediaType === 'text' && !newStoryText.trim()) || (createMediaType !== 'text' && !selectedMediaFile)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    Post Story
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capture Media Overlay */}
        <AnimatePresence>
          {isCapturing && (
            <CaptureMedia 
              onClose={() => setIsCapturing(false)}
              onCapture={(url, type) => {
                setCreateMediaType(type);
                setSelectedMediaFile(url);
                setIsCapturing(false);
              }}
            />
          )}
        </AnimatePresence>
    </React.Fragment>
  );
}
