// =============================================================
//  SkillQuest — Root Application Component
//  ─────────────────────────────────────────────────────────────
//  This is the top-level component that:
//   1. Owns ALL application state (users, exchanges, quests, etc.)
//   2. Loads initial data from the backend on mount
//   3. Defines every event handler (check-in, propose exchange, etc.)
//   4. Renders the correct view based on the active navigation tab
//   5. Controls which modals are open and what data they receive
//
//  Think of this as the "Controller" — it connects the UI to the API.
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';

// Type imports
import { User, SkillItem, SkillExchange, Quest, Review, MatchSynergy, SkillCategory } from './types';

// API service — all backend calls go through here
import { apiService } from './services/api';

// Real-time hook — SSE connection + notification inbox
import { useRealtime } from './hooks/useRealtime';

// Central config — XP values, durations, etc.
import { APP_CONFIG } from './config';

// Layout components
import { Sidebar } from './components/Sidebar';

// Page/view components (one per navigation tab)
import { DashboardView }     from './components/DashboardView';
import { ExploreSkillsView } from './components/ExploreSkillsView';
import { SkillExchangeView } from './components/SkillExchangeView';
import { QuestsView }        from './components/QuestsView';
import { LeaderboardView }   from './components/LeaderboardView';
import { AchievementsView }  from './components/AchievementsView';
import { ProfileView }       from './components/ProfileView';
import { TutorHubView }      from './components/TutorHubView';

// Modal components (overlays triggered by user actions)
import { NewExchangeModal } from './components/modals/NewExchangeModal';
import { AddSkillModal }    from './components/modals/AddSkillModal';
import { ReviewModal }      from './components/modals/ReviewModal';
import { AIMentorModal }    from './components/modals/AIMentorModal';
import { RegisterModal }    from './components/modals/RegisterModal';
import { AuthModal }        from './components/modals/AuthModal';

// Utilities
import { triggerCelebration, triggerGrandCelebration } from './utils/confetti';
import { Sparkles, CheckCircle2, Award } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  App Component
// ─────────────────────────────────────────────────────────────

