// =============================================================
//  SkillQuest — Vercel Serverless Adapter
//  ─────────────────────────────────────────────────────────────
//  This file wraps the entire Express backend as a single Vercel
//  serverless function. It is functionally identical to server.ts
//  with three differences:
//    1. No app.listen() — Vercel handles the HTTP layer
//    2. No Vite dev middleware — production only
//    3. SSE /api/events returns one ping then closes immediately
//       (Vercel functions timeout; the client backs off gracefully)
// =============================================================

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_SKILLS,
  INITIAL_EXCHANGES,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REVIEWS
} from '../src/data/seedData';
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
} from '../src/types';

// ═══════════════════════════════════════════════════════════
//  DATABASE ENGINE
// ═══════════════════════════════════════════════════════════
import { db } from '../src/server/db/database';

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
// ═══════════════════════════════════════════════════════════
let aiClient: GoogleGenAI | null = null;
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
].filter(Boolean);

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

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
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 429;
      if (!isTransient || attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

async function generateWithModelFallback(
  ai: GoogleGenAI,
  requestParams: { contents: string; config?: any }
) {
  let lastError: any;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await generateWithRetry(async () => {
        return await ai.models.generateContent({ ...requestParams, model });
      }, 1, 400);
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable, trying next...`);
    }
  }
  throw lastError;
}

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
//  HELPERS
// ═══════════════════════════════════════════════════════════
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
  return 10;
}

function evaluateAchievements(user: User): { unlockedAchievements: string[]; xpGained: number } {
  let xpGained = 0;
  const unlockedAchievements: string[] = [];
  for (const ach of user.achievements) {
    if (ach.unlocked) continue;
    if (ach.id === 'ach-first-teach' && user.stats.studentsTaught >= 1) {
      ach.unlocked = true; ach.progress = 1;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward; unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-streak-7' && user.streakDays >= 7) {
      ach.unlocked = true; ach.progress = 7;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward; unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-five-exchanges' && user.stats.sessionsCompleted >= 5) {
      ach.unlocked = true; ach.progress = 5;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward; unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-top-rated' && user.stats.reputationRating >= 4.9 && user.stats.reviewsCount >= 5) {
      ach.unlocked = true; ach.progress = 5;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward; unlockedAchievements.push(ach.title);
    } else if (ach.id === 'ach-grandmaster' && user.level >= 8) {
      ach.unlocked = true; ach.progress = user.xp;
      ach.unlockedAt = new Date().toISOString().split('T')[0];
      xpGained += ach.xpReward; unlockedAchievements.push(ach.title);
    }
  }
  if (xpGained > 0) { user.xp += xpGained; user.level = calculateLevel(user.xp); }
  return { unlockedAchievements, xpGained };
}

// ═══════════════════════════════════════════════════════════
//  EXPRESS APP
// ═══════════════════════════════════════════════════════════
const app = express();
app.use(express.json());

// ── SSE: Vercel-compatible (immediate close — client backs off gracefully) ──
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'close');
  res.write(`data: ${JSON.stringify({ type: 'ping', payload: {}, timestamp: new Date().toISOString() })}\n\n`);
  res.end(); // Close immediately — serverless cannot hold connections open
});

// ── Health ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SkillQuest Backend', timestamp: new Date().toISOString(), liveClients: 0 });
});

// ── Users ──
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

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const userReviews = reviews.filter(r => r.toUserId === user.id);
  res.json({ ...user, reviews: userReviews });
});

// ── Auth ──
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar, college, branch, year, bio, teachSkill, learnSkill, googleId } = req.body;
  if (!email) return res.status(400).json({ error: 'Google account email is required.' });
  const cleanEmail = email.trim().toLowerCase();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  let isNew = false;
  if (user) {
    user.isOnline = true;
    user.lastActiveDate = new Date().toISOString().split('T')[0];
    if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) user.avatar = avatar;
    if (googleId) user.googleId = googleId;
    user.authProvider = 'google';
  } else {
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
      xp: 250, level: 1, streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      authProvider: 'google', googleId,
      skillsTeaching: teachSkill ? [{ id: `teach-${Date.now()}`, name: teachSkill, category: 'Web Development', proficiency: 'Intermediate', experienceMonths: 12, description: `Ready to teach and collaborate on ${teachSkill}`, endorsementsCount: 0, tags: [teachSkill, 'Peer'] }] : [],
      skillsLearning: learnSkill ? [{ id: `learn-${Date.now()}`, name: learnSkill, category: 'Data Structures & Algorithms', targetProficiency: 'Advanced', priority: 'High', notes: `Looking forward to mastering ${learnSkill} through peer exchanges.` }] : [],
      badges: [{ id: `badge-welcome-${Date.now()}`, name: 'Campus Initiate', description: 'Joined SkillQuest with Google Sign-In', icon: 'Sparkles', tier: 'bronze', unlockedAt: new Date().toISOString().split('T')[0], category: 'community' }],
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      stats: { totalHoursExchanged: 0, sessionsCompleted: 0, studentsTaught: 0, skillsLearnedCount: 0, reputationRating: 5.0, reviewsCount: 0, questPointsClaimed: 0 },
      isOnline: true
    };
    users.push(user);
  }
  saveDatabase();
  res.json({ success: true, isNew, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required to log in.' });
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) return res.status(404).json({ error: 'No registered student found with this email. Please sign up or continue with Google.' });
  user.isOnline = true;
  user.lastActiveDate = new Date().toISOString().split('T')[0];
  saveDatabase();
  res.json({ success: true, user });
});

app.post('/api/users/register', (req, res) => {
  const { name, email, college, branch, year, bio, skillsTeaching, skillsLearning } = req.body;
  if (!name || !college) return res.status(400).json({ error: 'Name and college are required.' });
  const studentEmail = (email || `${name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`).trim().toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === studentEmail);
  if (existing) return res.status(409).json({ error: 'An account with this email is already registered. Please log in.' });
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: studentEmail,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentEmail)}`,
    college: college.trim(),
    branch: branch || 'Computer Science & Engineering',
    year: year || '3rd Year B.Tech',
    bio: bio || 'Excited to teach my tech skills and learn from fellow CSE peers on SkillQuest!',
    xp: 250, level: 1, streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    authProvider: 'email',
    skillsTeaching: skillsTeaching || [],
    skillsLearning: skillsLearning || [],
    badges: [{ id: `badge-welcome-${Date.now()}`, name: 'Campus Initiate', description: 'Joined SkillQuest student exchange network', icon: 'Sparkles', tier: 'bronze', unlockedAt: new Date().toISOString().split('T')[0], category: 'community' }],
    achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
    stats: { totalHoursExchanged: 0, sessionsCompleted: 0, studentsTaught: 0, skillsLearnedCount: 0, reputationRating: 5.0, reviewsCount: 0, questPointsClaimed: 0 },
    isOnline: true
  };
  users.push(newUser);
  saveDatabase();
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  users[index] = { ...users[index], ...req.body };
  saveDatabase();
  res.json(users[index]);
});

