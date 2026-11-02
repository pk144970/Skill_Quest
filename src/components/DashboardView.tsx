import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Zap,
  Repeat,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Calendar,
  Compass,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { User, SkillExchange, Quest, MatchSynergy } from '../types';

interface DashboardViewProps {
  currentUser: User;
  matches: MatchSynergy[];
  exchanges: SkillExchange[];
  quests: Quest[];
  onNavigate: (tab: string) => void;
  onOpenExchangeModal: (targetUser?: User, initialOffer?: string, initialRequest?: string) => void;
  onOpenAddSkill: (type: 'teach' | 'learn') => void;
  onOpenAIMentor: (skillName?: string, peerUser?: User) => void;
  onDailyCheckIn: () => void;
  onClaimQuest: (questId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  matches,
  exchanges,
  quests,
  onNavigate,
  onOpenExchangeModal,
  onOpenAddSkill,
  onOpenAIMentor,
  onDailyCheckIn,
  onClaimQuest,
}) => {
  const [checkingIn, setCheckingIn] = useState(false);

  // Active or pending exchanges involving current user
  const activeExchanges = exchanges.filter(
    (e) => (e.fromUserId === currentUser.id || e.toUserId === currentUser.id) &&
      (e.status === 'in_progress' || e.status === 'accepted' || e.status === 'pending')
  );

  const completedExchanges = exchanges.filter(
    (e) => (e.fromUserId === currentUser.id || e.toUserId === currentUser.id) && e.status === 'completed'
  );

  // Get Level Title based on level
  const getLevelTitle = (lvl: number) => {
    if (lvl <= 1) return 'Novice Explorer';
    if (lvl === 2) return 'Junior Apprentice';
    if (lvl === 3) return 'Skill Scholar';
    if (lvl === 4) return 'Code Sorcerer';
    if (lvl === 5) return 'Peer Mentor';
    if (lvl === 6) return 'Master Craftsman';
    if (lvl === 7) return 'Campus Legend';
    if (lvl === 8) return 'Grandmaster';
    return 'SkillQuest Luminary';
  };

  const handleCheckInClick = async () => {
    setCheckingIn(true);
    await onDailyCheckIn();
    setCheckingIn(false);
  };

  const topMatches = matches.slice(0, 3);
  const pendingQuests = quests.filter((q) => !q.claimed).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Hero Welcome & Gamified Identity Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-xl shadow-indigo-950/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/60 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-md">
                Lvl {currentUser.level}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  Welcome back, {currentUser.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {getLevelTitle(currentUser.level)}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400 inline" />
                <span>{currentUser.college}</span> • <span className="text-slate-400">{currentUser.year}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-1 max-w-xl">
                {currentUser.bio}
              </p>
            </div>
          </div>

          {/* Quick Streak Check-in & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCheckInClick}
              disabled={checkingIn}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-150 transform active:scale-95 disabled:opacity-50"
            >
              <Flame className="w-4 h-4 fill-slate-950 animate-bounce" />
              <span>Daily Check-In (+50 XP)</span>
            </button>

            <button
              onClick={() => onOpenAIMentor()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold text-sm transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">AI Learning Roadmap</span>
            </button>
          </div>
        </div>

        {/* Progress to next level bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          {(() => {
            // Use actual level thresholds matching config.ts / server.ts
            const thresholds = [0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000];
            const currentMin = thresholds[currentUser.level - 1] ?? 0;
            const currentMax = thresholds[currentUser.level] ?? currentMin + 2000;
            const progress = Math.max(0, currentUser.xp - currentMin);
            const needed = currentMax - currentMin;
            const percent = Math.min(100, Math.round((progress / needed) * 100));
            const remaining = Math.max(0, currentMax - currentUser.xp);
            return (
              <>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="font-semibold text-slate-200">Level {currentUser.level} Progress</span>
                  <span className="text-slate-400">({currentUser.xp} XP total)</span>
                </div>
                <div className="w-full sm:w-72 flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-amber-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 font-semibold">
                    {remaining} XP to L{currentUser.level + 1}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total XP</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-100 mt-2">{currentUser.xp}</p>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Top 15% on Campus</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Day Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
          </div>
          <p className="text-xl font-extrabold text-amber-400 mt-2">{currentUser.streakDays} Days</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Keep learning daily!</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Teaching</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-indigo-400 mt-2">{currentUser.skillsTeaching.length} Skills</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.stats.studentsTaught} peers mentored</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Learning</span>
            <Compass className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xl font-extrabold text-violet-400 mt-2">{currentUser.skillsLearning.length} Goals</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.stats.skillsLearnedCount} completed</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Reputation</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-100 mt-2">{currentUser.stats.reputationRating} ★</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.stats.reviewsCount} peer reviews</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Exchanges</span>
            <Repeat className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 mt-2">{currentUser.stats.sessionsCompleted}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.stats.totalHoursExchanged} hrs exchanged</p>
        </div>

      </div>

      {/* 3. Main Dashboard 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Smart Match Radar & Active Exchanges (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Smart Skill Matching Radar */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-100">Smart Skill Match Radar</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI-ranked peers who teach what you want to learn & want what you can teach
                </p>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topMatches.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No matches found yet. Add more skills to teach or learn to discover peers!</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenAddSkill('learn')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                  >
                    + Add Learning Goal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {topMatches.map((match) => (
                  <div
                    key={match.matchedUser.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Peer info */}
                      <div className="flex items-start sm:items-center gap-3">
                        <img
                          src={match.matchedUser.avatar}
                          alt={match.matchedUser.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {match.matchedUser.name}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Lvl {match.matchedUser.level}
                            </span>
                            <span className="flex items-center text-xs text-amber-400 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {match.matchedUser.stats.reputationRating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
                            {match.matchedUser.college.split('(')[0]} • {match.matchedUser.branch}
                          </p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">{match.matchScore}% Match</span>
                          <span className="text-[10px] text-slate-400">High Synergy</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                          {match.matchScore}%
                        </div>
                      </div>
                    </div>

                    {/* Skill Exchange Exchange Bar */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          <span className="text-slate-400 text-[10px]">They teach:</span>
                          <span className="font-semibold">{match.mutualTeachSkill}</span>
                        </div>
                        <Repeat className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300">
                          <span className="text-slate-400 text-[10px]">You teach:</span>
                          <span className="font-semibold">{match.mutualLearnSkill}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onOpenAIMentor(match.mutualTeachSkill, match.matchedUser)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Generate AI Peer Roadmap & Synergy"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Synergy</span>
                        </button>
                        
                        <button
                          onClick={() =>
                            onOpenExchangeModal(match.matchedUser, match.mutualLearnSkill, match.mutualTeachSkill)
                          }
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Propose Exchange</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Skill Exchanges Track */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-emerald-400" />
                  <span>Ongoing Skill Exchanges</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Track active learning sessions and milestones</p>
              </div>
              <button
                onClick={() => onNavigate('exchange')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Exchange Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeExchanges.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                <p className="text-sm text-slate-400">No active exchanges right now.</p>
                <button
                  onClick={() => onNavigate('explore')}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Find Peers to Exchange Skills</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeExchanges.map((exc) => {
                  const isRequester = exc.fromUserId === currentUser.id;
                  const partnerName = isRequester ? exc.toUserName : exc.fromUserName;
                  const partnerAvatar = isRequester ? exc.toUserAvatar : exc.fromUserAvatar;
                  const partnerCollege = isRequester ? exc.toUserCollege : exc.fromUserCollege;
                  const completedMilestones = exc.milestones.filter((m) => m.completed).length;

                  return (
                    <div
                      key={exc.id}
                      onClick={() => onNavigate('exchange')}
                      className="cursor-pointer p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={partnerAvatar} alt={partnerName} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-200">{exc.title}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                exc.status === 'in_progress'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : exc.status === 'accepted'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {exc.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Peer: <span className="text-slate-300 font-medium">{partnerName}</span> ({partnerCollege}) •{' '}
                            {completedMilestones}/{exc.milestones.length} Milestones Done
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {exc.meetLink && (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <ExternalLink className="w-3 h-3" />
                            <span>Room Ready</span>
                          </span>
                        )}
                        <span className="text-xs text-indigo-400 font-semibold hover:underline">Open Session →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Active Quests & Quick Skills Management (1 Col) */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Active Quests Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Active Quests</h3>
              </div>
              <button
                onClick={() => onNavigate('quests')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View Quests
              </button>
            </div>

            <div className="space-y-3">
              {pendingQuests.map((quest) => {
                const isReadyToClaim = quest.completed && !quest.claimed;
                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isReadyToClaim
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10'
                        : 'bg-slate-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">{quest.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            +{quest.xpReward} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{quest.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {quest.progress}/{quest.target} {quest.unit}
                      </span>
                    </div>

                    {isReadyToClaim && (
                      <button
                        onClick={() => onClaimQuest(quest.id)}
                        className="mt-2.5 w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Claim +{quest.xpReward} XP 🎉
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Skill Toolkit */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>My Skill Inventory</span>
              </h3>
              <button
                onClick={() => onNavigate('profile')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Manage
              </button>
            </div>

            {/* Teaching list */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>I Can Teach:</span>
                <button
                  onClick={() => onOpenAddSkill('teach')}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skillsTeaching.map((st) => (
                  <span
                    key={st.id}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-1"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] text-indigo-400/80">({st.proficiency})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Learning list */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>I Want to Learn:</span>
                <button
                  onClick={() => onOpenAddSkill('learn')}
                  className="text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skillsLearning.map((sl) => (
                  <span
                    key={sl.id}
                    className="px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium flex items-center gap-1"
                  >
                    <span>{sl.name}</span>
                    <span className="text-[10px] text-amber-300 font-semibold">• {sl.priority}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Advisor Shortcut */}
            <div className="pt-2">
              <button
                onClick={() => onOpenAIMentor()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 hover:from-violet-600/40 hover:to-indigo-600/40 border border-violet-500/30 text-violet-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Customized Study Plan</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
