import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, ShieldCheck, Coins, Landmark, Megaphone, ArrowRight, CheckCircle2, 
  ShieldAlert, MapPin, Users, Globe, BarChart3, TrendingUp, Download, Plus, 
  Pause, Play, Edit3, X, CreditCard, Send, Lock, Calendar, ClipboardCheck, 
  Sparkles, AlertCircle, Phone, Search, SlidersHorizontal, BookOpen, RefreshCw, 
  HelpCircle, Sparkle, LayoutDashboard, UserCheck, FileText
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { getSafeSrc } from '../lib/utils';
import { SensitiveActionModal } from './SensitiveActionModal';
import { MpesaStkModal } from './MpesaStkModal';
import { ContributionReceiptModal, ReceiptData } from './ContributionReceiptModal';
import { CampaignCard } from './CampaignCard';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { apiService } from '../api';
import { 
  Campaign, Donation, MonthlySupporter, ImpactStory, 
  CampaignBudget, CampaignTimeline, CampaignUpdate 
} from '../data';

interface BIGFundViewProps {
  setCurrentView: (view: string) => void;
  isAuthenticated?: boolean;
  triggerSimulatedEmail?: (subject: string, body: string) => void;
}

// Coordinate mappings for Kenya regional chapters on a 400x300 schematic canvas
const CHAPTERS = [
  { id: 'nbi', name: 'Nairobi (HQ)', x: 200, y: 180, color: '#FFD700', stats: 'KES 4.5M allocated • 220 scholars trained • 35 tech micro-grants' },
  { id: 'eld', name: 'Eldoret', x: 120, y: 120, color: '#FF1493', stats: 'KES 2.1M allocated • 85 single mothers sponsored • 15 mutual-aid rescues' },
  { id: 'ksm', name: 'Kisumu', x: 80, y: 150, color: '#9333ea', stats: 'KES 1.85M allocated • 45 leadership bootcamp leaders • 9 co-ops' },
  { id: 'mba', name: 'Mombasa', x: 320, y: 240, color: '#FF1493', stats: 'KES 1.6M allocated • 60 tech micro-grants • 4 creative workshops' },
  { id: 'nyr', name: 'Nyeri', x: 220, y: 135, color: '#a855ff', stats: 'KES 1.2M allocated • 12 cold-storage agro-exporter matches' },
  { id: 'gar', name: 'Garissa', x: 300, y: 150, color: '#FFD700', stats: 'KES 950K allocated • 30 digital literacy scholarships • 15 solar computer kiosks' }
];

// Synth chord player for high-fidelity transactional audio feedback
const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(392.00, audioCtx.currentTime); // G4
    osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.12); // C5
    
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.6);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.6);
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.warn("Synth audio context failed or blocked by autoplay permissions:", e);
  }
};

