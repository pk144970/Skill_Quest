// =============================================================
//  SkillQuest — Express Backend Server
//  ─────────────────────────────────────────────────────────────
//  This file is the ENTIRE backend. It:
//   1. Holds the in-memory "database" (arrays of users, exchanges, etc.)
//   2. Exposes REST API routes at /api/*
//   3. Integrates Google Gemini AI for roadmaps, quests, and synergy analysis
//   4. Serves the React frontend via Vite middleware (dev) or static files (prod)
//
//  To customize core values (XP rewards, AI model, port), see src/config.ts.
//  NOTE: All data is in-memory — restarting the server resets everything.
// =============================================================

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

import express from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_SKILLS,
  INITIAL_EXCHANGES,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REVIEWS
} from './src/data/seedData';
import {
  User,
  SkillItem,
  SkillExchange,
  Quest,
  Review,
  TeachingSkill,
  LearningSkill,
  MatchSynergy,
  LearningRoadmap
} from './src/types';

// ═══════════════════════════════════════════════════════════
//  PERSISTENT RESILIENT DATABASE ENGINE
//  Primary: Embedded SQLite database (node:sqlite in WAL mode)
//  Mirror:  Atomic crash-safe JSON snapshot (src/data/db.json)
//  All entered data across users, skills, exchanges, reviews,
//  and quests is permanently stored in the database!
// ═══════════════════════════════════════════════════════════
import { db } from './src/server/db/database';

let users:     User[]          = db.getUsers();
let skills:    SkillItem[]     = db.getSkills();
let exchanges: SkillExchange[] = db.getExchanges();
let quests:    Quest[]         = db.getQuests();
let reviews:   Review[]        = db.getReviews();

function saveDatabase() {
  db.persistAll();
}

// ═══════════════════════════════════════════════════════════
//  GEMINI AI CLIENT
//  The client is created lazily (on first use) so the server
//  still starts without a GEMINI_API_KEY — AI routes will
//  simply return their fallback responses instead of crashing.
//
//  To enable AI: copy .env.example → .env and set GEMINI_API_KEY.
// ═══════════════════════════════════════════════════════════
let aiClient: GoogleGenAI | null = null;
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
].filter(Boolean);

/**
 * Returns a cached Gemini AI client, or null if no API key is configured.
 * All AI routes check for null and gracefully fall back to static responses.
 */
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

/**
 * Retries an async function with exponential backoff on transient AI errors.
 *
 * Handles 503 (overloaded), 429 (rate limited), and RESOURCE_EXHAUSTED errors.
 * Non-transient errors (e.g. 400 Bad Request) are thrown immediately.
 *
 * @param fn       The async function to execute (usually an AI API call)
 * @param retries  Max number of retries after the first attempt (default: 2)
 * @param delayMs  Base delay in ms — doubles on each retry (default: 600ms)
 */
async function generateWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 600
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Determine if this error is worth retrying
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 429;

      if (!isTransient || attempt === retries) throw err;

      // Wait with exponential backoff: 600ms, 1200ms, 2400ms...
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

/**
 * Calls Gemini generateContent with automatic model fallback across candidate models
 * to ensure maximum uptime and mitigate transient 503 high-demand spikes.
 */
