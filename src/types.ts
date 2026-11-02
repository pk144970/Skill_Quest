// =============================================================
//  SkillQuest — TypeScript Type Definitions
//  ─────────────────────────────────────────────────────────────
//  This file defines ALL the data shapes used throughout the app.
//  If you add a new field to a model, update the interface here
//  and TypeScript will tell you everywhere else to update too.
// =============================================================

// ─── Simple Value Types (Union Strings) ──────────────────────

/** The broad topic area a skill belongs to */
export type SkillCategory =
  | 'Web Development'
  | 'AI & Machine Learning'
  | 'Data Structures & Algorithms'
  | 'Cloud & DevOps'
  | 'Cybersecurity'
  | 'Mobile App Dev'
  | 'UI/UX Design'
  | 'Competitive Programming'
  | 'Core CSE'
  | 'Data Science & Analytics'
  | 'Video & Animation'
  | 'Graphic & Poster Design'
  | 'Music & Audio Production'
  | 'Arts & Crafts'
  | 'Photography & Creative Media';

/** How well a student knows a skill */
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

/** How urgently a student wants to learn a skill */
export type PriorityLevel = 'High' | 'Medium' | 'Low';

/** Visual tier of a badge (bronze → platinum) */
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/** The lifecycle states of a skill exchange between two students */
export type ExchangeStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined';

/** How often a quest resets */
export type QuestType = 'daily' | 'weekly' | 'special';

// ─── Skill Interfaces ─────────────────────────────────────────

/**
 * A skill a student actively teaches to peers.
 * Stored in `user.skillsTeaching[]`.
 */
export interface TeachingSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;     // How well the teacher knows this skill
  experienceMonths: number;          // Real-world experience in months
  description: string;               // What the teacher offers in sessions
  endorsementsCount: number;         // Peer endorsements received
  tags: string[];                    // Searchable keywords (e.g. 'React', 'Hooks')
}

/**
 * A skill a student wants to learn from peers.
 * Stored in `user.skillsLearning[]`.
 */
export interface LearningSkill {
  id: string;
  name: string;
  category: SkillCategory;
  targetProficiency: ProficiencyLevel; // The level they want to reach
  priority: PriorityLevel;             // How urgently they want to learn it
  notes?: string;                       // Optional personal notes or context
}

// ─── Gamification Interfaces ──────────────────────────────────

/**
 * A collectible badge earned by reaching milestones.
 * Displayed on the student's profile page.
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;                  // Lucide icon name (e.g. 'Award', 'Flame')
  tier: BadgeTier;
  unlockedAt?: string;           // ISO date string when the badge was earned
  category: 'teaching' | 'learning' | 'streaks' | 'community' | 'mastery';
}

/**
 * A trackable achievement with XP rewards.
 * Unlike badges, achievements track numerical progress toward a goal.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'exchange' | 'streak' | 'mentor' | 'explorer';
  tier: BadgeTier;
  xpReward: number;        // XP granted when the achievement is first unlocked
  progress: number;        // Current progress toward maxProgress
  maxProgress: number;     // Target number needed to unlock
  unlocked: boolean;
  unlockedAt?: string;     // ISO date string
  icon: string;            // Lucide icon name
}

// ─── User Statistics ──────────────────────────────────────────

/**
 * Aggregated stats displayed on the user's profile and leaderboard.
 * Updated automatically when exchanges, reviews, and quests are completed.
 */
export interface UserStats {
  totalHoursExchanged: number;   // Total hours spent in peer sessions
  sessionsCompleted: number;     // Total completed exchange sessions
  studentsTaught: number;        // Unique students they have taught
  skillsLearnedCount: number;    // Skills they have learned through exchanges
  reputationRating: number;      // Average star rating (1.0–5.0) from received reviews
  reviewsCount: number;          // Total number of reviews received
  questPointsClaimed: number;    // Total XP earned through quests
}

// ─── Core User Model ──────────────────────────────────────────

/**
 * The main student profile object.
 * This is the central data model — nearly every component receives a `User`.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;              // URL to profile photo (Unsplash or similar)
  college: string;
  branch: string;              // e.g. "Computer Science & Engineering"
  year: string;                // e.g. "3rd Year B.Tech CSE"
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xp: number;                  // Total experience points earned
  level: number;               // Derived from XP via calculateLevel()
  streakDays: number;          // Consecutive daily check-in streak
  lastActiveDate: string;      // ISO date — used to track and update streak
  skillsTeaching: TeachingSkill[];
  skillsLearning: LearningSkill[];
  badges: Badge[];
  achievements: Achievement[];
  stats: UserStats;
  isOnline?: boolean;          // Live presence indicator (optional)
  authProvider?: 'google' | 'email'; // Sign-in method
  googleId?: string;           // Google profile ID if logged in via Google
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  channelName: string;
  playlistUrl: string;
  videoCount?: string | number;
  duration?: string;
  badge?: string; // e.g. "Most Comprehensive", "Top Placement Prep", "Best for Beginners", "Best in Hindi"
  description: string;
  keyTopics?: string[];
}

// ─── Skill Catalog ────────────────────────────────────────────

/**
 * A skill listed in the Explore Catalog.
 * Not tied to a specific user — it's the "template" entry for a technology.
 */
