import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, User, Sparkles, Fingerprint, AlertCircle } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { BiometricModal } from './BiometricModal';
import { apiService } from '../api';

interface AuthViewProps {
  onAuthSuccess: (isNewUser: boolean, name?: string, email?: string) => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enrollBiometrics, setEnrollBiometrics] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  
  // Security API state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Biometric Modal state
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [bioMode, setBioMode] = useState<'register' | 'authenticate'>('authenticate');

  useEffect(() => {
    const savedBioEmail = localStorage.getItem('big_biometric_registered_email');
    if (savedBioEmail) {
      setHasBiometrics(true);
      setEmail(savedBioEmail);
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    if (!isLogin && !name) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { token, user } = await apiService.login(email, password);
        localStorage.setItem('big_v2_session_token', token);
        localStorage.setItem('big_v2_current_user_email', email);
        onAuthSuccess(false, user.name, user.email);
      } else {
        if (enrollBiometrics) {
          setBioMode('register');
          setBioModalOpen(true);
        } else {
          const { token, user } = await apiService.register(name, email, password);
          localStorage.setItem('big_v2_session_token', token);
          localStorage.setItem('big_v2_current_user_email', email);
          onAuthSuccess(true, user.name, user.email);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSuccess = async (resolvedEmail: string, resolvedName?: string, biometricCredentialId?: string) => {
    setError(null);
    setLoading(true);
    try {
      if (bioMode === 'register') {
        const secureRandomPass = `BioPass_${Math.random().toString(36).slice(2, 10)}!`;
        const { token, user } = await apiService.register(
          name || resolvedName || 'BIG Member', 
          email || resolvedEmail, 
          password || secureRandomPass,
          biometricCredentialId
        );
        localStorage.setItem('big_v2_session_token', token);
        localStorage.setItem('big_v2_current_user_email', user.email || resolvedEmail);
        onAuthSuccess(true, user.name, user.email);
      } else {
        if (!biometricCredentialId) {
          throw new Error('Biometric key signature not found on this device');
        }
        const { token, user } = await apiService.biometricLogin(resolvedEmail, biometricCredentialId);
        localStorage.setItem('big_v2_session_token', token);
        localStorage.setItem('big_v2_current_user_email', user.email || resolvedEmail);
        onAuthSuccess(false, user.name, user.email);
      }
    } catch (err: any) {
      setError(err.message || 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBiometricLogin = () => {
    if (hasBiometrics) {
      setBioMode('authenticate');
      setBioModalOpen(true);
    } else {
      // No biometrics enrolled yet on this device - guide user
      setBioMode('register');
      setBioModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-widest relative z-10">
            {isLogin ? 'Welcome Back' : 'Join the Sisterhood'}
          </h2>
          <p className="text-white/80 mt-2 text-sm relative z-10">
            {isLogin ? 'Log in to your BIG account' : 'Start your journey with Be Independent Gal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 px-3.5 py-3 text-rose-800 dark:text-rose-300 text-xs font-semibold leading-relaxed animate-pulse">
              <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-primary dark:text-primary-foreground focus:border-secondary focus:outline-none"
                  placeholder="Sarah Jenkins"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-primary dark:text-primary-foreground focus:border-secondary focus:outline-none"
                placeholder="sister@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-primary dark:text-primary-foreground focus:border-secondary focus:outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {!isLogin && <PasswordStrengthIndicator password={password} />}
          </div>

          {!isLogin && (
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition duration-200">
              <input
                type="checkbox"
                checked={enrollBiometrics}
                onChange={(e) => setEnrollBiometrics(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                disabled={loading}
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-pink-500" />
                  Enroll Device Biometrics
                </span>
                <p className="text-[9px] text-slate-400 font-medium leading-normal">
                  Enable fast, cryptographically secured TouchID, FaceID, or platform logins.
                </p>
              </div>
            </label>
          )}

          <div className="space-y-3.5">
            <button
              type="submit"
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white transition-all hover:-translate-y-0.5 hover:bg-primary/95 shadow-md shadow-primary/20"
            >
              <span>{isLogin ? 'Log In' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={handleQuickBiometricLogin}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Fingerprint className="h-4 w-4 text-pink-500" />
                <span>Use Biometric Sign-In</span>
              </button>
            )}
          </div>
        </form>

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-secondary hover:underline uppercase tracking-wide text-xs"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>

      <BiometricModal
        isOpen={bioModalOpen}
        onClose={() => setBioModalOpen(false)}
        mode={bioMode}
        email={email}
        name={name}
        onSuccess={handleBiometricSuccess}
      />
    </div>
  );
}