app.post('/api/users/:id/skills/teach', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, category, proficiency, experienceMonths, description, tags } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Skill name and category are required.' });
  const newTeachSkill: TeachingSkill = { id: `teach-${Date.now()}`, name, category, proficiency: proficiency || 'Intermediate', experienceMonths: Number(experienceMonths) || 12, description: description || `Experienced in ${name}, eager to mentor peers.`, endorsementsCount: 0, tags: tags && Array.isArray(tags) ? tags : [category] };
  user.skillsTeaching.push(newTeachSkill);
  user.xp += 50; user.level = calculateLevel(user.xp);
  saveDatabase();
  res.status(201).json({ user, newSkill: newTeachSkill });
});

app.post('/api/users/:id/skills/learn', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, category, targetProficiency, priority, notes } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Skill name and category are required.' });
  const newLearnSkill: LearningSkill = { id: `learn-${Date.now()}`, name, category, targetProficiency: targetProficiency || 'Intermediate', priority: priority || 'High', notes: notes || `Looking for hands-on peer sessions in ${name}.` };
  user.skillsLearning.push(newLearnSkill);
  user.xp += 30; user.level = calculateLevel(user.xp);
  saveDatabase();
  res.status(201).json({ user, newSkill: newLearnSkill });
});

app.delete('/api/users/:id/skills/:type/:skillId', (req, res) => {
  const { id, type, skillId } = req.params;
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (type === 'teach') user.skillsTeaching = user.skillsTeaching.filter(s => s.id !== skillId);
  else if (type === 'learn') user.skillsLearning = user.skillsLearning.filter(s => s.id !== skillId);
  saveDatabase();
  res.json(user);
});

