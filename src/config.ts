// =============================================================
//  SkillQuest — Central App Configuration
//  ─────────────────────────────────────────────────────────────
//  Change values here to customize the entire app in one place.
//  No need to hunt through multiple files for magic numbers!
// =============================================================

export const APP_CONFIG = {
  // ── App Identity ─────────────────────────────────────────────
  appName: 'SkillQuest',
  appTagline: 'Gamified Peer-to-Peer Skill Exchange for Engineering Campuses',
  footerPoweredBy: 'Powered by Google Gemini 2.5 • Antigravity AI',

  // ── Server ───────────────────────────────────────────────────
  port: 3000,                    // Port the Express server listens on

  // ── AI / Gemini ───────────────────────────────────────────────
  aiModel: 'gemini-3.5-flash-lite',  // Gemini model used for all AI features
  aiRetries: 2,                  // Number of retry attempts on transient AI errors
  aiRetryDelayMs: 600,           // Base delay (ms) between retries (doubles each time)

  // ── XP Rewards ───────────────────────────────────────────────
  xp: {
    dailyCheckIn: 50,            // XP for daily streak check-in
    addTeachSkill: 50,           // XP for adding a skill you can teach
    addLearnSkill: 30,           // XP for adding a skill to your learning wishlist
    proposeExchange: 25,         // XP for sending a new exchange proposal
    reviewBonus: 100,            // XP bonus awarded to the person being reviewed (if rating ≥ 4)
    reviewGiven: 50,             // XP for writing a review
    exchangeComplete: 200,       // XP both students get when an exchange is completed
    newUserBonus: 250,           // Starting XP for a newly registered student
    registrationToast: 100,      // XP shown in the welcome toast (display only)
  },

  // ── XP Level Thresholds ───────────────────────────────────────
  // Adjust these to make levelling easier or harder.
  // Index = level (1-indexed), value = XP needed to REACH that level.
  levelThresholds: [0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000],
  maxLevel: 10,

  // ── Toast Notifications ───────────────────────────────────────
  toastDurationMs: 4500,         // How long the success toast stays visible (ms)

  // ── Confetti ─────────────────────────────────────────────────
  confetti: {
    colors: ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'],
    celebrationParticles: 80,    // Particle count for regular celebration
    celebrationSpread: 70,
    grandParticlesPerFrame: 3,   // Particles fired per animation frame on level-up
    grandSpread: 55,
    grandDurationMs: 1500,       // How long the grand (level-up) confetti runs
  },

  // ── Default New-User Onboarding ───────────────────────────────
  newUser: {
    defaultBranch: 'Computer Science & Engineering',
    defaultYear: '3rd Year B.Tech',
    defaultBio: 'Excited to teach my tech skills and learn from fellow CSE peers on SkillQuest!',
    starterBadgeName: 'Campus Initiate',
    starterBadgeDesc: 'Joined SkillQuest student exchange network',
    initialReputationRating: 5.0,
  },

  // ── Exchange Defaults ─────────────────────────────────────────
  exchange: {
    defaultSchedule: 'Weekends / Flexible',
    defaultMessage: 'Hello! Let us exchange our tech skills together on SkillQuest.',
    hoursAwardedOnComplete: 2,   // Hours added to totalHoursExchanged per completed exchange
    xpAwardedOnComplete: 200,    // XP awarded to EACH participant on exchange completion
  },

  // ── Achievement Trigger Thresholds ───────────────────────────
  achievements: {
    firstTeachStudentsRequired: 1,   // 'ach-first-teach': teach at least this many students
    streakDaysRequired: 7,           // 'ach-streak-7': maintain a streak this long
    fiveExchangesRequired: 5,        // 'ach-five-exchanges': complete this many sessions
    topRatedMinRating: 4.9,          // 'ach-top-rated': reputation rating threshold
    topRatedMinReviews: 5,           // 'ach-top-rated': minimum reviews to qualify
    grandmasterLevelRequired: 8,     // 'ach-grandmaster': level needed for grandmaster badge
  },
};
