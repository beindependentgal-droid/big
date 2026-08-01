import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  User, 
  MapPin, 
  Briefcase, 
  Tag, 
  CheckCircle2, 
  ThumbsUp,
  AlertTriangle, 
  Loader2, 
  Plus, 
  X, 
  Sparkles,
  Award,
  BookOpen,
  Users,
  MessageSquare,
  UserPlus,
  UserCheck,
  ChevronLeft,
  Share2,
  Calendar,
  Zap,
  Globe,
  Heart,
  Trophy,
  Coffee,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, Circle, isProfileVerified } from '../data';
import { copyToClipboard } from '../lib/utils';
import { isSupabaseConfigured, supabaseService } from '../supabase';
import { BadgeGalleryView } from './BadgeGalleryView';

interface ProfileViewProps {
  currentUser: Member;
  targetUser?: Member;
  onSaveProfile: (updatedUser: Member) => void;
  addPoints: (pts: number, badge?: string) => void;
  setCurrentView?: (view: string) => void;
  setSelectedProfileId?: (id: string | null) => void;
  toggleFollow?: (memberId: string) => void;
  followingIds?: string[];
  setSelectedConversationMember?: (m: Member) => void;
  circles?: Circle[];
  blockUser?: (userId: string) => void;
  reportUser?: (userId: string) => void;
  logActivity?: (action: string, details: string) => void;
  setToast?: (toast: any) => void;
  addNotification?: (title: string, message: string, type: 'chat' | 'mention' | 'system' | 'badge') => void;
}

