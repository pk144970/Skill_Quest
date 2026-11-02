import React, { useState, useEffect } from 'react';
import {
  User,
  Review,
  TeachingSkill,
  LearningSkill,
  SkillExchange
} from '../types';
import {
  GraduationCap,
  Star,
  Flame,
  Award,
  BookOpen,
  Compass,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Repeat,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Clock,
  Github,
  Linkedin,
  Database,
  HardDrive,
  Download,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { apiService } from '../services/api';

interface ProfileViewProps {
  currentUser: User;
  reviews: Review[];
  completedExchanges: SkillExchange[];
  onOpenAddSkill: (type: 'teach' | 'learn') => void;
  onDeleteSkill: (type: 'teach' | 'learn', skillId: string) => void;
  onUpdateBio: (bio: string) => void;
  onOpenAIMentor: (skillName?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  reviews,
  completedExchanges,
  onOpenAddSkill,
  onDeleteSkill,
  onUpdateBio,
  onOpenAIMentor,
}) => {
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.bio);
  const [dbStats, setDbStats] = useState<any>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  useEffect(() => {
    setBioText(currentUser.bio);
    setEditingBio(false);
  }, [currentUser.id, currentUser.bio]);

  useEffect(() => {
    apiService.getDbStats().then((res) => {
      if (res.success && res.data) {
        setDbStats(res.data);
      }
    });
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupMsg(null);
    try {
      const res = await apiService.backupDatabase();
      if (res.success && res.data) {
        setBackupMsg(`✅ Backup created: ${res.data.backupFile}`);
        const fresh = await apiService.getDbStats();
        if (fresh.success) setDbStats(fresh.data);
      } else {
        setBackupMsg('Failed to create database backup');
      }
    } catch {
      setBackupMsg('Database backup failed');
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setBackupMsg(null), 5000);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await apiService.exportDatabase();
      if (res.success && res.data) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `skillquest_db_export_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBio = () => {
    onUpdateBio(bioText);
    setEditingBio(false);
  };

  const userReviews = reviews.filter((r) => r.toUserId === currentUser.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/50 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                Lvl {currentUser.level}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentUser.year}
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{currentUser.college}</span> • <span className="text-slate-400">{currentUser.branch}</span>
              </p>

              {/* Bio */}
              <div className="mt-3">
                {editingBio ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 w-80"
                    />
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBio(false)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <p className="max-w-xl italic">"{currentUser.bio}"</p>
                    <button
                      onClick={() => setEditingBio(true)}
                      className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                      title="Edit bio"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Summary Stats */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="px-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total XP</p>
              <p className="text-lg font-black text-amber-300 mt-0.5">{currentUser.xp}</p>
            </div>
            <div className="px-2 border-x border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Streak</p>
              <p className="text-lg font-black text-orange-400 mt-0.5">{currentUser.streakDays}d 🔥</p>
            </div>
            <div className="px-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Rating</p>
              <p className="text-lg font-black text-slate-100 mt-0.5">{currentUser.stats.reputationRating}★</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Skills Portfolio Grid (Teaching & Learning) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Skills I Can Teach */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Skills I Can Teach ({currentUser.skillsTeaching.length})</h2>
            </div>
            <button
              onClick={() => onOpenAddSkill('teach')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentUser.skillsTeaching.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{skill.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {skill.proficiency}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {skill.experienceMonths} mos exp
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{skill.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skill.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSkill('teach', skill.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove teaching skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-slate-100">Skills I Want to Learn ({currentUser.skillsLearning.length})</h2>
            </div>
            <button
              onClick={() => onOpenAddSkill('learn')}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentUser.skillsLearning.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{skill.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Target: {skill.targetProficiency}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {skill.priority} Priority
                    </span>
                  </div>
                  {skill.notes && (
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{skill.notes}</p>
                  )}

                  <div className="mt-2">
                    <button
                      onClick={() => onOpenAIMentor(skill.name)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Generate AI Learning Roadmap</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSkill('learn', skill.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove learning goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Verified Peer Ratings & Reviews Wall */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Verified Peer Reviews & Endorsements ({userReviews.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ratings submitted by peers following completed skill exchange sessions</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-amber-400">{currentUser.stats.reputationRating}</span>
            <div className="flex text-amber-400">
              {'★★★★★'.split('').map((s, i) => (
                <span key={i} className="text-sm">
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {userReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm">No peer reviews received yet. Complete an exchange to receive verified feedback!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={rev.fromUserAvatar} alt={rev.fromUserName} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{rev.fromUserName}</h4>
                        <p className="text-[10px] text-slate-400">{rev.fromUserCollege}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400 text-xs font-bold">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rev.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-semibold"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Skill Exchanged: <strong>{rev.skillExchanged}</strong></span>
                  <span>{rev.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Completed Exchange History */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Completed Exchange History</h2>
              <p className="text-xs text-slate-400">Verified peer-to-peer knowledge exchanges</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {completedExchanges.length} Completed
          </span>
        </div>

        {completedExchanges.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm">No completed exchanges on record yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedExchanges.map((exc) => {
              const isRequester = exc.fromUserId === currentUser.id;
              const peerName = isRequester ? exc.toUserName : exc.fromUserName;
              const peerAvatar = isRequester ? exc.toUserAvatar : exc.fromUserAvatar;
              const peerCollege = isRequester ? exc.toUserCollege : exc.fromUserCollege;
              const taught = isRequester ? exc.skillOffered : exc.skillRequested;
              const learned = isRequester ? exc.skillRequested : exc.skillOffered;

              return (
                <div
                  key={exc.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={peerAvatar} alt={peerName} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Exchange with {peerName}
                      </h4>
                      <p className="text-[10px] text-slate-400">{peerCollege}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Taught: {taught}
                    </span>
                    <span className="text-slate-500">⇄</span>
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Learned: {learned}
                    </span>
                  </div>

                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified {exc.completedAt || 'Completed'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Persistent Database Storage & Infrastructure */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Persistent Backend Database Storage</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All profile edits, skills, peer exchanges, and quests are permanently stored in the backend database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Backing Up...' : 'Create Backup'}</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DB</span>
            </button>
          </div>
        </div>

        {backupMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
            {backupMsg}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Storage Engine</p>
            <p className="text-sm font-bold text-indigo-300 mt-0.5">
              {dbStats?.engine === 'sqlite' ? 'SQLite (WAL Mode)' : 'Atomic JSON'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {dbStats?.sqliteActive ? 'skillquest.db' : 'db.json'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Stored Users & Skills</p>
            <p className="text-sm font-bold text-emerald-300 mt-0.5">
              {dbStats?.userCount ?? '—'} Users • {dbStats?.skillCount ?? '—'} Skills
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Fully Indexed & Seeded</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Exchanges & Reviews</p>
            <p className="text-sm font-bold text-violet-300 mt-0.5">
              {dbStats?.exchangeCount ?? '—'} Exchanges • {dbStats?.reviewCount ?? '—'} Reviews
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Mutual Audit Trails</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Data Integrity</p>
            <p className="text-sm font-bold text-amber-300 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ACID Safe</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Crash-Resistant Mirror</p>
          </div>
        </div>
      </div>

    </div>
  );
};