// ── Skills Catalog ──
app.get('/api/skills', (req, res) => {
  const enrichedSkills = skills.map(skill => {
    const tutors = users.filter(u => u.skillsTeaching.some(st => st.name.toLowerCase() === skill.name.toLowerCase())).length;
    const learners = users.filter(u => u.skillsLearning.some(sl => sl.name.toLowerCase() === skill.name.toLowerCase())).length;
    return { ...skill, totalTutors: Math.max(skill.totalTutors, tutors), totalLearners: Math.max(skill.totalLearners, learners) };
  });
  res.json(enrichedSkills);
});

app.post('/api/skills', (req, res) => {
  const { name, category, description, popularTopics, difficulty, icon, youtubePlaylists } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Skill name and category are required' });
  const newSkill: SkillItem = { id: `skill-${Date.now()}`, name, category, icon: icon || 'Code2', description: description || `${name} skills for college students.`, popularTopics: popularTopics || [name], totalTutors: 1, totalLearners: 1, difficulty: difficulty || 'Intermediate', youtubePlaylists: youtubePlaylists || [{ id: `yt-${Date.now()}`, title: `${name} Full Course Tutorial & Projects`, channelName: 'Popular Tech Creators', playlistUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' full course playlist tutorial')}`, videoCount: 'Full Series', duration: '10+ Hours', badge: 'YouTube Course', description: `Comprehensive tutorials for learning ${name}.`, keyTopics: popularTopics || [name] }] };
  db.saveSkill(newSkill);
  skills = db.getSkills();
  res.status(201).json(newSkill);
});

// ── Exchanges ──
app.get('/api/exchanges', (req, res) => {
  const { userId, status } = req.query;
  let result = [...exchanges];
  if (userId && typeof userId === 'string') result = result.filter(e => e.fromUserId === userId || e.toUserId === userId);
  if (status && typeof status === 'string' && status !== 'all') result = result.filter(e => e.status === status);
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

app.post('/api/exchanges', (req, res) => {
  const { fromUserId, toUserId, skillOffered, skillRequested, title, message, preferredSchedule } = req.body;
  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.id === toUserId);
  if (!fromUser || !toUser) return res.status(400).json({ error: 'Valid requester and recipient students are required.' });
  const newExchange: SkillExchange = {
    id: `exc-${Date.now()}`,
    fromUserId: fromUser.id, fromUserName: fromUser.name, fromUserAvatar: fromUser.avatar, fromUserCollege: fromUser.college,
    toUserId: toUser.id, toUserName: toUser.name, toUserAvatar: toUser.avatar, toUserCollege: toUser.college,
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
  fromUser.xp += 25; fromUser.level = calculateLevel(fromUser.xp);
  saveDatabase();
  res.status(201).json(newExchange);
});

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
    const userA = users.find(u => u.id === exchange.fromUserId);
    const userB = users.find(u => u.id === exchange.toUserId);
    if (userA) { userA.xp += 200; userA.level = calculateLevel(userA.xp); userA.stats.sessionsCompleted += 1; userA.stats.totalHoursExchanged += 2; userA.stats.skillsLearnedCount += 1; userA.stats.studentsTaught += 1; evaluateAchievements(userA); }
    if (userB) { userB.xp += 200; userB.level = calculateLevel(userB.xp); userB.stats.sessionsCompleted += 1; userB.stats.totalHoursExchanged += 2; userB.stats.skillsLearnedCount += 1; userB.stats.studentsTaught += 1; evaluateAchievements(userB); }
  }
  saveDatabase();
  res.json(exchange);
});

app.post('/api/exchanges/:id/milestones', (req, res) => {
  const { milestoneId, completed } = req.body;
  const exchange = exchanges.find(e => e.id === req.params.id);
  if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
  const milestone = exchange.milestones.find(m => m.id === milestoneId);
  if (milestone) milestone.completed = completed;
  saveDatabase();
  res.json(exchange);
});

app.post('/api/exchanges/:id/notes', (req, res) => {
  const { note } = req.body;
  const exchange = exchanges.find(e => e.id === req.params.id);
  if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
  if (!exchange.sessionNotes) exchange.sessionNotes = [];
  exchange.sessionNotes.push(note);
  saveDatabase();
  res.json(exchange);
});

app.post('/api/exchanges/:id/review', (req, res) => {
  const { fromUserId, toUserId, rating, tags, comment } = req.body;
  const exchange = exchanges.find(e => e.id === req.params.id);
  if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.id === toUserId);
  if (!fromUser || !toUser) return res.status(400).json({ error: 'Invalid reviewer or recipient.' });
  const newReview: Review = { id: `rev-${Date.now()}`, exchangeId: exchange.id, fromUserId: fromUser.id, fromUserName: fromUser.name, fromUserAvatar: fromUser.avatar, fromUserCollege: fromUser.college, toUserId: toUser.id, rating: Number(rating) || 5, tags: tags || ['Patient Mentor', 'Clean Code'], comment: comment || 'Great peer session on SkillQuest!', skillExchanged: exchange.skillOffered, createdAt: new Date().toISOString().split('T')[0] };
  reviews.push(newReview);
  const allToUserReviews = reviews.filter(r => r.toUserId === toUser.id);
  const avgRating = allToUserReviews.reduce((sum, r) => sum + r.rating, 0) / allToUserReviews.length;
  toUser.stats.reputationRating = Number(avgRating.toFixed(2));
  toUser.stats.reviewsCount = allToUserReviews.length;
  if (rating >= 4) { toUser.xp += 100; toUser.level = calculateLevel(toUser.xp); }
  fromUser.xp += 50; fromUser.level = calculateLevel(fromUser.xp);
  evaluateAchievements(toUser);
  evaluateAchievements(fromUser);
  saveDatabase();
  res.status(201).json({ review: newReview, toUser, fromUser });
});

// ── Reviews ──
app.get('/api/reviews', (req, res) => {
  const { toUserId } = req.query;
  let result = [...reviews];
  if (toUserId && typeof toUserId === 'string') result = result.filter(r => r.toUserId === toUserId);
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

// ── Quests (check-in MUST be before /:id/claim) ──
app.get('/api/quests', (req, res) => { res.json(quests); });

app.post('/api/quests/check-in', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const today = new Date().toISOString().split('T')[0];
  let xpAwarded = 0;
  const prevLevel = user.level;
  if (user.lastActiveDate !== today) {
    user.streakDays += 1; user.lastActiveDate = today;
    user.xp += 50; user.level = calculateLevel(user.xp);
    xpAwarded = 50; evaluateAchievements(user);
  }
  saveDatabase();
  res.json({ user, streakDays: user.streakDays, xp: user.xp, level: user.level, xpAwarded, leveledUp: user.level > prevLevel, message: xpAwarded > 0 ? `🔥 Daily Check-In! +${xpAwarded} XP · ${user.streakDays}-day streak!` : `Already checked in today. Your ${user.streakDays}-day streak continues!` });
});

app.post('/api/quests/:id/claim', (req, res) => {
  const { userId } = req.body;
  const quest = quests.find(q => q.id === req.params.id);
  const user = users.find(u => u.id === userId);
  if (!quest || !user) return res.status(404).json({ error: 'Quest or user not found' });
  if (quest.claimed) return res.status(400).json({ error: 'Quest reward already claimed' });
  quest.completed = true; quest.claimed = true;
  user.xp += quest.xpReward; user.level = calculateLevel(user.xp);
  user.stats.questPointsClaimed += quest.xpReward;
  const achResults = evaluateAchievements(user);
  saveDatabase();
  res.json({ quest, user, xpAdded: quest.xpReward, newLevel: user.level, achievementsUnlocked: achResults.unlockedAchievements });
});

// ── Leaderboard ──
app.get('/api/leaderboard', (req, res) => {
  const { college } = req.query;
  let ranked = [...users];
  if (college && typeof college === 'string' && college !== 'All') {
    ranked = ranked.filter(u => u.college.toLowerCase().includes(college.toLowerCase()));
  }
  ranked.sort((a, b) => b.xp - a.xp || b.stats.reputationRating - a.stats.reputationRating);
  const leaderboard = ranked.map((u, index) => ({ rank: index + 1, id: u.id, name: u.name, avatar: u.avatar, college: u.college, branch: u.branch, level: u.level, xp: u.xp, streakDays: u.streakDays, reputationRating: u.stats.reputationRating, sessionsCompleted: u.stats.sessionsCompleted, badgesCount: u.badges.length, topSkill: u.skillsTeaching[0]?.name || 'Computer Science' }));
  res.json(leaderboard);
});

// ── Matching ──
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
    let directTeachMatches = peerTeaches.filter(pt => userLearns.some(ul => ul.includes(pt) || pt.includes(ul)));
    let directLearnMatches = userTeaches.filter(ut => peerLearns.some(pl => pl.includes(ut) || ut.includes(pl)));
    let score = 40;
    const highlights: string[] = [];
    if (directTeachMatches.length > 0 && directLearnMatches.length > 0) { score = 96; highlights.push(`Perfect Bi-directional Skill Match: They teach ${directTeachMatches[0]} and want your ${directLearnMatches[0]}`); }
    else if (directTeachMatches.length > 0) { score = 80; highlights.push(`Peer Tutor Match: ${peer.name} teaches ${directTeachMatches[0]} which is on your wishlist`); }
    else if (directLearnMatches.length > 0) { score = 75; highlights.push(`Student Match: ${peer.name} wants to learn ${directLearnMatches[0]} which you can teach`); }
    if (peer.stats.reputationRating >= 4.8) { score += 4; highlights.push(`High Reputation Tutor (${peer.stats.reputationRating}★ Rating)`); }
    if (peer.streakDays >= 5) highlights.push(`Active Student (${peer.streakDays}-day streak)`);
    matches.push({ matchedUser: peer, matchScore: Math.min(100, score), mutualTeachSkill: directTeachMatches[0] || peer.skillsTeaching[0]?.name || 'Tech Skills', mutualLearnSkill: directLearnMatches[0] || currentUser.skillsTeaching[0]?.name || 'Tech Skills', synergyHighlights: highlights, recommendedProjectIdea: `Build a collaborative full-stack portfolio app combining ${directTeachMatches[0] || 'Peer Skills'} and ${directLearnMatches[0] || 'Web Dev'}.` });
  }
  matches.sort((a, b) => b.matchScore - a.matchScore);
  res.json(matches);
});

// ── AI Routes ──
app.post('/api/ai/match-analysis', async (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  const userA = users.find(u => u.id === currentUserId);
  const userB = users.find(u => u.id === targetUserId);
  if (!userA || !userB) return res.status(404).json({ error: 'Both students must exist to analyze synergy' });
  const defaultSynergy = { synergyScore: 94, compatibilityRating: 'Exceptional Peer Match', summary: `${userA.name} and ${userB.name} have an outstanding mutual peer exchange synergy.`, whyThisMatchWorks: `High reciprocal skill alignment between ${userA.name} and ${userB.name}.`, whatStudent1Teaches: `${userB.skillsTeaching[0]?.name || 'Core Domain'}: Architecture patterns and clean code workflows.`, whatStudent2Teaches: `${userA.skillsTeaching[0]?.name || 'Specialized Frameworks'}: Hands-on implementations and best practices.`, collaborativeProjectIdea: `Co-build an open-source campus productivity app.`, projectIdea: `Campus Productivity App`, suggestedRoutine: 'Two 45-minute peer coding blocks per week on Google Meet.', recommendedExchangePlan: [`Session 1: ${userA.name} guides ${userB.name} on setup and architecture.`, `Session 2: ${userB.name} conducts a hands-on problem solving walkthrough.`, `Session 3: Joint pair-programming capstone project.`], mentorTips: ['Set up a shared GitHub repository before calling.', 'Prepare 2-3 specific questions before each session.', 'Complete mutual reviews on SkillQuest after each session.'] };
  const ai = getAI();
  if (!ai) return res.json(defaultSynergy);
  try {
    const prompt = `You are the AI Academic Advisor for SkillQuest. Analyze the mutual learning synergy between:\nStudent A: ${userA.name} (${userA.college}) teaches: ${JSON.stringify(userA.skillsTeaching.map(s => s.name))} wants to learn: ${JSON.stringify(userA.skillsLearning.map(s => s.name))}\nStudent B: ${userB.name} (${userB.college}) teaches: ${JSON.stringify(userB.skillsTeaching.map(s => s.name))} wants to learn: ${JSON.stringify(userB.skillsLearning.map(s => s.name))}\nReturn JSON with: synergyScore (70-99), compatibilityRating, summary, whyThisMatchWorks, whatStudent1Teaches, whatStudent2Teaches, collaborativeProjectIdea, projectIdea, suggestedRoutine, recommendedExchangePlan (array of 3), mentorTips (array of 3)`;
    const response = await generateWithModelFallback(ai, { contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ ...defaultSynergy, ...parsed });
  } catch (err: any) {
    console.error('AI match analysis fallback:', err?.message);
    res.json(defaultSynergy);
  }
});

app.post('/api/ai/generate-roadmap', async (req, res) => {
  const { skillName, targetProficiency, currentLevel } = req.body;
  if (!skillName) return res.status(400).json({ error: 'Skill name is required' });
  const fallbackRoadmap = getFallbackRoadmap(skillName, currentLevel, targetProficiency);
  const ai = getAI();
  if (!ai) return res.json(fallbackRoadmap);
  try {
    const prompt = `Create a 3-stage peer learning roadmap for a college CSE student learning "${skillName}" from ${currentLevel || 'Beginner'} to ${targetProficiency || 'Advanced'}. Return JSON with: skill, skillName, estimatedWeeks (number), duration, overview, stages (array of 3 with stageNumber, stageName, title, duration, goal, topics array, keyTopics array, projectMilestone, handsOnChallenge), peerStudyAdvice, mentorTips (array of 3)`;
    const response = await generateWithModelFallback(ai, { contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed.stages && Array.isArray(parsed.stages)) {
      parsed.stages = parsed.stages.map((st: any, i: number) => ({ stageNumber: st.stageNumber || i + 1, stageName: st.stageName || st.title || `Stage ${i + 1}`, title: st.title || st.stageName || `Stage ${i + 1}`, duration: st.duration || `Weeks ${i * 2 + 1}-${i * 2 + 2}`, goal: st.goal || '', suggestedSessions: st.suggestedSessions || 2, topics: st.topics || st.keyTopics || [], keyTopics: st.keyTopics || st.topics || [], projectMilestone: st.projectMilestone || st.handsOnChallenge || '', handsOnChallenge: st.handsOnChallenge || st.projectMilestone || '' }));
    }
    parsed.skill = parsed.skill || skillName; parsed.skillName = parsed.skillName || skillName;
    res.json({ ...fallbackRoadmap, ...parsed });
  } catch (err: any) {
    console.error('AI roadmap fallback:', err?.message);
    res.json(fallbackRoadmap);
  }
});

app.post('/api/ai/generate-quests', async (req, res) => {
  const { learningGoals, branch } = req.body;
  const ai = getAI();
  const fallbackQuests: Quest[] = [
    { id: `quest-ai-${Date.now()}-1`, title: `Master ${learningGoals?.[0] || 'DSA'} Deep Dive`, description: `Complete 2 collaborative coding problem sessions in ${learningGoals?.[0] || 'Algorithms'}.`, type: 'weekly', category: 'Data Structures & Algorithms', xpReward: 300, progress: 0, target: 2, unit: 'sessions', completed: false, claimed: false, expiresInHours: 120, icon: 'Code2' },
    { id: `quest-ai-${Date.now()}-2`, title: `System Architecture Peer Sync`, description: `Draw and explain a high-level system diagram for a real-time app to your peer mentor.`, type: 'weekly', category: 'Core CSE', xpReward: 250, progress: 0, target: 1, unit: 'diagram', completed: false, claimed: false, expiresInHours: 120, icon: 'Sparkles' }
  ];
  if (!ai) { db.saveQuests(fallbackQuests); quests = db.getQuests(); return res.json(quests); }
  try {
    const prompt = `Generate 2 gamified learning quests for a ${branch || 'CSE'} student learning: ${JSON.stringify(learningGoals || ['React', 'Data Structures'])}. Return a JSON array with objects: title, description, type (daily/weekly), category, xpReward (100-400), target (1-5), unit, icon (Code2/Sparkles/Flame/Terminal/Cpu/Zap)`;
    const response = await generateWithModelFallback(ai, { contents: prompt, config: { responseMimeType: 'application/json' } });
    const generated = JSON.parse(response.text?.trim() || '[]');
    const newQuests: Quest[] = generated.map((g: any, index: number) => ({ id: `quest-ai-${Date.now()}-${index}`, title: g.title, description: g.description, type: (g.type === 'weekly' ? 'weekly' : 'daily') as any, category: (g.category || 'General') as any, xpReward: Number(g.xpReward) || 150, progress: 0, target: Number(g.target) || 1, unit: g.unit || 'tasks', completed: false, claimed: false, expiresInHours: g.type === 'weekly' ? 120 : 24, icon: g.icon || 'Sparkles' }));
    db.saveQuests(newQuests); quests = db.getQuests(); res.json(quests);
  } catch (err: any) {
    console.error('AI quest fallback:', err?.message);
    db.saveQuests(fallbackQuests); quests = db.getQuests(); res.json(quests);
  }
});

// ── Database ──
app.get('/api/db/stats', (req, res) => { res.json(db.getStats()); });
app.post('/api/db/backup', (req, res) => { res.json(db.createBackup()); });
app.get('/api/db/export', (req, res) => { res.json({ timestamp: new Date().toISOString(), stats: db.getStats(), users: db.getUsers(), skills: db.getSkills(), exchanges: db.getExchanges(), reviews: db.getReviews(), quests: db.getQuests() }); });

// ── Static frontend (Vercel CDN serves /dist directly, but handle SPA fallback) ──
// Vercel routes /* → dist/index.html via vercel.json, so no express.static needed here.

export default app;
