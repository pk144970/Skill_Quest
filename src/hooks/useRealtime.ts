// =============================================================
//  SkillQuest — useRealtime Hook
//  ─────────────────────────────────────────────────────────────
//  React hook that connects to the SSE stream, manages a
//  notification inbox, and returns helpers to mark notifications
//  read and clear them.
// =============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimeEvent, RealtimeEventType } from '../services/realtime';
import { User, SkillExchange } from '../types';

export interface AppNotification {
  id: string;
  type: RealtimeEventType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  payload?: any;
}

function buildNotification(event: RealtimeEvent, currentUserId: string): AppNotification | null {
  const { type, payload, timestamp } = event;

  // Don't notify the current user about their own actions
  if (event.userId && event.userId === currentUserId && type !== 'quest_claimed') {
    return null;
  }

  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  switch (type) {
    case 'exchange_proposed':
      if (payload?.toUserId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '🤝 New Exchange Proposal!',
        body: `${payload?.fromUserName || 'A peer'} wants to exchange ${payload?.skillOffered} ⇄ ${payload?.skillRequested}`,
      };

    case 'exchange_accepted':
      if (payload?.fromUserId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '✅ Exchange Accepted!',
        body: `${payload?.toUserName || 'Your peer'} accepted your ${payload?.skillOffered} exchange. Meet link is ready!`,
      };

    case 'exchange_declined':
      if (payload?.fromUserId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '❌ Exchange Declined',
        body: `${payload?.toUserName || 'Your peer'} declined the ${payload?.skillOffered} exchange proposal.`,
      };

    case 'exchange_completed':
      if (payload?.fromUserId !== currentUserId && payload?.toUserId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '🏆 Exchange Completed!',
        body: `${payload?.title || 'Skill Exchange'} is complete. +200 XP awarded!`,
      };

    case 'review_submitted':
      if (payload?.toUserId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '⭐ New Peer Review',
        body: `${payload?.fromUserName || 'A peer'} left you a ${payload?.rating}★ review for ${payload?.skillExchanged}`,
      };

    case 'quest_claimed':
      if (payload?.userId !== currentUserId) return null;
      return {
        id, type, timestamp, read: false, payload,
        title: '🎯 Quest Reward Claimed!',
        body: `+${payload?.xpAwarded || 0} XP • ${payload?.questTitle || 'Quest complete'}`,
      };

    case 'user_registered':
      return {
        id, type, timestamp, read: false, payload,
        title: '👋 New Campus Peer',
        body: `${payload?.name || 'A new student'} from ${payload?.college || 'campus'} just joined SkillQuest!`,
      };

    case 'leaderboard_update':
      return {
        id, type, timestamp, read: false, payload,
        title: '📊 Leaderboard Updated',
        body: `Rankings have changed! Check the leaderboard to see where you stand.`,
      };

    default:
      return null;
  }
}

interface UseRealtimeOptions {
  currentUser: User | null;
  onDataRefresh?: () => void;        // Called when any mutation event arrives (triggers a poll)
  onExchangeUpdate?: (exchange: SkillExchange) => void;
}

export function useRealtime({ currentUser, onDataRefresh }: UseRealtimeOptions) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Connect/disconnect when user changes
  useEffect(() => {
    if (!currentUser) {
      realtimeService.disconnect();
      return;
    }
    realtimeService.connect(currentUser.id);
    return () => realtimeService.disconnect();
  }, [currentUser?.id]);

  // Subscribe to connection state changes
  useEffect(() => {
    return realtimeService.onConnectionChange(setIsConnected);
  }, []);

  // Subscribe to events
  useEffect(() => {
    if (!currentUser) return;

    return realtimeService.subscribe((event) => {
      // Build notification for this user
      const notif = buildNotification(event, currentUser.id);
      if (notif) {
        setNotifications((prev) => [notif, ...prev].slice(0, 50)); // keep max 50
      }

      // Trigger data refresh for mutation events (not pings)
      if (event.type !== 'ping' && onDataRefresh) {
        onDataRefresh();
      }
    });
  }, [currentUser?.id, onDataRefresh]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isConnected, markAllRead, markRead, clearAll };
}