export function ProfileView({ 
  currentUser, 
  targetUser = currentUser,
  onSaveProfile, 
  addPoints,
  setCurrentView,
  setSelectedProfileId,
  toggleFollow,
  followingIds = [],
  setSelectedConversationMember,
  circles = [],
  blockUser,
  reportUser,
  logActivity,
  setToast,
  addNotification
}: ProfileViewProps) {
  const isOwnProfile = targetUser.id === currentUser.id || targetUser.id === currentUser.id;
  const [isEditing, setIsEditing] = useState(isOwnProfile && !targetUser.name); // Edit mode by default if new
  const [showCompletionTooltip, setShowCompletionTooltip] = useState(false);
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false);

  // State variables for profile details
  const [name, setName] = useState(targetUser.name);
  const [title, setTitle] = useState(targetUser.title);
  const [city, setCity] = useState(targetUser.city);
  const [bio, setBio] = useState(targetUser.bio || '');
  const [avatar, setAvatar] = useState(targetUser.avatar || '');
  const [businessStage, setBusinessStage] = useState(targetUser.business_stage || 'Early Stage');
  const [mentoringCapacity, setMentoringCapacity] = useState(targetUser.mentoring_capacity || 'Seeking Match');
  
  // New Fields
  const [website, setWebsite] = useState(targetUser.website || '');
  const [linkedinUrl, setLinkedinUrl] = useState(targetUser.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(targetUser.githubUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(targetUser.twitterUrl || '');
  const [company, setCompany] = useState(targetUser.company || '');
  const [industry, setIndustry] = useState(targetUser.industry || '');
  const [certifications, setCertifications] = useState<string[]>(targetUser.certifications || []);
  const [newCertification, setNewCertification] = useState('');
  const [endorsements, setEndorsements] = useState<{ from: string; skill: string; note?: string; timestamp?: string }[]>(targetUser.endorsements || []);
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);

  const KUDOS_NOTES = [
    "True expert in this area! 🌟",
    "Always helpful and knowledgeable. 📚",
    "Highly recommend for this skill! ✅",
    "A real master of the craft. 🎨",
    "Super reliable and skilled! 🤝",
    "Incredible attention to detail. 🔍"
  ];
  const [recommendations, setRecommendations] = useState<{ from: string; text: string }[]>(targetUser.recommendations || []);
  
  // Coffee Chat States
  const [isSchedulingCoffee, setIsSchedulingCoffee] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [coffeeChatDate, setCoffeeChatDate] = useState('');
  const [coffeeChatTime, setCoffeeChatTime] = useState('');
  const [coffeeChatSuccess, setCoffeeChatSuccess] = useState(false);

  // Skills and interests tags states
  const [skills, setSkills] = useState<string[]>(targetUser.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>(targetUser.interests || []);
  const [newInterest, setNewInterest] = useState('');

  // Sync state if targetUser changes (e.g. navigation)
  useEffect(() => {
    setName(targetUser.name);
    setTitle(targetUser.title);
    setCity(targetUser.city);
    setBio(targetUser.bio || '');
    setAvatar(targetUser.avatar || '');
    setSkills(targetUser.skills || []);
    setInterests(targetUser.interests || []);
    setBusinessStage(targetUser.business_stage || 'Early Stage');
    setMentoringCapacity(targetUser.mentoring_capacity || 'Open to Mentee Matches');
    setWebsite(targetUser.website || '');
    setLinkedinUrl(targetUser.linkedinUrl || '');
    setGithubUrl(targetUser.githubUrl || '');
    setTwitterUrl(targetUser.twitterUrl || '');
    setCompany(targetUser.company || '');
    setIndustry(targetUser.industry || '');
    setCertifications(targetUser.certifications || []);
    setEndorsements(targetUser.endorsements || []);
    setRecommendations(targetUser.recommendations || []);
    if (!isOwnProfile) setIsEditing(false);
  }, [targetUser, isOwnProfile]);

  // Completion checklist calculation
  const completionItems = [
    { id: 'name', label: 'Full Name', complete: !!name.trim() },
    { id: 'title', label: 'Professional Title', complete: !!title.trim() },
    { id: 'city', label: 'Location (City)', complete: !!city.trim() },
    { id: 'bio', label: 'About Me (Bio)', complete: !!bio.trim() },
    { id: 'avatar', label: 'Profile Photo', complete: !!avatar },
    { id: 'skills', label: 'Skills (at least 1)', complete: skills.length > 0 },
    { id: 'interests', label: 'Interests (at least 1)', complete: interests.length > 0 },
  ];
  const completionPercentage = Math.round((completionItems.filter(item => item.complete).length / completionItems.length) * 100);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'storage' | 'local' | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Share profile
  const [shareCopied, setShareCopied] = useState(false);
  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/?view=profile&id=${targetUser.id}`;
    await copyToClipboard(profileUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('none');

  const PHOTO_FILTERS = [
    { name: 'Normal', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Contrast', value: 'contrast(150%)' },
    { name: 'Vivid', value: 'saturate(200%)' },
    { name: 'Warm', value: 'sepia(50%) hue-rotate(-30deg) saturate(150%)' }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setCapturedPhoto(null);
      setActiveFilter('none');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setUploadError('Unable to access camera. Please check your permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setActiveFilter('none');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.9));
        
        // Stop the active stream since we have the photo
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    }
  };

  const applyFilterAndSave = () => {
    if (capturedPhoto && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.filter = activeFilter;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              setIsCameraOpen(false);
              setCapturedPhoto(null);
              setActiveFilter('none');
              await handleFileProcess(file);
            }
          }, 'image/jpeg', 0.9);
        };
        img.src = capturedPhoto;
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen && !capturedPhoto && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream, capturedPhoto]);

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Handle Manual Click File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  // Core File Process and Direct Upload logic
  const handleFileProcess = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Oh sister, please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    // Validate size (limit to 4MB for optimal database/storage performance)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('This image exceeds 4MB. Let’s pick a smaller photo, sister!');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadMethod(null);

    // Attempt direct upload to Supabase Storage
    if (isSupabaseConfigured()) {
      try {
        const publicUrl = await supabaseService.uploadAvatar(file);
        setAvatar(publicUrl);
        setUploadMethod('storage');
        addPoints(15); // Reward points for direct storage syncing!
      } catch (err: any) {
        console.warn('Supabase storage upload failed, falling back to local Base64:', err);
        await processLocalBase64(file);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Fallback directly to offline base64
      await processLocalBase64(file);
      setIsUploading(false);
    }
  };

  const processLocalBase64 = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setAvatar(base64data);
        setUploadMethod('local');
        addPoints(10); // Reward points for profile update!
        resolve();
      };
    });
  };

  // Add skill tag
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Add interest tag
  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  // Remove interest tag
  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  // Endorse skill
  const handleEndorseSkill = (skillName: string, note?: string) => {
    if (isOwnProfile) return;
    
    // Prevent double endorsement
    if (endorsements.some(e => e.from === currentUser.id && e.skill === skillName)) return;

    const newEndorsement = { 
      from: currentUser.id, 
      skill: skillName, 
      note, 
      timestamp: new Date().toISOString() 
    };
    const updatedEndorsements = [...endorsements, newEndorsement];
    
    setEndorsements(updatedEndorsements);
    setEndorsingSkill(null); // Close the kudos selector
    
    // Profile owner gets a point reward
    const targetPoints = (targetUser.points || 0) + 10;
    
    const updatedTargetUser: Member = {
      ...targetUser,
      endorsements: updatedEndorsements,
      points: targetPoints
    };
    
    onSaveProfile(updatedTargetUser);
    
    // Reward current user (endorser) for community engagement
    addPoints(5); 

    // Activity Log
    if (logActivity) {
      logActivity('Endorsement', `Endorsed ${targetUser.name} for "${skillName}" skill.${note ? ` Note: ${note}` : ''}`);
    }

    // Toast
    if (setToast) {
      setToast({
        id: `endorse-${Date.now()}`,
        title: '🌟 Sisterhood Gratitude!',
        desc: `Thank you for validating your sister! You endorsed ${targetUser.name}'s "${skillName}" skill. They earned +10 points! (+5 points for you)`,
        type: 'points'
      });
    }
  };

  const handleConfirmCoffeeChat = () => {
    if (!coffeeChatDate || !coffeeChatTime) return;
    
    setIsSchedulingCoffee(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSchedulingCoffee(false);
      setCoffeeChatSuccess(true);
      
      // Trigger notification as requested
      if (addNotification) {
        addNotification(
          'Coffee Chat Proposed!',
          `You've proposed a coffee chat with ${targetUser.name} for ${coffeeChatDate} at ${coffeeChatTime}. We've notified her!`,
          'chat'
        );
      }

      // Reset after showing success
      setTimeout(() => {
        setShowCoffeeModal(false);
        setCoffeeChatSuccess(false);
        setCoffeeChatDate('');
        setCoffeeChatTime('');
      }, 2000);
    }, 1500);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUploadError('A girl needs a name! Please enter your name, sister.');
      return;
    }

    const updatedUser: Member = {
      ...targetUser,
      name: name.trim(),
      title: title.trim(),
      city: city.trim(),
      bio: bio.trim(),
      avatar: avatar,
      skills: skills,
      interests: interests,
      business_stage: businessStage as any,
      mentoring_capacity: mentoringCapacity as any,
      website: website.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      twitterUrl: twitterUrl.trim(),
      company: company.trim(),
      industry: industry.trim(),
      certifications: certifications,
      endorsements: endorsements,
      recommendations: recommendations
    };

    onSaveProfile(updatedUser);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="mx-auto max-w-5xl px-0 sm:px-6 lg:px-8">
        {/* TOP NAVIGATION / ACTIONS */}
        <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
          <button 
            onClick={() => {
              if (setSelectedProfileId) setSelectedProfileId(null);
              if (setCurrentView) setCurrentView('directory');
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </button>
        </div>
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm mb-8">
           {/* Banner */}
           <div className="h-40 bg-gradient-to-r from-primary/20 to-secondary/20" />
           
           <div className="px-8 pb-8">
             <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
                <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                  {targetUser.avatar ? (
                    <img
                      src={targetUser.avatar}
                      className="h-full w-full object-cover"
                      alt={targetUser.name || 'Profile photo'}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white text-slate-200">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 mt-2">
                   <h2 className="text-2xl font-heading font-black text-primary uppercase tracking-tight flex items-center gap-2 flex-wrap">
                     <span>{targetUser.name}</span>
                     {isProfileVerified(targetUser) && (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-50 text-pink-600 border border-pink-100 uppercase tracking-wide normal-case shrink-0 shadow-xs animate-fade-in" title="Verified Profile (100% complete)">
                         <CheckCircle2 className="h-3 w-3 text-pink-500 fill-pink-100/30 shrink-0" />
                         Verified
                       </span>
                     )}
                   </h2>
                   <p className="text-sm font-bold text-slate-500">{targetUser.title}</p>
                   <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {targetUser.city}</p>
                </div>

                <div className="flex items-center gap-3">
                  {!isOwnProfile && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => blockUser?.(targetUser.id)} className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest">Block</button>
                        <button onClick={() => reportUser?.(targetUser.id)} className="text-[10px] text-amber-500 hover:text-amber-700 font-black uppercase tracking-widest">Report</button>
                      </div>
                  )}
                  <button 
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${
                      shareCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  {isOwnProfile ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                    >
                      <Zap className="h-3.5 w-3.5 text-accent" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {toggleFollow && (
                        <button
                          onClick={() => toggleFollow(targetUser.id)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                            followingIds.includes(targetUser.id)
                              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              : 'bg-primary border-primary text-white hover:bg-primary/90'
                          }`}
                        >
                          {followingIds.includes(targetUser.id) ? 'Unfollow' : 'Follow'}
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (setSelectedConversationMember && setCurrentView) {
                            setSelectedConversationMember(targetUser);
                            setCurrentView('messages');
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary/90 transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Message</span>
                      </button>
                      <button 
                        onClick={() => setShowCoffeeModal(true)}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10"
                      >
                        <Coffee className="h-3.5 w-3.5" />
                        <span>Coffee Chat</span>
                      </button>
                    </div>
                  )}
                </div>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-0">
          {/* PROFILE LEFT: STATS CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-primary p-8 text-white shadow-xl shadow-primary/10 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                    <Award className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Sister Standing</h3>
                    <p className="text-sm font-heading font-black text-accent">{targetUser.rank} Rank</p>
                 </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Global Points</span>
                    <span className="text-lg font-heading font-black text-accent">{targetUser.points}</span>
                  </div>

                  <button
                    onClick={() => setIsBadgeGalleryOpen(true)}
                    className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-4 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Badge Gallery</span>
                    </div>
                    <span className="text-xs font-black text-accent group-hover:translate-x-1 transition-transform">→</span>
                  </button>
               </div>
            </div>
            
            <div className="rounded-3xl bg-white border border-slate-100 p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Connections</h3>
                <div className="flex justify-between text-center">
                    <div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Followers</p>
                        <p className="text-lg font-heading font-black text-primary">{targetUser.followerIds?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Following</p>
                        <p className="text-lg font-heading font-black text-primary">{targetUser.followingIds?.length || 0}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* PROFILE RIGHT: CONTENT AREAS */}
          <div className="lg:col-span-8 space-y-8">
            {/* ABOUT SECTION */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">About this Sister</h3>
               </div>
               
               <p className="text-sm text-slate-500 leading-[1.8] font-medium whitespace-pre-line">
                  {targetUser.bio || "This sister hasn't shared her story yet, but we're excited to have her in the community!"}
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Venture Stage</p>
                     <div className="flex items-center gap-2 text-xs font-black text-primary uppercase">
                        <Briefcase className="h-4 w-4 text-secondary" />
                        <span>{targetUser.business_stage || 'Ideation'}</span>
                     </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Mentorship Status</p>
                     <div className="flex items-center gap-2 text-xs font-black text-primary uppercase">
                        <Heart className="h-4 w-4 text-secondary" />
                        <span>{targetUser.mentoring_capacity || 'Seeking Match'}</span>
                     </div>
                  </div>
               </div>
            </section>

            {/* SKILLS & INTERESTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">Core Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                      {targetUser.skills.map(skill => {
                        const count = (targetUser.endorsements || []).filter(e => e.skill === skill).length;
                        const hasEndorsed = (targetUser.endorsements || []).some(e => e.from === currentUser.id && e.skill === skill);
                        const isHighlyEndorsed = count >= 3;
                        
                        return (
                          <div key={skill} className="flex flex-col gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              isHighlyEndorsed 
                                ? 'bg-secondary/10 text-secondary border-secondary/20 shadow-sm' 
                                : 'bg-primary/5 text-primary border-primary/5'
                            }`}>
                               <span className="flex items-center gap-1.5">
                                 {isHighlyEndorsed && <Sparkles className="h-3 w-3" />}
                                 {skill}
                               </span>
                               {count > 0 && (
                                 <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] ${
                                   isHighlyEndorsed ? 'bg-secondary text-white' : 'bg-primary text-white'
                                 }`}>
                                   <ThumbsUp className="h-2.5 w-2.5" />
                                   {count}
                                 </span>
                               )}
                            </div>
                            {!isOwnProfile && (
                              <button 
                                onClick={() => setEndorsingSkill(skill)}
                                disabled={hasEndorsed}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                  hasEndorsed 
                                    ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100 shadow-sm' 
                                    : 'bg-white border border-slate-150 text-slate-400 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50 hover:shadow-md active:scale-95'
                                }`}
                              >
                                {hasEndorsed ? <CheckCircle2 className="h-2.5 w-2.5" /> : <ThumbsUp className="h-2.5 w-2.5" />}
                                <span>{hasEndorsed ? 'Endorsed' : 'Endorse'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                     {targetUser.skills.length === 0 && <p className="text-[10px] text-slate-300 italic">No skills listed.</p>}
                  </div>
               </section>

               <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                    <BookOpen className="h-4 w-4 text-secondary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">Growth Focus</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {targetUser.interests.map(interest => (
                       <span key={interest} className="px-4 py-2 rounded-xl bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/5">
                          {interest}
                       </span>
                     ))}
                     {targetUser.interests.length === 0 && <p className="text-[10px] text-slate-300 italic">No interests listed.</p>}
                  </div>
               </section>
            </div>

            {/* JOURNEY STATS */}
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Globe className="h-40 w-40" />
               </div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Sisterhood Journey</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Member Since</p>
                        <p className="text-sm font-heading font-black text-accent">July 2026</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Circles</p>
                        <p className="text-sm font-heading font-black text-accent">
                          {(() => {
                            const count = isOwnProfile
                              ? circles.filter(c => c.isJoined).length
                              : (targetUser.circleIds?.length || 0);
                            return `${count} ${count === 1 ? 'Community' : 'Communities'}`;
                          })()}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Academy Rank</p>
                        <p className="text-sm font-heading font-black text-accent">
                          {(() => {
                            const pts = targetUser.points || 0;
                            if (pts >= 1000) return 'Top 5%';
                            if (pts >= 600) return 'Top 15%';
                            if (pts >= 300) return 'Top 30%';
                            if (pts >= 100) return 'Top 50%';
                            if (pts > 0) return 'Top 90%';
                            return 'New Joiner';
                          })()}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Connections</p>
                        <p className="text-sm font-heading font-black text-accent">{(targetUser.followerIds?.length || 0) + (targetUser.followingIds?.length || 0)} Sisters</p>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">
                        "Your growth is the community's growth. Every milestone you reach as an independent gal inspires sisters across the globe."
                     </p>
                  </div>
               </div>
            </section>
            
            {/* ENDORSEMENT KUDOS SECTION */}
            {(targetUser.endorsements || []).some(e => e.note) && (
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Endorsement Kudos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(targetUser.endorsements || []).filter(e => e.note).map((endorsement, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="h-10 w-10 text-secondary" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                          {endorsement.skill}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400">
                          {endorsement.timestamp ? new Date(endorsement.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-primary italic mb-2">"{endorsement.note}"</p>
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Heart className="h-2.5 w-2.5 text-secondary" fill="currentColor" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sister Endorsement</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* KUDOS SELECTOR MODAL */}
        <AnimatePresence>
          {endorsingSkill && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEndorsingSkill(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
                  <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-black uppercase tracking-tight mb-2">Send Some Kudos!</h3>
                  <p className="text-xs text-white/70 font-medium">
                    You're endorsing {targetUser.name} for <span className="text-accent font-black">"{endorsingSkill}"</span>. 
                    Choose a note to brighten her day!
                  </p>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 gap-2">
                    {KUDOS_NOTES.map((note) => (
                      <button
                        key={note}
                        onClick={() => handleEndorseSkill(endorsingSkill, note)}
                        className="flex items-center justify-between group rounded-2xl border border-slate-100 p-4 text-left hover:border-secondary hover:bg-secondary/5 transition-all active:scale-[0.98]"
                      >
                        <span className="text-xs font-bold text-slate-600 group-hover:text-secondary">{note}</span>
                        <Heart className="h-4 w-4 text-slate-200 group-hover:text-secondary group-hover:fill-current" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleEndorseSkill(endorsingSkill)}
                      className="mt-4 w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                    >
                      Skip Note, Just Endorse
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setEndorsingSkill(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            </div>
          )}

          <BadgeGalleryView 
            isOpen={isBadgeGalleryOpen} 
            onClose={() => setIsBadgeGalleryOpen(false)} 
            user={targetUser} 
          />

          {/* COFFEE CHAT MODAL */}
          {showCoffeeModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSchedulingCoffee && setShowCoffeeModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Coffee className="h-5 w-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Coffee Chat</h3>
                  </div>
                  <button 
                    onClick={() => !isSchedulingCoffee && setShowCoffeeModal(false)}
                    className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-8">
                  {coffeeChatSuccess ? (
                    <div className="py-6 text-center animate-fade-in">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-6 w-6" />
                      </div>
                      <h4 className="text-base font-heading font-black text-primary dark:text-white">Invitation Sent!</h4>
                      <p className="mt-1 text-[11px] font-bold text-slate-500">Proposed: {coffeeChatDate} at {coffeeChatTime}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Propose a time to connect with {targetUser.name}. We'll notify her of your request!
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input 
                              type="date" 
                              value={coffeeChatDate}
                              onChange={(e) => setCoffeeChatDate(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Time</label>
                          <select
                            value={coffeeChatTime}
                            onChange={(e) => setCoffeeChatTime(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                          >
                            <option value="">-- Select Time --</option>
                            <option value="9:00 AM">9:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="1:00 PM">1:00 PM</option>
                            <option value="2:00 PM">2:00 PM</option>
                            <option value="3:00 PM">3:00 PM</option>
                            <option value="4:00 PM">4:00 PM</option>
                            <option value="5:00 PM">5:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmCoffeeChat}
                        disabled={isSchedulingCoffee || !coffeeChatDate || !coffeeChatTime}
                        className="w-full mt-4 rounded-xl bg-amber-500 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                      >
                        {isSchedulingCoffee ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Scheduling...</span>
                          </>
                        ) : (
                          <>
                            <Coffee className="h-4 w-4" />
                            <span>Propose Coffee Chat</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in" id="profile-management-screen">
      
      {/* HEADER HERO */}
      <div className="mb-8 rounded-3xl bg-primary p-6 sm:p-8 text-white relative overflow-hidden shadow-xl" id="profile-hero">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 hidden md:block">
          <div className="w-80 h-80 rounded-full bg-secondary filter blur-2xl translate-x-20 translate-y-20" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              Profile Management
            </span>
            <h1 className="mt-4 text-2xl sm:text-3xl font-heading font-extrabold">
              Refine Your Sisterhood Presence
            </h1>
            <p className="mt-2 text-xs text-white/70 max-w-xl">
              Upload a beautiful photo and describe your business milestones so mentors and fellow independent girls can discover, support, and collaborate with you.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 shrink-0 backdrop-blur-md border border-white/10">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-white/60 uppercase">Total Score</p>
              <p className="text-lg font-heading font-black text-accent">{currentUser.points} Pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: PHOTO UPLOAD */}
        <div className="space-y-6">
          {/* PROFILE COMPLETION BOX */}
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
             <h3 className="font-heading text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>Profile Completion</span>
             </h3>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Progress</span>
                <span className="text-xs font-black text-secondary">{completionPercentage}%</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-secondary transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
             </div>
             <ul className="space-y-2">
                {completionItems.map(item => (
                  <li key={item.id} className="flex items-center gap-2 text-[10px] font-bold">
                     {item.complete ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                     ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                     )}
                     <span className={item.complete ? "text-slate-400 line-through" : "text-primary"}>{item.label}</span>
                  </li>
                ))}
             </ul>
          </div>

          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm" id="avatar-management-card">
            <h3 className="font-heading text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-secondary" />
              <span>Profile Photo</span>
            </h3>

            {/* Current Avatar preview */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-slate-50 ring-4 ring-secondary/10 shadow-lg">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar preview" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 font-heading text-4xl font-extrabold text-primary">
                      {name ? name[0] : 'S'}
                    </div>
                  )}
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="text-center flex flex-col items-center">
                <p className="text-xs font-bold text-primary">{name || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{title || 'Independent Gal Member'}</p>
                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-full mt-2.5">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-secondary" />
                    {currentUser.followerIds?.length || 0} {(currentUser.followerIds?.length || 0) === 1 ? 'follower' : 'followers'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>
                    {currentUser.followingIds?.length || 0} following
                  </span>
                </div>
              </div>

              {/* Upload Drag & Drop Area */}
              <div 
                className={`w-full rounded-2xl border-2 border-dashed p-4 transition-all text-center cursor-pointer ${
                  dragActive 
                    ? 'border-secondary bg-secondary/5 scale-[0.98]' 
                    : 'border-slate-200 hover:border-secondary hover:bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                
                <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-[11px] font-bold text-primary">Drag and drop your photo</p>
                <p className="text-[9px] text-slate-400 mt-1">or <span className="text-secondary font-bold underline">browse files</span></p>
                <p className="text-[8px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP (Max 4MB)</p>
              </div>

              {/* Camera Section */}
              {!isCameraOpen ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take a Photo
                </button>
              ) : (
                <div className="w-full space-y-3 rounded-2xl border border-slate-200 p-3 bg-slate-50">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    {!capturedPhoto ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={capturedPhoto} 
                        alt="Captured" 
                        className="w-full h-full object-cover"
                        style={{ filter: activeFilter }}
                      />
                    )}
                  </div>
                  
                  {capturedPhoto && (
                    <div className="flex flex-wrap gap-1.5 justify-center py-1">
                      {PHOTO_FILTERS.map(f => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => setActiveFilter(f.value)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                            activeFilter === f.value 
                              ? 'bg-secondary text-white shadow-sm' 
                              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!capturedPhoto ? (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-white hover:bg-secondary/90 transition-all"
                      >
                        Capture
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyFilterAndSave}
                        className="flex-1 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-white hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="h-3 w-3" />
                        Apply & Upload
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Status Indicator */}
              {uploadMethod === 'storage' && (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-emerald-800 text-[10px] font-medium w-full">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="leading-tight text-left">Uploaded directly to storage service! (+15 Pts)</span>
                </div>
              )}

              {uploadMethod === 'local' && (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-amber-800 text-[10px] font-medium w-full">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="leading-tight text-left">Saved securely in browser offline storage (+10 Pts)</span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-rose-800 text-[10px] font-medium w-full">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span className="leading-tight text-left">{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rank Card */}
          <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-3">
              <Award className="h-6 w-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-heading font-extrabold text-primary">Member Standing</h4>
            <div className="mt-2 inline-block rounded-full bg-primary text-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {currentUser.rank || 'Learner'} Rank
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Unlock the <strong>Member</strong> and <strong>Mentor</strong> ranks by earning points through interactive workshops and connecting with sisters.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL EDIT FORM */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-150 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 mb-2">
              <h3 className="font-heading text-sm font-extrabold text-primary">
                Sister Information
              </h3>
              <p className="text-[10px] text-slate-400">Manage your credentials and business bio.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" />
                  <span>Full Name</span>
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>City & Country</span>
                </label>
                <input 
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lagos, Nigeria or Nairobi, Kenya"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-slate-400" />
                <span>Professional Headline</span>
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Aspiring Fashion Founder & Designer"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-slate-400" />
                <span>Industry</span>
              </label>
              <input 
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Technology"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-slate-400" />
                <span>Company</span>
              </label>
              <input 
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="My Awesome Startup"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <span>Website</span>
                </label>
                <input 
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://mysite.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  LinkedIn URL
                </label>
                <input 
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  GitHub URL
                </label>
                <input 
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Twitter URL
                </label>
                <input 
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-slate-400" />
                <span>Certifications</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="AWS Certified..."
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
                        setCertifications([...certifications, newCertification.trim()]);
                        setNewCertification('');
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {certifications.map(cert => (
                  <span key={cert} className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
                    {cert}
                    <button type="button" onClick={() => setCertifications(certifications.filter(c => c !== cert))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Biography / Venture Mission
              </label>
              <textarea 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your personal story and what independent venture you are building..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Venture Stage
                </label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                >
                  <option value="Idea Stage">Idea Stage / Discovery</option>
                  <option value="Early Stage">Early Stage Launch</option>
                  <option value="Growth Stage">Growth Stage / Scaling</option>
                  <option value="Established">Established Venture</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Mentorship Status
                </label>
                <select
                  value={mentoringCapacity}
                  onChange={(e) => setMentoringCapacity(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-primary focus:border-secondary focus:outline-none bg-slate-50/50"
                >
                  <option value="Seeking Match">Seeking Mentor Match</option>
                  <option value="Open">Open to Mentee Matches</option>
                  <option value="Limited">Limited Capacity Pairing</option>
                  <option value="No Capacity">No Capacity (Currently Full)</option>
                </select>
              </div>
            </div>

            {/* SKILLS TAGS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" />
                <span>Skills & Talents</span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-100 bg-slate-50/30">
                {skills.map(skill => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full p-0.5 hover:bg-primary/10 text-primary/60 hover:text-primary"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-[10px] text-slate-400 p-1">No skills specified yet.</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., Brand Strategy)"
                  className="flex-grow rounded-xl border border-slate-200 px-3 py-2 text-xs text-primary focus:border-secondary focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* INTERESTS TAGS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-slate-400" />
                <span>Venture Interests</span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-100 bg-slate-50/30">
                {interests.map(interest => (
                  <span 
                    key={interest}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/5 border border-secondary/15 px-2.5 py-1 text-[10px] font-semibold text-secondary"
                  >
                    <span>{interest}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveInterest(interest)}
                      className="rounded-full p-0.5 hover:bg-secondary/10 text-secondary/60 hover:text-secondary"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {interests.length === 0 && (
                  <span className="text-[10px] text-slate-400 p-1">No interests specified yet.</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest (e.g., Fair Trade)"
                  className="flex-grow rounded-xl border border-slate-200 px-3 py-2 text-xs text-primary focus:border-secondary focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-secondary hover:bg-secondary/90 px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg scale-100 hover:scale-[1.01]"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
