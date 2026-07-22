import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, Check, AlertCircle, X, ArrowRight, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiService } from '../api';

interface SensitiveActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionName: string;
  triggerSimulatedEmail?: (subject: string, body: string) => void;
}

export function SensitiveActionModal({
  isOpen,
  onClose,
  onSuccess,
  actionName,
  triggerSimulatedEmail
}: SensitiveActionModalProps) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  // Steps: 'intro' | 'email_verify' | 'pin_verify' | 'success' | 'error'
  const [step, setStep] = useState<'email_verify' | 'pin_verify' | 'success' | 'ready'>('ready');
  const [emailCode, setEmailCode] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and check security configuration
  useEffect(() => {
    if (isOpen) {
      const isEmail = localStorage.getItem('big_v2_security_email_verify') === 'true';
      const isPin = localStorage.getItem('big_v2_security_code_verify') === 'true';
      const email = localStorage.getItem('big_v2_current_user_email') || '';
      
      setEmailEnabled(isEmail);
      setPinEnabled(isPin);

      setEmailCode('');
      setEnteredPin('');
      setErrorMsg('');
      setIsSubmitting(false);

      if (isEmail && email) {
        setStep('email_verify');
        setIsSubmitting(true);
        apiService.requestOtp(email, actionName)
          .then(() => {
            setIsSubmitting(false);
            if (triggerSimulatedEmail) {
              triggerSimulatedEmail("One-Time Passcode Dispatched", `A secure 6-digit authorization passcode was sent to ${email}`);
            }
          })
          .catch((err: any) => {
            setErrorMsg(err.message || 'Failed to dispatch security code');
            setIsSubmitting(false);
          });
      } else if (isPin) {
        setStep('pin_verify');
      } else {
        // Neither toggled, auto-succeed or just show confirmation
        setStep('ready');
      }
    }
  }, [isOpen, actionName, triggerSimulatedEmail]);

  if (!isOpen) return null;

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const email = localStorage.getItem('big_v2_current_user_email') || '';
      if (!email) {
        setErrorMsg('Registered email is missing. Please re-authenticate.');
        setIsSubmitting(false);
        return;
      }
      
      await apiService.verifyOtp(email, emailCode);
      setIsSubmitting(false);

      if (pinEnabled) {
        setStep('pin_verify');
      } else {
        handleCompleteSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid verification code. Please check your simulated mailbox.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await apiService.verifyPin(enteredPin);
      setIsSubmitting(false);
      handleCompleteSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect Security PIN. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmReady = () => {
    handleCompleteSuccess();
  };

  const handleCompleteSuccess = () => {
    setIsSubmitting(true);
    setStep('success');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-500">
              <Shield className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black text-primary dark:text-white uppercase tracking-tight">
                Authorize Action
              </h2>
              <p className="text-xs font-semibold text-pink-500 mt-1 uppercase tracking-wider">
                {actionName}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. NO PROTECTIONS ACTIVE */}
            {step === 'ready' && (
              <div className="space-y-4 text-center">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  No strict action verification requirements are currently configured. Would you like to proceed with the authorization?
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-3.5 py-2.5 rounded-xl font-bold">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>You can activate Email Verification or PIN requirements in the Settings tab anytime.</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReady}
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-850 dark:hover:bg-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Authorize</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. EMAIL VERIFICATION STEP */}
            {step === 'email_verify' && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    A one-time 6-digit code has been dispatched to your registered mailbox.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 dark:bg-pink-950/30 px-3 py-1 rounded-md">
                    <Mail className="h-3.5 w-3.5" />
                    Simulated Email Dispatched
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-slate-800 dark:text-white outline-none focus:border-pink-500 transition-all"
                    placeholder="••••••"
                  />
                  <p className="text-[9px] text-slate-400 text-center italic mt-1">
                    Tip: View the simulated inbox popup in the top-right corner to get the code!
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 px-3 py-2.5 text-rose-800 dark:text-rose-300 text-[10px] font-medium leading-relaxed">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pink-600 transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* 3. SECURITY PIN CODE STEP */}
            {step === 'pin_verify' && (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {emailEnabled ? 'Next, enter your personal Security PIN Code.' : 'Please enter your personal Security PIN Code to authorize.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    6-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-slate-800 dark:text-white outline-none focus:border-pink-500 transition-all"
                    placeholder="••••••"
                  />
                  <p className="text-[9px] text-slate-400 text-center italic mt-1">
                    Note: The default PIN is 123456 (or configure a custom PIN in Settings).
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 px-3 py-2.5 text-rose-800 dark:text-rose-300 text-[10px] font-medium leading-relaxed">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-850 dark:hover:bg-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-slate-900/20 dark:shadow-none"
                  >
                    <span>Authorize PIN</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* 4. SUCCESS STATE */}
            {step === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-6 space-y-4"
              >
                <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20">
                  <Check className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Authorized Successfully
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 leading-normal">
                    Cryptographic signature attached. Executing your action secure index.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
