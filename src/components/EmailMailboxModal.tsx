import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, X, RefreshCw, Send, CheckCircle2, 
  Copy, ShieldCheck, Clock, AlertCircle, Key, ExternalLink, Zap
} from 'lucide-react';
import { apiService } from '../api';

interface EmailMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserEmail?: string;
}

export const EmailMailboxModal: React.FC<EmailMailboxModalProps> = ({
  isOpen,
  onClose,
  defaultUserEmail = 'supporter@bigfund.org'
}) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'logs'>('dispatch');
  const [emailStatus, setEmailStatus] = useState<{
    isConfigured: boolean;
    fromEmail: string;
    sentEmailLogs: any[];
  }>({
    isConfigured: false,
    fromEmail: 'BIG Foundation <onboarding@resend.dev>',
    sentEmailLogs: []
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Form State
  const [toEmail, setToEmail] = useState<string>(defaultUserEmail);
  const [subject, setSubject] = useState<string>('M-Pesa Official Contribution Receipt');
  const [body, setBody] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<'receipt' | 'welcome' | 'otp' | 'grant_update' | 'general'>('receipt');
  const [sending, setSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    requiresApiKey?: boolean;
    provider?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await apiService.getEmailStatus();
      setEmailStatus(data);
    } catch (err) {
      console.error('Failed to fetch email service status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      if (!body) handleTemplateChange('receipt');
    }
  }, [isOpen]);

  const handleTemplateChange = (tmpl: 'receipt' | 'welcome' | 'otp' | 'grant_update' | 'general') => {
    setSelectedTemplate(tmpl);
    if (tmpl === 'receipt') {
      setSubject('🧾 M-Pesa Official Contribution Receipt #SK984321YP');
      setBody(
        `BE INDEPENDENT GAL (BIG) FUND - M-PESA CONTRIBUTION RECEIPT\n` +
        `--------------------------------------------------\n` +
        `Receipt Reference: SK984321YP\n` +
        `Contributor: Sarah Jenkins\n` +
        `Target Cause: BIG Academy Women Tech Micro-Grants\n` +
        `Amount Paid: KES 2,500.00\n` +
        `Payment Channel: Safaricom M-Pesa STK Push (PayBill 174379)\n` +
        `Status: VERIFIED & COMPLETED\n` +
        `Timestamp: ${new Date().toLocaleString('en-KE')}\n\n` +
        `Thank you for advancing African women's tech leadership and business independence!`
      );
    } else if (tmpl === 'welcome') {
      setSubject('🌸 Welcome to Be Independent Gal (BIG) Platform!');
      setBody(
        `Dear Sister,\n\n` +
        `Welcome to the BIG global sisterhood! Your account has been initialized successfully.\n\n` +
        `You now have full access to our community feeds, BIG Academy seed grants, peer mentorship circles, micro-business tools, and BIG Fund impact campaigns.\n\n` +
        `Explore your dashboard and build your independent future with us!\n\n` +
        `Warmly,\n` +
        `The BIG Foundation Team\n` +
        `https://bigfund.org`
      );
    } else if (tmpl === 'otp') {
      const code = Math.floor(100000 + Math.random() * 900000);
      setSubject('🔐 One-Time Security Authorization Code');
      setBody(
        `Your one-time authorization code for sensitive platform access is: ${code}.\n\n` +
        `Please enter this code in the BIG platform within 5 minutes to complete authorization.\n\n` +
        `If you did not request this code, please secure your account immediately.`
      );
    } else if (tmpl === 'grant_update') {
      setSubject('🎓 BIG Academy Seed Grant Application Update');
      setBody(
        `Dear Applicant,\n\n` +
        `We are delighted to inform you that your application for the BIG Academy Micro-Business Seed Grant has passed initial screening.\n\n` +
        `Our selection committee has scheduled a 15-minute virtual pitch review with your mentor circle.\n\n` +
        `Log in to your BIG dashboard to confirm your interview time slot.`
      );
    } else {
      setSubject('Notification from BIG Platform');
      setBody('Enter your custom email notification text here...');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !subject) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await apiService.sendEmail({
        to: toEmail,
        subject,
        body,
        template: selectedTemplate
      });

      setSendResult({
        success: res.success,
        message: res.message,
        requiresApiKey: res.requiresApiKey,
        provider: res.provider
      });

      await fetchStatus();
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || 'Failed to dispatch email'
      });
    } finally {
      setSending(false);
    }
  };

  const copyEnvVarKey = () => {
    navigator.clipboard.writeText('RESEND_API_KEY');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[700px]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-md">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">Real Email Service (Resend)</h3>
                  {emailStatus.isConfigured ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 fill-emerald-400" />
                      Resend Active
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Key className="h-2.5 w-2.5" />
                      Key Setup Needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Transactional dispatches via Resend API (M-Pesa Receipts, Welcomes & Notifications)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subheader / Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeTab === 'dispatch'
                    ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Send Real Email</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  activeTab === 'logs'
                    ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Sent Email Logs ({emailStatus.sentEmailLogs?.length || 0})</span>
              </button>
            </div>

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-pink-600 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Status</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!emailStatus.isConfigured && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Key className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-900 dark:text-amber-200 mb-0.5">
                      Resend API Key Setup Instructions
                    </h4>
                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                      To send emails directly to real inboxes, create a free API key at{' '}
                      <a 
                        href="https://resend.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="underline font-bold text-amber-950 dark:text-amber-100"
                      >
                        resend.com
                      </a>{' '}
                      and set <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">RESEND_API_KEY</code> in environment variables.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyEnvVarKey}
                  className="px-3 py-1.5 bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-bold rounded-lg shrink-0 transition"
                >
                  {copiedText ? 'Copied Var Name!' : 'Copy RESEND_API_KEY'}
                </button>
              </div>
            )}

            {activeTab === 'dispatch' ? (
              <form onSubmit={handleSendEmail} className="space-y-5">
                {/* Template Selector */}
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Choose Template Preset:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTemplateChange('receipt')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col gap-1 ${
                        selectedTemplate === 'receipt'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm">🧾</span>
                      <span>M-Pesa Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('welcome')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col gap-1 ${
                        selectedTemplate === 'welcome'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm">🌸</span>
                      <span>Welcome Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('otp')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col gap-1 ${
                        selectedTemplate === 'otp'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm">🔐</span>
                      <span>Security Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('grant_update')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col gap-1 ${
                        selectedTemplate === 'grant_update'
                          ? 'bg-sky-50 border-sky-500 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm">🎓</span>
                      <span>Grant Status</span>
                    </button>
                  </div>
                </div>

                {/* Recipient Email & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Recipient Email Address:
                    </label>
                    <input
                      type="email"
                      required
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="e.g., user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subject Line:
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Body Content */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Message Content:
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your email message..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 leading-relaxed"
                  />
                </div>

                {/* Dispatch Status Banners */}
                {sendResult && (
                  <div className={`p-4 rounded-xl border text-xs font-bold ${
                    sendResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' 
                      : sendResult.requiresApiKey 
                        ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {sendResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-extrabold">{sendResult.message}</span>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Server proxy with secure Resend API integration</span>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    {sending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{sending ? 'Dispatching...' : 'Dispatch Email via Resend'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Sent Logs Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Recent Email Dispatches History
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Sender Address: {emailStatus.fromEmail}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                  {emailStatus.sentEmailLogs?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold">No email dispatches recorded yet.</p>
                    </div>
                  ) : (
                    emailStatus.sentEmailLogs.map(log => (
                      <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {log.subject}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            To: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.to}</span> • Provider: {log.provider}
                          </p>
                        </div>

                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
