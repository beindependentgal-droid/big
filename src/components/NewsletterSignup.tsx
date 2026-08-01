import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, Send, ShieldCheck, Bell, Award, BookOpen } from 'lucide-react';
import { apiService } from '../api';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'card' | 'banner' | 'embedded';
  setToast?: (toast: { id: string; title: string; desc: string; type: 'points' | 'badge' } | null) => void;
}

export function NewsletterSignup({ className = '', variant = 'card', setToast }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Success Stories',
    'Grant & Funding Alerts',
    'Academy Masterclasses'
  ]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(5420);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. sister@domain.com).');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const res = await apiService.subscribeNewsletter(email.trim(), selectedTopics);
      setStatus('success');
      if (res.totalSubscribers) {
        setSubscriberCount(res.totalSubscribers);
      } else {
        setSubscriberCount((prev) => prev + 1);
      }

      if (setToast) {
        setToast({
          id: `newsletter-${Date.now()}`,
          title: '🎉 Subscribed to BIG Dispatch!',
          desc: `Welcome confirmation sent to ${email.trim()}. You are now set for weekly sisterhood updates!`,
          type: 'points'
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to subscribe. Please try again.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
  };

  if (variant === 'banner') {
    return (
      <div id="newsletter-signup-banner" className={`bg-gradient-to-r from-primary to-primary-900 text-white py-12 px-4 sm:px-6 lg:px-8 rounded-3xl relative overflow-hidden shadow-xl ${className}`}>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/30">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              BIG Weekly Dispatch
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Stay Connected with the Sisterhood
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Weekly updates, success stories, and direct grant alerts delivered straight to your inbox.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[320px]">
            {status === 'success' ? (
              <div id="newsletter-success-state" className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">Thank You for Subscribing! 🎉</h4>
                  <p className="text-xs text-slate-200">
                    We've sent a confirmation to <span className="font-bold underline decoration-secondary decoration-2 text-white">{email}</span>.
                  </p>
                </div>
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {selectedTopics.map((topic) => (
                      <span key={topic} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/20">
                        ✓ {topic}
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    id="newsletter-reset-btn"
                    onClick={handleReset}
                    type="button"
                    className="text-xs font-bold text-secondary hover:text-white hover:underline transition-all inline-flex items-center gap-1"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="newsletter-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all"
                    />
                  </div>
                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {status === 'error' && errorMessage && (
                  <p id="newsletter-error-msg" className="text-xs text-red-300 font-medium">{errorMessage}</p>
                )}
                <p className="text-[10px] text-slate-300 flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Join {subscriberCount.toLocaleString()}+ sisters. Zero spam, unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="newsletter-signup-card"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Subtle decorative background circle */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-50 dark:bg-primary-950/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            BIG Weekly Dispatch
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Weekly Insights, Success Stories & Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Subscribe to our weekly dispatch to receive uplifting member stories, tech & business grant alerts, early masterclass invites, and actionable mentorship advice.
          </p>
        </div>

        {status === 'success' ? (
          <div
            id="newsletter-success-state"
            className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 sm:p-10 text-center space-y-5 animate-fadeIn shadow-inner"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-100/50 dark:ring-emerald-900/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Subscriber #{subscriberCount.toLocaleString()}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Thank You for Subscribing, Sister! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your subscription is confirmed! We've dispatched a welcome confirmation email to <span className="font-bold text-slate-900 dark:text-white underline decoration-secondary decoration-2">{email}</span>.
              </p>
            </div>

            {selectedTopics.length > 0 && (
              <div className="bg-white dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 max-w-lg mx-auto space-y-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-500" />
                  Your Active Preference Topics
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="newsletter-reset-btn"
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Subscribe another email
              </button>
            </div>
          </div>
        ) : (
          <form id="newsletter-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                Select Your Topics of Interest
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { name: 'Success Stories', icon: Award },
                  { name: 'Grant & Funding Alerts', icon: Sparkles },
                  { name: 'Academy Masterclasses', icon: BookOpen }
                ].map((topic) => {
                  const isSelected = selectedTopics.includes(topic.name);
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.name}
                      type="button"
                      onClick={() => toggleTopic(topic.name)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-sm dark:bg-primary-600 dark:border-primary-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Input & Submit Button */}
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="newsletter-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address (e.g. sister@domain.com)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Subscribe <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {status === 'error' && errorMessage && (
                <p id="newsletter-error-msg" className="text-xs text-red-500 font-medium text-center">{errorMessage}</p>
              )}

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  100% Spam-free
                </span>
                <span>•</span>
                <span>Unsubscribe anytime</span>
                <span>•</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Join {subscriberCount.toLocaleString()}+ sisters
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
