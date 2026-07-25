import React, { useState, useRef } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Lock, 
  Smartphone, 
  CreditCard, 
  LogOut,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mail,
  MapPin,
  Briefcase,
  Plus,
  Loader2,
  AlertTriangle,
  Palette,
  Key,
  Laptop,
  BadgeCheck,
  Share2,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Link2,
  Check,
  SmartphoneIcon,
  Flame,
  Award
} from 'lucide-react';
import { Member } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured, supabaseService } from '../supabase';
import { SensitiveActionModal } from './SensitiveActionModal';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { apiService } from '../api';

interface SettingsViewProps {
  currentUser: Member;
  onSaveProfile: (user: Member) => void;
  addPoints: (pts: number) => void;
}

export function SettingsView({ currentUser, onSaveProfile, addPoints }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy' | 'notifications' | 'verification' | 'display' | 'account'>('profile');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');

  // --- PROFILE TAB STATES ---
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [bio, setBio] = useState(currentUser.bio);
  const [city, setCity] = useState(currentUser.city);
  const [email, setEmail] = useState('sarah.j@example.com');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  
  // Social Links (Modern social media connections)
  const [website, setWebsite] = useState('https://sarahjenkins.design');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/sarahjenkins');
  const [instagram, setInstagram] = useState('https://instagram.com/sarahj_creates');
  const [twitter, setTwitter] = useState('https://twitter.com/sarah_codes');

  // --- PROFILE IMAGE UPLOAD ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'storage' | 'local' | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('This image exceeds 4MB. Please pick a smaller photo.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadMethod(null);

    if (isSupabaseConfigured()) {
      try {
        const publicUrl = await supabaseService.uploadAvatar(file);
        setAvatar(publicUrl);
        setUploadMethod('storage');
        addPoints(15);
      } catch (err: any) {
        console.warn('Supabase storage upload failed, falling back to local Base64:', err);
        await processLocalBase64(file);
      } finally {
        setIsUploading(false);
      }
    } else {
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
        addPoints(10);
        resolve();
      };
    });
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setUploadMethod(null);
    setUploadError(null);
  };

  const handleSaveProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSaveProfile({
      ...currentUser,
      name,
      title,
      bio,
      city,
      avatar
    });
    
    setIsSaving(false);
    setSuccessMessage('Profile Information Synchronized! (+25 Pts)');
    setShowSuccess(true);
    addPoints(25);
    setTimeout(() => setShowSuccess(false), 3000);
  };


  // --- SECURITY TAB STATES ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>(['BIG-4491-9230', 'BIG-5521-1294', 'BIG-8821-2904', 'BIG-3142-9908']);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // --- PROTECTION & TIMEOUT STATES ---
  const [emailVerifyRequired, setEmailVerifyRequired] = useState<boolean>(() => {
    return localStorage.getItem('big_v2_security_email_verify') === 'true';
  });
  const [codeVerifyRequired, setCodeVerifyRequired] = useState<boolean>(() => {
    return localStorage.getItem('big_v2_security_code_verify') === 'true';
  });
  const [securityPin, setSecurityPin] = useState<string>(() => {
    return localStorage.getItem('big_v2_security_pin') || '123456';
  });
  const [sessionTimeout, setSessionTimeout] = useState<string>(() => {
    return localStorage.getItem('big_v2_session_timeout') || 'never';
  });

  // --- SENSITIVE ACTION INTERACTION ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('');
  const [pendingActionType, setPendingActionType] = useState<'password_change' | null>(null);

  const handleTimeoutChange = (val: string) => {
    setSessionTimeout(val);
    localStorage.setItem('big_v2_session_timeout', val);
    addPoints(10);
    setSuccessMessage(`Session timeout updated to ${val === 'never' ? 'Never' : val + ' min(s)'}! Security audited. (+10 Pts)`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleToggleEmailVerify = () => {
    const nextVal = !emailVerifyRequired;
    setEmailVerifyRequired(nextVal);
    localStorage.setItem('big_v2_security_email_verify', String(nextVal));
    if (nextVal) {
      addPoints(20);
      setSuccessMessage('Email verification requirement activated! (+20 Pts)');
    } else {
      setSuccessMessage('Email verification requirement deactivated.');
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleToggleCodeVerify = () => {
    const nextVal = !codeVerifyRequired;
    setCodeVerifyRequired(nextVal);
    localStorage.setItem('big_v2_security_code_verify', String(nextVal));
    if (nextVal) {
      addPoints(20);
      setSuccessMessage('Security PIN Code requirement activated! (+20 Pts)');
    } else {
      setSuccessMessage('Security PIN Code requirement deactivated.');
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePinChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setSecurityPin(cleanVal);
  };

  // Active Login Sessions (Simulating modern session management)
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'iPhone 15 Pro', os: 'iOS 17.4', location: 'Nairobi, Kenya', active: true, ip: '197.248.31.55', time: 'Active now', icon: Smartphone },
    { id: 'sess-2', device: 'MacBook Pro 16"', os: 'macOS Sonoma', location: 'Nairobi, Kenya', active: false, ip: '197.248.31.55', time: '2 hours ago', icon: Laptop },
    { id: 'sess-3', device: 'Chrome on Windows 11', os: 'Windows 11', location: 'Mombasa, Kenya', active: false, ip: '102.219.208.12', time: 'July 12, 10:45 AM', icon: Laptop },
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    addPoints(10);
    setSuccessMessage('Device Session Revoked Successfully! Security audited. (+10 Pts)');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const executePasswordChange = async () => {
    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Password changed securely! Security index updated. (+15 Pts)');
    setShowSuccess(true);
    addPoints(15);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleVerifySuccess = () => {
    if (pendingActionType === 'password_change') {
      executePasswordChange();
    }
    setPendingActionType(null);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New Password and Confirmation do not match.');
      return;
    }
    
    if (emailVerifyRequired || codeVerifyRequired) {
      setPendingActionType('password_change');
      setAuthActionName('Change Account Password');
      setIsAuthModalOpen(true);
    } else {
      executePasswordChange();
    }
  };

  const handleRegenerateBackupCodes = () => {
    const codes = Array.from({ length: 4 }, () => 
      `BIG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    );
    setBackupCodes(codes);
  };


  // --- PRIVACY TAB STATES ---
  const [stealthMode, setStealthMode] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDiscovery, setAllowDiscovery] = useState(true);
  const [messagePermissions, setMessagePermissions] = useState<'everyone' | 'connections' | 'mentors'>('connections');
  
  // Blocked Users Management
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'b1', name: 'Anonymous Bot 01', title: 'Syndicated Content Spammer' },
    { id: 'b2', name: 'Unsolicited Ads Co', title: 'Marketing automation bot' }
  ]);
  const [newBlockName, setNewBlockName] = useState('');

  const handleAddBlockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName.trim()) return;
    setBlockedUsers([...blockedUsers, { id: 'b-' + Date.now(), name: newBlockName, title: 'Custom blocked account' }]);
    setNewBlockName('');
    setSuccessMessage(`Account "${newBlockName}" added to blocklist.`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUnblockUser = (id: string, name: string) => {
    setBlockedUsers(blockedUsers.filter(u => u.id !== id));
    setSuccessMessage(`Account "${name}" unblocked successfully.`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };


  // --- NOTIFICATIONS TAB STATES ---
  const [notifConnection, setNotifConnection] = useState(true);
  const [notifCircle, setNotifCircle] = useState(true);
  const [notifDM, setNotifDM] = useState(true);
  const [notifEvent, setNotifEvent] = useState(false);
  const [notifNews, setNotifNews] = useState(false);

  // Modern Social Media "Quiet Mode" Schedule
  const [quietMode, setQuietMode] = useState(false);
  const [quietFrom, setQuietFrom] = useState('22:00');
  const [quietTo, setQuietTo] = useState('07:00');

  const handleToggleQuietMode = (val: boolean) => {
    setQuietMode(val);
    if (val) {
      addPoints(15);
      setSuccessMessage('Quiet Mode scheduled! Digital boundaries applied. (+15 Pts)');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };


  // --- VERIFICATION TAB STATES (The Blue Tick workflow) ---
  const [verifyCategory, setVerifyCategory] = useState('Founder & Entrepreneur');
  const [verifyDocType, setVerifyDocType] = useState('business_reg');
  const [verifyLink, setVerifyLink] = useState('https://linkedin.com/in/sarahjenkins');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'submitting' | 'pending' | 'verified'>('idle');
  const [verifyFile, setVerifyFile] = useState<string | null>(null);
  const [dragActiveVerify, setDragActiveVerify] = useState(false);

  const handleVerifyDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveVerify(true);
    } else if (e.type === "dragleave") {
      setDragActiveVerify(false);
    }
  };

  const handleVerifyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveVerify(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVerifyFile(e.dataTransfer.files[0].name);
    }
  };

  const handleVerifyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerifyFile(e.target.files[0].name);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile && !verifyLink) {
      alert('Please provide a LinkedIn link or upload a verification document.');
      return;
    }
    setVerificationStatus('submitting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setVerificationStatus('verified'); // Approve instantly in preview for satisfaction!
    addPoints(100); // 100 Pts verification award!
    setSuccessMessage('Congratulations! Profile Verification Approved instantly! (+100 Pts)');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };


  // --- DISPLAY & STYLING TAB STATES (Modern UI customizer) ---
  const [accentPreset, setAccentPreset] = useState<'rose' | 'indigo' | 'emerald' | 'amber' | 'violet'>('rose');

  const colorPresets = [
    { id: 'rose', name: 'Sisterhood Rose', primaryColor: '#ec4899', bgClass: 'bg-rose-500', textClass: 'text-rose-600', ringClass: 'ring-rose-200' },
    { id: 'indigo', name: 'Empowerment Indigo', primaryColor: '#4f46e5', bgClass: 'bg-indigo-500', textClass: 'text-indigo-600', ringClass: 'ring-indigo-200' },
    { id: 'emerald', name: 'Eco Growth Teal', primaryColor: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600', ringClass: 'ring-emerald-200' },
    { id: 'amber', name: 'Gold Coast Amber', primaryColor: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-600', ringClass: 'ring-amber-200' },
    { id: 'violet', name: 'Leaderboard Violet', primaryColor: '#8b5cf6', bgClass: 'bg-violet-500', textClass: 'text-violet-600', ringClass: 'ring-violet-200' },
  ];

  const handleApplyAccent = () => {
    addPoints(10);
    setSuccessMessage(`Visual theme updated to "${colorPresets.find(p => p.id === accentPreset)?.name}"! (+10 Pts)`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };


  // --- TABS DEFINITION ---
  const tabs = [
    { id: 'profile', label: 'Profile & Socials', icon: User },
    { id: 'security', label: 'Security & Sessions', icon: Lock },
    { id: 'privacy', label: 'Privacy & Blocklist', icon: Shield },
    { id: 'notifications', label: 'Notifications Schedule', icon: Bell },
    { id: 'verification', label: 'Verified Badge', icon: BadgeCheck },
    { id: 'display', label: 'Display & Accent', icon: Palette },
    { id: 'account', label: 'Billing Plan', icon: CreditCard },
  ];

  const activePresetInfo = colorPresets.find(p => p.id === accentPreset) || colorPresets[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-heading font-black text-primary uppercase tracking-tight">
              System <span className="text-secondary">Settings</span>
            </h1>
            {verificationStatus === 'verified' && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white animate-pulse" title="Verified Account">
                <BadgeCheck className="h-4 w-4" />
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">
            Configure your digital footprint, sync secure device sessions, verify your identity, and set boundary schedules.
          </p>
        </div>
        
        {/* Network Capital Widget */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl px-5 py-3">
          <Award className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 leading-none">Security Score</div>
            <div className="text-sm font-black text-amber-950 mt-1">BIG Founding Partner</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3">
          {/* MOBILE DROPDOWN */}
          <div className="lg:hidden mb-4 relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700"
            >
              {tabs.find(t => t.id === activeTab)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        active ? 'bg-primary/5 text-secondary' : 'hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex flex-col gap-1.5 pb-4 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    active 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-primary'
                  }`}
                  id={`settings-tab-${tab.id}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 hidden lg:block p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
             <div className="flex items-center gap-2 text-primary">
               <Smartphone className="h-4.5 w-4.5 text-secondary" />
               <span className="text-[10px] font-black uppercase tracking-widest">Mobile Cloud Sync</span>
             </div>
             <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
               All settings synchronize automatically. The BIG platform is fortified with end-to-end cloud protection.
             </p>
             <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block">
               ● Systems Connected
             </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* PROFILE & SOCIALS TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10"
                >
                  <form onSubmit={handleSaveProfileForm} className="space-y-8">
                    {/* AVATAR SECTION */}
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-slate-50">
                      <div 
                        className={`relative group cursor-pointer transition-all ${
                          dragActive ? 'scale-[0.97] ring-4 ring-secondary/20' : ''
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
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-slate-50">
                          {avatar ? (
                            <img src={avatar || null} className="h-full w-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 font-heading text-2xl font-extrabold text-primary">
                              {name ? name[0] : 'S'}
                            </div>
                          )}
                          
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary text-white flex items-center justify-center border-2 border-white shadow-lg">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">Identity & Portrait</h3>
                          {verificationStatus === 'verified' && (
                            <span className="flex items-center gap-1 text-[10px] bg-pink-50 text-pink-700 font-extrabold px-2 py-0.5 rounded-full border border-pink-100">
                              <BadgeCheck className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                              <span>Verified Portfolio</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-400">Add a professional face photo to increase direct trust within the Sisterhood. Drag-drop or browse.</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all"
                          >
                            Upload Photo
                          </button>
                          {avatar && (
                            <button 
                              type="button" 
                              onClick={handleRemoveAvatar}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {uploadError && (
                          <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-3 py-1.5 text-rose-800 text-[10px] font-medium max-w-sm mx-auto md:mx-0">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <User className="h-3 w-3" /> Full Name
                        </label>
                        <input 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-xs font-medium outline-none focus:border-secondary transition-all"
                          placeholder="Sarah Jenkins"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Mail className="h-3 w-3" /> Email Address
                        </label>
                        <input 
                          disabled
                          value={email}
                          className="w-full bg-slate-100 rounded-xl border border-slate-100 px-4 py-3 text-xs font-medium text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Briefcase className="h-3 w-3" /> Professional Designation
                        </label>
                        <input 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-xs font-medium outline-none focus:border-secondary transition-all"
                          placeholder="Design Strategist & Founder"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <MapPin className="h-3 w-3" /> Current City
                        </label>
                        <input 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-xs font-medium outline-none focus:border-secondary transition-all"
                          placeholder="Nairobi, Kenya"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Manifesto (Bio)</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-xs font-medium outline-none focus:border-secondary transition-all resize-none"
                        placeholder="Define your mission, startup strategy, or co-founder needs..."
                      />
                    </div>

                    {/* SOCIAL NETWORKS (Connecting modern social accounts) */}
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                          <Share2 className="h-4 w-4 text-secondary" />
                          Connected Social Accounts
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">Cross-reference your portfolios to increase networking success indicators by 300%.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">LinkedIn Profile URL</label>
                          <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                            <span className="bg-slate-100 px-3 py-3 text-[10px] font-bold text-slate-500 border-r border-slate-150">IN</span>
                            <input 
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                              className="w-full bg-transparent px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Personal Website Portfolio</label>
                          <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                            <span className="bg-slate-100 px-3 py-3 text-[10px] font-bold text-slate-500 border-r border-slate-150">URL</span>
                            <input 
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              className="w-full bg-transparent px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Instagram Handle</label>
                          <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                            <span className="bg-slate-100 px-3 py-3 text-[10px] font-bold text-slate-500 border-r border-slate-150">IG</span>
                            <input 
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              className="w-full bg-transparent px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">X / Twitter Handle</label>
                          <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                            <span className="bg-slate-100 px-3 py-3 text-[10px] font-bold text-slate-500 border-r border-slate-150">X</span>
                            <input 
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
                              className="w-full bg-transparent px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                         <Globe className="h-4 w-4" /> Public Portfolio Visibility
                       </span>
                       <button 
                         type="submit"
                         disabled={isSaving}
                         className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                       >
                         {isSaving ? (
                           <Loader2 className="h-4 w-4 animate-spin text-accent" />
                         ) : (
                           <Save className="h-4 w-4 text-accent" />
                         )}
                         {isSaving ? 'Synchronizing...' : 'Save Profile Details'}
                       </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* SECURITY & SESSIONS TAB */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10 space-y-10"
                >
                  {/* Password Modification */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Security Credentials</h3>
                      <p className="text-xs font-medium text-slate-400">Update your access key to safeguard account data integrity.</p>
                    </div>
                    
                    <form onSubmit={handleUpdatePassword} className="md:col-span-8 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Current Password</label>
                        <input 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5 text-xs font-medium outline-none focus:border-secondary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">New Password</label>
                          <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5 text-xs font-medium outline-none focus:border-secondary transition-all"
                            placeholder="Min. 8 characters"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Confirm Password</label>
                          <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5 text-xs font-medium outline-none focus:border-secondary transition-all"
                            placeholder="Re-type new password"
                          />
                        </div>
                      </div>

                      <PasswordStrengthIndicator password={newPassword} />

                      <button 
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {isUpdatingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> : <Key className="h-3.5 w-3.5 text-accent" />}
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Two-Factor Auth</h3>
                      <p className="text-xs font-medium text-slate-400">Increase defense index by blocking unauthorized browser logins.</p>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="space-y-1 max-w-[75%]">
                          <p className="text-xs font-black text-primary uppercase tracking-tight flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                            Authenticator App Protection
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">Verify login sessions with secure rolling 6-digit keys.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setTwoFactorEnabled(!twoFactorEnabled);
                            if(!twoFactorEnabled) {
                              addPoints(20);
                              setSuccessMessage('2FA Security Layer Enabled! Backup codes generated. (+20 Pts)');
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 3000);
                            }
                          }}
                          className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {twoFactorEnabled && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-2xl bg-slate-900 text-white space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-accent flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> Emergency Backup Codes
                            </p>
                            <button 
                              onClick={handleRegenerateBackupCodes}
                              className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-white"
                            >
                              Regenerate
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-slate-300 leading-relaxed">Save these recovery keys in a safe, offline location. Each key can be used once if you lose device access.</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-center font-mono text-[10px] font-bold text-slate-200">
                            {backupCodes.map((code, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/5 py-2.5 rounded-lg select-all cursor-pointer hover:bg-white/10 transition-all">
                                {code}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Sensitive Action Protection & Timeout Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Access & Inactivity</h3>
                      <p className="text-xs font-medium text-slate-400">Configure safety margins for active sessions and sensitive transaction verifications.</p>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                      {/* Session Timeout */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-primary uppercase tracking-tight flex items-center gap-1.5">
                              <Laptop className="h-4 w-4 text-pink-500" />
                              Session Inactivity Timeout
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">Automatically logs you out after periods of total inactivity.</p>
                          </div>
                          <select
                            value={sessionTimeout}
                            onChange={(e) => handleTimeoutChange(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:border-secondary"
                          >
                            <option value="never">Never (Off)</option>
                            <option value="1">1 Minute (Test)</option>
                            <option value="5">5 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="60">1 Hour</option>
                          </select>
                        </div>
                      </div>

                      {/* Email Verification Toggle */}
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="space-y-1 max-w-[75%]">
                          <p className="text-xs font-black text-primary uppercase tracking-tight flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-pink-500" />
                            Require Email Verification
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">Require a one-time verification code sent to your registered email before executing sensitive actions.</p>
                        </div>
                        <button 
                          onClick={() => handleToggleEmailVerify()}
                          className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors ${emailVerifyRequired ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${emailVerifyRequired ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Security PIN Code Toggle */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 max-w-[75%]">
                            <p className="text-xs font-black text-primary uppercase tracking-tight flex items-center gap-1.5">
                              <Lock className="h-4 w-4 text-pink-500" />
                              Require Security PIN Code
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">Prompt for a customized 6-digit security code/PIN before authorizing sensitive actions.</p>
                          </div>
                          <button 
                            onClick={() => handleToggleCodeVerify()}
                            className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors ${codeVerifyRequired ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          >
                            <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${codeVerifyRequired ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {codeVerifyRequired && (
                          <div className="pt-3 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Configure 6-Digit PIN</label>
                              <p className="text-[9px] text-slate-400 leading-normal">Set your personal authorize-key (default: 123456).</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="password"
                                maxLength={6}
                                value={securityPin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                className="bg-white border border-slate-250 rounded-xl px-3 py-2 w-28 text-center font-mono text-sm font-black tracking-widest text-slate-850 outline-none focus:border-secondary"
                                placeholder="123456"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (securityPin.length !== 6) {
                                    alert('PIN must be exactly 6 digits.');
                                    return;
                                  }
                                  try {
                                    await apiService.setPin(securityPin);
                                    addPoints(15);
                                    setSuccessMessage('Security PIN saved securely on the server! (+15 Pts)');
                                    setShowSuccess(true);
                                    setTimeout(() => setShowSuccess(false), 3000);
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to save PIN.');
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                Set PIN
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Device List & Revocation (The Session Manager) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Active Devices</h3>
                      <p className="text-xs font-medium text-slate-400">Monitor and revoke devices logged into your account in real-time.</p>
                    </div>

                    <div className="md:col-span-8 space-y-3.5">
                      <AnimatePresence>
                        {sessions.map((session) => {
                          const Icon = session.icon;
                          return (
                            <motion.div 
                              key={session.id}
                              initial={{ opacity: 1 }}
                              exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                              className="p-4 border border-slate-100 rounded-2xl bg-white flex items-center justify-between group hover:border-slate-200/80 hover:shadow-md hover:shadow-slate-100/30 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${session.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                  <Icon className="h-5.5 w-5.5" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-primary uppercase tracking-tight">{session.device}</span>
                                    {session.active && (
                                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 animate-pulse">
                                        Active Now
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold flex flex-wrap items-center gap-x-2">
                                    <span>{session.os}</span>
                                    <span>•</span>
                                    <span>{session.location}</span>
                                    <span>•</span>
                                    <span className="font-mono text-[9px]">{session.ip}</span>
                                  </div>
                                </div>
                              </div>

                              {!session.active && (
                                <button 
                                  onClick={() => handleRevokeSession(session.id)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Revoke session access"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRIVACY & BLOCKTAB */}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10 space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Profile Confidentiality</h3>
                      <p className="text-xs font-medium text-slate-400">Control who views your updates and direct messages.</p>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      {/* Stealth Mode */}
                      <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="text-xs font-black text-primary uppercase tracking-tight">Stealth Profile Mode</p>
                          <p className="text-[10px] font-medium text-slate-400">Temporarily hide from search suggestions and matching algorithms.</p>
                        </div>
                        <button 
                          onClick={() => setStealthMode(!stealthMode)}
                          className={`h-5.5 w-10 rounded-full p-0.5 cursor-pointer transition-colors ${stealthMode ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                          <div className={`h-4.5 w-4.5 rounded-full bg-white shadow-md transition-transform ${stealthMode ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Online status */}
                      <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="text-xs font-black text-primary uppercase tracking-tight">Show Connection Status</p>
                          <p className="text-[10px] font-medium text-slate-400">Display a green online signal indicator on your public dashboard.</p>
                        </div>
                        <button 
                          onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                          className={`h-5.5 w-10 rounded-full p-0.5 cursor-pointer transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                          <div className={`h-4.5 w-4.5 rounded-full bg-white shadow-md transition-transform ${showOnlineStatus ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Direct Message Filters */}
                      <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-primary uppercase tracking-tight">Direct Messaging Filters</p>
                          <p className="text-[10px] font-medium text-slate-400">Restrain incoming spam messages and cold network requests.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {[
                            { id: 'everyone', label: 'Everyone' },
                            { id: 'connections', label: 'My Connections' },
                            { id: 'mentors', label: 'Coaches Only' }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setMessagePermissions(opt.id as any)}
                              className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                                messagePermissions === opt.id 
                                  ? 'bg-primary text-white border-primary shadow-sm' 
                                  : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blocklist Manager */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Blocked Accounts</h3>
                      <p className="text-xs font-medium text-slate-400">Permanently mute specific users or automated agents.</p>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <form onSubmit={handleAddBlockUser} className="flex gap-2">
                        <input 
                          value={newBlockName}
                          onChange={(e) => setNewBlockName(e.target.value)}
                          placeholder="Type profile handle or name..."
                          className="w-full bg-slate-50 rounded-xl border border-slate-150 px-4 py-2.5 text-xs font-medium outline-none"
                        />
                        <button 
                          type="submit"
                          className="px-5 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0"
                        >
                          Block Account
                        </button>
                      </form>

                      <div className="space-y-2">
                        {blockedUsers.length === 0 ? (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                            No blocked profiles on this account.
                          </div>
                        ) : (
                          blockedUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                <p className="text-xs font-black text-primary uppercase tracking-tight leading-none">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{user.title}</p>
                              </div>
                              <button
                                onClick={() => handleUnblockUser(user.id, user.name)}
                                className="text-[9px] font-black uppercase tracking-wider text-secondary hover:text-rose-600 bg-white border border-slate-150 px-3 py-1.5 rounded-lg transition-all"
                              >
                                Restore
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10 space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Push Signal Rules</h3>
                      <p className="text-xs font-medium text-slate-400">Configure real-time smartphone notification thresholds.</p>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      {[
                        { title: 'Connection Requests', desc: 'Alert when a sister triggers a networking handshake request.', state: notifConnection, setState: setNotifConnection },
                        { title: 'Circle Discussions', desc: 'Alert when someone mentions your name or comments on joined circles.', state: notifCircle, setState: setNotifCircle },
                        { title: 'Direct Instant Messaging', desc: 'Send smartphone vibrations for incoming private mail signals.', state: notifDM, setState: setNotifDM },
                        { title: 'Local Event Reminders', desc: 'Alert 24 hours prior to registered community workshops.', state: notifEvent, setState: setNotifEvent },
                        { title: 'Sourcing Opportunities', desc: 'Weekly summaries of microfinance funding and exports.', state: notifNews, setState: setNotifNews },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white group hover:border-slate-200 transition-all">
                          <div className="space-y-0.5 max-w-[75%]">
                            <p className="text-xs font-black text-primary uppercase tracking-tight">{item.title}</p>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => item.setState(!item.state)}
                            className={`h-5.5 w-10 rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${item.state ? 'bg-primary' : 'bg-slate-200'}`}
                          >
                            <div className={`h-4.5 w-4.5 rounded-full bg-white shadow-md transition-transform ${item.state ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Mode scheduling */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">Quiet Mode Schedule</h3>
                      <p className="text-xs font-medium text-slate-400">Enforce focus boundaries. Mute notifications automatically during rest.</p>
                    </div>

                    <div className="md:col-span-8 space-y-5">
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/50">
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="text-xs font-black text-indigo-900 uppercase tracking-tight flex items-center gap-1.5">
                            <Flame className="h-4.5 w-4.5 text-secondary animate-pulse" />
                            Enable Quiet Hours
                          </p>
                          <p className="text-[10px] font-medium text-indigo-700 leading-tight">Vibrations & push badges are muted automatically on scheduled timelines.</p>
                        </div>
                        <button 
                          onClick={() => handleToggleQuietMode(!quietMode)}
                          className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${quietMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                          <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${quietMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {quietMode && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Quiet From</label>
                            <input 
                              type="time" 
                              value={quietFrom} 
                              onChange={(e) => setQuietFrom(e.target.value)}
                              className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Quiet Until</label>
                            <input 
                              type="time" 
                              value={quietTo} 
                              onChange={(e) => setQuietTo(e.target.value)}
                              className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VERIFIED BADGE TAB */}
              {activeTab === 'verification' && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10 space-y-8"
                >
                  <div className="text-center max-w-xl mx-auto space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                      <BadgeCheck className="h-8 w-8 text-pink-500 fill-pink-100" />
                    </div>
                    <h2 className="text-xl font-heading font-black text-primary uppercase tracking-tight">Request Account Verification</h2>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      Verify your identity to claim an exclusive <strong className="text-pink-500">BIG Verified Sister Badge</strong>. This increases your platform authority rank and establishes peer credibility.
                    </p>
                  </div>

                  {verificationStatus === 'verified' ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-8 rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50/50 to-indigo-50/20 text-center space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="relative">
                          <img src={avatar || "/images/african_woman_portrait_1_1784708232425.jpg"} className="h-20 w-20 rounded-full border-4 border-white shadow-xl object-cover" alt="Avatar" />
                          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-white border-2 border-white shadow-md">
                            <BadgeCheck className="h-4.5 w-4.5" />
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{name}</h4>
                          <BadgeCheck className="h-5 w-5 text-pink-500 fill-pink-500" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500">{title}</p>
                        <p className="text-[10px] text-pink-600 font-extrabold uppercase tracking-widest pt-1">Verify Category: {verifyCategory}</p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-5 py-2 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Instant Verification Active (+100 Pts Credited)</span>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitVerification} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/40 space-y-6 max-w-2xl mx-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Professional Category</label>
                          <select 
                            value={verifyCategory} 
                            onChange={(e) => setVerifyCategory(e.target.value)}
                            className="w-full bg-white border border-slate-150 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option>Founder & Entrepreneur</option>
                            <option>Mentoring Lead & Expert</option>
                            <option>Community Creator</option>
                            <option>Venture Coach & Investor</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Proof of Identification</label>
                          <select 
                            value={verifyDocType} 
                            onChange={(e) => setVerifyDocType(e.target.value)}
                            className="w-full bg-white border border-slate-150 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="business_reg">Business Reg. Certificate</option>
                            <option value="national_id">National Passport/ID card</option>
                            <option value="linkedin">LinkedIn Professional Sync</option>
                          </select>
                        </div>
                      </div>

                      {verifyDocType === 'linkedin' ? (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">LinkedIn Verified Link</label>
                          <input 
                            value={verifyLink} 
                            onChange={(e) => setVerifyLink(e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="w-full bg-white border border-slate-150 rounded-xl px-4 py-2.5 text-xs font-medium outline-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Verification Document File</label>
                          <div 
                            onDragEnter={handleVerifyDrag}
                            onDragOver={handleVerifyDrag}
                            onDragLeave={handleVerifyDrag}
                            onDrop={handleVerifyDrop}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                              dragActiveVerify ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="verify-file-input"
                              onChange={handleVerifyFileChange}
                              className="hidden" 
                            />
                            <label htmlFor="verify-file-input" className="cursor-pointer space-y-2 block">
                              <div className="flex justify-center">
                                <Link2 className="h-6 w-6 text-slate-400" />
                              </div>
                              {verifyFile ? (
                                <p className="text-xs font-black text-slate-800">{verifyFile}</p>
                              ) : (
                                <>
                                  <p className="text-xs font-black text-slate-600">Drag & Drop verification document or <span className="text-secondary">Browse</span></p>
                                  <p className="text-[9px] text-slate-400 font-medium">PDF, PNG, JPG accepted (Max 5MB)</p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={verificationStatus === 'submitting'}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
                      >
                        {verificationStatus === 'submitting' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        ) : (
                          <BadgeCheck className="h-4.5 w-4.5 text-accent" />
                        )}
                        {verificationStatus === 'submitting' ? 'Authenticating documents...' : 'Submit Verification Request (+100 Pts)'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {/* DISPLAY ACCENT TAB */}
              {activeTab === 'display' && (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">Display Accent Theme</h3>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                          Personalize your dashboard interface experience. Choose an identity color accent that matches your brand aura.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Available Color Presets</p>
                        <div className="flex flex-col gap-2">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => setAccentPreset(preset.id as any)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                accentPreset === preset.id 
                                  ? 'bg-slate-50 border-primary scale-[1.02] shadow-sm' 
                                  : 'bg-white border-slate-150 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`h-4.5 w-4.5 rounded-full ${preset.bgClass} shrink-0`} />
                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{preset.name}</span>
                              </div>
                              {accentPreset === preset.id && <Check className="h-4 w-4 text-primary stroke-[3px]" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleApplyAccent}
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        <Palette className="h-4.5 w-4.5 text-accent" />
                        Apply Theme Accent (+10 Pts)
                      </button>
                    </div>

                    {/* LIVE PREVIEW MODULE */}
                    <div className="md:col-span-6 flex justify-center">
                      <div className="w-64 rounded-3xl border border-slate-150 bg-slate-50 p-4 shadow-xl relative overflow-hidden">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 text-center">Live Preview</div>
                        
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800">S</div>
                            <div>
                              <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{name}</div>
                              <div className="text-[9px] text-slate-400 font-bold">{title}</div>
                            </div>
                          </div>

                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: activePresetInfo.primaryColor, width: '65%' }} />
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold">Progress</span>
                            <span className="font-extrabold" style={{ color: activePresetInfo.primaryColor }}>65%</span>
                          </div>

                          <button 
                            className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all duration-300"
                            style={{ backgroundColor: activePresetInfo.primaryColor }}
                          >
                            Connect Sister
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACCOUNT BILLING PLAN TAB */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 md:p-10 space-y-10"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">Subscription Hub</h3>
                      <p className="text-xs font-medium text-slate-400">You are on the highly privileged BIG Founding Partner membership tier.</p>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-white">
                      <div className="absolute -top-4 -right-4 h-24 w-24 bg-secondary/15 rounded-full blur-2xl" />
                      
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-accent shrink-0 border border-slate-800">
                            <CreditCard className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-1.5">
                              <Award className="h-4 w-4" />
                              Founding Partner
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">Unlimited course licensing & VIP events access. Renewal: July 15, 2027</p>
                         </div>
                      </div>
                      
                      <button className="px-5 py-2.5 rounded-lg bg-white text-slate-950 text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0">
                        Manage Plan Billing
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <h3 className="text-lg font-heading font-black text-rose-600 uppercase tracking-tight">Danger Zone</h3>
                      <p className="text-xs font-medium text-slate-400">Irreversible modifications regarding your community record history.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 group transition-all text-left">
                        <div>
                          <p className="text-xs font-black text-rose-600 uppercase tracking-tight">Deactivate Presence</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 leading-none">Temporarily hide your profile from listings.</p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-rose-300 group-hover:text-rose-500" />
                      </button>
                      
                      <button className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-slate-150 bg-white hover:border-rose-200 group transition-all text-left">
                        <div>
                          <p className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-rose-600">Delete Permanently</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 leading-none">Erase all points, courses, and chat archives.</p>
                        </div>
                        <LogOut className="h-5 w-5 text-slate-350 group-hover:text-rose-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>

      <SensitiveActionModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleVerifySuccess}
        actionName={authActionName}
      />

      {/* SUCCESS TRANSITION BANNER */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3.5 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/5"
          >
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
            <div className="space-y-0.5">
               <p className="text-xs font-black uppercase tracking-widest text-accent leading-none">System Synchronized</p>
               <p className="text-[10px] font-medium opacity-90 leading-none">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
