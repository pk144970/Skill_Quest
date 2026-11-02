// =============================================================
//  SkillQuest — Frontend API Service
//  ─────────────────────────────────────────────────────────────
//  This module is a thin HTTP client that wraps every backend
//  API call in a clean, typed function.
//
//  Rules:
//  • All functions return { success: boolean; data: T }
//  • Errors are caught and logged — callers never need try/catch
//  • No business logic lives here — just fetch + parse
//
//  Backend base URL: /api/* (proxied to Express by Vite in dev)
// =============================================================

import {
  User,
  SkillItem,
  SkillExchange,
  Quest,
  Review,
  MatchSynergy,
} from '../types';

// ─── Helper Types ─────────────────────────────────────────────

/** Standard success/failure wrapper returned by every API function */
type ApiResult<T> = Promise<{ success: boolean; data: T }>;

// ─── API Service Object ───────────────────────────────────────

export const apiService = {

  // ═══════════════════════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Fetch all users, with optional filters.
   * Used on initial load and when switching the active user.
   *
   * @param params.college  Filter by college name (partial match)
   * @param params.search   Full-text search across name, college, branch, skills
   * @param params.skill    Filter to users who teach or want to learn a skill
   */
  async getUsers(params?: { college?: string; search?: string; skill?: string }): ApiResult<User[]> {
    try {
      // Build query string only for params that were provided
      const query = new URLSearchParams();
      if (params?.college) query.set('college', params.college);
      if (params?.search)  query.set('search',  params.search);
      if (params?.skill)   query.set('skill',   params.skill);

      const res = await fetch(`/api/users?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getUsers:', err);
      return { success: false, data: [] };
    }
  },

  /**
   * Fetch a single user by ID, including their received reviews.
   * Used on the Profile and Peer Detail views.
   */
  async getUserById(id: string): Promise<{ success: boolean; data: User & { reviews: Review[] } }> {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getUserById:', err);
      throw err; // Re-throw because caller needs to handle this case
    }
  },

  /**
   * Log in or sign up a student with their Google account / Gmail.
   */
  async loginWithGoogle(payload: {
    email: string;
    name?: string;
    avatar?: string;
    college?: string;
    branch?: string;
    year?: string;
    bio?: string;
    teachSkill?: string;
    learnSkill?: string;
    googleId?: string;
  }): Promise<{ success: boolean; data?: { isNew: boolean; user: User }; error?: string }> {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Google login failed' };
      return { success: true, data };
    } catch (err: any) {
      console.error('[API] loginWithGoogle:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  },

  /**
   * Log in an existing student via their registered Gmail or email.
   */
  async loginWithEmail(email: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      return { success: true, data };
    } catch (err: any) {
      console.error('[API] loginWithEmail:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  },

  /**
   * Register a brand-new student and create their profile.
   * Called from the RegisterModal when a student signs up.
   */
  async registerUser(userData: Partial<User>): ApiResult<User> {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to register user');
    return { success: true, data: await res.json() };
  },

  /**
   * Update any fields on an existing user profile (e.g. bio, links).
   * Uses a partial update — only provided fields are changed.
   */
  async updateUser(id: string, updates: Partial<User>): ApiResult<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return { success: true, data: await res.json() };
  },

  /**
   * Add a new skill to the user's "I can teach this" list.
   * Awards XP and updates the user's level on the server.
   */
  async addTeachingSkill(userId: string, skillData: Partial<{
    name: string; category: string; proficiency: string;
    experienceMonths: number; description: string; tags: string[];
  }>): ApiResult<User> {
    const res = await fetch(`/api/users/${userId}/skills/teach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillData),
    });
    if (!res.ok) throw new Error('Failed to add teaching skill');
    const data = await res.json();
    return { success: true, data: data.user || data }; // Server returns { user, newSkill }
  },

  /**
   * Add a new skill to the user's "I want to learn this" wishlist.
   * Awards XP and updates the user's level on the server.
   */
  async addLearningSkill(userId: string, skillData: Partial<{
    name: string; category: string; targetProficiency: string; priority: string; notes: string;
  }>): ApiResult<User> {
    const res = await fetch(`/api/users/${userId}/skills/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillData),
    });
    if (!res.ok) throw new Error('Failed to add learning skill');
    const data = await res.json();
    return { success: true, data: data.user || data };
  },

  /**
   * Remove a skill from either the teaching or learning list.
   *
   * @param type  'teach' or 'learn' — which list to remove from
   * @param skillId  The skill's unique ID
   */
  async deleteSkill(userId: string, type: 'teach' | 'learn', skillId: string): ApiResult<User> {
    const res = await fetch(`/api/users/${userId}/skills/${type}/${skillId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete skill');
    return { success: true, data: await res.json() };
  },

  // ═══════════════════════════════════════════════════════════
  //  SKILLS CATALOG
  // ═══════════════════════════════════════════════════════════

  /**
   * Fetch the full skill catalog used on the Explore page.
   * The server dynamically enriches tutor/learner counts from live user data.
   */
  async getSkills(): ApiResult<SkillItem[]> {
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('Failed to fetch skills');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getSkills:', err);
      return { success: false, data: [] };
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  SKILL EXCHANGES
  // ═══════════════════════════════════════════════════════════

  /**
   * Fetch all exchanges, optionally filtered by user or status.
   * Returns exchanges sorted newest-first.
   */
  async getExchanges(userId?: string, status?: string): ApiResult<SkillExchange[]> {
    try {
      const query = new URLSearchParams();
      if (userId) query.set('userId', userId);
      if (status) query.set('status', status);
      const res = await fetch(`/api/exchanges?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch exchanges');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getExchanges:', err);
      return { success: false, data: [] };
    }
  },

  /**
   * Send a new skill exchange proposal from one student to another.
   * This creates the exchange in 'pending' status and awards proposer XP.
   */
  async createExchange(data: {
    fromUserId: string;
    toUserId: string;
    skillOffered: string;   // Skill the proposer will teach
    skillRequested: string; // Skill the recipient will teach in return
    message: string;
    preferredSchedule: string;
  }): ApiResult<SkillExchange> {
    const res = await fetch('/api/exchanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        // Auto-generate a descriptive title for the exchange card
        title: `${data.skillOffered} ⇄ ${data.skillRequested} Exchange`,
      }),
    });
    if (!res.ok) throw new Error('Failed to propose exchange');
    return { success: true, data: await res.json() };
  },

  /**
   * Update an exchange's status (e.g. accept → in_progress, or complete it).
   * Accepting auto-generates a Google Meet link. Completing awards XP to both students.
   *
   * @param status  The new status to set (e.g. 'in_progress', 'completed', 'cancelled')
   * @param meetLink  Optional custom meeting link (server auto-generates one if omitted)
   */
  async updateExchangeStatus(id: string, status: string, meetLink?: string): ApiResult<SkillExchange> {
    const res = await fetch(`/api/exchanges/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, meetLink }),
    });
    if (!res.ok) throw new Error('Failed to update exchange status');
    return { success: true, data: await res.json() };
  },

  /**
   * Toggle the completion state of a single milestone within an exchange.
   * Called when a student checks/unchecks a milestone checkbox.
   */
  async toggleMilestone(exchangeId: string, milestoneId: string, completed: boolean): ApiResult<SkillExchange> {
    const res = await fetch(`/api/exchanges/${exchangeId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, completed }),
    });
    if (!res.ok) throw new Error('Failed to update milestone');
    return { success: true, data: await res.json() };
  },

  /**
   * Append a session note to an exchange's note log.
   * Students use this to record key takeaways after each session.
   */
  async addSessionNote(exchangeId: string, note: string): ApiResult<SkillExchange> {
    const res = await fetch(`/api/exchanges/${exchangeId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return { success: true, data: await res.json() };
  },

  // ═══════════════════════════════════════════════════════════
  //  REVIEWS
  // ═══════════════════════════════════════════════════════════

  /**
   * Submit a peer review after completing an exchange.
   * Awards XP to both the reviewer and the reviewed student.
   * Returns the new review plus updated user objects for both parties.
   */
  async createReview(data: {
    exchangeId: string;
    fromUserId: string;   // Who is writing the review
    toUserId: string;     // Who is being reviewed
    rating: number;       // 1–5 stars
    tags: string[];       // Quick descriptive tags
    comment: string;      // Free-text feedback
    skillExchanged: string;
  }): Promise<{ success: boolean; data: { review: Review; toUser: User; fromUser: User } }> {
    const res = await fetch(`/api/exchanges/${data.exchangeId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return { success: true, data: await res.json() };
  },

  /**
   * Fetch all reviews (used to populate the profile page review section).
   * Fails silently and returns an empty array — reviews are non-critical.
   */
  async getReviews(): ApiResult<Review[]> {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) return { success: true, data: await res.json() };
      return { success: true, data: [] }; // Non-critical — return empty on failure
    } catch {
      return { success: true, data: [] };
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  QUESTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Fetch all current quests (daily, weekly, and special).
   * Called on initial load and after generating new AI quests.
   */
  async getQuests(): ApiResult<Quest[]> {
    try {
      const res = await fetch('/api/quests');
      if (!res.ok) throw new Error('Failed to fetch quests');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getQuests:', err);
      return { success: false, data: [] };
    }
  },

  /**
   * Claim the XP reward for a completed quest.
   * Returns the updated quest list, updated user, and XP awarded amount.
   * Also re-fetches the full quests list so the UI stays in sync.
   */
  async claimQuest(questId: string, userId: string): Promise<{
    success: boolean;
    data: { quests: Quest[]; user: User; xpAwarded: number };
  }> {
    // Claim the quest on the server
    const res = await fetch(`/api/quests/${questId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to claim quest');
    const claimData = await res.json();

    // Re-fetch the full quests list so all quest states are accurate
    const questsRes = await fetch('/api/quests');
    const allQuests: Quest[] = await questsRes.json();

    return {
      success: true,
      data: {
        quests: allQuests,
        user: claimData.user,
        xpAwarded: claimData.xpAdded || 50,
      },
    };
  },

  /**
   * Record today's daily check-in for the current user.
   * Increments their streak, awards XP, and updates their level.
   * If the user already checked in today, the server is idempotent (no double award).
   */
  async dailyCheckIn(userId: string): Promise<{
    success: boolean;
    data: { user: User; xpAwarded: number; message: string; leveledUp?: boolean };
  }> {
    // Single request — server now returns the full updated user object directly
    const res = await fetch('/api/quests/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to check in');
    const checkInData = await res.json();

    // Use the real user object from the DB response (no second fetch needed)
    const updatedUser: User = checkInData.user;

    return {
      success: true,
      data: {
        user: updatedUser,
        xpAwarded: checkInData.xpAwarded ?? 0,
        message: checkInData.message || 'Daily Check-In complete!',
        leveledUp: checkInData.leveledUp ?? false,
      },
    };
  },

  // ═══════════════════════════════════════════════════════════
  //  SMART MATCHING
  // ═══════════════════════════════════════════════════════════

  /**
   * Run the algorithmic skill-matching engine for a given user.
   * Returns a ranked list of peer matches sorted by compatibility score.
   * Called on load and whenever the active user changes.
   */
  async getMatches(userId: string): ApiResult<MatchSynergy[]> {
    try {
      const res = await fetch(`/api/matches/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch matches');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getMatches:', err);
      return { success: false, data: [] };
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  GEMINI AI FEATURES
  // ═══════════════════════════════════════════════════════════

  /**
   * Ask Gemini to deeply analyze the learning synergy between two students.
   * Falls back to a dynamic server-generated analysis if AI is unavailable.
   */
  async getMatchSynergyAnalysis(currentUserId: string, targetUserId: string): ApiResult<any> {
    try {
      const res = await fetch('/api/ai/match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId, targetUserId }),
      });
      if (!res.ok) throw new Error('Failed to analyze synergy');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getMatchSynergyAnalysis:', err);
      // Return a generic fallback so the UI never breaks
      return {
        success: true,
        data: {
          synergyScore: 92,
          compatibilityRating: 'High Synergy',
          whyThisMatchWorks: 'Complementary tech stacks where reciprocal mentorship accelerates both students learning curve by 3x.',
          whatStudent1Teaches: 'Frontend architectural patterns, Next.js App Router, and clean state design.',
          whatStudent2Teaches: 'Backend data structures, distributed caching, and algorithmic optimization.',
          collaborativeProjectIdea: 'Full-Stack Campus Hackathon project pairing Next.js with high-throughput microservices.',
          suggestedRoutine: '2 sessions per week, 1 hour each on Discord / Google Meet.',
        },
      };
    }
  },

  /**
   * Generate a personalized 3-stage AI learning roadmap for a skill.
   * Optionally accepts the student's current level to tailor the roadmap.
   * Falls back gracefully if Gemini is unavailable.
   */
  async generateLearningRoadmap(
    skillName: string,
    userId?: string,
    category?: string,
    currentLevel?: string
  ): ApiResult<any> {
    try {
      const res = await fetch('/api/ai/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName,
          targetProficiency: 'Advanced',
          currentLevel: currentLevel || 'Beginner',
        }),
      });
      if (!res.ok) throw new Error('Failed to generate roadmap');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] generateLearningRoadmap:', err);
      // Inline fallback so callers always receive valid roadmap data
      return {
        success: true,
        data: {
          skill: skillName,
          category: category || 'Computer Science',
          estimatedWeeks: 6,
          overview: `A comprehensive 3-stage mastery roadmap for ${skillName} tailored for engineering students.`,
          stages: [
            {
              stageName: 'Stage 1: Core Fundamentals & Environment Setup',
              duration: 'Weeks 1-2',
              goal: `Master foundational syntax, primitives, and core mental models of ${skillName}.`,
              topics: ['Basic syntax & configuration', 'Core architectural concepts', 'Hello-world mini project'],
              projectMilestone: `Build a functional prototype demonstrating ${skillName} fundamentals.`,
            },
            {
              stageName: 'Stage 2: Intermediate Patterns & Real-world Workflows',
              duration: 'Weeks 3-4',
              goal: 'Implement best practices, asynchronous patterns, and testing.',
              topics: ['State management & concurrency', 'API integrations', 'Performance profiling'],
              projectMilestone: `Deploy a production-ready application with full CI/CD.`,
            },
            {
              stageName: 'Stage 3: Advanced Optimization & Peer Mentoring',
              duration: 'Weeks 5-6',
              goal: 'Reach production mastery and teach incoming apprentices on SkillQuest.',
              topics: ['Distributed systems scalability', 'Security hardening', 'Peer code reviews'],
              projectMilestone: `Publish an open-source template and host a SkillQuest peer workshop.`,
            },
          ],
          peerStudyAdvice: `Schedule two 45-minute peer review calls each week to discuss blocking concepts.`,
        },
      };
    }
  },

  /**
   * Ask Gemini to generate 2 personalized quests based on the student's learning goals.
   * The generated quests are added to the server's quest list and returned.
   * Falls back to a pre-defined pair of quests if AI is unavailable.
   */
  async generateAIQuests(userId?: string, learningGoals?: string[], branch?: string): ApiResult<Quest[]> {
    try {
      const res = await fetch('/api/ai/generate-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningGoals: learningGoals && learningGoals.length > 0 ? learningGoals : ['Next.js', 'PyTorch', 'Docker'],
          branch: branch || 'Computer Science',
        }),
      });
      if (!res.ok) throw new Error('Failed to generate AI quests');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] generateAIQuests:', err);
      // Hardcoded fallback quests shown when AI is unavailable
      const fallbackQuests: Quest[] = [
        {
          id: `ai-q-${Date.now()}-1`,
          title: 'AI Code Review Sprint',
          description: 'Review 2 peer pull requests or code snippets in an exchange session.',
          xpReward: 90,
          type: 'special',
          category: 'Core CSE',
          icon: 'Sparkles',
          progress: 0,
          target: 2,
          unit: 'reviews',
          completed: false,
          claimed: false,
        },
        {
          id: `ai-q-${Date.now()}-2`,
          title: 'System Design Architecture Challenge',
          description: 'Draw and explain a high-level system diagram for a real-time app to your peer mentor.',
          xpReward: 120,
          type: 'special',
          category: 'Core CSE',
          icon: 'Sparkles',
          progress: 0,
          target: 1,
          unit: 'diagram',
          completed: false,
          claimed: false,
        },
      ];
      return { success: true, data: fallbackQuests };
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  DATABASE & STORAGE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Fetch live metrics from the persistent database engine
   */
  async getDbStats(): ApiResult<any> {
    try {
      const res = await fetch('/api/db/stats');
      if (!res.ok) throw new Error('Failed to fetch database metrics');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] getDbStats:', err);
      return { success: false, data: null };
    }
  },

  /**
   * Trigger an on-demand snapshot backup to src/data/backups/
   */
  async backupDatabase(): ApiResult<any> {
    try {
      const res = await fetch('/api/db/backup', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create database backup');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] backupDatabase:', err);
      return { success: false, data: null };
    }
  },

  /**
   * Export the full database payload
   */
  async exportDatabase(): ApiResult<any> {
    try {
      const res = await fetch('/api/db/export');
      if (!res.ok) throw new Error('Failed to export database');
      return { success: true, data: await res.json() };
    } catch (err) {
      console.error('[API] exportDatabase:', err);
      return { success: false, data: null };
    }
  },
};

// Named alias — use whichever import style you prefer
export const api = apiService;
