import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Users,
  Trophy,
  User as UserIcon,
  Compass,
  Repeat,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Sun,
  Moon,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenRegister: () => void;
  onOpenAIMentor: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenRegister,
  onOpenAIMentor,
  isDarkMode,
  onToggleTheme,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'explore', label: 'Explore Skills', icon: BookOpen },
    { id: 'exchange', label: 'Skill Exchange', icon: Repeat },
    { id: 'quests', label: 'Quests', icon: Flame },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Calculate XP percentage to next level
  const getLevelInfo = (xp: number, level: number) => {
    const levelThresholds = [0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000];
    const currentMin = levelThresholds[level - 1] || 0;
    const currentMax = levelThresholds[level] || currentMin + 2000;
    const currentLevelProgress = Math.max(0, xp - currentMin);
    const needed = currentMax - currentMin;
    const percent = Math.min(100, Math.round((currentLevelProgress / needed) * 100));
    return { percent, needed, remaining: currentMax - xp };
  };

  const levelInfo = getLevelInfo(currentUser.xp, currentUser.level);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                    SkillQuest
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    P2P
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Campus Skill Exchange</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIMentor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all duration-150 transform active:scale-95"
              title="Open AI Peer Roadmap & Synergy Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Streak Counter */}
            <div
              onClick={() => setActiveTab('quests')}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              title={`${currentUser.streakDays} Day Learning Streak`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-300">{currentUser.streakDays}d</span>
            </div>

            {/* XP & Level Badge */}
            <div
              onClick={() => setActiveTab('profile')}
              className="cursor-pointer hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              title={`${currentUser.xp} XP total. ${levelInfo.remaining > 0 ? `${levelInfo.remaining} XP to Level ${currentUser.level + 1}` : 'Max Level'}`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-300">Lvl {currentUser.level}</span>
                <span className="font-bold text-indigo-400">{currentUser.xp} XP</span>
              </div>
              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 border border-slate-800 transition-colors focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
                />
                <span className="hidden md:block text-xs font-medium text-slate-200 max-w-[100px] truncate text-left">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-indigo-400 truncate mt-0.5">{currentUser.college}</p>
                  </div>

                  <div className="px-3.5 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Switch Demo Student:
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs text-left transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                            <div className="truncate">
                              <p className="truncate font-medium">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{u.college.split('(')[0]}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                            L{u.level}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 px-2">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenRegister();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-300 hover:bg-indigo-600/15 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-indigo-400" />
                      <span>Register New Student</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
