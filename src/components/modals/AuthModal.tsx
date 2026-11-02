import React, { useState } from 'react';
import { User, SkillCategory } from '../../types';
import { apiService } from '../../services/api';
import {
  Sparkles,
  X,
  Mail,
  UserPlus,
  LogIn,
  GraduationCap,
  BookOpen,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: User, isNewUser?: boolean) => void;
  registeredUsers?: User[];
  defaultTab?: 'google' | 'login' | 'register';
  isMandatory?: boolean; // if true, cannot be dismissed without signing in
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  registeredUsers = [],
  defaultTab = 'google',
  isMandatory = false,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>(defaultTab);

  // Google sign in state
  const [googleStep, setGoogleStep] = useState<'choose' | 'onboard'>('choose');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleCollege, setGoogleCollege] = useState('IIT Bombay');
  const [googleBranch, setGoogleBranch] = useState('Computer Science & Engineering');
  const [googleYear, setGoogleYear] = useState('3rd Year B.Tech');
  const [googleTeachSkill, setGoogleTeachSkill] = useState('React & Next.js');
  const [googleLearnSkill, setGoogleLearnSkill] = useState('DSA in C++ & Java');

  // Email login state
  const [loginEmail, setLoginEmail] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCollege, setRegCollege] = useState('IIT Bombay');
  const [regBranch, setRegBranch] = useState('Computer Science & Engineering');
  const [regYear, setRegYear] = useState('3rd Year B.Tech');
  const [regBio, setRegBio] = useState('');
  const [regTeachSkill, setRegTeachSkill] = useState('React & Next.js');
  const [regLearnSkill, setRegLearnSkill] = useState('DSA in C++ & Java');

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google Sign In trigger
  const handleGoogleSubmit = async (emailToUse: string, nameToUse?: string) => {
    if (!emailToUse.trim()) {
      setErrorMsg('Please enter a valid Google account or Gmail address.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      // Check if this email is already registered
      const clean = emailToUse.trim().toLowerCase();
      const existing = registeredUsers.find((u) => u.email.toLowerCase() === clean);

      if (existing) {
        // Direct Google Login
        const res = await apiService.loginWithGoogle({ email: clean });
        if (res.success && res.data) {
          onAuthSuccess(res.data.user, false);
          if (onClose) onClose();
          return;
        }
      }

      // If user doesn't exist yet and we haven't prompted onboarding, show quick campus profile setup
      if (googleStep === 'choose' && !existing) {
        setGoogleEmail(clean);
        setGoogleName(nameToUse || clean.split('@')[0].replace(/[._]/g, ' '));
        setGoogleStep('onboard');
        setLoading(false);
        return;
      }

      // Complete Google registration
      const studentName = googleName.trim() || clean.split('@')[0].replace(/[._]/g, ' ');
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`;
      const res = await apiService.loginWithGoogle({
        email: clean,
        name: studentName,
        avatar: avatarUrl,
        college: googleCollege,
        branch: googleBranch,
        year: googleYear,
        teachSkill: googleTeachSkill,
        learnSkill: googleLearnSkill,
      });

      if (res.success && res.data) {
        onAuthSuccess(res.data.user, res.data.isNew);
        if (onClose) onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete Google sign-in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Email / Gmail Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your registered Gmail or campus email.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await apiService.loginWithEmail(loginEmail.trim());
      if (res.success && res.data) {
        onAuthSuccess(res.data.user, false);
        if (onClose) onClose();
      } else {
        setErrorMsg(res.error || 'No registered account found with this email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed. Please verify email.');
    } finally {
      setLoading(false);
    }
  };

  // Standard Student Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Student name and email are required.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const studentEmail = regEmail.trim().toLowerCase();
      const res = await apiService.registerUser({
        name: regName.trim(),
        email: studentEmail,
        college: regCollege,
        branch: regBranch,
        year: regYear,
        bio: regBio.trim() || `Computer Science student passionate about peer learning and software engineering.`,
        skillsTeaching: [
          {
            id: `teach-${Date.now()}`,
            name: regTeachSkill,
            category: 'Web Development',
            proficiency: 'Intermediate',
            experienceMonths: 12,
            description: `Passionate about sharing insights on ${regTeachSkill}`,
            endorsementsCount: 0,
            tags: [regTeachSkill, 'Peer'],
          },
        ],
        skillsLearning: [
          {
            id: `learn-${Date.now()}`,
            name: regLearnSkill,
            category: 'Data Structures & Algorithms',
            targetProficiency: 'Advanced',
            priority: 'High',
            notes: `Aiming to master ${regLearnSkill} through weekly exchanges.`,
          },
        ],
      });

      if (res.success && res.data) {
        onAuthSuccess(res.data, true);
        if (onClose) onClose();
      } else {
        setErrorMsg('Registration failed. Please check details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Student Generator (to test peer exchanges with multiple students)
  const handleCreateDemoStudent = async (presetName: string, presetEmail: string, college: string, teach: string, learn: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.loginWithGoogle({
        name: presetName,
        email: presetEmail,
        college,
        branch: 'Computer Science & Engineering',
        year: '3rd Year B.Tech',
        teachSkill: teach,
        learnSkill: learn,
      });

      if (res.success && res.data) {
        onAuthSuccess(res.data.user, res.data.isNew);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with SkillQuest brand & close button */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-100">SkillQuest Campus</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">Join the peer skill-swapping network with zero tuition</p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-6 pt-3">
          <button
            onClick={() => { setActiveTab('google'); setErrorMsg(null); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'google'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Google G Icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Account</span>
          </button>

          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Gmail / Email Login</span>
          </button>

          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Profile</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">

          {/* Error notification */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* TAB 1: GOOGLE ACCOUNT LOGIN */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              {googleStep === 'choose' ? (
                <>
                  <div className="text-center py-2 space-y-1">
                    <h3 className="text-base font-bold text-slate-100">Sign in with your Google Account</h3>
                    <p className="text-slate-400 text-xs">
                      Use your official college Gmail or personal Google account to instantly access peer matching.
                    </p>
                  </div>

                  {/* Official Google Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleGoogleSubmit('student@gmail.com', 'Campus Student')}
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-98 cursor-pointer border border-slate-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Or Enter Custom Gmail */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      Or type your Gmail address
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Enter Gmail / Google Workspace:</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          placeholder="e.g. arjun.cse@gmail.com or student@iitb.ac.in"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loading || !googleEmail.trim()}
                      onClick={() => handleGoogleSubmit(googleEmail)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      <span>Sign In with this Google Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick-test accounts if available */}
                  {registeredUsers.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 mb-2">Registered Accounts on this Device:</p>
                      <div className="space-y-2">
                        {registeredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleGoogleSubmit(u.email, u.name)}
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between text-left transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                              <div>
                                <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{u.name}</p>
                                <p className="text-[10px] text-slate-500">{u.email} • {u.college}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400">1-Click Login →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Starter reward notice */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <p className="text-[11px]">
                      New students receive <strong>+250 XP starter bonus</strong> and unlock the <strong>Campus Initiate</strong> badge automatically!
                    </p>
                  </div>
                </>
              ) : (
                /* Google Onboarding Step (first-time Google user profile setup) */
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-indigo-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-bold text-xs">Google Verified: {googleEmail}</p>
                      <p className="text-[10px] text-slate-400">Complete your student profile to join the campus matrix</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Your Full Name:</label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">College / University:</label>
                      <input
                        type="text"
                        value={googleCollege}
                        onChange={(e) => setGoogleCollege(e.target.value)}
                        placeholder="e.g. IIT Bombay, DTU, BITS Pilani"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Branch / Major:</label>
                      <input
                        type="text"
                        value={googleBranch}
                        onChange={(e) => setGoogleBranch(e.target.value)}
                        placeholder="e.g. Computer Science"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Skill You Can Teach:</label>
                      <input
                        type="text"
                        value={googleTeachSkill}
                        onChange={(e) => setGoogleTeachSkill(e.target.value)}
                        placeholder="e.g. React & Next.js"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Skill You Want to Learn:</label>
                      <input
                        type="text"
                        value={googleLearnSkill}
                        onChange={(e) => setGoogleLearnSkill(e.target.value)}
                        placeholder="e.g. DSA in C++ & Java"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('choose')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleGoogleSubmit(googleEmail, googleName)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Complete Google Signup (+250 XP)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* TAB 2: EMAIL / GMAIL LOGIN */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <h3 className="text-base font-bold text-slate-100">Sign in with Registered Email</h3>
                <p className="text-slate-400 text-xs">
                  Enter your campus or personal email to access your streaks, skills, and exchange sessions.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. arjun.cse@gmail.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to SkillQuest</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-slate-400 text-xs">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-indigo-400 font-bold hover:underline"
                  >
                    Register here
                  </button>
                  {' '}or{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('google')}
                    className="text-indigo-400 font-bold hover:underline"
                  >
                    Use Google Sign-In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* TAB 3: REGISTER NEW STUDENT PROFILE */}
          {/* ═══════════════════════════════════════════════════════ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="text-center py-1">
                <h3 className="text-base font-bold text-slate-100">Create New Campus Student Profile</h3>
                <p className="text-slate-400 text-xs">
                  Start swapping tech skills with fellow engineering students across campuses
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Student Full Name:</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email / Gmail:</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. vikram@gmail.com"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">College / University:</label>
                  <input
                    type="text"
                    value={regCollege}
                    onChange={(e) => setRegCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi, BITS Pilani, DTU"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Branch / Major:</label>
                  <input
                    type="text"
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Year of Study:</label>
                <select
                  value={regYear}
                  onChange={(e) => setRegYear(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year B.Tech">1st Year B.Tech</option>
                  <option value="2nd Year B.Tech">2nd Year B.Tech</option>
                  <option value="3rd Year B.Tech">3rd Year B.Tech</option>
                  <option value="4th Year B.Tech">4th Year B.Tech</option>
                  <option value="M.Tech / MS Scholar">M.Tech / MS Scholar</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Skill You Can Teach:</label>
                  <input
                    type="text"
                    value={regTeachSkill}
                    onChange={(e) => setRegTeachSkill(e.target.value)}
                    placeholder="e.g. React & Next.js"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Skill You Want to Learn:</label>
                  <input
                    type="text"
                    value={regLearnSkill}
                    onChange={(e) => setRegLearnSkill(e.target.value)}
                    placeholder="e.g. System Design & Microservices"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Student Profile (+250 XP Starter Bonus)</span>
              </button>
            </form>
          )}

          {/* Quick Demo Helper (for evaluating or testing peer exchanges with 2 profiles) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400">Quick Testing / Peer Demos:</span>
              <span className="text-[10px] text-indigo-400">One-click creation</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCreateDemoStudent('Aarav Sharma', 'aarav.iitb@gmail.com', 'IIT Bombay', 'React & Next.js', 'DSA in C++ & Java')}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-bold text-slate-200">Aarav (IIT Bombay)</div>
                <div className="text-[10px] text-slate-400 truncate">Teaches React ⇄ Wants DSA</div>
              </button>
              <button
                type="button"
                onClick={() => handleCreateDemoStudent('Sneha Rao', 'sneha.bits@gmail.com', 'BITS Pilani', 'DSA in C++ & Java', 'React & Next.js')}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-bold text-slate-200">Sneha (BITS Pilani)</div>
                <div className="text-[10px] text-slate-400 truncate">Teaches DSA ⇄ Wants React</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
