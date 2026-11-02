// =============================================================
//  SkillQuest — Real-Time Notification Service
//  ─────────────────────────────────────────────────────────────
//  Connects to the server's /api/events SSE stream and dispatches
//  typed events to all registered listeners in the React app.
//
//  Architecture:
//   • Server pushes SSE events on any data mutation
//   • This service reconnects automatically with back-off
//   • Components subscribe via subscribe() and unsubscribe via
//     the returned cleanup function
// =============================================================

export type RealtimeEventType =
  | 'exchange_proposed'
  | 'exchange_accepted'
  | 'exchange_declined'
  | 'exchange_completed'
  | 'milestone_toggled'
  | 'review_submitted'
  | 'quest_claimed'
  | 'user_registered'
  | 'user_online'
  | 'leaderboard_update'
  | 'ping';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
  userId?: string; // The user who triggered the event
}

type Listener = (event: RealtimeEvent) => void;

class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1500; // ms
  private maxReconnectDelay = 30000;
  private currentUserId: string | null = null;
  private isConnected = false;
  private connectionListeners = new Set<(connected: boolean) => void>();

  /** Connect (or re-connect) the SSE stream for a given user */
  connect(userId: string) {
    this.currentUserId = userId;
    this._open();
  }

  /** Disconnect and clean up */
  disconnect() {
    this._close();
    this.currentUserId = null;
  }

  /** Subscribe to realtime events. Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Subscribe to connection state changes */
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  get connected() {
    return this.isConnected;
  }

  // ── Private ──────────────────────────────────────────────

  private _open() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (!this.currentUserId) return;

    const url = `/api/events?userId=${encodeURIComponent(this.currentUserId)}`;
    const es = new EventSource(url);

    es.onopen = () => {
      this.isConnected = true;
      this.reconnectDelay = 1500; // reset back-off on success
      this._notifyConnectionListeners(true);
      console.log('[Realtime] SSE connected ✓');
    };

    es.onmessage = (e) => {
      try {
        const event: RealtimeEvent = JSON.parse(e.data);
        this._dispatch(event);
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      es.close();
      this.isConnected = false;
      this._notifyConnectionListeners(false);
      console.warn(`[Realtime] SSE disconnected, reconnecting in ${this.reconnectDelay}ms...`);
      this._scheduleReconnect();
    };

    this.eventSource = es;
  }

  private _close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this._notifyConnectionListeners(false);
  }

  private _scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentUserId) this._open();
    }, this.reconnectDelay);
    // Exponential back-off
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  private _dispatch(event: RealtimeEvent) {
    this.listeners.forEach((l) => {
      try { l(event); } catch (err) {
        console.error('[Realtime] Listener error:', err);
      }
    });
  }

  private _notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach((l) => {
      try { l(connected); } catch { /* ignore */ }
    });
  }
}

/** Singleton instance — import this everywhere in the app */
export const realtimeService = new RealtimeService();
