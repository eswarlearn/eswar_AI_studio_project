import React, { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { 
  Database, User, Lock, Eye, EyeOff, LogIn, UserPlus, 
  CheckCircle2, AlertCircle, Loader2, Cpu, ShieldCheck, 
  Sparkles, ArrowRight
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, continueAsGuest } = useGame();
  // Default to 'register' (Create Account first) as requested
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter your User ID / Username.');
      return;
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      setError('User ID must be between 3 and 30 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      setError('User ID may only contain letters, numbers, underscores, and dashes.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register(cleanUsername, password);
      } else {
        await login(cleanUsername, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (msg.includes('INVALID_CREDENTIALS')) {
        setError(
          `User ID "${cleanUsername}" was not found or password was incorrect. If you haven't created your account yet, click "1. Create Account" above first!`
        );
      } else if (msg.includes('USERNAME_ALREADY_TAKEN')) {
        setError(
          `User ID "${cleanUsername}" is already taken! If this is your account, switch to "2. Sign In" above.`
        );
      } else if (msg.includes('PASSWORD_TOO_SHORT')) {
        setError('Password must be at least 4 characters long.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600/30 relative overflow-hidden">
      {/* Background ambient glowing gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Wordmark */}
      <div className="flex flex-col items-center mb-6 text-center z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/20 mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Cpu className="w-7 h-7 text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Backend Quest
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
          Distributed Systems, Cloud Architecture & Incident Response Simulator
        </p>
        
        {/* PostgreSQL Database Connected Status */}
        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>PostgreSQL Database Connected & Ready</span>
        </div>
      </div>

      {/* Authentication Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 flex flex-col gap-5">
        {/* 2-Step Process Tabs: Create Account 1st, Sign In 2nd */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>1. Create Account</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>2. Sign In</span>
          </button>
        </div>

        {/* Informational Guidance Callout */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200/90 leading-relaxed">
          {mode === 'register' ? (
            <>
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Step 1: Create your Engineer Account</strong>
                Your User ID & password will be stored in PostgreSQL. All completed levels, star badges, high scores, and architectures will be saved to this account.
              </div>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Step 2: Sign In to Existing Account</strong>
                Enter your credentials to load all your saved progress, completed levels, and active canvas sessions from PostgreSQL.
              </div>
            </>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 leading-relaxed animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              User ID / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. eswaramoorthy"
                autoComplete="username"
                disabled={submitting}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                disabled={submitting}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-blue-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Registration only) with Eye Toggle */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={submitting}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'register' ? 'Creating Account in Database...' : 'Signing In & Loading Progress...'}</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Start Game</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Continue Game</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Create Account and Sign In */}
        <div className="text-center pt-1 border-t border-slate-800/80">
          {mode === 'register' ? (
            <p className="text-xs text-slate-400">
              Already registered your account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Create Account here
              </button>
            </p>
          )}
        </div>

        {/* Optional Guest Mode link */}
        <div className="text-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Or play as Guest without an account (progress won't save across reboots)
          </button>
        </div>
      </div>
    </div>
  );
};