export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;              // Lucide icon name
  description: string;
  popularTopics: string[];   // Common sub-topics students focus on
  totalTutors: number;       // How many users currently teach this skill
  totalLearners: number;     // How many users want to learn this skill
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  youtubePlaylists?: YouTubePlaylist[]; // Curated YouTube playlists for learning this skill
}

// ─── Skill Exchange System ────────────────────────────────────

/**
 * A single milestone/checkpoint within an active skill exchange.
 * Students tick these off as they complete sessions.
 */
export interface ExchangeMilestone {
  id: string;
  title: string;     // Short description of what this milestone covers
  completed: boolean;
}

/**
 * The main exchange record — created when one student proposes
 * a peer-to-peer skill swap with another student.
 *
 * Flow: pending → accepted → in_progress → completed
 *                         └→ declined
 */
export interface SkillExchange {
  id: string;
  fromUserId: string;          // The student who sent the proposal
  fromUserName: string;
  fromUserAvatar: string;
  fromUserCollege: string;
  toUserId: string;            // The student who received the proposal
  toUserName: string;
  toUserAvatar: string;
  toUserCollege: string;
  skillOffered: string;        // Skill the fromUser teaches in this exchange
  skillRequested: string;      // Skill the toUser teaches (what fromUser learns)
  title: string;               // Auto-generated: "SkillA ⇄ SkillB Exchange"
  message: string;             // Personal message from the proposer
  status: ExchangeStatus;
  preferredSchedule: string;   // e.g. "Weekends • 7–9 PM IST"
  meetLink?: string;           // Google Meet link (auto-generated on accept)
  sessionNotes?: string[];     // Notes both students add during sessions
  milestones: ExchangeMilestone[];
  createdAt: string;           // ISO date
  completedAt?: string;        // ISO date — set when status = 'completed'
  ratingGivenByRequester?: number;
  ratingGivenByReceiver?: number;
  xpAwarded?: number;          // XP given to each participant on completion
}

// ─── Quests ───────────────────────────────────────────────────

/**
 * A gamified task that rewards XP when completed and claimed.
 * Daily quests reset every 24 hours; weekly quests every 120 hours.
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: SkillCategory | 'General';
  xpReward: number;
  progress: number;          // Current progress toward `target`
  target: number;            // Number needed to mark the quest complete
  unit: string;              // e.g. "sessions", "problems", "reviews"
  completed: boolean;        // true when progress >= target
  claimed: boolean;          // true after the student claims the XP reward
  expiresInHours?: number;   // Countdown hours until expiry
  icon: string;              // Lucide icon name for the quest card
}

// ─── Reviews ──────────────────────────────────────────────────

/**
 * A peer rating left after completing a skill exchange.
 * Submitted by the reviewer (`fromUserId`) for the teacher (`toUserId`).
 */
export interface Review {
  id: string;
  exchangeId: string;         // The exchange this review is for
  fromUserId: string;         // Student who wrote the review
  fromUserName: string;
  fromUserAvatar: string;
  fromUserCollege: string;
  toUserId: string;           // Student being reviewed/rated
  rating: number;             // Star rating from 1 to 5
  tags: string[];             // Quick descriptive tags (e.g. 'Patient Mentor')
  comment: string;            // Free-text feedback
  skillExchanged: string;     // Which skill the exchange was about
  createdAt: string;          // ISO date
}

// ─── AI-Powered Matching & Roadmaps ──────────────────────────

/**
 * The result of the smart matching algorithm for a user.
 * Contains a peer candidate plus compatibility scoring details.
 */
export interface MatchSynergy {
  matchedUser: User;
  matchScore: number;              // 0–100 compatibility score
  mutualTeachSkill: string;        // What the matched peer teaches (that you want to learn)
  mutualLearnSkill: string;        // What you teach (that the peer wants to learn)
  synergyHighlights: string[];     // Human-readable reasons for the match
  recommendedProjectIdea?: string; // AI-suggested collaborative project
}

/**
 * A 3-stage AI-generated learning roadmap for a specific skill.
 * Returned by the Gemini-powered `/api/ai/generate-roadmap` endpoint.
 */
export interface LearningRoadmap {
  skillName: string;
  duration: string;           // e.g. "6 Weeks (3 Stages • 6 Peer Sessions)"
  stages: {
    stageNumber: number;
    title: string;            // e.g. "Stage 1: Core Fundamentals"
    goal: string;             // Measurable learning objective
    suggestedSessions: number;
    keyTopics: string[];      // Specific technical topics to cover
    handsOnChallenge: string; // Mini-project or challenge for this stage
  }[];
  mentorTips: string[];       // Actionable advice for peer mentors
}
