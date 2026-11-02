// =============================================================
//  SkillQuest — Resilient Unified Database Engine
//  ─────────────────────────────────────────────────────────────
//  Provides a production-grade persistence layer supporting:
//   1. Primary: Embedded SQLite database (node:sqlite)
//   2. Mirror: Atomic JSON snapshot (src/data/db.json)
//   3. Automated seed migration & crash-safe backups
//   4. Full typed CRUD repositories for all entities
// =============================================================

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Universal require using project root URL (avoids esbuild import.meta CJS warnings)
const require = createRequire(`file://${process.cwd().replace(/\\/g, '/')}/package.json`);
import {
  User,
  SkillItem,
  SkillExchange,
  Quest,
  Review,
  TeachingSkill,
  LearningSkill,
  Achievement
} from '../../types';
import {
  INITIAL_USERS,
  INITIAL_SKILLS,
  INITIAL_EXCHANGES,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REVIEWS
} from '../../data/seedData';

// Paths
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_SQLITE_PATH = path.join(DATA_DIR, 'skillquest.db');
const DB_JSON_PATH = path.join(DATA_DIR, 'db.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

export interface DbStats {
  engine: 'sqlite' | 'json-file';
  sqliteActive: boolean;
  sqlitePath: string;
  jsonPath: string;
  userCount: number;
  skillCount: number;
  exchangeCount: number;
  reviewCount: number;
  questCount: number;
  auditCount: number;
  lastSyncTime: string;
  sqliteSizeBytes?: number;
  jsonSizeBytes?: number;
}

export class DatabaseEngine {
  private sqliteDb: any = null;
  private isSqliteAvailable: boolean = false;

  // In-memory active cache
  private users: User[] = [];
  private skills: SkillItem[] = [];
  private exchanges: SkillExchange[] = [];
  private quests: Quest[] = [];
  private reviews: Review[] = [];
  private lastSyncTime: string = new Date().toISOString();

  constructor() {
    this.ensureDirectories();
    this.initSqlite();
    this.bootstrapData();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  /**
   * Initializes SQLite using Node 22's built-in node:sqlite.
   * If not available or fails, seamlessly degrades to atomic JSON storage.
   */
  private initSqlite() {
    try {
      // Dynamic import / require of node:sqlite
      const sqliteModule = require('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        this.sqliteDb = new sqliteModule.DatabaseSync(DB_SQLITE_PATH);
        this.sqliteDb.exec('PRAGMA journal_mode = WAL;');
        this.sqliteDb.exec('PRAGMA foreign_keys = ON;');
        this.createTables();
        this.isSqliteAvailable = true;
        console.log(`[DatabaseEngine] 🗄️ SQLite database initialized successfully at: ${DB_SQLITE_PATH}`);
      }
    } catch (err: any) {
      console.warn('[DatabaseEngine] SQLite initialization notice (using atomic JSON storage):', err?.message || err);
      this.isSqliteAvailable = false;
      this.sqliteDb = null;
    }
  }

  private createTables() {
    if (!this.sqliteDb) return;

    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT NOT NULL,
        college TEXT NOT NULL,
        branch TEXT,
        year TEXT,
        bio TEXT,
        avatar TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streakDays INTEGER DEFAULT 1,
        lastActiveDate TEXT,
        authProvider TEXT DEFAULT 'email',
        googleId TEXT,
        isOnline INTEGER DEFAULT 0,
        data_json TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE,
        category TEXT NOT NULL,
        icon TEXT,
        difficulty TEXT,
        totalTutors INTEGER DEFAULT 0,
        totalLearners INTEGER DEFAULT 0,
        description TEXT,
        data_json TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS exchanges (
        id TEXT PRIMARY KEY,
        fromUserId TEXT NOT NULL,
        toUserId TEXT NOT NULL,
        skillOffered TEXT,
        skillRequested TEXT,
        title TEXT,
        status TEXT DEFAULT 'pending',
        preferredSchedule TEXT,
        meetLink TEXT,
        xpAwarded INTEGER DEFAULT 0,
        data_json TEXT NOT NULL,
        createdAt TEXT,
        completedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        exchangeId TEXT NOT NULL,
        fromUserId TEXT NOT NULL,
        toUserId TEXT NOT NULL,
        rating REAL DEFAULT 5.0,
        comment TEXT,
        skillExchanged TEXT,
        data_json TEXT NOT NULL,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'daily',
        category TEXT,
        xpReward INTEGER DEFAULT 100,
        progress INTEGER DEFAULT 0,
        target INTEGER DEFAULT 1,
        unit TEXT,
        completed INTEGER DEFAULT 0,
        claimed INTEGER DEFAULT 0,
        expiresInHours INTEGER DEFAULT 24,
        icon TEXT,
        data_json TEXT NOT NULL,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entityId TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
      );
    `);
  }

  /**
   * Bootstraps data by loading from SQLite or db.json, or seeds from seedData.ts.
   */
  private bootstrapData() {
    let loadedFromSqlite = false;

    // 1. Try loading from SQLite if active
    if (this.isSqliteAvailable && this.sqliteDb) {
      try {
        const userRows = this.sqliteDb.prepare('SELECT data_json FROM users').all();
        const skillRows = this.sqliteDb.prepare('SELECT data_json FROM skills').all();
        const exchangeRows = this.sqliteDb.prepare('SELECT data_json FROM exchanges').all();
        const questRows = this.sqliteDb.prepare('SELECT data_json FROM quests').all();
        const reviewRows = this.sqliteDb.prepare('SELECT data_json FROM reviews').all();

        if (userRows.length > 0 && skillRows.length > 0) {
          this.users = userRows.map((r: any) => JSON.parse(r.data_json));
          this.skills = skillRows.map((r: any) => JSON.parse(r.data_json));
          this.exchanges = exchangeRows.map((r: any) => JSON.parse(r.data_json));
          this.quests = questRows.map((r: any) => JSON.parse(r.data_json));
          this.reviews = reviewRows.map((r: any) => JSON.parse(r.data_json));
          loadedFromSqlite = true;
          console.log(`[DatabaseEngine] Loaded ${this.users.length} users and ${this.skills.length} skills from SQLite database.`);
        }
      } catch (err) {
        console.warn('[DatabaseEngine] Could not load from SQLite tables, falling back to JSON sync:', err);
      }
    }

    // 2. If SQLite was empty or not active, try loading from db.json
    if (!loadedFromSqlite) {
      if (fs.existsSync(DB_JSON_PATH)) {
        try {
          const raw = fs.readFileSync(DB_JSON_PATH, 'utf-8');
          const data = JSON.parse(raw);
          if (Array.isArray(data.users) && data.users.length > 0) this.users = data.users;
          if (Array.isArray(data.skills) && data.skills.length > 0) this.skills = data.skills;
          if (Array.isArray(data.exchanges)) this.exchanges = data.exchanges;
          if (Array.isArray(data.quests) && data.quests.length > 0) this.quests = data.quests;
          if (Array.isArray(data.reviews)) this.reviews = data.reviews;
          console.log(`[DatabaseEngine] Loaded ${this.users.length} users and ${this.skills.length} skills from db.json.`);
        } catch (err) {
          console.error('[DatabaseEngine] Error reading db.json:', err);
        }
      }
    }

    // 3. If still empty, seed defaults
    if (this.users.length === 0) this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    if (this.skills.length === 0) this.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
    if (this.exchanges.length === 0) this.exchanges = JSON.parse(JSON.stringify(INITIAL_EXCHANGES));
    if (this.quests.length === 0) this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    if (this.reviews.length === 0) this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));

    // Save and sync both stores
    this.persistAll();
  }

  /**
   * Persists the entire database atomically to both SQLite and db.json.
   * Atomic file rename guarantees no partial writes or corruption.
   */
  public persistAll() {
    this.lastSyncTime = new Date().toISOString();

    // 1. Sync to SQLite
    if (this.isSqliteAvailable && this.sqliteDb) {
      try {
        const insertUser = this.sqliteDb.prepare(`
          INSERT INTO users (
            id, email, name, college, branch, year, bio, avatar, xp, level,
            streakDays, lastActiveDate, authProvider, googleId, isOnline,
            data_json, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            email = excluded.email,
            name = excluded.name,
            college = excluded.college,
            branch = excluded.branch,
            year = excluded.year,
            bio = excluded.bio,
            avatar = excluded.avatar,
            xp = excluded.xp,
            level = excluded.level,
            streakDays = excluded.streakDays,
            lastActiveDate = excluded.lastActiveDate,
            authProvider = excluded.authProvider,
            googleId = excluded.googleId,
            isOnline = excluded.isOnline,
            data_json = excluded.data_json,
            updatedAt = excluded.updatedAt
        `);

        for (const u of this.users) {
          insertUser.run(
            u.id,
            u.email || '',
            u.name || '',
            u.college || '',
            u.branch || '',
            u.year || '',
            u.bio || '',
            u.avatar || '',
            u.xp || 0,
            u.level || 1,
            u.streakDays || 1,
            u.lastActiveDate || '',
            u.authProvider || 'email',
            u.googleId || null,
            u.isOnline ? 1 : 0,
            JSON.stringify(u),
            u.lastActiveDate || this.lastSyncTime,
            this.lastSyncTime
          );
        }

        const insertSkill = this.sqliteDb.prepare(`
          INSERT INTO skills (
            id, name, category, icon, difficulty, totalTutors, totalLearners,
            description, data_json, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            icon = excluded.icon,
            difficulty = excluded.difficulty,
            totalTutors = excluded.totalTutors,
            totalLearners = excluded.totalLearners,
            description = excluded.description,
            data_json = excluded.data_json,
            updatedAt = excluded.updatedAt
        `);

        for (const s of this.skills) {
          insertSkill.run(
            s.id,
            s.name,
            s.category,
            s.icon || 'Code2',
            s.difficulty || 'Intermediate',
            s.totalTutors || 0,
            s.totalLearners || 0,
            s.description || '',
            JSON.stringify(s),
            this.lastSyncTime,
            this.lastSyncTime
          );
        }

        const insertExchange = this.sqliteDb.prepare(`
          INSERT INTO exchanges (
            id, fromUserId, toUserId, skillOffered, skillRequested, title,
            status, preferredSchedule, meetLink, xpAwarded, data_json,
            createdAt, completedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            preferredSchedule = excluded.preferredSchedule,
            meetLink = excluded.meetLink,
            xpAwarded = excluded.xpAwarded,
            data_json = excluded.data_json,
            completedAt = excluded.completedAt
        `);

        for (const e of this.exchanges) {
          insertExchange.run(
            e.id,
            e.fromUserId,
            e.toUserId,
            e.skillOffered || '',
            e.skillRequested || '',
            e.title || '',
            e.status || 'pending',
            e.preferredSchedule || '',
            e.meetLink || null,
            e.xpAwarded || 0,
            JSON.stringify(e),
            e.createdAt || this.lastSyncTime,
            e.completedAt || null
          );
        }

        const insertReview = this.sqliteDb.prepare(`
          INSERT INTO reviews (
            id, exchangeId, fromUserId, toUserId, rating, comment, skillExchanged, data_json, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            rating = excluded.rating,
            comment = excluded.comment,
            data_json = excluded.data_json
        `);

        for (const r of this.reviews) {
          insertReview.run(
            r.id,
            r.exchangeId,
            r.fromUserId,
            r.toUserId,
            r.rating ?? 5,
            r.comment || '',
            r.skillExchanged || '',
            JSON.stringify(r),
            r.createdAt || this.lastSyncTime
          );
        }

        const insertQuest = this.sqliteDb.prepare(`
          INSERT INTO quests (
            id, title, description, type, category, xpReward, progress, target, unit,
            completed, claimed, expiresInHours, icon, data_json, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            progress = excluded.progress,
            completed = excluded.completed,
            claimed = excluded.claimed,
            data_json = excluded.data_json
        `);

        for (const q of this.quests) {
          insertQuest.run(
            q.id,
            q.title,
            q.description || '',
            q.type || 'daily',
            q.category || 'General',
            q.xpReward || 100,
            q.progress || 0,
            q.target || 1,
            q.unit || 'tasks',
            q.completed ? 1 : 0,
            q.claimed ? 1 : 0,
            q.expiresInHours ?? 24,
            q.icon || 'Sparkles',
            JSON.stringify(q),
            this.lastSyncTime
          );
        }
      } catch (err) {
        console.error('[DatabaseEngine] SQLite synchronization error:', err);
      }
    }

    // 2. Atomic sync to db.json (write to temporary file, then atomic rename)
    try {
      const payload = JSON.stringify(
        {
          meta: {
            schemaVersion: '2.0.0',
            lastSync: this.lastSyncTime,
            stats: {
              users: this.users.length,
              skills: this.skills.length,
              exchanges: this.exchanges.length,
              reviews: this.reviews.length,
              quests: this.quests.length
            }
          },
          users: this.users,
          skills: this.skills,
          exchanges: this.exchanges,
          quests: this.quests,
          reviews: this.reviews
        },
        null,
        2
      );

      const tempPath = `${DB_JSON_PATH}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, payload, 'utf-8');
      fs.renameSync(tempPath, DB_JSON_PATH);
    } catch (err) {
      console.error('[DatabaseEngine] Error writing db.json atomic file:', err);
    }
  }

  public logAudit(action: string, entity: string, entityId: string, details?: any) {
    if (this.isSqliteAvailable && this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare(`
          INSERT INTO audit_logs (id, action, entity, entityId, details, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          action,
          entity,
          entityId,
          details ? JSON.stringify(details) : '',
          new Date().toISOString()
        );
      } catch (err) {
        // Non-blocking audit log error
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  CRUD REPOSITORY: USERS
  // ═══════════════════════════════════════════════════════════

  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === clean);
  }

  public saveUser(user: User): User {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      this.users.push(user);
      this.logAudit('CREATE', 'user', user.id, { name: user.name, email: user.email });
    } else {
      this.users[index] = user;
      this.logAudit('UPDATE', 'user', user.id, { name: user.name });
    }
    this.persistAll();
    return user;
  }

  public updateUser(id: string, partial: Partial<User>): User | null {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, partial);
    this.saveUser(user);
    return user;
  }

  public addTeachingSkill(userId: string, skill: TeachingSkill): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.skillsTeaching.push(skill);
    this.saveUser(user);
    this.logAudit('ADD_TEACH_SKILL', 'user', userId, { skillName: skill.name });
    return user;
  }

  public addLearningSkill(userId: string, skill: LearningSkill): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.skillsLearning.push(skill);
    this.saveUser(user);
    this.logAudit('ADD_LEARN_SKILL', 'user', userId, { skillName: skill.name });
    return user;
  }

  public removeSkill(userId: string, type: 'teach' | 'learn', skillId: string): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    if (type === 'teach') {
      user.skillsTeaching = user.skillsTeaching.filter((s) => s.id !== skillId);
    } else {
      user.skillsLearning = user.skillsLearning.filter((s) => s.id !== skillId);
    }
    this.saveUser(user);
    this.logAudit('REMOVE_SKILL', 'user', userId, { type, skillId });
    return user;
  }

  // ═══════════════════════════════════════════════════════════
  //  CRUD REPOSITORY: SKILLS
  // ═══════════════════════════════════════════════════════════

  public getSkills(): SkillItem[] {
    return this.skills;
  }

  public getSkillById(id: string): SkillItem | undefined {
    return this.skills.find((s) => s.id === id);
  }

  public saveSkill(skill: SkillItem): SkillItem {
    const index = this.skills.findIndex((s) => s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase());
    if (index === -1) {
      this.skills.push(skill);
      this.logAudit('CREATE', 'skill', skill.id, { name: skill.name });
    } else {
      this.skills[index] = { ...this.skills[index], ...skill };
      this.logAudit('UPDATE', 'skill', skill.id, { name: skill.name });
    }
    this.persistAll();
    return skill;
  }

  // ═══════════════════════════════════════════════════════════
  //  CRUD REPOSITORY: EXCHANGES
  // ═══════════════════════════════════════════════════════════

  public getExchanges(): SkillExchange[] {
    return this.exchanges;
  }

  public getExchangeById(id: string): SkillExchange | undefined {
    return this.exchanges.find((e) => e.id === id);
  }

  public saveExchange(exchange: SkillExchange): SkillExchange {
    const index = this.exchanges.findIndex((e) => e.id === exchange.id);
    if (index === -1) {
      this.exchanges.unshift(exchange);
      this.logAudit('CREATE', 'exchange', exchange.id, {
        from: exchange.fromUserId,
        to: exchange.toUserId,
        offered: exchange.skillOffered,
        requested: exchange.skillRequested
      });
    } else {
      this.exchanges[index] = exchange;
      this.logAudit('UPDATE', 'exchange', exchange.id, { status: exchange.status });
    }
    this.persistAll();
    return exchange;
  }

  public updateExchangeStatus(id: string, status: SkillExchange['status'], extra?: Partial<SkillExchange>): SkillExchange | null {
    const exchange = this.getExchangeById(id);
    if (!exchange) return null;
    exchange.status = status;
    if (extra) Object.assign(exchange, extra);
    this.saveExchange(exchange);
    return exchange;
  }

  // ═══════════════════════════════════════════════════════════
  //  CRUD REPOSITORY: REVIEWS
  // ═══════════════════════════════════════════════════════════

  public getReviews(): Review[] {
    return this.reviews;
  }

  public saveReview(review: Review): Review {
    const index = this.reviews.findIndex((r) => r.id === review.id);
    if (index === -1) {
      this.reviews.unshift(review);
      this.logAudit('CREATE', 'review', review.id, { to: review.toUserId, rating: review.rating });
    } else {
      this.reviews[index] = review;
    }
    this.persistAll();
    return review;
  }

  // ═══════════════════════════════════════════════════════════
  //  CRUD REPOSITORY: QUESTS
  // ═══════════════════════════════════════════════════════════

  public getQuests(): Quest[] {
    return this.quests;
  }

  public getQuestById(id: string): Quest | undefined {
    return this.quests.find((q) => q.id === id);
  }

  public saveQuest(quest: Quest): Quest {
    const index = this.quests.findIndex((q) => q.id === quest.id);
    if (index === -1) {
      this.quests.push(quest);
      this.logAudit('CREATE', 'quest', quest.id, { title: quest.title });
    } else {
      this.quests[index] = quest;
    }
    this.persistAll();
    return quest;
  }

  public saveQuests(newQuests: Quest[]): Quest[] {
    for (const q of newQuests) {
      const idx = this.quests.findIndex((existing) => existing.id === q.id);
      if (idx === -1) {
        this.quests.push(q);
      } else {
        this.quests[idx] = q;
      }
    }
    this.persistAll();
    return this.quests;
  }

  // ═══════════════════════════════════════════════════════════
  //  DATABASE UTILITIES & STATS
  // ═══════════════════════════════════════════════════════════

  public getStats(): DbStats {
    let sqliteSizeBytes = 0;
    let jsonSizeBytes = 0;

    try {
      if (fs.existsSync(DB_SQLITE_PATH)) {
        sqliteSizeBytes = fs.statSync(DB_SQLITE_PATH).size;
      }
      if (fs.existsSync(DB_JSON_PATH)) {
        jsonSizeBytes = fs.statSync(DB_JSON_PATH).size;
      }
    } catch {
      // non-fatal
    }

    let auditCount = 0;
    if (this.isSqliteAvailable && this.sqliteDb) {
      try {
        const row = this.sqliteDb.prepare('SELECT count(*) as cnt FROM audit_logs').get();
        if (row) auditCount = Number(row.cnt) || 0;
      } catch {
        // non-fatal
      }
    }

    return {
      engine: this.isSqliteAvailable ? 'sqlite' : 'json-file',
      sqliteActive: this.isSqliteAvailable,
      sqlitePath: DB_SQLITE_PATH,
      jsonPath: DB_JSON_PATH,
      userCount: this.users.length,
      skillCount: this.skills.length,
      exchangeCount: this.exchanges.length,
      reviewCount: this.reviews.length,
      questCount: this.quests.length,
      auditCount,
      lastSyncTime: this.lastSyncTime,
      sqliteSizeBytes,
      jsonSizeBytes
    };
  }

  public createBackup(): { success: boolean; backupFile: string; recordCounts: any } {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `skillquest_backup_${timestamp}.json`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    const backupData = {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      users: this.users,
      skills: this.skills,
      exchanges: this.exchanges,
      reviews: this.reviews,
      quests: this.quests
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    this.logAudit('BACKUP_DATABASE', 'system', backupFileName);

    return {
      success: true,
      backupFile: backupFileName,
      recordCounts: {
        users: this.users.length,
        skills: this.skills.length,
        exchanges: this.exchanges.length,
        reviews: this.reviews.length,
        quests: this.quests.length
      }
    };
  }
}

// Singleton export
export const db = new DatabaseEngine();
