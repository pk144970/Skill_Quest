import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Star,
  Search,
  Filter,
  Repeat,
  Sparkles,
  GraduationCap,
  Award,
  Crown
} from 'lucide-react';
import { User } from '../types';

interface LeaderboardViewProps {
  allUsers: User[];
  currentUser: User | null;
  onOpenExchangeModal: (targetUser: User) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  allUsers,
  currentUser,
  onOpenExchangeModal,
}) => {
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique colleges
  const colleges = ['All', ...Array.from(new Set(allUsers.map((u) => u.college)))];

  // Filter & rank users
  let rankedUsers = [...allUsers];
  if (selectedCollege !== 'All') {
    rankedUsers = rankedUsers.filter((u) => u.college === selectedCollege);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    rankedUsers = rankedUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.college.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q)
    );
  }

  // Sort descending by XP, then rating
  rankedUsers.sort((a, b) => b.xp - a.xp || b.stats.reputationRating - a.stats.reputationRating);

  const top3 = rankedUsers.slice(0, 3);
  const restUsers = rankedUsers.slice(3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Campus Leaderboard & Hall of Fame</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Top Student Mentors & Learners
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Ranked by XP gained through peer teaching, streak milestones, and positive peer reviews across universities.
          </p>
        </div>

        {/* Current user rank indicator */}
        <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs">
          <p className="text-[11px] text-slate-400">Your Current Rank:</p>
          <p className="text-base font-extrabold text-slate-100 mt-0.5">
            {(() => {
              if (!currentUser) return 'Sign in to see rank';
              const rank = rankedUsers.findIndex((u) => u.id === currentUser.id);
              if (rank !== -1) {
                return `#${rank + 1} ${selectedCollege === 'All' ? 'on Campus' : 'in College'}`;
              }
              return 'Not in Selected Filter';
            })()}
          </p>
        </div>
      </div>

      {/* Top 3 Podium (Safe for 1, 2, or 3+ registered students) */}
      {top3.length > 0 && !searchQuery ? (
        <div className={`grid gap-4 pt-6 ${
          top3.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          top3.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
          'grid-cols-1 md:grid-cols-3'
        }`}>
          
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex flex-col items-center text-center shadow-lg relative mt-4 md:mt-6">
              <div className="absolute -top-4 px-3 py-1 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                #2 Silver Scholar
              </div>
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-400/50 mt-2"
              />
              <h3 className="text-base font-bold text-slate-100 mt-3">{top3[1].name}</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{top3[1].college.split('(')[0]}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 font-extrabold text-xs">
                  {top3[1].xp} XP
                </span>
                <span className="text-xs text-slate-300 font-semibold">Lvl {top3[1].level}</span>
              </div>

              {(!currentUser || top3[1].id !== currentUser.id) && (
                <button
                  onClick={() => onOpenExchangeModal(top3[1])}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Propose Exchange</span>
                </button>
              )}
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          {top3[0] && (
            <div className="order-1 md:order-2 p-7 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 flex flex-col items-center text-center shadow-2xl shadow-amber-500/10 relative -mt-2">
              <div className="absolute -top-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>#1 Campus Champion</span>
              </div>
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-400 mt-2 shadow-xl shadow-amber-500/20"
              />
              <h3 className="text-lg font-black text-slate-100 mt-3">{top3[0].name}</h3>
              <p className="text-xs text-indigo-300 font-medium truncate max-w-xs">{top3[0].college}</p>
              
              <div className="mt-3 flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm">
                  {top3[0].xp} XP
                </span>
                <span className="flex items-center text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {top3[0].stats.reputationRating}★
                </span>
              </div>

              {(!currentUser || top3[0].id !== currentUser.id) && (
                <button
                  onClick={() => onOpenExchangeModal(top3[0])}
                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Exchange with Champion</span>
                </button>
              )}
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <div className="order-3 md:order-3 p-6 rounded-2xl bg-slate-900/90 border border-amber-900/40 flex flex-col items-center text-center shadow-lg relative mt-4 md:mt-6">
              <div className="absolute -top-4 px-3 py-1 rounded-full bg-amber-800 text-amber-100 font-black text-xs shadow-md">
                #3 Bronze Master
              </div>
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-700/50 mt-2"
              />
              <h3 className="text-base font-bold text-slate-100 mt-3">{top3[2].name}</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{top3[2].college.split('(')[0]}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 font-extrabold text-xs">
                  {top3[2].xp} XP
                </span>
                <span className="text-xs text-slate-300 font-semibold">Lvl {top3[2].level}</span>
              </div>

              {(!currentUser || top3[2].id !== currentUser.id) && (
                <button
                  onClick={() => onOpenExchangeModal(top3[2])}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Propose Exchange</span>
                </button>
              )}
            </div>
          )}

        </div>
      ) : rankedUsers.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Trophy className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No students on the campus leaderboard yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Be the campus pioneer! Register or sign in with your Google account to claim the #1 spot on the leaderboard.
          </p>
        </div>
      ) : null}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or branch..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter College:</span>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ranked Table */}
      <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Streak</th>
                <th className="py-3.5 px-4">Reputation</th>
                <th className="py-3.5 px-4">Total XP</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedUsers.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = user.id === currentUser.id;

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrentUser ? 'bg-indigo-600/10 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {rank === 1 ? (
                        <span className="text-amber-400 font-black">🥇 #1</span>
                      ) : rank === 2 ? (
                        <span className="text-slate-300 font-black">🥈 #2</span>
                      ) : rank === 3 ? (
                        <span className="text-amber-600 font-black">🥉 #3</span>
                      ) : (
                        <span className="text-slate-400">#{rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-100 flex items-center gap-1.5">
                            {user.name}
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{user.branch}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {user.college}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold text-[11px]">
                        Lvl {user.level}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {user.streakDays}d
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {user.stats.reputationRating}★
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                      {user.xp} XP
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!isCurrentUser ? (
                        <button
                          onClick={() => onOpenExchangeModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors"
                        >
                          Exchange
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