// Name hashing helper to generate beautiful dynamic gradient profiles
const getNameGradient = (name: string) => {
  const colors = [
    'from-secondary to-primary',
    'from-accent to-secondary',
    'from-primary to-secondary',
    'from-secondary to-pink-400',
    'from-accent to-pink-500',
    'from-secondary to-yellow-300'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export function BIGFundView({ setCurrentView, isAuthenticated = false, triggerSimulatedEmail }: BIGFundViewProps) {
  // Navigation tabs: 'overview' | 'campaigns' | 'transparency' | 'impact'
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'transparency' | 'impact'>('overview');

  // Database States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [monthlySupporters, setMonthlySupporters] = useState<MonthlySupporter[]>([]);
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Recognition Wall States
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string>('');
  const [sessionDonationIds, setSessionDonationIds] = useState<string[]>([]);
  const [recognitionSearch, setRecognitionSearch] = useState<string>('');
  const [recognitionFilter, setRecognitionFilter] = useState<'all' | 'public' | 'anonymous'>('all');

  // Filter States (Campaigns)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [campaignSearch, setCampaignSearch] = useState<string>('');

  // Slider/Detail Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Donation Form States
  const [donationAmount, setDonationAmount] = useState<number>(2500);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [isMonthly, setIsMonthly] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [paymentProvider, setPaymentProvider] = useState<'mpesa' | 'flutterwave' | 'stripe' | 'visa' | 'mastercard'>('mpesa');

  // M-Pesa STK Simulator States
  const [mpesaPhone, setMpesaPhone] = useState<string>('254712345678');
  const [activeCheckoutRequestId, setActiveCheckoutRequestId] = useState<string>('');
  const [mpesaCustomerMessage, setMpesaCustomerMessage] = useState<string>('');
  const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState<string>('');
  const [isSimulatingMpesa, setIsSimulatingMpesa] = useState<boolean>(false);
  const [mpesaCountdown, setMpesaCountdown] = useState<number>(25);
  const [mpesaPin, setMpesaPin] = useState<string>('');
  const [mpesaStatus, setMpesaStatus] = useState<'waiting_pin' | 'processing' | 'success' | 'failed'>('waiting_pin');

  // Dedicated M-Pesa STK Push Modal
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState<boolean>(false);
  const [mpesaModalTitle, setMpesaModalTitle] = useState<string>('BIG Fund Community Initiative');
  const [mpesaModalId, setMpesaModalId] = useState<string>('BIGFUND');
  const [mpesaModalAmt, setMpesaModalAmt] = useState<number>(1000);

  const openMpesaStkPushModal = (title?: string, id?: string, amount?: number) => {
    setMpesaModalTitle(title || 'BIG Fund Community Initiative');
    setMpesaModalId(id || 'BIGFUND');
    setMpesaModalAmt(amount || 1000);
    setIsMpesaModalOpen(true);
  };

  // Receipt Viewer State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const handleViewReceipt = (donation: Donation) => {
    setSelectedReceipt({
      receiptNumber: donation.receiptNumber || `SK${Math.floor(100 + Math.random() * 899)}${Math.random().toString(36).substring(2, 6).toUpperCase()}YP`,
      donorName: donation.donorName || 'Supporter',
      donorEmail: donation.donorEmail || 'supporter@bigfund.org',
      amount: donation.amount,
      campaignTitle: donation.campaignTitle,
      date: donation.date,
      paymentProvider: donation.paymentProvider || 'M-Pesa STK Push',
      isMonthly: donation.type === 'monthly',
      isAnonymous: donation.isAnonymous
    });
    setIsReceiptModalOpen(true);
  };

  // Card Simulator States
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [isSimulatingCard, setIsSimulatingCard] = useState<boolean>(false);

  // Transparency Search & Ledger
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [isCompilingReport, setIsCompilingReport] = useState<boolean>(false);
  const [compilingStep, setCompilingStep] = useState<string>('');
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [showCompiledReport, setShowCompiledReport] = useState<boolean>(false);
  const [compiledYear, setCompiledYear] = useState<number>(2025);

  // Map state
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);

  // Staff Mode Control
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignGoal, setNewCampaignGoal] = useState<string>('');
  const [newCampaignCategory, setNewCampaignCategory] = useState<string>('Education & Academy');
  const [newCampaignShort, setNewCampaignShort] = useState<string>('');
  const [newCampaignStory, setNewCampaignStory] = useState<string>('');
  const [staffSelectedCampaignId, setStaffSelectedCampaignId] = useState<string>('');
  const [fieldUpdateTitle, setFieldUpdateTitle] = useState<string>('');
  const [fieldUpdateContent, setFieldUpdateContent] = useState<string>('');

  // Weekly pool tracking (persistent inside localStorage so they can see updates)
  const [weeklyPoolRaised, setWeeklyPoolRaised] = useState<number>(() => {
    const saved = localStorage.getItem('big_fund_weekly_raised');
    return saved ? parseInt(saved, 10) : 185000;
  });
  const weeklyPoolTarget = 250000;

  // Sensitive security action trigger
  const [isSensitiveAuthOpen, setIsSensitiveAuthOpen] = useState<boolean>(false);
  const [pendingDonationData, setPendingDonationData] = useState<any>(null);

  // Success Banner
  const [successBanner, setSuccessBanner] = useState<{ show: boolean; title: string; message: string } | null>(null);

  // Load backend database on mount
  const fetchDbState = async () => {
    try {
      setLoading(true);
      const state = await apiService.getFullState();
      setCampaigns(state.campaigns || []);
      setDonations(state.donations || []);
      setMonthlySupporters(state.monthlySupporters || []);
      setImpactStories(state.impactStories || []);
    } catch (err) {
      console.error('Failed to sync state from live database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState();
  }, []);

  // Sync state helpers
  const saveStateToServer = async (updates: Partial<any>) => {
    try {
      const synced = await apiService.syncState(updates);
      setCampaigns(synced.campaigns || []);
      setDonations(synced.donations || []);
      setMonthlySupporters(synced.monthlySupporters || []);
    } catch (err) {
      console.warn('Sync failed, relying on local updates:', err);
    }
  };

  // Pre-fill email/name if authenticated
  useEffect(() => {
    const savedUser = localStorage.getItem('big_v2_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) {
          setDonorEmail(u.email);
          setLoggedInUserEmail(u.email);
        }
        if (u.name) setDonorName(u.name);
        if (u.phone) setMpesaPhone(u.phone);
      } catch (e) {}
    } else {
      setLoggedInUserEmail('');
    }
  }, [isAuthenticated]);

  // Handle donation presets or custom inputs
  const finalDonationAmount = useMemo(() => {
    if (customAmountText) {
      const parsed = parseFloat(customAmountText);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    return donationAmount;
  }, [donationAmount, customAmountText]);

  // Category listing
  const categories = ['All', 'Education & Academy', 'Leadership & Advocacy', 'Technology', 'Mental Wellness', 'Family & Care', 'Mutual Aid'];

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchSearch = c.title.toLowerCase().includes(campaignSearch.toLowerCase()) || 
                          c.shortDescription.toLowerCase().includes(campaignSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [campaigns, selectedCategory, campaignSearch]);

  // Sum total contributions
  const totalRaisedStats = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + c.amountRaised, 0);
  }, [campaigns]);

  const totalSponsorsCount = useMemo(() => {
    return donations.length + monthlySupporters.length + 120; // adding constant base for aesthetic volume
  }, [donations, monthlySupporters]);

  // Ledger filter
  const filteredLedger = useMemo(() => {
    return donations.filter(d => {
      const s = ledgerSearch.toLowerCase();
      return d.donorName.toLowerCase().includes(s) || 
             d.campaignTitle.toLowerCase().includes(s) || 
             d.paymentProvider.toLowerCase().includes(s);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, ledgerSearch]);

  // Recognition wall filter
  const filteredDonors = useMemo(() => {
    return donations.filter(d => {
      // If anonymous, search matches "Anonymous Supporter"
      const nameToMatch = d.isAnonymous ? 'Anonymous Supporter' : d.donorName;
      const matchSearch = nameToMatch.toLowerCase().includes(recognitionSearch.toLowerCase()) || 
                          d.campaignTitle.toLowerCase().includes(recognitionSearch.toLowerCase());
      
      const matchFilter = recognitionFilter === 'all' || 
                          (recognitionFilter === 'public' && !d.isAnonymous) || 
                          (recognitionFilter === 'anonymous' && d.isAnonymous);
      
      return matchSearch && matchFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, recognitionSearch, recognitionFilter]);

  // Allocation Chart Data
  const chartAllocationData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    campaigns.forEach(c => {
      dataMap[c.category] = (dataMap[c.category] || 0) + c.amountRaised;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  // Monthly contribution progress
  const monthlyTrendsData = [
    { name: 'Feb', Raised: 1400000 },
    { name: 'Mar', Raised: 1800000 },
    { name: 'Apr', Raised: 2100000 },
    { name: 'May', Raised: 2900000 },
    { name: 'Jun', Raised: 3500000 },
    { name: 'Jul', Raised: totalRaisedStats }
  ];

  const COLORS = ['#FFD700', '#FF1493', '#2D1B4E', '#ff7700', '#9333ea', '#EC4899', '#facc15'];

  // Countdown timer for M-Pesa STK simulation
  useEffect(() => {
    let timer: any;
    if (isSimulatingMpesa && mpesaStatus === 'waiting_pin') {
      if (mpesaCountdown > 0) {
        timer = setTimeout(() => setMpesaCountdown(mpesaCountdown - 1), 1000);
      } else {
        setMpesaStatus('failed');
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulatingMpesa, mpesaCountdown, mpesaStatus]);

  // Triggering the OTP/PIN modal if security constraints are enabled
  const triggerDonationAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalDonationAmount <= 0) {
      alert('Please enter or select a valid contribution amount.');
      return;
    }
    if (!isAnonymous && !donorName) {
      alert('Please provide your name or toggle anonymous giving.');
      return;
    }
    if (!donorEmail) {
      alert('Please enter your email to receive your tax-deductible receipt.');
      return;
    }

    const payload = {
      amount: finalDonationAmount,
      isMonthly,
      isAnonymous,
      donorName: donorName || 'Anonymous Well-wisher',
      donorEmail,
      paymentProvider: paymentProvider === 'mpesa' ? 'M-Pesa' : paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1),
      campaignId: selectedCampaign ? selectedCampaign.id : 'weekly-pool',
      campaignTitle: selectedCampaign ? selectedCampaign.title : 'Weekly Community Impact Goal'
    };

    setPendingDonationData(payload);

    // Security Hardening intercepts
    const isEmailVerify = localStorage.getItem('big_v2_security_email_verify') === 'true';
    const isPinVerify = localStorage.getItem('big_v2_security_code_verify') === 'true';

    if (isEmailVerify || isPinVerify) {
      setIsSensitiveAuthOpen(true);
    } else {
      launchPaymentGateway(payload);
    }
  };

  const launchPaymentGateway = async (payload: any) => {
    if (payload.paymentProvider === 'M-Pesa') {
      const formattedPhone = mpesaPhone || '254712345678';
      setIsSimulatingMpesa(true);
      setMpesaCountdown(25);
      setMpesaStatus('waiting_pin');
      setMpesaPin('');
      setMpesaCustomerMessage(`Initiating Safaricom STK Push to +${formattedPhone}...`);

      try {
        const result = await apiService.initiateMpesaStkPush({
          phoneNumber: formattedPhone,
          amount: payload.amount,
          accountReference: payload.campaignId,
          campaignTitle: payload.campaignTitle,
          donorName: payload.donorName,
          donorEmail: payload.donorEmail,
          isAnonymous: payload.isAnonymous,
          isMonthly: payload.isMonthly
        });

        if (result.success) {
          setActiveCheckoutRequestId(result.checkoutRequestId);
          setMpesaCustomerMessage(result.customerMessage || `STK Push prompt sent to +${formattedPhone}`);
        } else {
          alert('Failed to dispatch M-Pesa STK Push prompt');
          setIsSimulatingMpesa(false);
        }
      } catch (err: any) {
        console.warn('STK Push dispatch notice:', err);
        setMpesaCustomerMessage(`STK Push prompt dispatched to +${formattedPhone}`);
      }
    } else {
      setIsSimulatingCard(true);
      setCardNumber('');
      setCardName(payload.donorName);
      setCardExpiry('');
      setCardCvv('');
    }
  };

  // M-Pesa Code Confirmation
  const confirmSimulatedMpesa = async () => {
    if (mpesaPin.length < 4) {
      alert('Please input a valid 4-digit M-Pesa PIN.');
      return;
    }
    setMpesaStatus('processing');

    try {
      if (activeCheckoutRequestId) {
        const result = await apiService.confirmSimulatedMpesaStkPush(activeCheckoutRequestId, mpesaPin);
        if (result.success) {
          setMpesaReceiptNumber(result.receiptNumber);
          executeDonationSuccess({
            ...pendingDonationData,
            receiptNumber: result.receiptNumber
          });
          setMpesaStatus('success');
          playChimeSound();
          fetchDbState();

          setTimeout(() => {
            setIsSimulatingMpesa(false);
          }, 3500);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend confirmation error, executing local fallback:', err);
    }

    setTimeout(() => {
      const fallbackReceipt = `SK${Math.floor(100 + Math.random() * 899)}${Math.random().toString(36).substring(2, 6).toUpperCase()}YP`;
      setMpesaReceiptNumber(fallbackReceipt);
      executeDonationSuccess(pendingDonationData);
      setMpesaStatus('success');
      playChimeSound();
      fetchDbState();

      setTimeout(() => {
        setIsSimulatingMpesa(false);
      }, 3500);
    }, 1500);
  };


  // Card Payment Confirmation
  const confirmSimulatedCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    setIsSimulatingCard(false);
    executeDonationSuccess(pendingDonationData);
    playChimeSound();
  };

  // Toggle visibility of a donation on the public Recognition Wall
  const toggleDonationVisibility = (donationId: string) => {
    const updated = donations.map(d => {
      if (d.id === donationId) {
        return { ...d, isAnonymous: !d.isAnonymous };
      }
      return d;
    });
    setDonations(updated);
    saveStateToServer({ donations: updated });
    playChimeSound();
  };

  // Common donation success handler
  const executeDonationSuccess = (payload: any) => {
    // 1. Create a new Donation record
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donorName: payload.donorName,
      donorEmail: payload.donorEmail,
      amount: payload.amount,
      campaignId: payload.campaignId,
      campaignTitle: payload.campaignTitle,
      date: new Date().toISOString(),
      isAnonymous: payload.isAnonymous,
      type: payload.isMonthly ? 'monthly' : 'one-time',
      paymentProvider: payload.paymentProvider,
      status: 'Completed'
    };

    const updatedDonations = [newDonation, ...donations];

    // 2. Update the corresponding Campaign or Weekly Goal
    let updatedCampaigns = [...campaigns];
    if (payload.campaignId === 'weekly-pool') {
      const nextWeeklyRaised = weeklyPoolRaised + payload.amount;
      setWeeklyPoolRaised(nextWeeklyRaised);
      localStorage.setItem('big_fund_weekly_raised', nextWeeklyRaised.toString());
    } else {
      updatedCampaigns = campaigns.map(c => {
        if (c.id === payload.campaignId) {
          return {
            ...c,
            amountRaised: c.amountRaised + payload.amount,
            supportersCount: c.supportersCount + 1
          };
        }
        return c;
      });
    }

    // 3. Register Monthly Supporter if selected
    let updatedSupporters = [...monthlySupporters];
    if (payload.isMonthly) {
      const isBronze = payload.amount < 5000;
      const isSilver = payload.amount >= 5000 && payload.amount < 15000;
      const isGold = payload.amount >= 15000 && payload.amount < 30000;
      const isPlat = payload.amount >= 30000;
      
      const tierLabel = isPlat ? 'Platinum Champion' : isGold ? 'Gold Champion' : isSilver ? 'Silver Champion' : 'Bronze Champion';
      const badgeLabel = isPlat ? '💎 PLATINUM' : isGold ? '🏆 GOLD' : isSilver ? '🥈 SILVER' : '🥉 BRONZE';

      const newSupporter: MonthlySupporter = {
        id: `sup-${Date.now()}`,
        name: payload.donorName,
        avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
        amount: payload.amount,
        tier: tierLabel,
        joinedAt: new Date().toISOString(),
        badge: `${badgeLabel} CHAMPION`
      };
      updatedSupporters = [newSupporter, ...monthlySupporters];
    }

    // 4. Update state variables locally and sync to server
    setCampaigns(updatedCampaigns);
    setDonations(updatedDonations);
    setMonthlySupporters(updatedSupporters);
    setSessionDonationIds(prev => [newDonation.id, ...prev]);

    // Save back to local JSON database securely
    saveStateToServer({
      campaigns: updatedCampaigns,
      donations: updatedDonations,
      monthlySupporters: updatedSupporters
    });

    // 5. Trigger simulated notification email for receipt transparency
    if (triggerSimulatedEmail) {
      const receiptBody = `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #f59e0b;">BIG Fund Donation Receipt</h2>
          <p>Dear ${payload.donorName},</p>
          <p>Thank you for your generous contribution of <strong>KES ${payload.amount.toLocaleString()}</strong> towards the <strong>${payload.campaignTitle}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Transaction Details:</strong></p>
          <ul>
            <li><strong>Donor:</strong> ${payload.donorName} (${payload.isAnonymous ? 'Anonymous on Public Feed' : 'Publicly listed'})</li>
            <li><strong>Amount:</strong> KES ${payload.amount.toLocaleString()}</li>
            <li><strong>Allocation:</strong> ${payload.campaignTitle}</li>
            <li><strong>Method:</strong> ${payload.paymentProvider}</li>
            <li><strong>Status:</strong> Completed</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Your support directly builds economic sovereignty, technical literacy, and grassroots community leadership for women across Kenya. We pledge absolute financial accountability, with 100% of these funds deployed according to our transparent budget breakdown.</p>
          <p>With deep gratitude,<br/><strong>The Be Independent Gal (BIG) Council</strong></p>
        </div>
      `;
      triggerSimulatedEmail(`Receipt for your KES ${payload.amount.toLocaleString()} BIG Fund Donation`, receiptBody);
    }

    // Show beautiful success popup
    setSuccessBanner({
      show: true,
      title: 'Contribution Deployed Successfully! 🌟',
      message: `Your donation of KES ${payload.amount.toLocaleString()} was processed. A detailed receipt has been dispatched to ${payload.donorEmail} and added to our transparency ledger.`,
      donationId: newDonation.id
    });

    // Close detail slideover
    setSelectedCampaign(null);
  };

  // Compiled Transparency Report Simulator
  const compileSponsorReport = (year: number) => {
    setCompiledYear(year);
    setIsCompilingReport(true);
    setCompileProgress(0);
    setCompilingStep('Querying active transaction logs...');

    const steps = [
      { p: 15, text: 'Resolving cryptographic transaction hashes...' },
      { p: 40, text: 'Matching disbursements against regional circle projects...' },
      { p: 70, text: 'Calculating administrative overhead ratios (9.4%)...' },
      { p: 90, text: 'Compiling PDF page formats with signature keys...' },
      { p: 100, text: 'Report generation finalized!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setCompileProgress(steps[currentStepIdx].p);
        setCompilingStep(steps[currentStepIdx].text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsCompilingReport(false);
        setShowCompiledReport(true);
      }
    }, 900);
  };

  // Staff Mode: Add Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignGoal || !newCampaignShort) {
      alert('Please provide title, goal and brief summary.');
      return;
    }

    const nextId = `camp-${campaigns.length + 1}`;
    const cleanGoal = parseFloat(newCampaignGoal) || 500000;

    const newCamp: Campaign = {
      id: nextId,
      coverImage: '/images/african_women_community_circle_1784704135356.jpg',
      title: newCampaignTitle,
      shortDescription: newCampaignShort,
      story: newCampaignStory || 'The Be Independent Gal community is initiating this project to support members in our circles. Real transparency, real resources, and real mentorship.',
      whyItMatters: 'Equipping our circles with capital avoids exploitative market parameters.',
      expectedImpact: 'Direct localized economic empowerment.',
      goalAmount: cleanGoal,
      amountRaised: 0,
      daysRemaining: 45,
      supportersCount: 0,
      category: newCampaignCategory,
      status: 'active',
      budgetTransparency: [
        { item: 'Direct distribution grants to scholars', cost: Math.round(cleanGoal * 0.7) },
        { item: 'Materials, technical tools and laptops', cost: Math.round(cleanGoal * 0.2) },
        { item: 'Governance and mentor matching support', cost: Math.round(cleanGoal * 0.1) }
      ],
      timeline: [
        { date: 'Month 1', title: 'Cohort vetting & enrollment', description: 'Selecting candidates based on localized circle suggestions.' },
        { date: 'Month 2', title: 'Asset deployment', description: 'Distributing cold storage, micro-funding, or laptop packages.' }
      ],
      updates: [],
      gallery: []
    };

    const nextCampaigns = [...campaigns, newCamp];
    setCampaigns(nextCampaigns);
    saveStateToServer({ campaigns: nextCampaigns });

    // Reset Form
    setNewCampaignTitle('');
    setNewCampaignGoal('');
    setNewCampaignShort('');
    setNewCampaignStory('');

    alert(`Campaign "${newCampaignTitle}" added to live server database!`);
  };

  // Staff Mode: Add Field Update to Campaign
  const handleAddFieldUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffSelectedCampaignId || !fieldUpdateTitle || !fieldUpdateContent) {
      alert('Please select a campaign and fill in update fields.');
      return;
    }

    const nextCampaigns = campaigns.map(c => {
      if (c.id === staffSelectedCampaignId) {
        const newUpdate: CampaignUpdate = {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          title: fieldUpdateTitle,
          content: fieldUpdateContent
        };
        return {
          ...c,
          updates: [newUpdate, ...(c.updates || [])]
        };
      }
      return c;
    });

    setCampaigns(nextCampaigns);
    saveStateToServer({ campaigns: nextCampaigns });

    setFieldUpdateTitle('');
    setFieldUpdateContent('');
    alert('On-the-ground field update published successfully!');
  };

  // Card formatter
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 relative overflow-hidden font-sans">
      {/* Absolute ambient light accents */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] bg-pink-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[600px] w-[600px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Dynamic Alert Popup */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white border border-pink-200 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 font-sans">{successBanner.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{successBanner.message}</p>
                  
                  {successBanner.donationId && (
                    (() => {
                      const currentDon = donations.find(d => d.id === successBanner.donationId);
                      if (!currentDon) return null;
                      return (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-pink-50/60 p-2 rounded-xl border border-pink-100">
                          <span className="text-[10px] text-pink-700 font-bold uppercase tracking-wider">
                            Wall Visibility: <span className="text-slate-900 font-black">{currentDon.isAnonymous ? '🔒 Anonymous' : '👁️ Public'}</span>
                          </span>
                          <button
                            onClick={() => {
                              toggleDonationVisibility(currentDon.id);
                            }}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg transition shrink-0 text-center"
                          >
                            Set to {currentDon.isAnonymous ? 'Public' : 'Anonymous'}
                          </button>
                        </div>
                      );
                    })()
                  )}
                </div>
                <button 
                  onClick={() => setSuccessBanner(null)} 
                  className="text-slate-400 hover:text-slate-700 transition shrink-0 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8 mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-pink-50 border border-pink-200 px-3.5 py-1 text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5 text-pink-600" />
              Sovereignty and Sisterhood Fund
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600">BIG Fund</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              BIG Fund is NOT a crowdfunding or loan site. It allows sponsors, well-wishers, and organizations to invest directly in BIG’s initiatives, scholarships, mental care, and micro-grants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Primary M-Pesa STK Push Contribute Button */}
            <button
              onClick={() => openMpesaStkPushModal()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-emerald-900/20 transition duration-200"
            >
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>Contribute to Fund (M-Pesa STK)</span>
            </button>

            {/* Staff simulation switcher */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 pl-1.5">Staff Controls</span>
              <button 
                onClick={() => setIsStaffMode(!isStaffMode)}
                className={`text-[10px] uppercase font-black tracking-widest rounded-xl px-4 py-1.5 transition duration-200 ${isStaffMode ? 'bg-pink-600 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isStaffMode ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto gap-2 border-b border-slate-200 pb-4 mb-8 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Impact Map', icon: Globe },
            { id: 'campaigns', label: 'Inspirational Campaigns', icon: Heart },
            { id: 'transparency', label: 'Transparency & Financial Ledger', icon: BarChart3 },
            { id: 'impact', label: 'Impact Stories Hub', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${active ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black shadow-md shadow-pink-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/60'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MAIN BODY CONTENTS */}

        {/* TAB 1: OVERVIEW & MAP */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-in">
            {/* Key stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Capital Raised', value: `KES ${(totalRaisedStats + weeklyPoolRaised).toLocaleString()}`, desc: 'Deployed with full accountability', icon: Coins, color: 'text-pink-600' },
                { label: 'Active Campaigns', value: campaigns.length.toString(), desc: 'Direct, structured community initiatives', icon: Heart, color: 'text-pink-600' },
                { label: 'Lives Transformed', value: '720+', desc: 'Scholars, mothers, and founders backed', icon: Users, color: 'text-rose-600' },
                { label: 'Administrative Ratio', value: '9.4%', desc: 'Industry-leading overhead matching', icon: ShieldCheck, color: 'text-amber-600' },
              ].map((st, i) => {
                const Icon = st.icon;
                return (
                  <div key={i} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{st.label}</span>
                      <Icon className={`h-5 w-5 ${st.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">{st.value}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly Target Tracker & Kenya schematic map row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Weekly Giving Goal ring (4 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-pink-600" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">Operational Continuity Tracker</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Weekly Giving Target</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Sponsors our day-to-day administrative counseling hotlines, legal rescue networks, and basic learning server nodes. 
                  </p>
                </div>

                {/* SVG Radial Ring */}
                <div className="flex flex-col items-center justify-center py-4 relative">
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg className="absolute transform -rotate-90 w-full h-full">
                      <circle
                        cx="88"
                        cy="88"
                        r="72"
                        className="stroke-slate-100"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="72"
                        className="stroke-pink-600 transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 72}
                        strokeDashoffset={2 * Math.PI * 72 * (1 - Math.min(weeklyPoolRaised / weeklyPoolTarget, 1))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <p className="text-2xl font-black text-slate-900">{Math.round((weeklyPoolRaised / weeklyPoolTarget) * 100)}%</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Raised</p>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm font-bold text-slate-900">
                      KES {weeklyPoolRaised.toLocaleString()} / KES {weeklyPoolTarget.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      KES {Math.max(weeklyPoolTarget - weeklyPoolRaised, 0).toLocaleString()} remaining to hit goal this week
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                  <button 
                    onClick={() => openMpesaStkPushModal('Weekly Continuity Goal', 'BIGFUND_WEEKLY', 1000)}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-black tracking-wider rounded-xl transition text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-300" />
                    <span>M-Pesa STK Push</span>
                  </button>
                  <button 
                    onClick={() => {
                      setCustomAmountText('');
                      setDonationAmount(1000);
                      setSelectedCampaign(null);
                      setActiveTab('campaigns');
                      setTimeout(() => {
                        document.getElementById('unified-donation-anchor')?.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase font-bold tracking-wider rounded-xl transition text-center shadow-sm"
                  >
                    Other Payment Methods
                  </button>
                </div>
              </div>

              {/* Right Column: Kenya Hotspots map (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-600" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">Decentralized Footprint</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Hover nodes to track circle impact</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Impact Hotspots Locator</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    BIG Fund capital reaches localized sub-circles across major regional centers. Click on any active marker below to view localized disbursements.
                  </p>
                </div>

                {/* SVG Map Canvas */}
                <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                  <div className="relative w-full max-w-[340px] aspect-[4/3] bg-slate-50 border border-slate-200 rounded-3xl p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 400 300" className="w-full h-full select-none">
                      {/* Stylized schematic connections */}
                      {CHAPTERS.map(ch => (
                        ch.id !== 'nbi' && (
                          <line
                            key={`line-${ch.id}`}
                            x1="200"
                            y1="180"
                            x2={ch.x}
                            y2={ch.y}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                        )
                      ))}

                      {/* Schematic Grid dots */}
                      {Array.from({ length: 12 }).map((_, r) => (
                        Array.from({ length: 16 }).map((_, c) => {
                          const cx = 25 + c * 23;
                          const cy = 20 + r * 23;
                          const distToHQ = Math.sqrt(Math.pow(cx - 200, 2) + Math.pow(cy - 180, 2));
                          const opacity = distToHQ > 180 ? 0.05 : 0.12;
                          return (
                            <circle
                              key={`bg-dot-${r}-${c}`}
                              cx={cx}
                              cy={cy}
                              r="1.5"
                              fill="#64748b"
                              opacity={opacity}
                            />
                          );
                        })
                      ))}

                      {/* Glowing Chapter Markers */}
                      {CHAPTERS.map(ch => {
                        const isHovered = hoveredChapter === ch.id;
                        const isSelected = selectedChapter?.id === ch.id;
                        return (
                          <g 
                            key={ch.id} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredChapter(ch.id)}
                            onMouseLeave={() => setHoveredChapter(null)}
                            onClick={() => setSelectedChapter(ch)}
                          >
                            {/* Outer pulsing ring */}
                            <circle
                              cx={ch.x}
                              cy={ch.y}
                              r={isHovered || isSelected ? 18 : 8}
                              fill={ch.color}
                              opacity={isHovered || isSelected ? 0.35 : 0.15}
                              className="transition-all duration-300"
                            />
                            {/* Inner node */}
                            <circle
                              cx={ch.x}
                              cy={ch.y}
                              r="4.5"
                              fill={ch.color}
                            />
                            {/* Label anchor */}
                            <text
                              x={ch.x}
                              y={ch.y - 12}
                              textAnchor="middle"
                              fill={isHovered || isSelected ? '#0f172a' : '#475569'}
                              fontSize="9"
                              fontWeight="bold"
                              className="transition-colors duration-200 uppercase tracking-wider"
                            >
                              {ch.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Chapter Statistics Detail Card */}
                  <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between h-[180px]">
                    {selectedChapter || hoveredChapter ? (
                      (() => {
                        const ch = selectedChapter || CHAPTERS.find(c => c.id === hoveredChapter);
                        return (
                          <div className="h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{ch.name} Chapter</h4>
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {ch.stats}
                              </p>
                            </div>
                            <div className="text-[10px] text-slate-500 italic">
                              Hover nodes to swap location profiles. Click to select an anchor chapter.
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <MapPin className="h-8 w-8 text-slate-400 mb-2 stroke-1" />
                        <p className="text-xs text-slate-500 max-w-[180px]">
                          Select or hover any node in Kenya to review regional circle stats
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Introductory Vision Panel */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 flex flex-col md:flex-row gap-10 items-center shadow-sm">
              <div className="flex-1 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">The Power of Direct Giving</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Inspiring economic sovereignty without dependency traps</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The BIG Fund was established following the simple observation that traditional micro-credit models often strip micro-business founders of capital and piece of mind. By allowing partners to back initiatives transparently, we fund laptops, certifications, and structural cooling facilities completely equity-free.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-pink-600" />
                    <span className="text-xs font-bold text-slate-800">No predatory rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-pink-600" />
                    <span className="text-xs font-bold text-slate-800">100% transparent audits</span>
                  </div>
                </div>
              </div>

              {/* Video Thumbnail placeholder */}
              <div className="w-full md:w-[320px] aspect-video rounded-[1.8rem] bg-slate-100 border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-md shrink-0">
                <img 
                  src="/images/african_women_tech_collaboration_1784664040784.jpg" 
                  alt="Women working together"
                  className="absolute inset-0 object-cover opacity-60 group-hover:opacity-75 transition duration-300"
                />
                <div className="h-14 w-14 rounded-full bg-pink-600/90 group-hover:bg-pink-600 border border-white flex items-center justify-center text-white transition cursor-pointer relative z-10 shadow-lg">
                  <Play className="h-6 w-6 fill-white stroke-none ml-1" />
                </div>
                <div className="absolute bottom-3 left-4 text-[9px] font-bold uppercase text-slate-700 tracking-wider z-10 bg-white/90 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                  Introductory Video (1:45)
                </div>
              </div>
            </div>

            {/* Recognition Wall Section */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 space-y-8 mt-12 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-pink-700 font-bold">
                    <Sparkle className="h-4 w-4 text-pink-600" />
                    <span className="text-[10px] uppercase tracking-widest">Sisterhood Circle</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">Recognition Wall</h3>
                  <p className="text-xs text-slate-600">
                    A living wall celebrating our sponsors, partners, and anonymous sisterhood allies. Click on your own donations to toggle visibility instantly.
                  </p>
                </div>

                {/* Filter and search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search donors..."
                      value={recognitionSearch}
                      onChange={(e) => setRecognitionSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1">
                    {(['all', 'public', 'anonymous'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setRecognitionFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                          recognitionFilter === filter
                            ? 'bg-pink-600 text-white font-black shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donor cards layout */}
              {filteredDonors.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-[1.8rem] border border-slate-200">
                  <Users className="h-8 w-8 text-slate-400 mx-auto mb-2 stroke-1" />
                  <p className="text-xs text-slate-500">No matching supporters found on the Recognition Wall.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDonors.map((d) => {
                    const isOwnDonation = sessionDonationIds.includes(d.id) || 
                                        (loggedInUserEmail && d.donorEmail === loggedInUserEmail);
                    const initial = d.isAnonymous ? '?' : d.donorName.charAt(0).toUpperCase();
                    const bgGradient = d.isAnonymous 
                      ? 'from-slate-200 to-slate-300 border-slate-300' 
                      : getNameGradient(d.donorName);
                    
                    return (
                      <div 
                        key={d.id}
                        className={`bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                          isOwnDonation 
                            ? 'border-pink-300 shadow-md bg-pink-50/30' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        {isOwnDonation && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-pink-700">
                            <UserCheck className="h-2.5 w-2.5" /> Yours
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          {/* Avatar / Circle */}
                          <div className={`h-11 w-11 rounded-full shrink-0 flex items-center justify-center shadow-md relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
                            {d.isAnonymous ? (
                              <Lock className="h-4 w-4 text-slate-600" />
                            ) : (
                              <span className="text-white font-black text-sm drop-shadow-md">{initial}</span>
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate leading-snug font-sans">
                              {d.isAnonymous ? (
                                <span className="text-slate-500 italic font-sans">Anonymous Supporter</span>
                              ) : (
                                d.donorName
                              )}
                            </h4>
                            
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-pink-600 font-mono">
                                KES {d.amount.toLocaleString()}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] text-slate-500 font-medium">
                                {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-slate-600 leading-snug truncate max-w-[200px] mt-1">
                              backed {d.campaignTitle}
                            </p>
                          </div>
                        </div>

                        {/* Status and Actions Row */}
                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            {d.isAnonymous ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded border border-slate-300">
                                <Lock className="h-2.5 w-2.5" /> Anonymous
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-pink-700 uppercase tracking-wider bg-pink-100/80 px-2 py-0.5 rounded border border-pink-200">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Publicly Listed
                              </span>
                            )}

                            {isOwnDonation && (
                              <span className="text-[9px] text-pink-600 font-bold">
                                Toggle below
                              </span>
                            )}
                          </div>

                          {isOwnDonation && (
                            <button
                              onClick={() => toggleDonationVisibility(d.id)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 bg-pink-600 text-white hover:bg-pink-700 border-pink-600"
                            >
                              {d.isAnonymous ? (
                                <>
                                  <Globe className="h-3 w-3 shrink-0" />
                                  <span>Make Listing Public</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 shrink-0" />
                                  <span>Make Listing Anonymous</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INSPIRATIONAL CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-12 animate-fade-in" id="unified-donation-anchor">
            {/* Filter and search bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm">
              
              {/* Category buttons list */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none scroll-smooth">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === cat ? 'bg-pink-600 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search text field */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            {/* Campaign Cards Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="h-8 w-8 text-pink-600 animate-spin mx-auto mb-4" />
                <p className="text-xs text-slate-500 uppercase tracking-widest">Compiling live campaign directory...</p>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(camp => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    onDonate={setSelectedCampaign}
                    onMpesaStk={(c) => openMpesaStkPushModal(c.title, c.id, 1000)}
                    buttonText="Invest & Story"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3 stroke-1" />
                <p className="text-sm font-bold text-slate-800">No campaigns found matching filter</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting your category or adjusting the search query</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRANSPARENCY & FINANCIAL LEDGER */}
        {activeTab === 'transparency' && (
          <div className="space-y-12 animate-fade-in">
            {/* Financial allocation and ledger tracking graphics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Pie Chart of allocations (Standard Recharts layout) */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-pink-600" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">Ledger Accountability</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Fund Allocation Breakdown</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    A visual percentage representation of how every single donation has been budgeted and allocated across our primary development programs.
                  </p>
                </div>

                <div className="h-56">
                  {chartAllocationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '12px' }}
                          formatter={(value) => `KES ${value.toLocaleString()}`}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          iconSize={8}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', color: '#475569' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-500">
                      No allocation stats loaded.
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly growth bar chart */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-pink-600" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">Contributions Growth</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Sponsorship Volume over Time</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    Tracks month-on-month cumulative contributions showing local and international sponsor trust progression.
                  </p>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendsData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} formatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '12px' }}
                        formatter={(value) => `KES ${value.toLocaleString()}`}
                      />
                      <Bar dataKey="Raised" fill="#db2777" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Public financial ledger table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Live Public Financial Ledger</h3>
                  <p className="text-xs text-slate-600 mt-1">Real-time audit record of contributions synchronized instantly with our local database nodes.</p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Table ledger */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-600">
                      <th className="py-4.5 px-6">Donor Name</th>
                      <th className="py-4.5 px-6">Allocation Campaign</th>
                      <th className="py-4.5 px-6">Amount (KES)</th>
                      <th className="py-4.5 px-6">Date</th>
                      <th className="py-4.5 px-6">Provider</th>
                      <th className="py-4.5 px-6 text-center">Status</th>
                      <th className="py-4.5 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                    {filteredLedger.length > 0 ? (
                      filteredLedger.map((ld, index) => (
                        <tr key={ld.id || index} className="hover:bg-slate-50 transition">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {ld.isAnonymous ? (
                              <span className="text-slate-500 italic font-medium">Anonymous Supporter</span>
                            ) : ld.donorName}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {ld.campaignTitle}
                          </td>
                          <td className="py-4 px-6 text-slate-900 font-black">
                            KES {ld.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {new Date(ld.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {ld.paymentProvider}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                              ● Completed
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewReceipt(ld)}
                              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow-sm"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          No transaction ledgers found matching search filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annual audit reports list (PDF Simulators) */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-sm">
              
              <AnimatePresence>
                {isCompilingReport && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm"
                  >
                    <RefreshCw className="h-10 w-10 text-pink-600 animate-spin mb-4" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{compilingStep}</h4>
                    <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 border border-slate-200">
                      <div className="h-full bg-pink-600 transition-all duration-300" style={{ width: `${compileProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2">{compileProgress}% finalized</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* In-app Audit Report Overlay */}
              <AnimatePresence>
                {showCompiledReport && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white z-30 p-8 flex flex-col justify-between overflow-y-auto"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-pink-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">BIG Fund Certified Annual Report ({compiledYear})</span>
                        </div>
                        <button 
                          onClick={() => setShowCompiledReport(false)}
                          className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs text-slate-700 max-w-2xl leading-relaxed">
                        <p className="font-bold text-slate-900 uppercase tracking-wider">I. Executive Summary & Verification Hash</p>
                        <p className="font-mono text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                          MD5: b871ef3b6d271c62fbc90ee12ff9502b • SHA256: 7f7e91efb011403bf6fec893bc4e7d1219bce
                        </p>
                        <p>
                          During the {compiledYear} financial ledger cycle, BIG Fund recorded total incoming contributions of KES {(totalRaisedStats + weeklyPoolRaised).toLocaleString()}. In alignment with our constitutional charter, exactly 90.6% of capital resources were distributed directly to regional scholarship programs, tech micro-grants, and cold room cooperative facilities.
                        </p>
                        <p className="font-bold text-slate-900 uppercase tracking-wider pt-2">II. Direct Program Allocations</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>BIG Academy Scholarships:</strong> KES 940,000 disbursed sponsoring 20 female software quality certifying trainees.</li>
                          <li><strong>Women Tech Startups:</strong> KES 1,100,000 Cloud credits and API subsidies.</li>
                          <li><strong>Grassroots Leadership Bootcamps:</strong> KES 520,000 for 35 localized regional organizers.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                      <button 
                        onClick={() => setShowCompiledReport(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition"
                      >
                        Close View
                      </button>
                      <button 
                        onClick={() => {
                          alert('Annual Financial Statement downloaded to your simulated workspace!');
                          setShowCompiledReport(false);
                        }}
                        className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase rounded-xl transition shadow-md"
                      >
                        💾 Download PDF Statement
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="max-w-3xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-pink-700">Certified Audits</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 mb-3">Download Annual Accountability Statements</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8">
                  We compile our ledger logs with cryptographic ledger verification. Click below to compile and download any annual performance audited report directly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[2025, 2024].map(year => (
                    <div key={year} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-pink-300 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                          <Download className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Annual Financial Report {year}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Verified SHA-256 Ledger • PDF</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => compileSponsorReport(year)}
                        className="h-8 px-4 rounded-lg bg-pink-600 hover:bg-pink-700 text-xs text-white font-bold transition shadow-sm"
                      >
                        Compile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMPACT STORIES HUB */}
        {activeTab === 'impact' && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {impactStories.map(story => (
                <div 
                  key={story.id} 
                  className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col justify-between hover:border-pink-300 transition duration-300 shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="h-52 relative overflow-hidden bg-slate-100">
                      <img 
                        src={getSafeSrc(story.coverImage)} 
                        alt={story.author}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 text-[9px] uppercase font-black tracking-widest text-pink-700 bg-white/95 px-2.5 py-1 rounded-lg border border-pink-200 shadow-sm">
                        🌻 {story.programFunded}
                      </span>
                    </div>

                    {/* Story card details */}
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-4">
                        {story.title}
                      </h3>
                      
                      {/* Before / After slider grids */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Status Before</p>
                          <p className="text-[11px] text-slate-700 leading-relaxed">{story.before}</p>
                        </div>
                        <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-pink-700 mb-1">Sovereignty After</p>
                          <p className="text-[11px] text-pink-900 leading-relaxed font-medium">{story.after}</p>
                        </div>
                      </div>

                      {/* Quote layout */}
                      <div className="border-l-2 border-pink-500 pl-4 py-1 italic text-xs text-slate-700 leading-relaxed my-4">
                        {story.quote}
                        <span className="block not-italic text-[10px] font-bold text-slate-900 mt-2">
                          — {story.author}, <span className="font-normal text-slate-600">{story.authorRole}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements and progress footer */}
                  <div className="p-8 pt-0 mt-2 border-t border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pt-5 mb-3">Key Program Achievements</h4>
                    <ul className="space-y-2">
                      {story.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAFF/PARTNER SYSTEM ADMINISTRATOR PANEL */}
        {isStaffMode && (
          <div className="mt-16 bg-white border border-pink-200 rounded-[2.5rem] p-8 sm:p-12 animate-slide-up shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5 mb-8">
              <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900">Staff Coordination Console</h3>
                <p className="text-xs text-slate-600">Add active campaigns, publish ground supervisor field-updates, and review transaction audits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Form 1: Add Campaign */}
              <form onSubmit={handleCreateCampaign} className="space-y-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-pink-700">Create New Campaign Initiative</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Initiative Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Expand Kisumu Agro-Exporters Hub"
                    value={newCampaignTitle}
                    onChange={(e) => setNewCampaignTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Initiative Target Goal (KES)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1200000"
                      value={newCampaignGoal}
                      onChange={(e) => setNewCampaignGoal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Program Category</label>
                    <select
                      value={newCampaignCategory}
                      onChange={(e) => setNewCampaignCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat} className="bg-white text-slate-900">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Brief Description</label>
                  <input
                    type="text"
                    required
                    placeholder="One-sentence description shown in lists..."
                    value={newCampaignShort}
                    onChange={(e) => setNewCampaignShort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Inspirational Storytelling Narrative</label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed stories, expected milestones, why this capital matters..."
                    value={newCampaignStory}
                    onChange={(e) => setNewCampaignStory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Publish Initiative
                </button>
              </form>

              {/* Form 2: Publish field updates */}
              <div className="space-y-6">
                <form onSubmit={handleAddFieldUpdate} className="space-y-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] p-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-pink-700">Publish Field Update to Campaign</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Target Initiative</label>
                    <select
                      value={staffSelectedCampaignId}
                      onChange={(e) => setStaffSelectedCampaignId(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition"
                    >
                      <option value="" className="bg-white text-slate-900">-- Select Initiative --</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id} className="bg-white text-slate-900">{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Update Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Laptops Delivered to Kisumu Scholars!"
                      value={fieldUpdateTitle}
                      onChange={(e) => setFieldUpdateTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Progress Update Details</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe progress, buy receipts, or local circle feedback..."
                      value={fieldUpdateContent}
                      onChange={(e) => setFieldUpdateContent(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Publish Live Field Update
                  </button>
                </form>

                {/* Audit Information Logs */}
                <div className="bg-slate-50 border border-slate-200 rounded-[1.8rem] p-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">Live System Metrics</h4>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p>● Connected to live database file: <span className="font-mono text-[10px] text-slate-500">api/db.json</span></p>
                    <p>● Total ledger records parsed: <span className="text-slate-900 font-bold">{donations.length}</span></p>
                    <p>● Monthly members subscribed: <span className="text-slate-900 font-bold">{monthlySupporters.length}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED CAMPAIGN SLIDEOVER MODAL */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-40 overflow-hidden font-sans">
            <div className="absolute inset-0 overflow-hidden">
              {/* Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCampaign(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="pointer-events-auto w-screen max-w-2xl"
                >
                  <div className="flex h-full flex-col overflow-y-scroll bg-white border-l border-slate-200 shadow-2xl">
                    
                    {/* Cover Banner with Back Button */}
                    <div className="h-56 relative shrink-0 bg-slate-100">
                      <img 
                        src={getSafeSrc(selectedCampaign.coverImage)} 
                        alt={selectedCampaign.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                      
                      <button
                        onClick={() => setSelectedCampaign(null)}
                        className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-md transition"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-5 left-8 pr-8">
                        <span className="text-[9px] uppercase font-black tracking-widest text-pink-700 bg-white/90 px-2.5 py-1 rounded-md border border-pink-200 shadow-sm">
                          {selectedCampaign.category}
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-3">
                          {selectedCampaign.title}
                        </h2>
                      </div>
                    </div>

                    {/* Slideover Body Content */}
                    <div className="flex-1 p-8 space-y-10">
                      
                      {/* Section 1: Detailed Storytelling */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-pink-700">The Impact Narrative</h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {selectedCampaign.story}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Why It Matters</h4>
                            <p className="text-xs text-slate-600 leading-normal">{selectedCampaign.whyItMatters}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Expected Outcome</h4>
                            <p className="text-xs text-slate-600 leading-normal">{selectedCampaign.expectedImpact}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Budget Transparency Itemization */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-pink-700">Budget Transparency</h3>
                        <p className="text-xs text-slate-600">100% of your contributions go directly to program disbursements. Here is exactly where the funds are budgeted:</p>
                        
                        <div className="space-y-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                          {selectedCampaign.budgetTransparency?.map((item, i) => {
                            const pct = Math.round((item.cost / selectedCampaign.goalAmount) * 100);
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-700 font-medium">{item.item}</span>
                                  <span className="text-slate-900 font-black">KES {item.cost.toLocaleString()} ({pct}%)</span>
                                </div>
                                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-pink-600" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Timeline Stepper Milestones */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-pink-700">Timeline & Project Stepper</h3>
                        
                        <div className="space-y-4 border-l border-slate-200 pl-5 ml-2.5">
                          {selectedCampaign.timeline?.map((step, i) => (
                            <div key={i} className="relative">
                              {/* Step circle indicator */}
                              <div className="absolute -left-7.5 top-0 h-4.5 w-4.5 rounded-full bg-white border-2 border-pink-600 flex items-center justify-center shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-pink-600" />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-pink-700">{step.date}</span>
                              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{step.title}</h4>
                              <p className="text-xs text-slate-600 mt-1 leading-normal">{step.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 4: Live ground supervisor updates */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-pink-700">Live Ground Progress Logs</h3>
                        
                        {selectedCampaign.updates && selectedCampaign.updates.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCampaign.updates.map((upd, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-bold text-slate-900">{upd.title}</span>
                                  <span className="text-[10px] text-slate-500 font-bold">{upd.date}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-normal">{upd.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 italic">
                            No ground supervisor logs published yet for this cycle.
                          </div>
                        )}
                      </div>

                      {/* Section 5: Embed Contribution checkout form */}
                      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sm:p-8 space-y-6">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs text-pink-700 font-bold uppercase tracking-wider mb-2">
                            <Lock className="h-4 w-4" />
                            Secure Partnership Terminal
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">Invest in this Initiative</h3>
                          <p className="text-xs text-slate-600 leading-normal mt-1">Select your partnership amount. Contributions are audited and reported with absolute precision.</p>
                        </div>

                        <form onSubmit={triggerDonationAttempt} className="space-y-5">
                          
                          {/* Amount selections */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Contribution Amount (KES)</label>
                            
                            <div className="grid grid-cols-5 gap-2">
                              {[500, 1000, 2500, 5000, 10000].map(amt => (
                                <button
                                  type="button"
                                  key={amt}
                                  onClick={() => {
                                    setDonationAmount(amt);
                                    setCustomAmountText('');
                                  }}
                                  className={`py-3.5 rounded-xl text-xs font-black transition ${donationAmount === amt && !customAmountText ? 'bg-pink-600 text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                                >
                                  {amt.toLocaleString()}
                                </button>
                              ))}
                            </div>

                            {/* Custom amount field */}
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="Or enter custom contribution amount (KES)..."
                                value={customAmountText}
                                onChange={(e) => setCustomAmountText(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                              />
                            </div>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Option 1: Monthly Champion program subscription */}
                            <div 
                              onClick={() => setIsMonthly(!isMonthly)}
                              className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition ${isMonthly ? 'bg-pink-50 border-pink-400' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isMonthly}
                                onChange={() => {}} // handled by div click
                                className="mt-1 h-3.5 w-3.5 rounded accent-pink-600"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">Join BIG Champions</h4>
                                <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">Subscribe this contribution monthly to secure permanent operational scholarships.</p>
                              </div>
                            </div>

                            {/* Option 2: Give Anonymously */}
                            <div 
                              onClick={() => setIsAnonymous(!isAnonymous)}
                              className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition ${isAnonymous ? 'bg-pink-50 border-pink-400' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={() => {}} // handled by div click
                                className="mt-1 h-3.5 w-3.5 rounded accent-pink-600"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">Donate Anonymously</h4>
                                <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">Hide your name and email from our public live transparency ledgers feed.</p>
                              </div>
                            </div>

                          </div>

                          {/* Name and Email details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Your Full Name</label>
                              <input
                                type="text"
                                required={!isAnonymous}
                                placeholder="e.g. Sarah Jenkins"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                              />
                              {isAnonymous && (
                                <p className="text-[9px] text-pink-700 font-medium">
                                  🔒 Your name will be hidden on our public walls, but remains stored for private tax receipts.
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Your Email Address</label>
                              <input
                                type="email"
                                required
                                placeholder="e.g. sarah.j@example.com"
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                              />
                            </div>
                          </div>

                          {/* Payment method toggle */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Select Gateway</label>
                             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                               {["mpesa", "flutterwave", "stripe", "visa", "mastercard"].map((method) => (
                                 <button
                                   key={method}
                                   type="button"
                                   onClick={() => setPaymentProvider(method as any)}
                                   className={`py-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition border ${paymentProvider === method ? "bg-pink-50 border-pink-600 text-pink-700 font-extrabold" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                                 >
                                   {method}
                                 </button>
                               ))}
                             </div>
                          </div>

                          {/* M-Pesa Phone Input */}
                          {paymentProvider === 'mpesa' && (
                            <div className="space-y-1.5 bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 transition-all">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 text-emerald-600" />
                                  Safaricom M-Pesa Phone Number
                                </label>
                                <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  STK PUSH ENABLED
                                </span>
                              </div>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-600">
                                  <span>🇰🇪</span>
                                  <span>+254</span>
                                </div>
                                <input
                                  type="tel"
                                  required
                                  placeholder="712 345 678"
                                  value={mpesaPhone.startsWith('254') ? mpesaPhone.slice(3) : mpesaPhone.startsWith('0') ? mpesaPhone.slice(1) : mpesaPhone}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    setMpesaPhone('254' + raw);
                                  }}
                                  className="w-full bg-white border border-emerald-200 focus:border-emerald-500 rounded-lg pl-16 pr-4 py-2 text-xs text-slate-900 font-mono font-medium outline-none shadow-sm transition"
                                />
                              </div>
                              <p className="text-[9px] text-emerald-700 font-medium">
                                📲 A Safaricom STK Push authorization prompt will be dispatched directly to this handset.
                              </p>
                            </div>
                          )}

                          {/* Submit Trigger */}
                          <button
                            type="submit"
                            className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                          >
                            <span>Deploy Partnership Donation</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>

                        </form>
                      </div>

                    </div>

                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE HIGH-FIDELITY MOBILE DEVICE POPUP (M-PESA SIMULATION) */}
      <AnimatePresence>
        {isSimulatingMpesa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              onClick={() => setIsSimulatingMpesa(false)} 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Handheld Device */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] w-[310px] aspect-[10/19] relative z-10 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Speaker mesh / camera island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-24 bg-slate-800 rounded-full z-30 flex items-center justify-center">
                <div className="h-1 w-8 bg-slate-700 rounded-full" />
              </div>

              {/* Simulated Phone Screen */}
              <div className="flex-1 bg-white p-5 pt-8 flex flex-col justify-between relative select-none text-slate-900">
                
                {/* M-Pesa Brand Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Safaricom M-Pesa</span>
                  </div>
                  <span className="text-[8px] text-slate-400 uppercase font-black">STK PUSH SIMULATOR</span>
                </div>

                {mpesaStatus === 'waiting_pin' && (
                  <div className="flex-1 flex flex-col justify-between pt-4">
                    
                    {/* Prompt Box */}
                    <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 text-center space-y-3">
                      <p className="text-xs text-slate-700 font-medium">
                        Pay KES <span className="text-slate-900 font-black">{finalDonationAmount.toLocaleString()}</span> to <strong className="text-pink-600">BIG FUND</strong>?
                      </p>
                      
                      {/* Password stars visual field */}
                      <div className="bg-white border border-slate-200 rounded-xl py-2.5 flex items-center justify-center font-mono text-lg text-emerald-600 tracking-[0.4em]">
                        {mpesaPin ? '•'.repeat(mpesaPin.length) : 'ENTER PIN'}
                      </div>

                      <div className="text-[9px] text-slate-500">
                        Transaction terminates in <span className="text-slate-900 font-bold">{mpesaCountdown}s</span>
                      </div>
                    </div>

                    {/* Keyboard pad simulation */}
                    <div className="grid grid-cols-3 gap-2 py-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(btn => (
                        <button
                          key={btn}
                          type="button"
                          onClick={() => {
                            if (btn === 'C') {
                              setMpesaPin('');
                            } else if (btn === '✓') {
                              confirmSimulatedMpesa();
                            } else if (mpesaPin.length < 4) {
                              setMpesaPin(mpesaPin + btn);
                            }
                          }}
                          className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono text-sm font-bold flex items-center justify-center transition active:scale-95"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>

                  </div>
                )}

                {mpesaStatus === 'processing' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verifying Ledger Authorization...</p>
                    <p className="text-[10px] text-slate-500">Polling Safaricom transaction feedback nodes...</p>
                  </div>
                )}

                {mpesaStatus === 'success' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Transaction Approved</h4>
                    <p className="text-[11px] text-slate-600 max-w-[200px] leading-relaxed">
                      Receipt Ref: <span className="font-mono text-emerald-700 font-extrabold block text-xs mt-1 bg-emerald-50 py-1 px-2 rounded border border-emerald-200">{mpesaReceiptNumber || `SK${Math.floor(100+Math.random()*899)}89YP`}</span> KES {finalDonationAmount.toLocaleString()} received on live ledger.
                    </p>
                  </div>
                )}

                {mpesaStatus === 'failed' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-rose-100 border border-rose-500 flex items-center justify-center text-rose-600">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">STK Push Terminated</h4>
                    <p className="text-[10px] text-slate-500">Simulated Safaricom session callback timed out or rejected by client PIN failure.</p>
                    <button 
                      onClick={() => setMpesaStatus('waiting_pin')}
                      className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-800 font-bold"
                    >
                      Retry Simulation
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED HIGH-FIDELITY CREDIT CARD CHECKOUT POPUP */}
      <AnimatePresence>
        {isSimulatingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              onClick={() => setIsSimulatingCard(false)} 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Checkout Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-md p-8 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">Credit Card Simulation</span>
                </div>
                <button 
                  onClick={() => setIsSimulatingCard(false)}
                  className="text-slate-400 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stylized physical credit card preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-44 flex flex-col justify-between relative overflow-hidden shadow-lg select-none">
                <div className="flex items-center justify-between">
                  {/* Card chip */}
                  <div className="h-8 w-11 bg-pink-500/20 border border-pink-500/30 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 w-6 h-4 border border-pink-500/20 opacity-30" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">BIG CHAMPIONS</span>
                </div>

                <div className="space-y-4">
                  {/* Card Number */}
                  <div className="font-mono text-base text-white tracking-[0.1em]">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cardholder</p>
                      <p className="font-medium text-slate-200 mt-0.5 truncate max-w-[150px]">{cardName || 'Sarah Jenkins'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Expires</p>
                      <p className="font-mono text-slate-200 mt-0.5">{cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={confirmSimulatedCard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-mono transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length >= 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-mono transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-mono transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="h-4 w-4" />
                  <span>Authorize & Transact</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SENSITIVE SECURITY AUTHORIZATION INTERCEPT MODAL */}
      <SensitiveActionModal
        isOpen={isSensitiveAuthOpen}
        onClose={() => setIsSensitiveAuthOpen(false)}
        onSuccess={() => {
          setIsSensitiveAuthOpen(false);
          if (pendingDonationData) {
            launchPaymentGateway(pendingDonationData);
          }
        }}
        actionName="Deploy BIG Fund Contribution"
        triggerSimulatedEmail={triggerSimulatedEmail}
      />

      {/* DEDICATED M-PESA STK PUSH INTEGRATION MODAL */}
      <MpesaStkModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        defaultCampaignTitle={mpesaModalTitle}
        defaultCampaignId={mpesaModalId}
        defaultAmount={mpesaModalAmt}
        onSuccess={(receiptNum, amt) => {
          playChimeSound();
          fetchDbState();
          setSuccessBanner({
            show: true,
            title: 'M-Pesa STK Push Authorized',
            message: `Contribution of KES ${amt.toLocaleString()} received for "${mpesaModalTitle}". M-Pesa Receipt Ref: ${receiptNum}`
          });
        }}
      />

      {/* CONTRIBUTION RECEIPT VIEW & DOWNLOAD MODAL */}
      <ContributionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={selectedReceipt}
      />
    </div>
  );
}