async function generateWithModelFallback(
  ai: GoogleGenAI,
  requestParams: { contents: string; config?: any }
) {
  let lastError: any;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await generateWithRetry(async () => {
        return await ai.models.generateContent({
          ...requestParams,
          model,
        });
      }, 1, 400);
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable (${err?.message?.substring(0, 80)}), trying next candidate...`);
    }
  }
  throw lastError;
}

/**
 * Generates a static (no-AI) 3-stage learning roadmap as a fallback.
 * Used when the Gemini API is unavailable or returns an error.
 * The content is generic but structured to match the AI-generated format.
 */
function getFallbackRoadmap(skillName: string, currentLevel?: string, targetProficiency?: string) {
  const level = currentLevel || 'Beginner';
  const target = targetProficiency || 'Advanced';
  return {
    skill: skillName,
    skillName,
    estimatedWeeks: 6,
    duration: '6 Weeks (3 Stages • 6 Peer Sessions)',
    overview: `A comprehensive 3-stage mastery roadmap for ${skillName} tailored for engineering students moving from ${level} to ${target} proficiency.`,
    stages: [
      {
        stageNumber: 1,
        stageName: `Stage 1: Core Fundamentals & Environment Setup`,
        title: `Stage 1: Core Fundamentals & Environment Setup`,
        duration: 'Weeks 1-2 (2 Sessions)',
        goal: `Master foundational syntax, primitives, and core mental models of ${skillName}.`,
        topics: [
          `${skillName} environment configuration & toolchain`,
          'Foundational syntax, idioms, and design patterns',
          'Building your initial runnable prototype'
        ],
        keyTopics: [
          `${skillName} environment configuration & toolchain`,
          'Foundational syntax, idioms, and design patterns',
          'Building your initial runnable prototype'
        ],
        projectMilestone: `Construct and test a functional sandbox application in ${skillName}.`,
        handsOnChallenge: `Construct and test a functional sandbox application in ${skillName}.`
      },
      {
        stageNumber: 2,
        stageName: `Stage 2: Intermediate Patterns & Real-world Workflows`,
        title: `Stage 2: Intermediate Patterns & Real-world Workflows`,
        duration: 'Weeks 3-4 (2 Sessions)',
        goal: `Implement best practices, asynchronous patterns, and testing in ${skillName}.`,
        topics: [
          'State/data architecture & modular code separation',
          'Integration with external APIs and data structures',
          'Error boundaries, logging, and unit testing'
        ],
        keyTopics: [
          'State/data architecture & modular code separation',
          'Integration with external APIs and data structures',
          'Error boundaries, logging, and unit testing'
        ],
        projectMilestone: `Deploy an interactive multi-feature project with peer code review.`,
        handsOnChallenge: `Deploy an interactive multi-feature project with peer code review.`
      },
      {
        stageNumber: 3,
        stageName: `Stage 3: Advanced Optimization & Peer Mentoring`,
        title: `Stage 3: Advanced Optimization & Peer Mentoring`,
        duration: 'Weeks 5-6 (2 Sessions)',
        goal: `Achieve production readiness, performance tuning, and peer-teaching capability.`,
        topics: [
          'Performance profiling, memory efficiency, and caching',
          'Security hardening & CI/CD deployment automation',
          'Collaborative open-source documentation'
        ],
        keyTopics: [
          'Performance profiling, memory efficiency, and caching',
          'Security hardening & CI/CD deployment automation',
          'Collaborative open-source documentation'
        ],
        projectMilestone: `Publish an open-source template and conduct a SkillQuest peer exchange demo.`,
        handsOnChallenge: `Publish an open-source template and conduct a SkillQuest peer exchange demo.`
      }
    ],
    peerStudyAdvice: `Schedule two 45-minute peer review calls each week to discuss blocking concepts and exchange live code feedback on GitHub or screen share.`,
    mentorTips: [
      'Spend 10 mins reviewing the previous session before starting new topics.',
      'Use live coding screen shares instead of passive lecturing.',
      'Leave 10 mins at the end of each session for Q&A and setting next milestones.'
    ]
  };
}

// ═══════════════════════════════════════════════════════════
//  HELPER: XP → Level Calculator
//  Called after every XP change to keep user.level accurate.
//  Thresholds match APP_CONFIG.levelThresholds in config.ts.
//  To make levelling easier/harder, adjust the numbers below.
// ═══════════════════════════════════════════════════════════

/**
 * Returns the user's level (1–10) based on their total XP.
 * Level 10 (Grandmaster) is the maximum.
 */
function calculateLevel(xp: number): number {
  if (xp < 500)   return 1;
  if (xp < 1200)  return 2;
  if (xp < 2000)  return 3;
  if (xp < 3000)  return 4;
  if (xp < 4200)  return 5;
  if (xp < 5600)  return 6;
  if (xp < 7200)  return 7;
  if (xp < 9000)  return 8;
  if (xp < 11000) return 9;
  return 10; // Grandmaster — maximum level
}

/**
 * Checks all of a user's achievements and unlocks any whose conditions are now met.
 * Awards bonus XP for newly unlocked achievements and recalculates the user's level.
 *
 * Called automatically after exchanges complete, streaks update, and reviews are submitted.
 * Returns the list of newly unlocked achievement titles and total bonus XP gained.
 */
function evaluateAchievements(user: User): { unlockedAchievements: string[]; xpGained: number } {
  let xpGained = 0;
  const unlockedAchievements: string[] = [];

  for (const ach of user.achievements) {
    if (ach.unlocked) continue;

    if (ach.id === 'ach-first-teach' && user.stats.studentsTaught >= 1) {
      ach.unlocked = true;
      ach.progress = 1;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward;
      unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-streak-7' && user.streakDays >= 7) {
      ach.unlocked = true;
      ach.progress = 7;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward;
      unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-five-exchanges' && user.stats.sessionsCompleted >= 5) {
      ach.unlocked = true;
      ach.progress = 5;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward;
      unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-top-rated' && user.stats.reputationRating >= 4.9 && user.stats.reviewsCount >= 5) {
      ach.unlocked = true;
      ach.progress = 5;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward;
      unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-grandmaster' && user.level >= 8) {
      ach.unlocked = true;
      ach.progress = user.xp;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward;
      unlockedAchievements.push(ach.title);
    }
  }

  if (xpGained > 0) {
    user.xp += xpGained;
    user.level = calculateLevel(user.xp);
  }

  return { unlockedAchievements, xpGained };
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortFree(port))) {
    console.log(`ℹ️ Port ${port} is currently in use, checking port ${port + 1}...`);
    port++;
  }
  return port;
}

async function startServer() {
  const app = express();

  // Change port here, via PORT environment variable, or in APP_CONFIG.port (src/config.ts)
  const preferredPort = Number(process.env.PORT) || 3000;
  const PORT = await findAvailablePort(preferredPort);

  // Parse incoming request bodies as JSON
  app.use(express.json());

  // ═══════════════════════════════════════════════════════════
  //  REAL-TIME: SERVER-SENT EVENTS (SSE) BROADCASTER
  //  Keeps a map of userId → SSE response objects.
  //  Call broadcast(type, payload, triggerUserId) from any
  //  mutation route to push live updates to all connected clients.
  // ═══════════════════════════════════════════════════════════

  /** Map of connected SSE clients: userId → express Response */
  const sseClients = new Map<string, import('http').ServerResponse[]>();

  /**
   * Push a realtime event to ALL connected SSE clients.
   * triggerUserId is the actor — clients use it to suppress self-notifications.
   */
  function broadcast(
    type: string,
    payload: Record<string, any>,
    triggerUserId?: string
  ) {
    const event = JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId: triggerUserId,
    });
    for (const responses of sseClients.values()) {
      for (const res of responses) {
        try { res.write(`data: ${event}\n\n`); } catch { /* client gone */ }
      }
    }
  }

  // GET /api/events?userId=<id>
  // Opens a persistent SSE stream for a single authenticated client.
  // The client reconnects automatically; stale connections are cleaned up on close.
  app.get('/api/events', (req, res) => {
    const userId = (req.query.userId as string) || 'anonymous';

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    res.flushHeaders();

    // Register this client
    if (!sseClients.has(userId)) sseClients.set(userId, []);
    sseClients.get(userId)!.push(res);
    console.log(`[SSE] Client connected: ${userId} (total: ${sseClients.size} users)`);

    // Send an immediate welcome ping so the client knows the stream is live
    res.write(`data: ${JSON.stringify({ type: 'ping', payload: {}, timestamp: new Date().toISOString() })}\n\n`);

    // Keep-alive ping every 25 s to prevent proxy/browser timeouts
    const pingInterval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'ping', payload: {}, timestamp: new Date().toISOString() })}\n\n`);
      } catch {
        clearInterval(pingInterval);
      }
    }, 25000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(pingInterval);
      const list = sseClients.get(userId) || [];
      const filtered = list.filter(r => r !== res);
      if (filtered.length === 0) {
        sseClients.delete(userId);
      } else {
        sseClients.set(userId, filtered);
      }
      console.log(`[SSE] Client disconnected: ${userId}`);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: HEALTH CHECK
  // ═══════════════════════════════════════════════════════════

  // GET /api/health — Simple ping endpoint to confirm the server is running
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SkillQuest Backend', timestamp: new Date().toISOString(), liveClients: sseClients.size });
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: USERS
  // ═══════════════════════════════════════════════════════════

  // GET /api/users?college=&search=&skill=
  // Returns all users, optionally filtered by college, search term, or skill name
  app.get('/api/users', (req, res) => {
    const { college, search, skill } = req.query;
    let filtered = [...users];

    if (college && typeof college === 'string' && college !== 'All') {
      filtered = filtered.filter(u => u.college.toLowerCase().includes(college.toLowerCase()));
    }

    if (skill && typeof skill === 'string') {
      filtered = filtered.filter(u =>
        u.skillsTeaching.some(st => st.name.toLowerCase().includes(skill.toLowerCase())) ||
        u.skillsLearning.some(sl => sl.name.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.college.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q) ||
        u.skillsTeaching.some(st => st.name.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  // GET /api/users/:id
  // Returns a single user by ID, plus all reviews they have received
  app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userReviews = reviews.filter(r => r.toUserId === user.id);
    res.json({ ...user, reviews: userReviews });
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: AUTH & GOOGLE LOGIN
  // ═══════════════════════════════════════════════════════════

  // POST /api/auth/google
  // Logs in or registers a student using their Google account / Gmail.
  app.post('/api/auth/google', (req, res) => {
    const { email, name, avatar, college, branch, year, bio, teachSkill, learnSkill, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    let isNew = false;

    if (user) {
      // Existing user: mark online and update activity
      user.isOnline = true;
      user.lastActiveDate = new Date().toISOString().split('T')[0];
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = avatar;
      }
      if (googleId) user.googleId = googleId;
      user.authProvider = 'google';
    } else {
      // New user: register with Google profile
      isNew = true;
      const studentName = name || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      user = {
        id: `user-g-${Date.now()}`,
        name: studentName,
        email: cleanEmail,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        college: college || 'Campus Network',
        branch: branch || 'Computer Science & Engineering',
        year: year || '3rd Year B.Tech',
        bio: bio || 'Excited to learn, teach, and level up with fellow peers on SkillQuest!',
        xp: 250,   // Starting XP bonus
        level: 1,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        authProvider: 'google',
        googleId,
        skillsTeaching: teachSkill ? [
          {
            id: `teach-${Date.now()}`,
            name: teachSkill,
            category: 'Web Development',
            proficiency: 'Intermediate',
            experienceMonths: 12,
            description: `Ready to teach and collaborate on ${teachSkill}`,
            endorsementsCount: 0,
            tags: [teachSkill, 'Peer']
          }
        ] : [],
        skillsLearning: learnSkill ? [
          {
            id: `learn-${Date.now()}`,
            name: learnSkill,
            category: 'Data Structures & Algorithms',
            targetProficiency: 'Advanced',
            priority: 'High',
            notes: `Looking forward to mastering ${learnSkill} through peer exchanges.`
          }
        ] : [],
        badges: [
          {
            id: `badge-welcome-${Date.now()}`,
            name: 'Campus Initiate',
            description: 'Joined SkillQuest with Google Sign-In',
            icon: 'Sparkles',
            tier: 'bronze',
            unlockedAt: new Date().toISOString().split('T')[0],
            category: 'community'
          }
        ],
        achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
        stats: {
          totalHoursExchanged: 0,
          sessionsCompleted: 0,
          studentsTaught: 0,
          skillsLearnedCount: 0,
          reputationRating: 5.0,
          reviewsCount: 0,
          questPointsClaimed: 0
        },
        isOnline: true
      };
      users.push(user);
    }

    saveDatabase();
    // Broadcast new user event so peers see a fresh face on the leaderboard
    if (isNew) {
      broadcast('user_registered', { id: user.id, name: user.name, college: user.college, avatar: user.avatar }, user.id);
    }
    res.json({ success: true, isNew, user });
  });

  // POST /api/auth/login
  // Logs in an existing student via their registered Gmail or campus email.
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to log in.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({
        error: 'No registered student found with this email. Please sign up or continue with Google.'
      });
    }

    user.isOnline = true;
    user.lastActiveDate = new Date().toISOString().split('T')[0];
    saveDatabase();
    res.json({ success: true, user });
  });

  // POST /api/users/register
  // Creates a new student profile. Awards starter XP and the Campus Initiate badge.
  // Required fields: name, college
  app.post('/api/users/register', (req, res) => {
    const { name, email, college, branch, year, bio, skillsTeaching, skillsLearning } = req.body;
    if (!name || !college) {
      return res.status(400).json({ error: 'Name and college are required.' });
    }

    const studentEmail = (email || `${name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`).trim().toLowerCase();
    
    // Check if email already registered
    const existing = users.find(u => u.email.toLowerCase() === studentEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email is already registered. Please log in.' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: studentEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentEmail)}`,
      college: college.trim(),
      branch: branch || 'Computer Science & Engineering',
      year: year || '3rd Year B.Tech',
      bio: bio || 'Excited to teach my tech skills and learn from fellow CSE peers on SkillQuest!',
      xp: 250,   // Starting XP — matches APP_CONFIG.xp.newUserBonus
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      authProvider: 'email',
      skillsTeaching: skillsTeaching || [],
      skillsLearning: skillsLearning || [],
      badges: [
        {
          id: `badge-welcome-${Date.now()}`,
          name: 'Campus Initiate',
          description: 'Joined SkillQuest student exchange network',
          icon: 'Sparkles',
          tier: 'bronze',
          unlockedAt: new Date().toISOString().split('T')[0],
          category: 'community'
        }
      ],
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      stats: {
        totalHoursExchanged: 0,
        sessionsCompleted: 0,
        studentsTaught: 0,
        skillsLearnedCount: 0,
        reputationRating: 5.0,
        reviewsCount: 0,
        questPointsClaimed: 0
      },
      isOnline: true
    };

    users.push(newUser);
    saveDatabase();
    broadcast('user_registered', { id: newUser.id, name: newUser.name, college: newUser.college, avatar: newUser.avatar }, newUser.id);
    res.status(201).json(newUser);
  });

  // PUT /api/users/:id
  // Partial update of a user profile (e.g. bio, linkedinUrl, githubUrl)
  app.put('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    users[index] = { ...users[index], ...req.body };
    saveDatabase();
    res.json(users[index]);
  });

  // POST /api/users/:id/skills/teach
  // Adds a skill to the user's "I can teach this" list. Awards 50 XP.
  app.post('/api/users/:id/skills/teach', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, category, proficiency, experienceMonths, description, tags } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required.' });
    }

    const newTeachSkill: TeachingSkill = {
      id: `teach-${Date.now()}`,
      name,
      category,
      proficiency: proficiency || 'Intermediate',
      experienceMonths: Number(experienceMonths) || 12,
      description: description || `Experienced in ${name}, eager to mentor peers.`,
      endorsementsCount: 0,
      tags: tags && Array.isArray(tags) ? tags : [category]
    };

    user.skillsTeaching.push(newTeachSkill);
    user.xp += 50; // XP reward — matches APP_CONFIG.xp.addTeachSkill
    user.level = calculateLevel(user.xp);

    saveDatabase();
    res.status(201).json({ user, newSkill: newTeachSkill });
  });

  // POST /api/users/:id/skills/learn
  // Adds a skill to the user's "I want to learn" wishlist. Awards 30 XP.
  app.post('/api/users/:id/skills/learn', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, category, targetProficiency, priority, notes } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required.' });
    }

    const newLearnSkill: LearningSkill = {
      id: `learn-${Date.now()}`,
      name,
      category,
      targetProficiency: targetProficiency || 'Intermediate',
      priority: priority || 'High',
      notes: notes || `Looking for hands-on peer sessions in ${name}.`
    };

    user.skillsLearning.push(newLearnSkill);
    user.xp += 30; // XP reward — matches APP_CONFIG.xp.addLearnSkill
    user.level = calculateLevel(user.xp);

    saveDatabase();
    res.status(201).json({ user, newSkill: newLearnSkill });
  });

  // DELETE /api/users/:id/skills/:type/:skillId
  // Removes a skill entry. :type must be 'teach' or 'learn'.
  app.delete('/api/users/:id/skills/:type/:skillId', (req, res) => {
    const { id, type, skillId } = req.params;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (type === 'teach') {
      user.skillsTeaching = user.skillsTeaching.filter(s => s.id !== skillId);
    } else if (type === 'learn') {
      user.skillsLearning = user.skillsLearning.filter(s => s.id !== skillId);
    }

    saveDatabase();
    res.json(user);
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: SKILLS CATALOG
  // ═══════════════════════════════════════════════════════════

  // GET /api/skills
  // Returns the skill catalog with live tutor/learner counts computed from user data
  app.get('/api/skills', (req, res) => {
    // Dynamic recalculation of tutors & learners
    const enrichedSkills = skills.map(skill => {
      const tutors = users.filter(u =>
        u.skillsTeaching.some(st => st.name.toLowerCase() === skill.name.toLowerCase())
      ).length;
      const learners = users.filter(u =>
        u.skillsLearning.some(sl => sl.name.toLowerCase() === skill.name.toLowerCase())
      ).length;

      return {
        ...skill,
        totalTutors: Math.max(skill.totalTutors, tutors),
        totalLearners: Math.max(skill.totalLearners, learners)
      };
    });

    res.json(enrichedSkills);
  });

  // POST /api/skills
  // Adds a new skill to the catalog (admin/dev use). Required: name, category
  app.post('/api/skills', (req, res) => {
    const { name, category, description, popularTopics, difficulty, icon, youtubePlaylists } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required' });
    }

    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name,
      category,
      icon: icon || 'Code2',
      description: description || `${name} skills for college students.`,
      popularTopics: popularTopics || [name],
      totalTutors: 1,
      totalLearners: 1,
      difficulty: difficulty || 'Intermediate',
      youtubePlaylists: youtubePlaylists || [
        {
          id: `yt-${Date.now()}`,
          title: `${name} Full Course Tutorial & Projects`,
          channelName: 'Popular Tech Creators',
          playlistUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' full course playlist tutorial')}`,
          videoCount: 'Full Series',
          duration: '10+ Hours',
          badge: 'YouTube Course',
          description: `Comprehensive tutorials, conceptual foundations, and hands-on projects for learning ${name}.`,
          keyTopics: popularTopics || [name]
        }
      ]
    };

    db.saveSkill(newSkill);
    skills = db.getSkills();
    res.status(201).json(newSkill);
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: SKILL EXCHANGES
  // ═══════════════════════════════════════════════════════════

  // GET /api/exchanges?userId=&status=
  // Returns all exchanges (sorted newest-first), filtered by user or status
  app.get('/api/exchanges', (req, res) => {
    const { userId, status } = req.query;
    let result = [...exchanges];

    if (userId && typeof userId === 'string') {
      result = result.filter(e => e.fromUserId === userId || e.toUserId === userId);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      result = result.filter(e => e.status === status);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(result);
  });

  // POST /api/exchanges
  // Creates a new exchange proposal (status: 'pending'). Awards 25 XP to proposer.
  // Required: fromUserId, toUserId, skillOffered, skillRequested
  app.post('/api/exchanges', (req, res) => {
    const {
      fromUserId,
      toUserId,
      skillOffered,
      skillRequested,
      title,
      message,
      preferredSchedule
    } = req.body;

    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
      return res.status(400).json({ error: 'Valid requester and recipient students are required.' });
    }

    const newExchange: SkillExchange = {
      id: `exc-${Date.now()}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatar,
      fromUserCollege: fromUser.college,
      toUserId: toUser.id,
      toUserName: toUser.name,
      toUserAvatar: toUser.avatar,
      toUserCollege: toUser.college,
      skillOffered: skillOffered || 'General Tech Mentoring',
      skillRequested: skillRequested || 'Peer Learning',
      title: title || `${skillOffered} ⇄ ${skillRequested} Exchange`,
      message: message || 'Hello! Let us exchange our tech skills together on SkillQuest.',
      status: 'pending',
      preferredSchedule: preferredSchedule || 'Weekends / Flexible',
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Introductory 15-min sync & roadmap setup', completed: false },
        { id: `m-${Date.now()}-2`, title: `Peer hands-on session on ${skillOffered}`, completed: false },
        { id: `m-${Date.now()}-3`, title: `Peer hands-on session on ${skillRequested}`, completed: false },
        { id: `m-${Date.now()}-4`, title: 'Mini project review & mutual feedback', completed: false }
      ],
      sessionNotes: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    exchanges.unshift(newExchange);

    // Award XP to the student who proposed the exchange — matches APP_CONFIG.xp.proposeExchange
    fromUser.xp += 25;
    fromUser.level = calculateLevel(fromUser.xp);

    saveDatabase();
    // Broadcast to the recipient so they see the proposal immediately
    broadcast('exchange_proposed', {
      id: newExchange.id,
      fromUserId: newExchange.fromUserId,
      fromUserName: newExchange.fromUserName,
      toUserId: newExchange.toUserId,
      toUserName: newExchange.toUserName,
      skillOffered: newExchange.skillOffered,
      skillRequested: newExchange.skillRequested,
    }, fromUser.id);
    res.status(201).json(newExchange);
  });

  // PUT /api/exchanges/:id/status
  // Updates exchange status. Accepting auto-creates a Meet link.
  // Completing awards 200 XP to both students and updates their stats.
  app.put('/api/exchanges/:id/status', (req, res) => {
    const { status, meetLink } = req.body;
    const exchange = exchanges.find(e => e.id === req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

    exchange.status = status;
    if (meetLink) exchange.meetLink = meetLink;

    if (status === 'accepted' || status === 'in_progress') {
      exchange.meetLink = exchange.meetLink || `https://meet.google.com/sq-${Math.random().toString(36).substring(7)}`;
    }

    if (status === 'completed') {
      exchange.completedAt = new Date().toISOString().split('T')[0];
      exchange.xpAwarded = 200;

      // Award XP to both users
      const userA = users.find(u => u.id === exchange.fromUserId);
      const userB = users.find(u => u.id === exchange.toUserId);

      if (userA) {
        userA.xp += 200;
        userA.level = calculateLevel(userA.xp);
        userA.stats.sessionsCompleted += 1;
        userA.stats.totalHoursExchanged += 2;
        userA.stats.skillsLearnedCount += 1;
        userA.stats.studentsTaught += 1;
        evaluateAchievements(userA);
      }

      if (userB) {
        userB.xp += 200;
        userB.level = calculateLevel(userB.xp);
        userB.stats.sessionsCompleted += 1;
        userB.stats.totalHoursExchanged += 2;
        userB.stats.skillsLearnedCount += 1;
        userB.stats.studentsTaught += 1;
        evaluateAchievements(userB);
      }
    }

    saveDatabase();
    // Broadcast status change
    const broadcastType =
      status === 'in_progress' ? 'exchange_accepted' :
      status === 'completed'   ? 'exchange_completed' :
      status === 'cancelled'   ? 'exchange_declined'  : null;
    if (broadcastType) {
      broadcast(broadcastType, {
        id: exchange.id,
        fromUserId: exchange.fromUserId,
        fromUserName: exchange.fromUserName,
        toUserId: exchange.toUserId,
        toUserName: exchange.toUserName,
        skillOffered: exchange.skillOffered,
        title: exchange.title,
      });
      if (status === 'completed') {
        broadcast('leaderboard_update', { reason: 'exchange_completed' });
      }
    }
    res.json(exchange);
  });

  // POST /api/exchanges/:id/milestones
  // Toggles a milestone's completed state (check/uncheck)
  app.post('/api/exchanges/:id/milestones', (req, res) => {
    const { milestoneId, completed } = req.body;
    const exchange = exchanges.find(e => e.id === req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

    const milestone = exchange.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = completed;
    }

    saveDatabase();
    res.json(exchange);
  });

  // POST /api/exchanges/:id/notes
  // Appends a text note to the exchange's session log
  app.post('/api/exchanges/:id/notes', (req, res) => {
    const { note } = req.body;
    const exchange = exchanges.find(e => e.id === req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

    if (!exchange.sessionNotes) exchange.sessionNotes = [];
    exchange.sessionNotes.push(note);

    saveDatabase();
    res.json(exchange);
  });

  // POST /api/exchanges/:id/review
  // Submits a peer review. Awards XP to both reviewer and reviewee.
  // Also recalculates the reviewee's reputation rating and triggers achievement checks.
  app.post('/api/exchanges/:id/review', (req, res) => {
    const { fromUserId, toUserId, rating, tags, comment } = req.body;
    const exchange = exchanges.find(e => e.id === req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
      return res.status(400).json({ error: 'Invalid reviewer or recipient.' });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      exchangeId: exchange.id,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatar,
      fromUserCollege: fromUser.college,
      toUserId: toUser.id,
      rating: Number(rating) || 5,
      tags: tags || ['Patient Mentor', 'Clean Code'],
      comment: comment || 'Great peer session on SkillQuest!',
      skillExchanged: exchange.skillOffered,
      createdAt: new Date().toISOString().split('T')[0]
    };

    reviews.push(newReview);

    // Update toUser rating stats
    const allToUserReviews = reviews.filter(r => r.toUserId === toUser.id);
    const avgRating = allToUserReviews.reduce((sum, r) => sum + r.rating, 0) / allToUserReviews.length;
    toUser.stats.reputationRating = Number(avgRating.toFixed(2));
    toUser.stats.reviewsCount = allToUserReviews.length;

    // Award bonus XP for receiving great review
    if (rating >= 4) {
      toUser.xp += 100;
      toUser.level = calculateLevel(toUser.xp);
    }

    // Award XP to reviewer for giving feedback
    fromUser.xp += 50;
    fromUser.level = calculateLevel(fromUser.xp);

    evaluateAchievements(toUser);
    evaluateAchievements(fromUser);

    saveDatabase();
    // Notify the reviewed user in real time
    broadcast('review_submitted', {
      id: newReview.id,
      fromUserId: newReview.fromUserId,
      fromUserName: newReview.fromUserName,
      toUserId: newReview.toUserId,
      rating: newReview.rating,
      skillExchanged: newReview.skillExchanged,
    }, fromUser.id);
    broadcast('leaderboard_update', { reason: 'review_submitted' });
    res.status(201).json({ review: newReview, toUser, fromUser });
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: REVIEWS
  // ═══════════════════════════════════════════════════════════

  // GET /api/reviews?toUserId=
  // Returns all reviews, optionally filtered by the user being reviewed.
  app.get('/api/reviews', (req, res) => {
    const { toUserId } = req.query;
    let result = [...reviews];
    if (toUserId && typeof toUserId === 'string') {
      result = result.filter(r => r.toUserId === toUserId);
    }
    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(result);
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: QUESTS
  // ═══════════════════════════════════════════════════════════

  // GET /api/quests
  // Returns the full list of available quests (daily, weekly, special)
  app.get('/api/quests', (req, res) => {
    res.json(quests);
  });

  // POST /api/quests/check-in
  // Records today's check-in, increments the streak, and awards 50 XP.
  // Idempotent — calling twice in one day has no extra effect (checks lastActiveDate).
  // NOTE: This MUST be defined before /api/quests/:id/claim to avoid 'check-in'
  // being captured as the :id parameter by Express route matching.
  app.post('/api/quests/check-in', (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    let xpAwarded = 0;
    const prevLevel = user.level;

    if (user.lastActiveDate !== today) {
      user.streakDays += 1;
      user.lastActiveDate = today;
      user.xp += 50; // Daily check-in XP — matches APP_CONFIG.xp.dailyCheckIn
      user.level = calculateLevel(user.xp);
      xpAwarded = 50;
      evaluateAchievements(user);
    }

    saveDatabase();
    // ── Return full user object so the frontend never needs a second fetch ──
    res.json({
      user,
      streakDays: user.streakDays,
      xp: user.xp,
      level: user.level,
      xpAwarded,
      leveledUp: user.level > prevLevel,
      message: xpAwarded > 0
        ? `\uD83D\uDD25 Daily Check-In! +${xpAwarded} XP · ${user.streakDays}-day streak!`
        : `Already checked in today. Your ${user.streakDays}-day streak continues!`,
    });
  });

  // POST /api/quests/:id/claim
  // Claims an already-completed quest's XP reward. Idempotent — returns 400 if already claimed.
  app.post('/api/quests/:id/claim', (req, res) => {
    const { userId } = req.body;
    const quest = quests.find(q => q.id === req.params.id);
    const user = users.find(u => u.id === userId);

    if (!quest || !user) {
      return res.status(404).json({ error: 'Quest or user not found' });
    }

    if (quest.claimed) {
      return res.status(400).json({ error: 'Quest reward already claimed' });
    }

    quest.completed = true;
    quest.claimed = true;
    user.xp += quest.xpReward;
    user.level = calculateLevel(user.xp);
    user.stats.questPointsClaimed += quest.xpReward;

    const achResults = evaluateAchievements(user);

    saveDatabase();
    broadcast('quest_claimed', {
      userId: user.id,
      questTitle: quest.title,
      xpAwarded: quest.xpReward,
    }, user.id);
    if (achResults.unlockedAchievements.length > 0) {
      broadcast('leaderboard_update', { reason: 'achievement_unlocked', userId: user.id });
    }
    res.json({
      quest,
      user,
      xpAdded: quest.xpReward,
      newLevel: user.level,
      achievementsUnlocked: achResults.unlockedAchievements
    });
  });


  // ═══════════════════════════════════════════════════════════
  //  ROUTES: LEADERBOARD
  // ═══════════════════════════════════════════════════════════

  // GET /api/leaderboard?college=
  // Returns ranked users sorted by XP (desc), then reputation rating.
  // The Leaderboard view currently computes rankings client-side from allUsers.
  app.get('/api/leaderboard', (req, res) => {
    const { college } = req.query;
    let ranked = [...users];

    if (college && typeof college === 'string' && college !== 'All') {
      ranked = ranked.filter(u => u.college.toLowerCase().includes(college.toLowerCase()));
    }

    // Sort by XP descending, then by reputation
    ranked.sort((a, b) => b.xp - a.xp || b.stats.reputationRating - a.stats.reputationRating);

    const leaderboard = ranked.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      college: u.college,
      branch: u.branch,
      level: u.level,
      xp: u.xp,
      streakDays: u.streakDays,
      reputationRating: u.stats.reputationRating,
      sessionsCompleted: u.stats.sessionsCompleted,
      badgesCount: u.badges.length,
      topSkill: u.skillsTeaching[0]?.name || 'Computer Science'
    }));

    res.json(leaderboard);
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: SMART SKILL MATCHING
  // ═══════════════════════════════════════════════════════════

  // GET /api/matches/:userId
  // Runs the bi-directional skill-matching algorithm for a user.
  // Scores range 40–100: 96 = perfect mutual match, 40 = baseline campus compatibility.
  // Results are sorted by matchScore (highest first).
  app.get('/api/matches/:userId', (req, res) => {
    const currentUser = users.find(u => u.id === req.params.userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const userTeaches = currentUser.skillsTeaching.map(s => s.name.toLowerCase());
    const userLearns = currentUser.skillsLearning.map(s => s.name.toLowerCase());

    const matches: MatchSynergy[] = [];

    for (const peer of users) {
      if (peer.id === currentUser.id) continue;

      const peerTeaches = peer.skillsTeaching.map(s => s.name.toLowerCase());
      const peerLearns = peer.skillsLearning.map(s => s.name.toLowerCase());

      // 1. Direct Bi-directional match: They teach what I want, I teach what they want!
      let directTeachMatches = peerTeaches.filter(pt =>
        userLearns.some(ul => ul.includes(pt) || pt.includes(ul))
      );
      let directLearnMatches = userTeaches.filter(ut =>
        peerLearns.some(pl => pl.includes(ut) || ut.includes(pl))
      );

      let score = 40; // baseline campus compatibility
      const highlights: string[] = [];

      if (directTeachMatches.length > 0 && directLearnMatches.length > 0) {
        score = 96;
        highlights.push(`Perfect Bi-directional Skill Match: They teach ${directTeachMatches[0]} and want your ${directLearnMatches[0]}`);
      } else if (directTeachMatches.length > 0) {
        score = 80;
        highlights.push(`Peer Tutor Match: ${peer.name} teaches ${directTeachMatches[0]} which is on your wishlist`);
      } else if (directLearnMatches.length > 0) {
        score = 75;
        highlights.push(`Student Match: ${peer.name} wants to learn ${directLearnMatches[0]} which you can teach`);
      }

      if (peer.stats.reputationRating >= 4.8) {
        score += 4;
        highlights.push(`High Reputation Tutor (${peer.stats.reputationRating}★ Rating)`);
      }

      if (peer.streakDays >= 5) {
        highlights.push(`Active Student (${peer.streakDays}-day streak)`);
      }

      matches.push({
        matchedUser: peer,
        matchScore: Math.min(100, score),
        mutualTeachSkill: directTeachMatches[0] || peer.skillsTeaching[0]?.name || 'Tech Skills',
        mutualLearnSkill: directLearnMatches[0] || currentUser.skillsTeaching[0]?.name || 'Tech Skills',
        synergyHighlights: highlights,
        recommendedProjectIdea: `Build a collaborative full-stack portfolio app combining ${directTeachMatches[0] || 'Peer Skills'} and ${directLearnMatches[0] || 'Web Dev'}.`
      });
    }

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    res.json(matches);
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: GEMINI AI FEATURES
  //  All AI routes fall back gracefully when Gemini is unavailable.
  //  Requires GEMINI_API_KEY in .env to activate real AI responses.
  // ═══════════════════════════════════════════════════════════

  // POST /api/ai/match-analysis
  // Uses Gemini to deeply analyze learning synergy between two specific students.
  // Falls back to a dynamic server-computed analysis if AI is unavailable.
  app.post('/api/ai/match-analysis', async (req, res) => {
    const { currentUserId, targetUserId } = req.body;
    const userA = users.find(u => u.id === currentUserId);
    const userB = users.find(u => u.id === targetUserId);

    if (!userA || !userB) {
      return res.status(404).json({ error: 'Both students must exist to analyze synergy' });
    }

    const defaultSynergy = {
      synergyScore: 94,
      compatibilityRating: 'Exceptional Peer Match',
      summary: `${userA.name} and ${userB.name} have an outstanding mutual peer exchange synergy. ${userA.name} provides strong practical experience in ${userA.skillsTeaching.map(s => s.name).join(', ') || 'Backend'}, while ${userB.name} brings deep domain depth in ${userB.skillsTeaching.map(s => s.name).join(', ') || 'Frontend & Cloud'}.`,
      whyThisMatchWorks: `High reciprocal skill alignment: ${userA.name} wants ${userA.skillsLearning[0]?.name || 'new skills'} taught by ${userB.name}, and ${userB.name} benefits from ${userA.skillsTeaching[0]?.name || 'practical concepts'}. Both have compatible engineering schedules and high reputation ratings.`,
      whatStudent1Teaches: `${userB.skillsTeaching[0]?.name || 'Core Domain'}: Architecture patterns, live coding debugging, and clean code workflows.`,
      whatStudent2Teaches: `${userA.skillsTeaching[0]?.name || 'Specialized Frameworks'}: Hands-on implementations, deployment steps, and best practices.`,
      collaborativeProjectIdea: `Co-build an open-source campus productivity app uniting ${userA.skillsTeaching[0]?.name || 'Core Tech'} with ${userB.skillsTeaching[0]?.name || 'Modern Frameworks'}.`,
      projectIdea: `A collaborative open-source campus tool combining ${userA.skillsTeaching[0]?.name || 'Web'} and ${userB.skillsTeaching[0]?.name || 'AI/Algorithms'}.`,
      suggestedRoutine: 'Two 45-minute peer coding blocks per week on Google Meet with mutual code review.',
      recommendedExchangePlan: [
        `Session 1: ${userA.name} guides ${userB.name} on setup, architecture, and core syntax.`,
        `Session 2: ${userB.name} conducts a hands-on problem solving walkthrough.`,
        `Session 3: Joint pair-programming capstone project combining both skillsets.`
      ],
      mentorTips: [
        'Set up a shared GitHub repository or Live Share session before calling.',
        'Prepare 2-3 specific questions before each 45-minute peer block.',
        'Complete mutual reviews on SkillQuest after testing code.'
      ]
    };

    const ai = getAI();
    if (!ai) {
      return res.json(defaultSynergy);
    }

    try {
      const prompt = `You are the AI Academic Advisor for SkillQuest, a gamified college CSE peer skill exchange platform.
Analyze the mutual learning synergy between these two students:

Student A:
- Name: ${userA.name} (${userA.college}, ${userA.branch})
- Skills they Teach: ${JSON.stringify(userA.skillsTeaching.map(s => ({ name: s.name, level: s.proficiency })))}
- Skills they Want to Learn: ${JSON.stringify(userA.skillsLearning.map(s => ({ name: s.name, target: s.targetProficiency })))}

Student B:
- Name: ${userB.name} (${userB.college}, ${userB.branch})
- Skills they Teach: ${JSON.stringify(userB.skillsTeaching.map(s => ({ name: s.name, level: s.proficiency })))}
- Skills they Want to Learn: ${JSON.stringify(userB.skillsLearning.map(s => ({ name: s.name, target: s.targetProficiency })))}

Provide a structured peer exchange analysis with:
1. synergyScore (number between 70 and 99)
2. compatibilityRating (string like "Exceptional Peer Match", "High Synergy", "Great Collaborative Fit")
3. summary (2-3 sentences explaining why this pair is synergistic)
4. whyThisMatchWorks (detailed explanation of mutual benefits)
5. whatStudent1Teaches (what Student B teaches Student A)
6. whatStudent2Teaches (what Student A teaches Student B)
7. collaborativeProjectIdea (tangible college portfolio project concept)
8. projectIdea (short project title)
9. suggestedRoutine (recommended weekly cadence)
10. recommendedExchangePlan (array of 3 progressive session outlines)
11. mentorTips (array of 3 actionable tips for peer mentorship)`;

      const response = await generateWithModelFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              synergyScore: { type: Type.NUMBER },
              compatibilityRating: { type: Type.STRING },
              summary: { type: Type.STRING },
              whyThisMatchWorks: { type: Type.STRING },
              whatStudent1Teaches: { type: Type.STRING },
              whatStudent2Teaches: { type: Type.STRING },
              collaborativeProjectIdea: { type: Type.STRING },
              projectIdea: { type: Type.STRING },
              suggestedRoutine: { type: Type.STRING },
              recommendedExchangePlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              mentorTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'synergyScore',
              'compatibilityRating',
              'summary',
              'whyThisMatchWorks',
              'whatStudent1Teaches',
              'whatStudent2Teaches',
              'collaborativeProjectIdea',
              'projectIdea',
              'suggestedRoutine',
              'recommendedExchangePlan',
              'mentorTips'
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      res.json({ ...defaultSynergy, ...parsed });
    } catch (err: any) {
      console.error('Gemini AI match analysis notice (using dynamic fallback):', err?.message || err);
      res.json(defaultSynergy);
    }
  });

  // POST /api/ai/generate-roadmap
  // Uses Gemini to generate a personalized 3-stage learning roadmap for any skill.
  // Falls back to getFallbackRoadmap() if AI is unavailable.
  app.post('/api/ai/generate-roadmap', async (req, res) => {
    const { skillName, targetProficiency, currentLevel } = req.body;
    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const fallbackRoadmap = getFallbackRoadmap(skillName, currentLevel, targetProficiency);
    const ai = getAI();
    if (!ai) {
      return res.json(fallbackRoadmap);
    }

    try {
      const prompt = `You are the Lead Academic Advisor on SkillQuest. Create a structured 3-stage peer-to-peer learning roadmap for a college CSE student learning "${skillName}".
Target Proficiency: ${targetProficiency || 'Advanced'}.
Current Knowledge: ${currentLevel || 'Beginner'}.

Return a detailed JSON object with:
- skill: "${skillName}"
- skillName: "${skillName}"
- estimatedWeeks: number (e.g. 6)
- duration: string (e.g. "6 Weeks (3 Stages • 6 Peer Sessions)")
- overview: string (2-3 sentences overview of the learning journey)
- stages: array of 3 objects, each having:
  - stageNumber: number (1, 2, 3)
  - stageName: string (e.g. "Stage 1: Core Fundamentals & Tooling")
  - title: string (same as stageName)
  - duration: string (e.g. "Weeks 1-2 (2 Sessions)")
  - goal: string (clear measurable objective)
  - suggestedSessions: number (2)
  - topics: array of 3 specific technical topics
  - keyTopics: array of 3 specific technical topics
  - projectMilestone: string (practical mini-project challenge)
  - handsOnChallenge: string (same as projectMilestone)
- peerStudyAdvice: string (actionable peer mentorship advice)
- mentorTips: array of 3 practical peer teaching tips.`;

      const response = await generateWithModelFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              skillName: { type: Type.STRING },
              estimatedWeeks: { type: Type.NUMBER },
              duration: { type: Type.STRING },
              overview: { type: Type.STRING },
              stages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stageNumber: { type: Type.INTEGER },
                    stageName: { type: Type.STRING },
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    goal: { type: Type.STRING },
                    suggestedSessions: { type: Type.INTEGER },
                    topics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    keyTopics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    projectMilestone: { type: Type.STRING },
                    handsOnChallenge: { type: Type.STRING }
                  },
                  required: [
                    'stageNumber',
                    'stageName',
                    'duration',
                    'goal',
                    'topics',
                    'projectMilestone'
                  ]
                }
              },
              peerStudyAdvice: { type: Type.STRING },
              mentorTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['skill', 'estimatedWeeks', 'duration', 'overview', 'stages', 'peerStudyAdvice', 'mentorTips']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      // Normalize stages if needed
      if (parsed.stages && Array.isArray(parsed.stages)) {
        parsed.stages = parsed.stages.map((st: any, i: number) => ({
          stageNumber: st.stageNumber || i + 1,
          stageName: st.stageName || st.title || `Stage ${i + 1}`,
          title: st.title || st.stageName || `Stage ${i + 1}`,
          duration: st.duration || `Weeks ${i * 2 + 1}-${i * 2 + 2}`,
          goal: st.goal || '',
          suggestedSessions: st.suggestedSessions || 2,
          topics: st.topics || st.keyTopics || [],
          keyTopics: st.keyTopics || st.topics || [],
          projectMilestone: st.projectMilestone || st.handsOnChallenge || '',
          handsOnChallenge: st.handsOnChallenge || st.projectMilestone || ''
        }));
      }
      parsed.skill = parsed.skill || skillName;
      parsed.skillName = parsed.skillName || skillName;
      parsed.estimatedWeeks = parsed.estimatedWeeks || 6;
      parsed.duration = parsed.duration || '6 Weeks (3 Stages)';

      res.json({ ...fallbackRoadmap, ...parsed });
    } catch (err: any) {
      console.error('Gemini AI roadmap generation notice (using dynamic fallback):', err?.message || err);
      // Gracefully return high quality dynamic fallback so frontend never breaks
      res.json(fallbackRoadmap);
    }
  });

  // POST /api/ai/generate-quests
  // Uses Gemini to generate 2 tailored quests based on the student's learning goals.
  // Falls back to two pre-defined quests if AI is unavailable.
  app.post('/api/ai/generate-quests', async (req, res) => {
    const { learningGoals, branch } = req.body;
    const ai = getAI();

    const fallbackQuests: Quest[] = [
      {
        id: `quest-ai-${Date.now()}-1`,
        title: `Master ${learningGoals?.[0] || 'DSA'} Deep Dive`,
        description: `Complete 2 collaborative coding problem sessions in ${learningGoals?.[0] || 'Algorithms'}.`,
        type: 'weekly',
        category: 'Data Structures & Algorithms',
        xpReward: 300,
        progress: 0,
        target: 2,
        unit: 'sessions',
        completed: false,
        claimed: false,
        expiresInHours: 120,
        icon: 'Code2'
      },
      {
        id: `quest-ai-${Date.now()}-2`,
        title: `System Architecture Peer Sync`,
        description: `Draw and explain a high-level system diagram for a real-time app to your peer mentor.`,
        type: 'weekly',
        category: 'Core CSE',
        xpReward: 250,
        progress: 0,
        target: 1,
        unit: 'diagram',
        completed: false,
        claimed: false,
        expiresInHours: 120,
        icon: 'Sparkles'
      }
    ];

    if (!ai) {
      db.saveQuests(fallbackQuests);
      quests = db.getQuests();
      return res.json(quests);
    }

    try {
      const prompt = `Generate 2 high-motivation gamified learning quests for a college student in ${branch || 'CSE'} learning: ${JSON.stringify(learningGoals || ['React', 'Data Structures'])}.
Return a JSON array of objects with:
- title: string (short, engaging action title)
- description: string (clear criteria)
- type: "daily" or "weekly"
- category: string
- xpReward: number (between 100 and 400)
- target: number (1 to 5)
- unit: string (e.g. "problems", "sessions", "modules")
- icon: string (e.g. "Code2", "Sparkles", "Flame", "Terminal", "Cpu", "Zap")`;

      const response = await generateWithModelFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                category: { type: Type.STRING },
                xpReward: { type: Type.NUMBER },
                target: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ['title', 'description', 'type', 'category', 'xpReward', 'target', 'unit', 'icon']
            }
          }
        }
      });

      const generated = JSON.parse(response.text?.trim() || '[]');
      const newQuests: Quest[] = generated.map((g: any, index: number) => ({
        id: `quest-ai-${Date.now()}-${index}`,
        title: g.title,
        description: g.description,
        type: (g.type === 'weekly' ? 'weekly' : 'daily') as any,
        category: (g.category || 'General') as any,
        xpReward: Number(g.xpReward) || 150,
        progress: 0,
        target: Number(g.target) || 1,
        unit: g.unit || 'tasks',
        completed: false,
        claimed: false,
        expiresInHours: g.type === 'weekly' ? 120 : 24,
        icon: g.icon || 'Sparkles'
      }));

      db.saveQuests(newQuests);
      quests = db.getQuests();
      res.json(quests);
    } catch (err: any) {
      console.error('Gemini AI quest generation notice (using dynamic fallback):', err?.message || err);
      db.saveQuests(fallbackQuests);
      quests = db.getQuests();
      res.json(quests);
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  ROUTES: DATABASE STORAGE & BACKUPS
  // ═══════════════════════════════════════════════════════════

  // GET /api/db/stats — Returns live SQLite & JSON storage metrics
  app.get('/api/db/stats', (req, res) => {
    res.json(db.getStats());
  });

  // POST /api/db/backup — Creates a persistent timestamped snapshot in src/data/backups/
  app.post('/api/db/backup', (req, res) => {
    const backupResult = db.createBackup();
    res.json(backupResult);
  });

  // GET /api/db/export — Exports full database collections
  app.get('/api/db/export', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      stats: db.getStats(),
      users: db.getUsers(),
      skills: db.getSkills(),
      exchanges: db.getExchanges(),
      reviews: db.getReviews(),
      quests: db.getQuests()
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  FRONTEND SERVING
  //  Dev:  Vite middleware handles hot-reload and proxies /api/* to Express
  //  Prod: Serve the pre-built static files from /dist
  // ═══════════════════════════════════════════════════════════
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start listening — binding to 0.0.0.0 allows access from other devices on the LAN
  const server = app.listen(PORT, '0.0.0.0', () => {
    const dbStats = db.getStats();
    console.log(`\n======================================================`);
    console.log(`🚀 SkillQuest server running → http://localhost:${PORT}`);
    console.log(`   Landing Page: http://localhost:${PORT}/landingPage.html`);
    console.log(`   AI features:  ${process.env.GEMINI_API_KEY ? '🟢 Gemini Active' : '🟡 Fallback Mode (Add GEMINI_API_KEY to .env to enable AI)'}`);
    console.log(`   Database:     ${dbStats.sqliteActive ? '🗄️ SQLite Active (WAL Mode)' : '📁 Atomic JSON File Storage'}`);
    console.log(`   Records:      Users: ${dbStats.userCount} | Skills: ${dbStats.skillCount} | Exchanges: ${dbStats.exchangeCount} | Quests: ${dbStats.questCount}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err: any) => {
    console.error('Server listener error:', err);
  });
}

startServer();