export default function App() {

  // ══════════════════════════════════════════════════════════
  //  SECTION 1: Application State
  // ══════════════════════════════════════════════════════════

  // Navigation & Theme
  const [activeTab, setActiveTab]   = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillquest-theme');
      if (saved !== null) return saved === 'dark';
    }
    return true;
  });

  // Sync theme changes with DOM and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark');
        localStorage.setItem('skillquest-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light-mode');
        document.body.classList.remove('dark');
        document.body.classList.add('light-mode');
        localStorage.setItem('skillquest-theme', 'light');
      }
    }
  }, [isDarkMode]);

  // Core data loaded from the backend on mount
  const [allUsers,     setAllUsers]     = useState<User[]>([]);
  const [currentUser,  setCurrentUser]  = useState<User | null>(null);
  const [skills,       setSkills]       = useState<SkillItem[]>([]);
  const [exchanges,    setExchanges]    = useState<SkillExchange[]>([]);
  const [quests,       setQuests]       = useState<Quest[]>([]);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [matches,      setMatches]      = useState<MatchSynergy[]>([]);
  const [loading,      setLoading]      = useState<boolean>(true);

  // ── Modal visibility & pre-filled data ──────────────────────

  // Exchange modal — can be opened with pre-selected user/skills
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangePreselect,   setExchangePreselect]   = useState<{
    user?: User;
    initialOffer?: string;
    initialRequest?: string;
  }>({});

  // Add-skill modal — opened in 'teach' or 'learn' mode
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [addSkillType,        setAddSkillType]        = useState<'teach' | 'learn'>('teach');

  // Review modal — opened with the specific exchange being reviewed
  const [isReviewModalOpen,         setIsReviewModalOpen]         = useState(false);
  const [selectedExchangeForReview, setSelectedExchangeForReview] = useState<SkillExchange | null>(null);

  // AI Mentor modal — can be pre-loaded with a skill name and/or peer user
  const [isAIMentorOpen,  setIsAIMentorOpen]  = useState(false);
  const [aiMentorParams,  setAIMentorParams]  = useState<{ skill?: string; peer?: User }>({});

  // Registration modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Auth modal (Google Account / Registered Gmail Login / Onboarding)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab,  setAuthDefaultTab]  = useState<'google' | 'login' | 'register'>('google');

  // ── Toast notification ──────────────────────────────────────
  const [toast, setToast] = useState<{
    message: string;
    xpGained?: number;
    levelUp?: boolean;
    type?: 'success' | 'info' | 'reward';
  } | null>(null);

  // ── Real-time SSE notifications ──────────────────────────────
  const {
    notifications,
    unreadCount,
    isConnected: isRealtimeConnected,
    markAllRead,
    markRead,
    clearAll: clearNotifications,
  } = useRealtime({ currentUser });

  // ══════════════════════════════════════════════════════════
  //  SECTION 2: Toast Helper
  // ══════════════════════════════════════════════════════════

  /**
   * Show a temporary toast notification at the top-right of the screen.
   * Automatically triggers confetti based on the event severity:
   *   - Level up  → grand side-cannon celebration
   *   - XP gained → small confetti burst
   *   - Info only → no animation
   *
   * Toast auto-dismisses after APP_CONFIG.toastDurationMs milliseconds.
   */
  // ══════════════════════════════════════════════════════════
  //  SECTION 2b: Re-sync current user's XP from the real DB
  //  Called after any action that awards XP server-side but
  //  doesn't return the updated user object in the response.
  // ══════════════════════════════════════════════════════════

  const syncCurrentUser = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await apiService.getUserById(currentUser.id);
      if (res.success && res.data) {
        const { reviews: _reviews, ...freshUser } = res.data as any;
        setCurrentUser(freshUser);
        setAllUsers((prev) => prev.map((u) => (u.id === freshUser.id ? freshUser : u)));
      }
    } catch (err) {
      console.error('[App] syncCurrentUser:', err);
    }
  }, [currentUser]);

  const showToast = (message: string, xpGained?: number, levelUp?: boolean) => {
    setToast({ message, xpGained, levelUp, type: levelUp ? 'reward' : 'success' });

    if (levelUp)      triggerGrandCelebration(); // Big celebration for level-up
    else if (xpGained) triggerCelebration();     // Small burst for XP gain

    setTimeout(() => setToast(null), APP_CONFIG.toastDurationMs);
  };

  // ══════════════════════════════════════════════════════════
  //  SECTION 3: Initial Data Load (runs once on mount)
  // ══════════════════════════════════════════════════════════

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all core data in parallel for faster load
        const [usersRes, skillsRes, exchangesRes, questsRes, reviewsRes] = await Promise.all([
          apiService.getUsers(),
          apiService.getSkills(),
          apiService.getExchanges(),
          apiService.getQuests(),
          apiService.getReviews(),
        ]);

        if (usersRes.success) {
          const fetchedUsers = usersRes.data || [];
          setAllUsers(fetchedUsers);

          // Restore last active user session from localStorage, or default to first registered user
          const savedUserId = typeof window !== 'undefined'
            ? localStorage.getItem('skillquest_active_user_id')
            : null;

          const activeUser = (savedUserId ? fetchedUsers.find((u) => u.id === savedUserId) : null)
            || (fetchedUsers.length > 0 ? fetchedUsers[0] : null);

          setCurrentUser(activeUser);

          // Load peer matches specifically for the active student
          if (activeUser) {
            localStorage.setItem('skillquest_active_user_id', activeUser.id);
            const matchesRes = await apiService.getMatches(activeUser.id);
            if (matchesRes.success) setMatches(matchesRes.data);
          }
        }

        if (skillsRes.success)    setSkills(skillsRes.data);
        if (exchangesRes.success) setExchanges(exchangesRes.data);
        if (questsRes.success)    setQuests(questsRes.data);
        if (reviewsRes.success)   setReviews(reviewsRes.data);

      } catch (err) {
        console.error('[App] Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array = runs once on mount

  // ══════════════════════════════════════════════════════════
  //  SECTION 4: Event Handlers (API → State Updates)
  // ══════════════════════════════════════════════════════════
  //
  //  Each handler follows the same pattern:
  //    1. Guard check (bail early if currentUser is null)
  //    2. Call API
  //    3. Update local state with the server's response
  //    4. Show a toast notification
  //
  // ──────────────────────────────────────────────────────────

  /**
   * Handle successful sign-in with Google, direct registered Gmail login, or new onboarding
   */
  const handleAuthSuccess = async (user: User, isNewUser?: boolean) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillquest_active_user_id', user.id);
    }
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
    });

    setIsAuthModalOpen(false);

    try {
      const matchesRes = await apiService.getMatches(user.id);
      if (matchesRes.success) setMatches(matchesRes.data);
    } catch (err) {
      console.error('[App] handleAuthSuccess matches:', err);
    }

    if (isNewUser) {
      showToast(
        `Welcome to SkillQuest, ${user.name}! +${APP_CONFIG.xp.registrationToast} XP Starter Bonus!`,
        APP_CONFIG.xp.registrationToast,
        true
      );
    } else {
      showToast(
        `Welcome back, ${user.name}! Signed in via ${user.authProvider === 'google' ? 'Google Account' : 'SkillQuest'}.`
      );
    }
  };

  /**
   * Logout current student account
   */
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillquest_active_user_id');
    }
    setCurrentUser(null);
    setMatches([]);
    showToast('Signed out of SkillQuest.');
    setAuthDefaultTab('google');
    setIsAuthModalOpen(true);
  };

  /**
   * Switch the active user (dev/demo feature via the Navbar user switcher).
   * Re-fetches matches for the newly selected user.
   */
  const handleSwitchUser = async (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillquest_active_user_id', user.id);
    }
    try {
      const matchesRes = await apiService.getMatches(user.id);
      if (matchesRes.success) setMatches(matchesRes.data);
    } catch (err) {
      console.error('[App] handleSwitchUser:', err);
    }
    showToast(`Active profile switched to ${user.name}.`);
  };

  /**
   * Handler 1 — Daily Streak Check-In
   * Awards XP and increments the streak counter for today.
   * Server is idempotent — calling this twice in one day has no extra effect.
   */
  const handleDailyCheckIn = async () => {
    if (!currentUser) return;
    try {
      const res = await apiService.dailyCheckIn(currentUser.id);
      if (res.success) {
        setCurrentUser(res.data.user);
        // Keep allUsers in sync so the leaderboard shows accurate data
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.user.id ? res.data.user : u)));
        const xp = res.data.xpAwarded > 0 ? res.data.xpAwarded : undefined;
        showToast(
          res.data.message,
          xp,
          res.data.leveledUp ?? (res.data.user.level > (currentUser?.level || 1))
        );
      }
    } catch (err) {
      console.error('[App] handleDailyCheckIn:', err);
    }
  };


  /**
   * Handler 2 — Claim Quest Reward
   * Marks the quest as claimed and awards its XP to the current user.
   */
  const handleClaimQuest = async (questId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiService.claimQuest(questId, currentUser.id);
      if (res.success) {
        setQuests(res.data.quests);
        setCurrentUser(res.data.user);
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.user.id ? res.data.user : u)));
        showToast(
          `Quest Reward Claimed! +${res.data.xpAwarded} XP`,
          res.data.xpAwarded,
          res.data.user.level > (currentUser?.level || 1)
        );
      }
    } catch (err) {
      console.error('[App] handleClaimQuest:', err);
    }
  };

  /**
   * Handler 3 — Submit a New Exchange Proposal
   * Creates a pending skill exchange from the current user to a chosen peer.
   * Called when the NewExchangeModal form is submitted.
   */
  const handleSubmitExchangeProposal = async (payload: {
    toUserId: string;
    skillOffered: string;
    skillRequested: string;
    message: string;
    preferredSchedule: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await apiService.createExchange({
        fromUserId: currentUser.id,
        ...payload,
      });
      if (res.success) {
        // Prepend new exchange so it appears at the top of the list
        setExchanges((prev) => [res.data, ...prev]);
        // ── XP SYNC: Server awards +25 XP to proposer on the DB.
        //    Re-fetch the real user to reflect accurate XP in sidebar.
        const prevXP = currentUser.xp;
        await syncCurrentUser();
        // After sync, compute actual XP gained from DB vs before
        showToast(
          `Skill Exchange Proposal Sent! +${APP_CONFIG.xp.proposeExchange} XP`,
          APP_CONFIG.xp.proposeExchange,
          false
        );
      }
    } catch (err) {
      console.error('[App] handleSubmitExchangeProposal:', err);
    }
  };

  /**
   * Handler 4 — Accept an Incoming Exchange Proposal
   * Moves the exchange from 'pending' → 'in_progress'.
   * The server auto-generates a Google Meet link on acceptance.
   */
  const handleAcceptExchange = async (exchangeId: string) => {
    try {
      const res = await apiService.updateExchangeStatus(exchangeId, 'in_progress');
      if (res.success) {
        setExchanges((prev) => prev.map((e) => (e.id === exchangeId ? res.data : e)));
        showToast('Exchange Proposal Accepted! Collaborative Workspace Created.');
        // Sync current user in case they are the one who accepted
        await syncCurrentUser();
      }
    } catch (err) {
      console.error('[App] handleAcceptExchange:', err);
    }
  };

  /**
   * Handler 5 — Decline an Incoming Exchange Proposal
   * Removes the exchange from the list after declining.
   */
  const handleDeclineExchange = async (exchangeId: string) => {
    try {
      const res = await apiService.updateExchangeStatus(exchangeId, 'cancelled');
      if (res.success) {
        // Remove it from state entirely — declined exchanges aren't shown
        setExchanges((prev) => prev.filter((e) => e.id !== exchangeId));
        showToast('Exchange proposal declined.');
      }
    } catch (err) {
      console.error('[App] handleDeclineExchange:', err);
    }
  };

  /**
   * Handler 6 — Toggle a Milestone's Completion State
   * Called when a student checks/unchecks a milestone checkbox in an active exchange.
   */
  const handleToggleMilestone = async (exchangeId: string, milestoneId: string, completed: boolean) => {
    try {
      const res = await apiService.toggleMilestone(exchangeId, milestoneId, completed);
      if (res.success) {
        setExchanges((prev) => prev.map((e) => (e.id === exchangeId ? res.data : e)));
      }
    } catch (err) {
      console.error('[App] handleToggleMilestone:', err);
    }
  };

  /**
   * Handler 7 — Add a Session Note to an Exchange
   * Appends a timestamped note to the exchange's session log.
   */
  const handleAddNote = async (exchangeId: string, note: string) => {
    try {
      const res = await apiService.addSessionNote(exchangeId, note);
      if (res.success) {
        setExchanges((prev) => prev.map((e) => (e.id === exchangeId ? res.data : e)));
        showToast('Session note added.');
      }
    } catch (err) {
      console.error('[App] handleAddNote:', err);
    }
  };

  /**
   * Handler 8 — Submit a Peer Review & Complete the Exchange
   * Awards XP_COMPLETE (200 XP) to both students.
   * Updates both users and marks the exchange as 'completed'.
   */
  const handleSubmitReview = async (payload: {
    exchangeId: string;
    toUserId: string;
    rating: number;
    comment: string;
    tags: string[];
    skillExchanged: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await apiService.createReview({
        exchangeId: payload.exchangeId,
        fromUserId: currentUser.id,
        toUserId: payload.toUserId,
        rating: payload.rating,
        comment: payload.comment,
        tags: payload.tags,
        skillExchanged: payload.skillExchanged,
      });

      if (res.success) {
        // Prepend the new review
        setReviews((prev) => [res.data.review, ...prev]);

        // Update both involved users in state
        if (res.data.fromUser.id === currentUser.id) setCurrentUser(res.data.fromUser);
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === res.data.fromUser.id ? res.data.fromUser
            : u.id === res.data.toUser.id ? res.data.toUser
            : u
          )
        );

        // Mark the exchange as completed in local state
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === payload.exchangeId
              ? { ...e, status: 'completed', completedAt: new Date().toISOString().split('T')[0] }
              : e
          )
        );

        showToast(
          `Exchange Completed! +${APP_CONFIG.xp.exchangeComplete} XP Awarded to both students!`,
          APP_CONFIG.xp.exchangeComplete,
          res.data.fromUser.level > currentUser.level // Did they level up?
        );
      }
    } catch (err) {
      console.error('[App] handleSubmitReview:', err);
    }
  };

  /**
   * Handler 9a — Add a Skill to the "I Can Teach" List
   * Accepts raw skill form data from AddSkillModal.
   */
  const handleAddTeachingSkill = async (skillData: any) => {
    if (!currentUser) return;
    try {
      const res = await apiService.addTeachingSkill(currentUser.id, skillData);
      if (res.success) {
        setCurrentUser(res.data);
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
        // Refresh peer matches since teaching skills updated
        apiService.getMatches(currentUser.id).then((matchRes) => {
          if (matchRes.success) setMatches(matchRes.data);
        });
        showToast(`Added ${skillData.name} to skills you teach!`);
      }
    } catch (err) {
      console.error('[App] handleAddTeachingSkill:', err);
    }
  };

  /**
   * Handler 9b — Add a Skill to the "I Want to Learn" Wishlist
   * Accepts raw skill form data from AddSkillModal.
   */
  const handleAddLearningSkill = async (skillData: any) => {
    if (!currentUser) return;
    try {
      const res = await apiService.addLearningSkill(currentUser.id, skillData);
      if (res.success) {
        setCurrentUser(res.data);
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
        // Refresh peer matches since learning wishlist updated
        apiService.getMatches(currentUser.id).then((matchRes) => {
          if (matchRes.success) setMatches(matchRes.data);
        });
        showToast(`Added ${skillData.name} to learning wishlist!`);
      }
    } catch (err) {
      console.error('[App] handleAddLearningSkill:', err);
    }
  };

  /**
   * Handler 10 — Delete a Skill from Teaching or Learning List
   *
   * @param type    'teach' to remove from teaching list, 'learn' for learning list
   * @param skillId The unique ID of the skill to remove
   */
  const handleDeleteSkill = async (type: 'teach' | 'learn', skillId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiService.deleteSkill(currentUser.id, type, skillId);
      if (res.success) {
        setCurrentUser(res.data);
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
        // Refresh peer matches after removing skill
        apiService.getMatches(currentUser.id).then((matchRes) => {
          if (matchRes.success) setMatches(matchRes.data);
        });
        showToast('Skill removed from profile.');
      }
    } catch (err) {
      console.error('[App] handleDeleteSkill:', err);
    }
  };

  /**
   * Handler 11 — Update the Current User's Bio Text
   * Called when the user saves their bio from the Profile page.
   */
  const handleUpdateBio = async (bio: string) => {
    if (!currentUser) return;
    try {
      const res = await apiService.updateUser(currentUser.id, { bio });
      if (res.success) {
        setCurrentUser(res.data);
        setAllUsers((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
        showToast('Bio updated successfully.');
      }
    } catch (err) {
      console.error('[App] handleUpdateBio:', err);
    }
  };

  /**
   * Handler 12 — Register a New Student Account
   * Called from the RegisterModal. The new user becomes the active user.
   */
  const handleRegisterUser = async (newUserData: Partial<User>) => {
    try {
      const res = await apiService.registerUser(newUserData);
      if (res.success) {
        setAllUsers((prev) => [...prev, res.data]);
        setCurrentUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('skillquest_active_user_id', res.data.id);
        }
        showToast(
          `Welcome to ${APP_CONFIG.appName}, ${res.data.name}! +${APP_CONFIG.xp.registrationToast} XP Starter Bonus!`,
          APP_CONFIG.xp.registrationToast
        );
      }
    } catch (err) {
      console.error('[App] handleRegisterUser:', err);
    }
  };

  /**
   * Handler 13 — Generate New AI-Personalized Quests
   * Calls the Gemini AI endpoint to create 2 new tailored quests.
   */
  const handleGenerateAIQuests = async () => {
    if (!currentUser) return;
    try {
      const learningGoals = currentUser.skillsLearning.map((s) => s.name);
      const res = await apiService.generateAIQuests(currentUser.id, learningGoals, currentUser.branch);
      if (res.success) {
        // Re-fetch full quest list or merge to ensure existing quests are never lost
        const allQuestsRes = await apiService.getQuests();
        if (allQuestsRes.success && allQuestsRes.data.length > 0) {
          setQuests(allQuestsRes.data);
        } else {
          setQuests((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const fresh = res.data.filter((q) => !existingIds.has(q.id));
            return [...fresh, ...prev];
          });
        }
        showToast('New AI Personalized Quests Generated with Gemini!');
      }
    } catch (err) {
      console.error('[App] handleGenerateAIQuests:', err);
    }
  };

  // ══════════════════════════════════════════════════════════
  //  SECTION 5: Loading Screen & Auth Gate
  // ══════════════════════════════════════════════════════════

  // Show an animated loading screen while fetching initial data
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'light-mode bg-slate-50 text-slate-900'
      }`}>
        {/* Animated logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-[2px] shadow-xl animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4 bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
          {APP_CONFIG.appName} Campus Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">Booting peer skill exchange matrix & AI modules...</p>
      </div>
    );
  }

  // If no student is signed in, prompt them to sign in with Google or their registered account
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'light-mode bg-slate-50 text-slate-900'
      }`}>
        {/* Ambient lighting glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <AuthModal
          isOpen={true}
          isMandatory={true}
          registeredUsers={allUsers}
          onAuthSuccess={handleAuthSuccess}
          defaultTab={authDefaultTab}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  SECTION 6: Main Render
  // ══════════════════════════════════════════════════════════

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'light-mode bg-slate-50 text-slate-900'
    }`}>

      {/* ── Toast Notification ─────────────────────────────── */}
      {toast && (
        <div className="fixed top-5 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl flex items-center gap-3.5 max-w-md">
            {/* Icon changes based on toast type */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              {toast.levelUp
                ? <Award className="w-6 h-6 animate-bounce" />
                : <CheckCircle2 className="w-6 h-6" />
              }
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">{toast.message}</p>
              {toast.xpGained && (
                <p className="text-[11px] font-extrabold text-amber-400 mt-0.5">
                  +{toast.xpGained} XP Earned!
                </p>
              )}
              {toast.levelUp && (
                <p className="text-[11px] font-black text-emerald-400 mt-0.5 animate-pulse">
                  LEVEL UP! Congratulations!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar Navigation (Desktop permanent + Mobile header & drawer) ── */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenRegister={() => {
          setAuthDefaultTab('register');
          setIsAuthModalOpen(true);
        }}
        onOpenAIMentor={() => {
          setAIMentorParams({});
          setIsAIMentorOpen(true);
        }}
        onOpenLogin={() => {
          setAuthDefaultTab('google');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        notifications={notifications}
        unreadCount={unreadCount}
        isRealtimeConnected={isRealtimeConnected}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        onClearNotifications={clearNotifications}
      />

      {/* ── Main Content Area & Layout Wrapper ─────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Tab: Dashboard — overview, matches, quick actions */}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            matches={matches}
            exchanges={exchanges}
            quests={quests}
            onNavigate={setActiveTab}
            onOpenExchangeModal={(user, initialOffer, initialRequest) => {
              setExchangePreselect({ user, initialOffer, initialRequest });
              setIsExchangeModalOpen(true);
            }}
            onOpenAddSkill={(type) => {
              setAddSkillType(type);
              setIsAddSkillModalOpen(true);
            }}
            onOpenAIMentor={(skillName, peerUser) => {
              setAIMentorParams({ skill: skillName, peer: peerUser });
              setIsAIMentorOpen(true);
            }}
            onDailyCheckIn={handleDailyCheckIn}
            onClaimQuest={handleClaimQuest}
          />
        )}

        {/* Tab: Explore — browse the skill catalog & find tutors */}
        {activeTab === 'explore' && (
          <ExploreSkillsView
            skills={skills}
            allUsers={allUsers}
            currentUser={currentUser}
            onOpenExchangeModal={(user, initialOffer, initialRequest) => {
              setExchangePreselect({ user, initialOffer, initialRequest });
              setIsExchangeModalOpen(true);
            }}
            onOpenAIMentor={(skillName) => {
              setAIMentorParams({ skill: skillName });
              setIsAIMentorOpen(true);
            }}
            // Quick-add from Explore catalog with sensible defaults
            onAddLearningSkill={async (skillName, category) => {
              await handleAddLearningSkill({
                name: skillName,
                category,
                targetProficiency: 'Intermediate',
                priority: 'High',
                notes: `Added from Explore catalog.`,
              });
            }}
            onAddTeachingSkill={async (skillName, category) => {
              await handleAddTeachingSkill({
                name: skillName,
                category,
                proficiency: 'Intermediate',
                experienceMonths: 12,
                description: `Offering peer tutoring in ${skillName}`,
                tags: [skillName, category],
              });
            }}
          />
        )}

        {/* Tab: Exchange — manage active/pending skill exchanges */}
        {activeTab === 'exchange' && (
          <SkillExchangeView
            exchanges={exchanges}
            currentUser={currentUser}
            onOpenExchangeModal={() => {
              setExchangePreselect({});
              setIsExchangeModalOpen(true);
            }}
            onAcceptExchange={handleAcceptExchange}
            onDeclineExchange={handleDeclineExchange}
            onToggleMilestone={handleToggleMilestone}
            onAddNote={handleAddNote}
            onOpenReviewModal={(exchange) => {
              setSelectedExchangeForReview(exchange);
              setIsReviewModalOpen(true);
            }}
            onOpenAIMentor={(skillName) => {
              setAIMentorParams({ skill: skillName });
              setIsAIMentorOpen(true);
            }}
          />
        )}

        {/* Tab: Quests — daily/weekly tasks and AI quest generator */}
        {activeTab === 'quests' && (
          <QuestsView
            quests={quests}
            currentUser={currentUser}
            onClaimQuest={handleClaimQuest}
            onDailyCheckIn={handleDailyCheckIn}
            onGenerateAIQuests={handleGenerateAIQuests}
            onNavigate={setActiveTab}
          />
        )}

        {/* Tab: Leaderboard — campus ranking sorted by XP */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            allUsers={allUsers}
            currentUser={currentUser}
            onOpenExchangeModal={(targetUser) => {
              setExchangePreselect({ user: targetUser });
              setIsExchangeModalOpen(true);
            }}
          />
        )}

        {/* Tab: Achievements — badges, milestones, XP progress */}
        {activeTab === 'achievements' && (
          <AchievementsView currentUser={currentUser} onNavigate={setActiveTab} />
        )}

        {/* Tab: Profile — personal stats, skills, and reviews */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            reviews={reviews}
            completedExchanges={exchanges.filter((e) => e.status === 'completed')}
            onOpenAddSkill={(type) => {
              setAddSkillType(type);
              setIsAddSkillModalOpen(true);
            }}
            onDeleteSkill={handleDeleteSkill}
            onUpdateBio={handleUpdateBio}
            onOpenAIMentor={(skillName) => {
              setAIMentorParams({ skill: skillName });
              setIsAIMentorOpen(true);
            }}
          />
        )}

        {/* Tab: Tutor Hub — online sessions, youtube videos, xp store, refer & earn */}
        {activeTab === 'tutor' && (
          <TutorHubView
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onGainXP={(amount, message) => {
              if (amount > 0) {
                // Award XP via daily check-in mechanism as a proxy
                showToast(message, amount, false);
              } else {
                showToast(message);
              }
            }}
          />
        )}

      </main>

      {/* ══════════════════════════════════════════════════════
           SECTION 7: Modals
           Each modal is conditionally rendered only when open.
           Passing null-guarded data prevents stale renders.
         ══════════════════════════════════════════════════════ */}

      {/* Modal: Propose a new skill exchange */}
      {isExchangeModalOpen && (
        <NewExchangeModal
          currentUser={currentUser}
          allUsers={allUsers}
          preselectedUser={exchangePreselect.user}
          initialOffer={exchangePreselect.initialOffer}
          initialRequest={exchangePreselect.initialRequest}
          onClose={() => setIsExchangeModalOpen(false)}
          onSubmitProposal={handleSubmitExchangeProposal}
        />
      )}

      {/* Modal: Add a skill to teach or learn */}
      {isAddSkillModalOpen && (
        <AddSkillModal
          type={addSkillType}
          onClose={() => setIsAddSkillModalOpen(false)}
          onAddTeachingSkill={handleAddTeachingSkill}
          onAddLearningSkill={handleAddLearningSkill}
        />
      )}

      {/* Modal: Submit a review after completing an exchange */}
      {isReviewModalOpen && selectedExchangeForReview && (
        <ReviewModal
          exchange={selectedExchangeForReview}
          currentUser={currentUser}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedExchangeForReview(null);
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Modal: AI Mentor chat & roadmap generator */}
      {isAIMentorOpen && (
        <AIMentorModal
          currentUser={currentUser}
          allUsers={allUsers}
          initialSkill={aiMentorParams.skill}
          initialPeer={aiMentorParams.peer}
          onClose={() => setIsAIMentorOpen(false)}
          onOpenExchangeModal={(peer, initialOffer, initialRequest) => {
            setExchangePreselect({ user: peer, initialOffer, initialRequest });
            setIsExchangeModalOpen(true);
          }}
        />
      )}

      {/* Modal: Register a new student account */}
      {isRegisterOpen && (
        <RegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onRegister={handleRegisterUser}
        />
      )}

      {/* Modal: Google Account Sign-In / Direct Login / Switch Account */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          isMandatory={false}
          registeredUsers={allUsers}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          defaultTab={authDefaultTab}
        />
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className={`border-t py-6 text-center text-xs mt-auto transition-colors ${
        isDarkMode
          ? 'border-slate-800/80 bg-slate-950/80 text-slate-500'
          : 'border-slate-200 bg-white/90 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{APP_CONFIG.appName}</span> • {APP_CONFIG.appTagline}
          </p>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {APP_CONFIG.footerPoweredBy}
          </p>
        </div>
      </footer>

      </div>

    </div>
  );
}
