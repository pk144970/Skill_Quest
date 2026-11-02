import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Trophy,
  User as UserIcon,
  Compass,
  Repeat,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Database,
  Bell,
  BellDot,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';
import { User } from '../types';

// ── Notification type (matches useRealtime hook) ─────────────────
interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  allUsers?: User[];          // kept for API compat but not used in UI
  onSwitchUser?: (userId: string) => void; // kept for compat
  onOpenRegister: () => void;
  onOpenAIMentor: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  // Notification props
  notifications?: Notification[];
  unreadCount?: number;
  isRealtimeConnected?: boolean;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenRegister,
  onOpenAIMentor,
  onOpenLogin,
  onLogout,
  isDarkMode = true,
  onToggleTheme,
  notifications = [],
  unreadCount = 0,
  isRealtimeConnected = false,
  onMarkAllRead,
  onMarkRead,
  onClearNotifications,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',      icon: Compass,       description: 'Overview & Matches' },
    { id: 'explore',      label: 'Explore Skills',  icon: BookOpen,      description: 'Find Peers & Tutors' },
    { id: 'tutor',        label: 'Tutor Hub',       icon: GraduationCap, description: 'Sessions, Videos & XP' },
    { id: 'exchange',     label: 'Skill Exchange',  icon: Repeat,        description: 'Manage Sessions' },
    { id: 'quests',       label: 'Quests',          icon: Flame,         description: 'Daily Tasks & XP' },
    { id: 'leaderboard',  label: 'Leaderboard',     icon: Trophy,        description: 'Campus Rankings' },
    { id: 'achievements', label: 'Achievements',    icon: Award,         description: 'Badges & Milestones' },
    { id: 'profile',      label: 'Profile',         icon: UserIcon,      description: 'Skills & Reviews' },
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

  const levelInfo = currentUser
    ? getLevelInfo(currentUser.xp, currentUser.level)
    : { percent: 0, needed: 100, remaining: 100 };

  // Format notification timestamp
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const diff = Date.now() - d.getTime();
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  // ─── Notification Panel ─────────────────────────────────────────
  const renderNotifPanel = () => (
    <div
      className={`absolute left-full top-0 ml-3 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
        isDarkMode
          ? 'bg-slate-900 border-slate-700/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Panel Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onMarkAllRead && unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors"
              title="Mark all read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {onClearNotifications && notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Bell className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <p>No notifications yet</p>
            <p className="text-[10px] mt-1 text-slate-500">Live activity will appear here</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onMarkRead && onMarkRead(n.id)}
              className={`w-full text-left px-4 py-3 border-b last:border-b-0 flex items-start gap-3 transition-colors ${
                isDarkMode ? 'border-slate-800/60 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50'
              } ${!n.read ? (isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-50') : ''}`}
            >
              {!n.read && (
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              )}
              {n.read && <div className="mt-1.5 w-1.5 h-1.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-slate-100' : 'text-slate-400'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500">{formatTime(n.timestamp)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  //  USER CARD — logged-in user only, no switcher
  // ══════════════════════════════════════════════════════════
  const renderUserCard = (mobile = false) => {
    if (!currentUser) {
      if (isCollapsed && !mobile) {
        return (
          <div className="flex flex-col items-center py-1">
            <button
              onClick={onOpenLogin}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              title="Sign In"
            >
              <LogIn className="w-4 h-4" />
            </button>
          </div>
        );
      }
      return (
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              SQ
            </div>
            <div className="truncate">
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Guest Student</p>
              <p className="text-[10px] text-slate-400">Not signed in</p>
            </div>
          </div>
          <button
            onClick={onOpenLogin}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      );
    }

    // Collapsed avatar only
    if (isCollapsed && !mobile) {
      return (
        <div className="flex flex-col items-center py-1">
          <button
            onClick={() => setIsCollapsed(false)}
            className="relative group focus:outline-none"
            title={`${currentUser.name} (Lvl ${currentUser.level}) — Click to expand`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 px-1 rounded bg-indigo-600 text-[8px] font-bold text-white shadow">
              L{currentUser.level}
            </div>
          </button>
        </div>
      );
    }

    // Full expanded user card
    return (
      <div className={`p-2.5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'}`}>
        {/* Profile row */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
            <div className="absolute -bottom-1 -right-1 px-1 rounded bg-indigo-600 text-[8px] font-bold text-white shadow">
              L{currentUser.level}
            </div>
          </div>
          <div className="flex-1 truncate">
            <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser.branch.split('&')[0].trim()}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser.college.split('(')[0].trim()}
            </p>
          </div>
          {/* Sign out button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Streak & XP pills */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTab('quests')}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-left"
            title={`${currentUser.streakDays} Day Learning Streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
            <div className="truncate">
              <p className="text-[9px] text-amber-400/80 leading-none">Streak</p>
              <p className="text-[11px] font-bold text-amber-300 leading-tight mt-0.5">{currentUser.streakDays}d</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-left"
            title={`${currentUser.xp} XP total`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="truncate">
              <p className="text-[9px] text-indigo-400/80 leading-none">XP</p>
              <p className="text-[11px] font-bold text-indigo-300 leading-tight mt-0.5">{currentUser.xp}</p>
            </div>
          </button>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-2 px-0.5">
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
            <span>Lvl {currentUser.level}</span>
            <span>{levelInfo.percent}% to Lvl {currentUser.level + 1}</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  //  NAV ITEMS
  // ══════════════════════════════════════════════════════════
  const renderNavItems = (mobile = false) => (
    <nav className="space-y-1">
      {!isCollapsed && !mobile && (
        <p className={`px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Menu Navigation
        </p>
      )}
      {mobile && (
        <p className={`px-2 pb-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Navigation Menu
        </p>
      )}

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const collapsed = isCollapsed && !mobile;

        return (
          <div key={item.id} className="relative group">
            <button
              onClick={() => {
                setActiveTab(item.id);
                if (mobile) setMobileOpen(false);
              }}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                collapsed
                  ? 'justify-center p-2.5'
                  : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10 font-semibold'
                  : `border border-transparent ${isDarkMode ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-400'
                      : isDarkMode
                        ? 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                        : 'bg-slate-200 text-slate-500 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <div className="text-left">
                    <p className="leading-tight text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-normal">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              )}
            </button>

            {/* Collapsed tooltip */}
            {collapsed && (
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-100 rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-150">
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  // ══════════════════════════════════════════════════════════
  //  DESKTOP SIDEBAR
  // ══════════════════════════════════════════════════════════
  const renderDesktopSidebar = () => (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r backdrop-blur-md z-30 transition-all duration-300 ease-in-out select-none ${
        isDarkMode
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
      } ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Top: Brand & Collapse Toggle */}
      <div className={`p-4 border-b flex items-center ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'} ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 group text-left focus:outline-none"
          title="SkillQuest Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                  SkillQuest
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  P2P
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">Campus Skill Exchange</p>
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg border border-transparent transition-all focus:outline-none ${
            isDarkMode
              ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 hover:border-slate-700/60'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Middle: Scrollable — User Card + Nav */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 min-h-0">
        {renderUserCard()}
        {renderNavItems()}
      </div>

      {/* Bottom pinned: AI Advisor + Notification + Theme + Status */}
      <div className={`p-3 border-t space-y-2 shrink-0 ${isDarkMode ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'}`}>

        {/* AI Advisor Button */}
        <div className="relative group">
          <button
            onClick={onOpenAIMentor}
            className={`w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-150 transform active:scale-95 ${
              isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white/10 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">AI Advisor</p>
                  <p className="text-[10px] text-indigo-200 font-normal">Roadmaps & Synergy</p>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />}
          </button>
          {isCollapsed && (
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-100 rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-150">
              AI Advisor
            </div>
          )}
        </div>

        {/* Notification Bell */}
        {!isCollapsed ? (
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-slate-900/60 border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-900'
                  : 'bg-slate-100 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {unreadCount > 0
                  ? <BellDot className="w-4 h-4 text-indigo-400" />
                  : <Bell className="w-4 h-4 text-slate-400" />
                }
                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Notifications
                </span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                    {unreadCount}
                  </span>
                )}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}
                  title={isRealtimeConnected ? 'Live connected' : 'Disconnected'}
                />
              </div>
            </button>

            {/* Notif dropdown panel */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-full z-50">
                  {renderNotifPanel()}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Collapsed notification bell */
          <div className="relative group flex justify-center">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              {unreadCount > 0
                ? <BellDot className="w-4 h-4 text-indigo-400" />
                : <Bell className="w-4 h-4" />
              }
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 text-[8px] font-black text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute left-full bottom-0 ml-3 z-50">
                  {renderNotifPanel()}
                </div>
              </>
            )}
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-100 rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-150">
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
            </div>
          </div>
        )}

        {/* Theme Toggle & Status Row */}
        {!isCollapsed ? (
          <div className={`flex items-center justify-between pt-1 px-1 text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {onToggleTheme ? (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode
                  ? <><Sun className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-medium">Dark Mode</span></>
                  : <><Moon className="w-3.5 h-3.5 text-indigo-600" /><span className="text-[11px] font-medium">Light Mode</span></>
                }
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Campus Network</span>
              </div>
            )}

            <div
              className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20"
              title="Persistent SQLite database active"
            >
              <Database className="w-3 h-3 text-indigo-400" />
              <span className="font-mono">DB</span>
            </div>
          </div>
        ) : (
          /* Collapsed theme toggle */
          onToggleTheme && (
            <div className="flex justify-center pt-1 relative group">
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode
                  ? <Sun className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4 text-indigo-600" />
                }
              </button>
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-100 rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-150">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
            </div>
          )
        )}
      </div>
    </aside>
  );

  // ══════════════════════════════════════════════════════════
  //  MOBILE DRAWER CONTENT
  // ══════════════════════════════════════════════════════════
  const renderMobileDrawerContent = () => (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* Drawer Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => { setActiveTab('dashboard'); setMobileOpen(false); }}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-[1px] shadow-md">
            <div className={`w-full h-full rounded-[9px] flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
              SkillQuest
            </span>
            <p className="text-[10px] text-slate-400">Campus Skill Exchange</p>
          </div>
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* User Card — mobile (always expanded, no collapse logic) */}
        {!currentUser ? (
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Guest Student</p>
            <button
              onClick={() => { setMobileOpen(false); if (onOpenLogin) onOpenLogin(); }}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            {/* Profile row */}
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0"
              />
              <div className="flex-1 truncate">
                <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.college.split('(')[0].trim()}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-[9px] font-bold text-white">
                    Lvl {currentUser.level}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-bold text-amber-300 border border-amber-500/20">
                    {currentUser.xp} XP
                  </span>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={() => { setMobileOpen(false); onLogout(); }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Streak & XP */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <div>
                  <p className="text-[9px] text-amber-400/80">Streak</p>
                  <p className="text-xs font-bold text-amber-300">{currentUser.streakDays} Days</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Award className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[9px] text-indigo-400/80">Points</p>
                  <p className="text-xs font-bold text-indigo-300">{currentUser.xp} XP</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 px-0.5">
              <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                <span>Level {currentUser.level}</span>
                <span>{levelInfo.percent}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications section in mobile drawer */}
        {notifications.length > 0 && (
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`px-3 py-2 flex items-center justify-between border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">{unreadCount}</span>
                )}
              </div>
              {onMarkAllRead && unreadCount > 0 && (
                <button onClick={onMarkAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2.5 border-b last:border-b-0 ${isDarkMode ? 'border-slate-800/60' : 'border-slate-100'} ${!n.read ? (isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-50') : ''}`}
                >
                  <p className={`text-xs ${!n.read ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatTime(n.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        {renderNavItems(true)}
      </div>

      {/* Drawer Bottom */}
      <div className={`p-4 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => { onOpenAIMentor(); setMobileOpen(false); }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold">AI Advisor</span>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-200" />
        </button>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="font-medium">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-500">Toggle</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Top Header Bar ── */}
      <header className={`lg:hidden sticky top-0 z-40 border-b backdrop-blur-md px-4 py-2.5 flex items-center justify-between transition-colors ${
        isDarkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-white/95'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className={`p-2 rounded-xl border focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-amber-400 p-[1px]">
              <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
              SkillQuest
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick AI button */}
          <button
            onClick={onOpenAIMentor}
            className="p-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
            title="Open AI Mentor"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* Notification bell */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {unreadCount > 0 ? <BellDot className="w-4.5 h-4.5 text-indigo-400" /> : <Bell className="w-4.5 h-4.5" />}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 text-[8px] font-black text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <>
              {/* Quick streak */}
              <div
                onClick={() => setActiveTab('quests')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{currentUser.streakDays}d</span>
              </div>
              {/* Avatar */}
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onClick={() => setMobileOpen(true)}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/40 cursor-pointer"
              />
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className={`relative w-72 max-w-[85vw] border-r shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {renderMobileDrawerContent()}
          </div>
        </div>
      )}

      {/* ── Desktop Permanent Sidebar ── */}
      {renderDesktopSidebar()}
    </>
  );
};
