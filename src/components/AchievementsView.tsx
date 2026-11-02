import React from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Star,
  Users,
  Compass,
  Crown,
  Clock,
  Palette,
  Cpu
} from 'lucide-react';
import { User, Badge, Achievement } from '../types';

interface AchievementsViewProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ currentUser, onNavigate }) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return Sparkles;
      case 'Flame':
        return Flame;
      case 'Clock':
        return Clock;
      case 'Cpu':
        return Cpu;
      case 'Palette':
        return Palette;
      case 'Trophy':
        return Trophy;
      case 'Users':
        return Users;
      case 'Star':
        return Star;
      case 'Compass':
        return Compass;
      case 'Crown':
        return Crown;
      default:
        return Award;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-700/20 to-amber-900/10 border-amber-700/40 text-amber-300';
      case 'silver':
        return 'from-slate-400/20 to-slate-600/10 border-slate-400/40 text-slate-200';
      case 'gold':
        return 'from-amber-400/20 to-amber-600/10 border-amber-400/40 text-amber-300';
      case 'platinum':
        return 'from-cyan-400/20 to-indigo-600/10 border-cyan-400/40 text-cyan-300';
      default:
        return 'from-indigo-600/20 to-violet-600/10 border-indigo-500/40 text-indigo-300';
    }
  };

  const unlockedCount = currentUser.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Campus Badges & Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            SkillQuest Honors & Achievements
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Collect prestigious badges and unlock achievements by tutoring peers, completing sprints, and maintaining high campus reputation.
          </p>
        </div>

        {/* Total Unlocked Stats */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold">Achievements Unlocked</p>
            <p className="text-xl font-black text-amber-300">
              {unlockedCount} / {currentUser.achievements.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 1. Badges Showcase Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Unlocked Badges Showcase ({currentUser.badges.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentUser.badges.map((badge) => {
            const Icon = getBadgeIcon(badge.icon);
            const tierStyle = getTierColor(badge.tier);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl bg-gradient-to-b ${tierStyle} border shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-950/80 border border-slate-800">
                    {badge.tier}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mt-4">{badge.name}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{badge.description}</p>
                <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                  Unlocked on {badge.unlockedAt || 'Recent'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. All Achievements Progression */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" />
          <span>Campus Quest Milestones & Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentUser.achievements.map((ach) => {
            const Icon = getBadgeIcon(ach.icon);
            const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ach.unlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-950/10'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {ach.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{ach.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {ach.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold whitespace-nowrap">
                    +{ach.xpReward} XP
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>
                      {ach.unlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked!
                        </span>
                      ) : (
                        <span>In Progress</span>
                      )}
                    </span>
                    <span>
                      {ach.progress} / {ach.maxProgress} ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.unlocked
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
