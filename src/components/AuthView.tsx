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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, user, isNewUser = false } = event.data;
        const normalizedEmail = user.email?.trim().toLowerCase() || '';
        localStorage.setItem('big_v2_session_token', token);
        localStorage.setItem('big_v2_current_user_email', normalizedEmail);
        onAuthSuccess(isNewUser, user.name, normalizedEmail);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !password) return;
    if (!isLogin && !name) return;

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      if (isLogin) {
        const { token, user } = await apiService.login(normalizedEmail, password);
        localStorage.setItem('big_v2_session_token', token);
        localStorage.setItem('big_v2_current_user_email', normalizedEmail);
        onAuthSuccess(false, user.name, user.email || normalizedEmail);
      } else {
        if (enrollBiometrics) {
          setBioMode('register');
          setBioModalOpen(true);
        } else {
          const { token, user } = await apiService.register(name, normalizedEmail, password);
          localStorage.setItem('big_v2_session_token', token);
          localStorage.setItem('big_v2_current_user_email', normalizedEmail);
          
          // Show success message about welcome email
          setSuccess(`🎉 Welcome to BIG, ${name}! A welcome email has been sent to ${normalizedEmail}. Check your inbox!`);
          
          // Small delay to show the message before navigating
          setTimeout(() => {
            onAuthSuccess(true, user.name, user.email || normalizedEmail);
          }, 1500);
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
        
        // Show success message about welcome email and biometric enrollment
        setSuccess(`🔐 Biometrics enrolled! Welcome email sent to ${user.email || resolvedEmail}.`);
        
        // Small delay to show success message before navigating
        setTimeout(() => {
          onAuthSuccess(true, user.name, user.email);
        }, 1500);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(window.location.origin)}`);
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to connect to Google Auth API");
      }
      const data = await res.json();

      const authWindow = window.open(
        data.url,
        'google_oauth_popup',
        'width=500,height=600'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to sign in with Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Please enter your email address to receive a reset code.');
      return;
    }

    setLoading(true);
    try {
      await apiService.requestOtp(email, 'Password Reset');
      setSuccess(`✅ Password reset code sent! Check ${email} for a 6-digit code (expires in 5 minutes). Enter it below to set a new password.`);
    } catch (err: any) {
      const errorMsg = err.message || 'Could not dispatch your reset code.';
      // Provide helpful guidance if email service isn't configured
      if (errorMsg.includes('not configured') || errorMsg.includes('RESEND')) {
        setError(`📧 Note: Email service is in test mode. Check the browser console or server logs for your reset code.`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !otpCode || !newPassword) {
      setError('Please fill in your email, the reset code, and your new password.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.resetPassword(email, otpCode, newPassword);
      setSuccess(result.message || 'Password reset successful.');
      setIsResettingPassword(false);
      setOtpCode('');
      setNewPassword('');
      setPassword('');
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
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

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              {success}
            </div>
          )}

          {isResettingPassword ? (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-primary focus:border-secondary focus:outline-none"
                    placeholder="sister@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reset Code</label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-primary focus:border-secondary focus:outline-none"
                  placeholder="123456"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-primary focus:border-secondary focus:outline-none"
                    placeholder="Choose a new password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-primary/95 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setOtpCode('');
                    setNewPassword('');
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
                >
                  Back
                </button>
              </div>

              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={loading}
                className="w-full text-sm font-semibold text-secondary underline"
              >
                Send me a new reset code
              </button>
            </form>
          ) : (
            <>
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
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white transition-all hover:-translate-y-0.5 hover:bg-primary/95 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLogin ? 'Log In' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsResettingPassword(true);
                  setSuccess(null);
                  setError(null);
                }}
                className="w-full text-sm font-semibold text-secondary underline"
              >
                Forgot password?
              </button>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">or continue with</span>
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.72 21.56,11.39 21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.34,0.97 -2.57,0 -4.75,-1.73 -5.53,-4.06H2.38v2.65C3.89,17.48 7.64,20.6 12,20.6z" fill="#34A853" />
                  <path d="M6.47,12.76c-0.19,-0.58 -0.3,-1.2 -0.3,-1.84s0.11,-1.26 0.3,-1.84V6.43H2.38c-0.64,1.28 -1,2.72 -1,4.24s0.36,2.96 1,4.24L6.47,12.76z" fill="#FBBC05" />
                  <path d="M12,5.16c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.51 14.43,1.7 12,1.7C7.64,1.7 3.89,4.82 2.38,7.82l4.09,3.18C7.25,6.89 9.43,5.16 12,5.16z" fill="#EA4335" />
                </g>
              </svg>
              <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={handleQuickBiometricLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <Fingerprint className="h-4 w-4 text-pink-500" />
                <span>Use Biometric Sign-In</span>
              </button>
            )}
          </div>
            </>
          )}
        </form>

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setIsResettingPassword(false);
                setError(null);
                setSuccess(null);
                setOtpCode('');
                setNewPassword('');
              }}
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
