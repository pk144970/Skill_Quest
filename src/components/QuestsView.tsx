import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  Trophy,
  Calendar,
  Compass,
  GraduationCap,
  Star,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Quest, User } from '../types';

interface QuestsViewProps {
  quests: Quest[];
  currentUser: User;
  onClaimQuest: (questId: string) => void;
  onDailyCheckIn: () => void;
  onGenerateAIQuests: () => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  quests,
  currentUser,
  onClaimQuest,
  onDailyCheckIn,
  onGenerateAIQuests,
  onNavigate,
}) => {
  const [generatingAI, setGeneratingAI] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');

  const handleGenerateClick = async () => {
    setGeneratingAI(true);
    await onGenerateAIQuests();
    setGeneratingAI(false);
  };

  const filteredQuests = quests.filter((q) => {
    if (filterType === 'all') return true;
    return q.type === filterType;
  });

  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.type === 'weekly');
  const specialQuests = quests.filter((q) => q.type === 'special');

  const totalClaimableXP = quests
    .filter((q) => q.completed && !q.claimed)
    .reduce((sum, q) => sum + q.xpReward, 0);

  // Past 7 days streak days mock
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Gamified CSE Quests & Challenges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Daily Learning Quests & Streaks
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Complete daily peer mentoring tasks, maintain your campus streak, and unlock bonus XP to climb the campus leaderboard.
          </p>
        </div>

        {/* AI Quest Generator Button */}
        <button
          onClick={handleGenerateClick}
          disabled={generatingAI}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {generatingAI ? (
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{generatingAI ? 'Forging AI Quests...' : 'AI Quest Forge (Generate More)'}</span>
        </button>
      </div>

      {/* Streak Tracker & Claimable XP Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Streak card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-7 h-7 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Current Campus Streak</p>
              <h3 className="text-2xl font-black text-amber-400">{currentUser.streakDays} Days</h3>
            </div>
          </div>

          <button
            onClick={onDailyCheckIn}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors"
          >
            Check In
          </button>
        </div>

        {/* Total Claimable XP */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Claimable Quest Rewards</p>
              <h3 className="text-2xl font-black text-indigo-300">+{totalClaimableXP} XP</h3>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            {quests.filter((q) => q.completed && !q.claimed).length} Ready
          </span>
        </div>

        {/* Level Milestone Status */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Rank Tier</p>
              <h3 className="text-lg font-black text-slate-100">Level {currentUser.level}</h3>
            </div>
          </div>

          <button
            onClick={() => onNavigate('achievements')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Badges →
          </button>
        </div>

      </div>

      {/* Quest Category Filters */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All Quests ({quests.length})
        </button>
        <button
          onClick={() => setFilterType('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'daily'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Daily Tasks ({dailyQuests.length})
        </button>
        <button
          onClick={() => setFilterType('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'weekly'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Weekly Challenges ({weeklyQuests.length})
        </button>
        <button
          onClick={() => setFilterType('special')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'special'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Special AI Quests ({specialQuests.length})
        </button>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuests.map((quest) => {
          const isCompleted = quest.completed;
          const isClaimed = quest.claimed;
          const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                isClaimed
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-75'
                  : isCompleted
                  ? 'bg-gradient-to-b from-slate-900 to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        quest.type === 'daily'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : quest.type === 'weekly'
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {quest.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{quest.category}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                    +{quest.xpReward} XP
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="text-base font-bold text-slate-100 mt-3">{quest.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{quest.description}</p>
              </div>

              {/* Progress & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-200">
                    {quest.progress}/{quest.target} {quest.unit} ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Claim or Status button */}
                <div className="mt-4">
                  {isClaimed ? (
                    <div className="w-full py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Reward Claimed (+{quest.xpReward} XP)</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onClaimQuest(quest.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all transform active:scale-95 animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Claim +{quest.xpReward} XP Reward!</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('explore')}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Start Quest in Exchange Hub</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
