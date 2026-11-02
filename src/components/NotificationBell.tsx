// =============================================================
//  SkillQuest — NotificationBell Component
//  ─────────────────────────────────────────────────────────────
//  A bell icon with a badge showing unread count. Clicking it
//  opens a dropdown panel with all notifications, each tappable
//  to mark read and navigate to the relevant tab.
// =============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { AppNotification } from '../hooks/useRealtime';

interface NotificationBellProps {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  isDarkMode: boolean;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate?: (tab: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  isConnected,
  isDarkMode,
  onMarkAllRead,
  onMarkRead,
  onClearAll,
  onNavigate,
}) => {
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(unreadCount);

  // Shake the bell on new notifications
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (notif: AppNotification) => {
    onMarkRead(notif.id);
    // Navigate to relevant section
    if (notif.type === 'exchange_proposed' || notif.type === 'exchange_accepted' ||
        notif.type === 'exchange_completed' || notif.type === 'exchange_declined') {
      onNavigate?.('exchange');
    } else if (notif.type === 'review_submitted') {
      onNavigate?.('profile');
    } else if (notif.type === 'leaderboard_update') {
      onNavigate?.('leaderboard');
    } else if (notif.type === 'quest_claimed') {
      onNavigate?.('quests');
    }
    setOpen(false);
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) onMarkAllRead(); }}
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
          isDarkMode
            ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80'
            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
        } ${shake ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg shadow-red-500/40 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Connection indicator dot */}
      <span
        className={`absolute bottom-1 left-1 w-2 h-2 rounded-full border-2 ${isDarkMode ? 'border-slate-950' : 'border-white'} ${
          isConnected ? 'bg-emerald-500' : 'bg-amber-400'
        }`}
        title={isConnected ? 'Live — real-time sync active' : 'Reconnecting...'}
      />

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-700/80 shadow-slate-900/80'
              : 'bg-white border-slate-200 shadow-slate-300/50'
          }`}
          id="notification-panel"
        >
          {/* Header */}
          <div className={`p-3 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Notifications
              </span>
              {/* Live indicator */}
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-[10px] text-emerald-400 font-medium">Live</span></>
                ) : (
                  <><WifiOff className="w-3 h-3 text-amber-400" /><span className="text-[10px] text-amber-400 font-medium">Reconnecting</span></>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
                    title="Mark all read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClearAll}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  No notifications yet
                </p>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                  Exchange proposals &amp; events will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors ${
                      notif.read
                        ? isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        : isDarkMode ? 'bg-indigo-500/8 hover:bg-indigo-500/15' : 'bg-indigo-50 hover:bg-indigo-100/60'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="shrink-0 mt-1.5">
                      <div className={`w-2 h-2 rounded-full ${notif.read ? 'bg-transparent' : 'bg-indigo-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {notif.body}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {relativeTime(notif.timestamp)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
