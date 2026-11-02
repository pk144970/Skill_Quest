// =============================================================
//  SkillQuest — Tutor Hub View
//  ─────────────────────────────────────────────────────────────
//  4 tabs:
//   1. Online Sessions  — book / host live tutor sessions
//   2. YouTube Learn    — browse curated YouTube videos + earn XP
//   3. XP Store         — redeem XP points for rewards/perks
//   4. Refer Friends    — invite friends for bonus XP
// =============================================================

import React, { useState, useRef } from 'react';
import {
  Video,
  Youtube,
  ShoppingBag,
  Users,
  PlayCircle,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Copy,
  Share2,
  X,
  ExternalLink,
  Award,
  Lock,
  Unlock,
  Trophy,
  Calendar,
  Plus,
  Search,
  Sparkles,
  Check,
  Link,
  Send,
  UserPlus,
} from 'lucide-react';
import { User } from '../types';

// ─── Types ────────────────────────────────────────────────────

interface TutorSession {
  id: string;
  tutorName: string;
  tutorAvatar: string;
  tutorRating: number;
  skill: string;
  topic: string;
  scheduledAt: string;
  durationMins: number;
  mode: 'live' | 'recorded';
  status: 'upcoming' | 'live_now' | 'completed';
  xpReward: number;
  meetLink?: string;
  price: 'free' | number;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: string;
  category: string;
  xpOnWatch: number;
  xpOnComplete: number;
  watched: boolean;
  completed: boolean;
  progress: number;
  tags: string[];
}

interface XPReward {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpCost: number;
  category: 'perks' | 'badges' | 'boosts' | 'social';
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  redeemed: boolean;
  available: boolean;
  limitedTime?: boolean;
  expiresIn?: string;
}

interface ReferralEntry {
  id: string;
  friendName: string;
  friendAvatar: string;
  joinedAt: string;
  xpEarned: number;
  status: 'pending' | 'joined' | 'active';
}

// ─── Static Data ──────────────────────────────────────────────

const TUTOR_SESSIONS: TutorSession[] = [
  {
    id: 'ts1',
    tutorName: 'Priya Sharma',
    tutorAvatar: 'https://i.pravatar.cc/150?img=47',
    tutorRating: 4.9,
    skill: 'React',
    topic: 'React Hooks Deep Dive — useState, useEffect & Custom Hooks',
    scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    durationMins: 60,
    mode: 'live',
    status: 'upcoming',
    xpReward: 150,
    meetLink: 'https://meet.google.com/abc-defg-hij',
    price: 'free',
  },
  {
    id: 'ts2',
    tutorName: 'Arjun Mehta',
    tutorAvatar: 'https://i.pravatar.cc/150?img=12',
    tutorRating: 4.7,
    skill: 'Python',
    topic: 'Data Structures in Python — Trees, Graphs & DP',
    scheduledAt: new Date(Date.now() + 5 * 3600000).toISOString(),
    durationMins: 90,
    mode: 'live',
    status: 'upcoming',
    xpReward: 200,
    meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    price: 'free',
  },
  {
    id: 'ts3',
    tutorName: 'Riya Patel',
    tutorAvatar: 'https://i.pravatar.cc/150?img=32',
    tutorRating: 5.0,
    skill: 'Machine Learning',
    topic: 'ML Fundamentals — Regression, Classification & Evaluation',
    scheduledAt: new Date(Date.now() + 0.5 * 3600000).toISOString(),
    durationMins: 75,
    mode: 'live',
    status: 'live_now',
    xpReward: 180,
    meetLink: 'https://meet.google.com/live-now-xyz',
    price: 'free',
  },
  {
    id: 'ts4',
    tutorName: 'Karan Singh',
    tutorAvatar: 'https://i.pravatar.cc/150?img=56',
    tutorRating: 4.8,
    skill: 'System Design',
    topic: 'System Design Interviews — Scalability & Architecture Patterns',
    scheduledAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    durationMins: 120,
    mode: 'recorded',
    status: 'completed',
    xpReward: 250,
    price: 'free',
  },
  {
    id: 'ts5',
    tutorName: 'Sneha Gupta',
    tutorAvatar: 'https://i.pravatar.cc/150?img=48',
    tutorRating: 4.6,
    skill: 'UI/UX Design',
    topic: 'Figma Masterclass — Prototyping & Design Systems',
    scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    durationMins: 60,
    mode: 'live',
    status: 'upcoming',
    xpReward: 130,
    meetLink: 'https://meet.google.com/figma-session',
    price: 'free',
  },
];

const YOUTUBE_VIDEOS: YouTubeVideo[] = [
  {
    id: 'yt1',
    title: 'React JS Full Course 2024 — Build Modern Web Apps',
    channelName: 'Traversy Media',
    channelAvatar: 'https://i.pravatar.cc/150?img=11',
    thumbnail: 'https://img.youtube.com/vi/LDB4uaJ87e0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=LDB4uaJ87e0',
    duration: '8:24:15',
    views: '3.2M',
    category: 'Web Development',
    xpOnWatch: 20,
    xpOnComplete: 100,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: 'yt2',
    title: 'Python for Beginners — Full Course in 12 Hours',
    channelName: 'freeCodeCamp',
    channelAvatar: 'https://i.pravatar.cc/150?img=22',
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    duration: '4:26:51',
    views: '52M',
    category: 'Programming',
    xpOnWatch: 20,
    xpOnComplete: 100,
    watched: true,
    completed: false,
    progress: 45,
    tags: ['Python', 'Programming', 'Beginner'],
  },
  {
    id: 'yt3',
    title: 'Machine Learning with Python — Complete Bootcamp',
    channelName: 'Sentdex',
    channelAvatar: 'https://i.pravatar.cc/150?img=33',
    thumbnail: 'https://img.youtube.com/vi/OGxgnH8y2NM/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=OGxgnH8y2NM',
    duration: '5:18:30',
    views: '4.1M',
    category: 'AI & ML',
    xpOnWatch: 25,
    xpOnComplete: 150,
    watched: true,
    completed: true,
    progress: 100,
    tags: ['ML', 'Python', 'AI'],
  },
  {
    id: 'yt4',
    title: 'System Design Interview — Top 10 Concepts',
    channelName: 'Tech Dummies',
    channelAvatar: 'https://i.pravatar.cc/150?img=44',
    thumbnail: 'https://img.youtube.com/vi/xpDnVSmNFX0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX0',
    duration: '2:45:10',
    views: '2.8M',
    category: 'System Design',
    xpOnWatch: 20,
    xpOnComplete: 120,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['System Design', 'Interview', 'Architecture'],
  },
  {
    id: 'yt5',
    title: 'DSA Complete Course — Arrays to Advanced Graphs',
    channelName: 'Love Babbar',
    channelAvatar: 'https://i.pravatar.cc/150?img=55',
    thumbnail: 'https://img.youtube.com/vi/WQoB2z67hvY/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=WQoB2z67hvY',
    duration: '6:30:00',
    views: '7.5M',
    category: 'DSA',
    xpOnWatch: 25,
    xpOnComplete: 150,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['DSA', 'Algorithms', 'Competitive'],
  },
  {
    id: 'yt6',
    title: 'Next.js 14 Full Course — App Router & Server Components',
    channelName: 'Fireship',
    channelAvatar: 'https://i.pravatar.cc/150?img=66',
    thumbnail: 'https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    duration: '1:28:00',
    views: '1.9M',
    category: 'Web Development',
    xpOnWatch: 20,
    xpOnComplete: 80,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['Next.js', 'React', 'TypeScript'],
  },
  {
    id: 'yt7',
    title: 'Git & GitHub — Complete Tutorial for Beginners to Pro',
    channelName: 'Kunal Kushwaha',
    channelAvatar: 'https://i.pravatar.cc/150?img=77',
    thumbnail: 'https://img.youtube.com/vi/apGV9Kg7ics/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=apGV9Kg7ics',
    duration: '6:42:00',
    views: '3.4M',
    category: 'DevOps',
    xpOnWatch: 20,
    xpOnComplete: 100,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['Git', 'GitHub', 'Version Control'],
  },
  {
    id: 'yt8',
    title: 'Tailwind CSS Full Course — Modern UI in Hours',
    channelName: 'Kevin Powell',
    channelAvatar: 'https://i.pravatar.cc/150?img=88',
    thumbnail: 'https://img.youtube.com/vi/lCxcTsOHrjo/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=lCxcTsOHrjo',
    duration: '3:15:22',
    views: '1.1M',
    category: 'Web Development',
    xpOnWatch: 15,
    xpOnComplete: 75,
    watched: false,
    completed: false,
    progress: 0,
    tags: ['CSS', 'Tailwind', 'Design'],
  },
];

const XP_REWARDS: XPReward[] = [
  { id: 'xp1', title: '⚡ XP Booster — 2× for 24h', description: 'Double all XP earned for the next 24 hours. Stack with streaks!', icon: '⚡', xpCost: 300, category: 'boosts', tier: 'rare', redeemed: false, available: true },
  { id: 'xp2', title: '🏅 Gold Supporter Badge', description: 'Exclusive Gold Supporter badge displayed on your profile & leaderboard.', icon: '🏅', xpCost: 500, category: 'badges', tier: 'epic', redeemed: false, available: true },
  { id: 'xp3', title: '☕ Buy Coffee for Tutor', description: 'Send an appreciation token to your favorite tutor — they love it!', icon: '☕', xpCost: 200, category: 'social', tier: 'common', redeemed: false, available: true },
  { id: 'xp4', title: '🗺️ Premium AI Roadmap', description: 'Get a personalized 12-week AI-generated skill roadmap for any topic.', icon: '🗺️', xpCost: 400, category: 'perks', tier: 'epic', redeemed: false, available: true },
  { id: 'xp5', title: '🌟 Profile Spotlight (1 week)', description: 'Feature your profile on the SkillQuest homepage for 7 days.', icon: '🌟', xpCost: 800, category: 'social', tier: 'legendary', redeemed: false, available: true, limitedTime: true, expiresIn: '3 days' },
  { id: 'xp6', title: '🛡️ Streak Freeze (3 days)', description: 'Protect your streak for 3 days — perfect for busy exam weeks.', icon: '🛡️', xpCost: 150, category: 'perks', tier: 'common', redeemed: false, available: true },
  { id: 'xp7', title: '💎 Diamond Coder Badge', description: 'The rarest badge in SkillQuest. Only 50 exist. Flex it forever.', icon: '💎', xpCost: 2000, category: 'badges', tier: 'legendary', redeemed: false, available: true, limitedTime: true, expiresIn: '7 days' },
  { id: 'xp8', title: '🤝 Study Buddy Matching', description: 'Get AI-matched with the perfect study partner for your goal skill.', icon: '🤝', xpCost: 100, category: 'perks', tier: 'common', redeemed: false, available: true },
];

const REFERRAL_LIST: ReferralEntry[] = [
  { id: 'ref1', friendName: 'Rohan Verma', friendAvatar: 'https://i.pravatar.cc/150?img=15', joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(), xpEarned: 200, status: 'active' },
  { id: 'ref2', friendName: 'Anjali Kapoor', friendAvatar: 'https://i.pravatar.cc/150?img=25', joinedAt: new Date(Date.now() - 2 * 86400000).toISOString(), xpEarned: 200, status: 'active' },
  { id: 'ref3', friendName: 'Dev Sharma', friendAvatar: 'https://i.pravatar.cc/150?img=60', joinedAt: new Date(Date.now() - 0.5 * 86400000).toISOString(), xpEarned: 0, status: 'joined' },
];

// ─── Helpers ──────────────────────────────────────────────────

function formatTimeFromNow(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff < 0) return 'Ended';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

function tierGradient(tier: XPReward['tier']): string {
  const m: Record<string, string> = { common: 'from-slate-400 to-slate-500', rare: 'from-blue-400 to-blue-600', epic: 'from-purple-400 to-purple-600', legendary: 'from-amber-400 to-orange-500' };
  return m[tier] || m.common;
}
function tierBorder(tier: XPReward['tier']): string {
  const m: Record<string, string> = { common: 'border-slate-500/30', rare: 'border-blue-400/40', epic: 'border-purple-400/40', legendary: 'border-amber-400/50' };
  return m[tier] || m.common;
}
function tierBadge(tier: XPReward['tier']): string {
  const m: Record<string, string> = { common: 'bg-slate-500/20 text-slate-300', rare: 'bg-blue-500/20 text-blue-300', epic: 'bg-purple-500/20 text-purple-300', legendary: 'bg-amber-500/20 text-amber-300' };
  return m[tier] || m.common;
}

// ─── Props ────────────────────────────────────────────────────

export interface TutorHubViewProps {
  currentUser: User | null;
  onGainXP: (amount: number, message: string) => void;
  isDarkMode?: boolean;
}

// ─── Main Component ───────────────────────────────────────────

export const TutorHubView: React.FC<TutorHubViewProps> = ({
  currentUser,
  onGainXP,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'videos' | 'store' | 'refer'>('sessions');
  const dark = isDarkMode;

  const tabs = [
    { id: 'sessions' as const, label: 'Online Sessions', icon: Video },
    { id: 'videos'   as const, label: 'YouTube Learn',   icon: Youtube },
    { id: 'store'    as const, label: 'XP Store',         icon: ShoppingBag },
    { id: 'refer'    as const, label: 'Refer & Earn',     icon: Users },
  ];

  return (
    <div className={`min-h-screen pb-20 transition-colors ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* ── Header ── */}
      <div className={`sticky top-0 z-20 border-b backdrop-blur-lg ${dark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </span>
                Tutor Hub
              </h1>
              <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Learn, earn XP, and grow with your campus community
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${dark ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200'}`}>
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className={`text-sm font-medium ${dark ? 'text-violet-300' : 'text-violet-700'}`}>
                {(currentUser?.xp ?? 0).toLocaleString()} XP
              </span>
              <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>available</span>
            </div>
          </div>
          <div className="flex gap-0.5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                    active ? 'border-violet-500 text-violet-400' : `border-transparent ${dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'sessions' && <OnlineSessionsTab dark={dark} currentUser={currentUser} onGainXP={onGainXP} />}
        {activeTab === 'videos'   && <YouTubeTab dark={dark} currentUser={currentUser} onGainXP={onGainXP} />}
        {activeTab === 'store'    && <XPStoreTab dark={dark} currentUser={currentUser} onGainXP={onGainXP} />}
        {activeTab === 'refer'    && <ReferEarnTab dark={dark} currentUser={currentUser} onGainXP={onGainXP} />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  TAB 1: Online Sessions
// ─────────────────────────────────────────────────────────────

interface TabProps { dark: boolean; currentUser: User | null; onGainXP: (amount: number, message: string) => void; }

const OnlineSessionsTab: React.FC<TabProps> = ({ dark, currentUser: _cu, onGainXP }) => {
  const [sessions, setSessions] = useState<TutorSession[]>(TUTOR_SESSIONS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live_now' | 'upcoming' | 'completed'>('all');
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set());
  const [showHostModal, setShowHostModal] = useState(false);

  const filtered = filterStatus === 'all' ? sessions : sessions.filter(s => s.status === filterStatus);
  const liveCount = sessions.filter(s => s.status === 'live_now').length;

  const handleJoin = (session: TutorSession) => {
    if (joinedSessions.has(session.id)) return;
    setJoinedSessions(prev => new Set([...prev, session.id]));
    onGainXP(session.xpReward, `Joined "${session.skill}" session! +${session.xpReward} XP`);
    if (session.meetLink) window.open(session.meetLink, '_blank', 'noopener,noreferrer');
  };

  const xpFromSessions = [...joinedSessions].reduce((acc, id) => {
    const s = sessions.find(x => x.id === id);
    return acc + (s?.xpReward || 0);
  }, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Live Now', value: liveCount, icon: '🔴', color: 'text-red-400' },
          { label: 'Upcoming Today', value: sessions.filter(s => s.status === 'upcoming').length, icon: '📅', color: 'text-blue-400' },
          { label: 'Sessions Joined', value: joinedSessions.size, icon: '✅', color: 'text-green-400' },
          { label: 'XP from Sessions', value: xpFromSessions, icon: '⚡', color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl p-4 border ${dark ? 'bg-slate-900/70 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Host */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'live_now', 'upcoming', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === f ? 'bg-violet-600 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {f === 'live_now' ? '🔴 Live Now' : f === 'all' ? 'All' : f === 'upcoming' ? '📅 Upcoming' : '✅ Completed'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowHostModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-900/30">
          <Plus className="w-4 h-4" /> Host a Session
        </button>
      </div>

      {/* Session Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map(session => {
          const joined = joinedSessions.has(session.id);
          const isLive = session.status === 'live_now';
          const isDone = session.status === 'completed';
          return (
            <div key={session.id} className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:scale-[1.01] ${
              dark ? 'bg-slate-900/70 border-slate-700/60 hover:border-violet-500/40' : 'bg-white border-slate-200 hover:border-violet-300'
            } ${isLive ? (dark ? 'border-red-500/40 shadow-red-900/20 shadow-lg' : 'border-red-300') : ''}`}>
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img src={session.tutorAvatar} alt={session.tutorName} className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-500/30" />
                  {isLive && <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{session.tutorName}</span>
                    <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" />{session.tutorRating}</span>
                    {isLive && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wide animate-pulse">🔴 LIVE</span>}
                    {isDone && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">✅ Done</span>}
                  </div>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{session.skill} Tutor</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-bold">
                  <Zap className="w-3 h-3" />+{session.xpReward} XP
                </div>
              </div>
              <div>
                <p className={`font-medium text-sm leading-snug ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{session.topic}</p>
                <div className={`flex items-center gap-3 mt-1.5 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.durationMins} min</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{isLive ? 'Happening now!' : isDone ? 'Completed' : formatTimeFromNow(session.scheduledAt)}</span>
                </div>
              </div>
              <button onClick={() => handleJoin(session)} disabled={joined || isDone}
                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  joined || isDone
                    ? dark ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
                    : isLive
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg shadow-red-900/30'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/30'
                }`}>
                {joined ? <><CheckCircle2 className="w-4 h-4" /> Joined</> : isDone ? <>Watch Recording</> : isLive ? <><PlayCircle className="w-4 h-4" /> Join Live Now</> : <><Calendar className="w-4 h-4" /> Reserve Seat</>}
              </button>
            </div>
          );
        })}
      </div>

      {showHostModal && (
        <HostSessionModal dark={dark} onClose={() => setShowHostModal(false)}
          onHost={(s) => { setSessions(prev => [s, ...prev]); setShowHostModal(false); onGainXP(100, 'Session created! +100 XP for hosting!'); }} />
      )}
    </div>
  );
};

// ─── Host Session Modal ────────────────────────────────────────
const HostSessionModal: React.FC<{ dark: boolean; onClose: () => void; onHost: (s: TutorSession) => void }> = ({ dark, onClose, onHost }) => {
  const [skill, setSkill] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !topic || !time) return;
    onHost({ id: `ts-${Date.now()}`, tutorName: 'You (Host)', tutorAvatar: 'https://i.pravatar.cc/150?img=99', tutorRating: 5.0, skill, topic, scheduledAt: new Date(time).toISOString(), durationMins: duration, mode: 'live', status: 'upcoming', xpReward: 120, meetLink: 'https://meet.google.com/new', price: 'free' });
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-violet-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-400'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl border p-6 ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-2xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-lg font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>🎙️ Host an Online Session</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Skill Topic</label>
            <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. React, Python, DSA..." required className={inputCls} />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Session Title</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. React Hooks Deep Dive" required className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputCls}>
                {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Date & Time</label>
              <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} required className={inputCls} />
            </div>
          </div>
          <div className={`p-3 rounded-xl text-sm ${dark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-700'}`}>
            💡 Hosting earns you <strong>+100 XP</strong> and builds your tutor reputation!
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-purple-500 transition-all">Create Session</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  TAB 2: YouTube Learning
// ─────────────────────────────────────────────────────────────

const YouTubeTab: React.FC<TabProps> = ({ dark, currentUser: _cu, onGainXP }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>(YOUTUBE_VIDEOS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [totalXPEarned, setTotalXPEarned] = useState(
    YOUTUBE_VIDEOS.filter(v => v.completed).reduce((acc, v) => acc + v.xpOnComplete, 0) +
    YOUTUBE_VIDEOS.filter(v => v.watched && !v.completed).reduce((acc, v) => acc + v.xpOnWatch, 0)
  );

  const categories = ['All', ...Array.from(new Set(YOUTUBE_VIDEOS.map(v => v.category)))];

  const filtered = videos.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.channelName.toLowerCase().includes(search.toLowerCase()) ||
      v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleWatch = (video: YouTubeVideo) => {
    if (!video.watched) {
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, watched: true, progress: 10 } : v));
      setTotalXPEarned(prev => prev + video.xpOnWatch);
      onGainXP(video.xpOnWatch, `Started "${video.title.slice(0, 30)}…" +${video.xpOnWatch} XP`);
    }
    setPlayingVideo(videos.find(v => v.id === video.id) ?? video);
  };

  const handleMarkComplete = (video: YouTubeVideo) => {
    if (video.completed) return;
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, completed: true, progress: 100 } : v));
    setTotalXPEarned(prev => prev + video.xpOnComplete);
    onGainXP(video.xpOnComplete, `Completed "${video.title.slice(0, 30)}…" +${video.xpOnComplete} XP 🎉`);
    setPlayingVideo(null);
  };

  return (
    <div>
      {/* Banner */}
      <div className={`rounded-2xl p-5 mb-6 border ${dark ? 'bg-gradient-to-r from-red-950/40 to-orange-950/30 border-red-800/30' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Youtube className="w-5 h-5 text-red-400" />
              <span className={`font-bold text-lg ${dark ? 'text-slate-100' : 'text-slate-800'}`}>YouTube Learning</span>
            </div>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Watch videos to earn XP — <strong>+20 XP</strong> on start, <strong>+100 XP</strong> on completion!
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Completed', value: videos.filter(v => v.completed).length, color: 'text-emerald-400' },
              { label: 'In Progress', value: videos.filter(v => v.watched && !v.completed).length, color: 'text-blue-400' },
              { label: 'XP Earned', value: totalXPEarned, color: 'text-violet-400' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className={`flex-1 min-w-48 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <Search className={`w-4 h-4 shrink-0 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos, channels, topics..." className={`bg-transparent text-sm outline-none flex-1 ${dark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-700 placeholder-slate-400'}`} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat ? 'bg-red-500/20 text-red-400 border border-red-500/30' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}>{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(video => (
          <VideoCard key={video.id} video={video} dark={dark}
            onWatch={() => handleWatch(video)}
            onMarkComplete={() => handleMarkComplete(video)} />
        ))}
      </div>

      {playingVideo && (
        <VideoPlayerModal video={playingVideo} dark={dark}
          onClose={() => setPlayingVideo(null)}
          onMarkComplete={() => handleMarkComplete(playingVideo)} />
      )}
    </div>
  );
};

const VideoCard: React.FC<{ video: YouTubeVideo; dark: boolean; onWatch: () => void; onMarkComplete: () => void }> = ({ video, dark, onWatch, onMarkComplete }) => (
  <div className={`rounded-2xl border overflow-hidden flex flex-col transition-all hover:scale-[1.01] hover:shadow-lg ${dark ? 'bg-slate-900/70 border-slate-700/60 hover:border-red-500/30' : 'bg-white border-slate-200 hover:border-red-300'}`}>
    <div className="relative aspect-video bg-slate-800 overflow-hidden group cursor-pointer" onClick={onWatch}>
      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/320/180`; }} />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"><PlayCircle className="w-7 h-7 text-red-600" /></div>
      </div>
      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">{video.duration}</span>
      {video.completed && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">✓ Completed</span>}
      {video.watched && !video.completed && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">In Progress</span>}
    </div>
    {video.watched && (
      <div className={`h-1 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div className={`h-full rounded-full transition-all ${video.completed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${video.progress}%` }} />
      </div>
    )}
    <div className="p-4 flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <img src={video.channelAvatar} alt={video.channelName} className="w-5 h-5 rounded-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=1'; }} />
        <span className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{video.channelName}</span>
        <span className={`text-xs ml-auto ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{video.views} views</span>
      </div>
      <h3 className={`text-sm font-semibold leading-snug line-clamp-2 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{video.title}</h3>
      <div className="flex flex-wrap gap-1 mt-auto pt-1">
        {video.tags.slice(0, 3).map(tag => <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>)}
      </div>
      <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        <span className="flex items-center gap-0.5 text-blue-400"><Zap className="w-3 h-3" />+{video.xpOnWatch} start</span>
        <span className="flex items-center gap-0.5 text-violet-400"><Award className="w-3 h-3" />+{video.xpOnComplete} complete</span>
      </div>
      <div className="flex gap-2 mt-1">
        <button onClick={onWatch} className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
          video.completed ? dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white'
        }`}>
          <PlayCircle className="w-3.5 h-3.5" />{video.watched ? 'Continue' : `Watch (+${video.xpOnWatch} XP)`}
        </button>
        {video.watched && !video.completed && (
          <button onClick={onMarkComplete} className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all">
            <Check className="w-3.5 h-3.5" />Done (+{video.xpOnComplete} XP)
          </button>
        )}
      </div>
    </div>
  </div>
);

const VideoPlayerModal: React.FC<{ video: YouTubeVideo; dark: boolean; onClose: () => void; onMarkComplete: () => void }> = ({ video, dark, onClose, onMarkComplete }) => {
  const videoId = video.videoUrl.split('v=')[1]?.split('&')[0] || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-3xl rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-2xl`}>
        <div className={`flex items-center justify-between p-4 border-b ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 min-w-0">
            <Youtube className="w-5 h-5 text-red-500 shrink-0" />
            <span className={`font-semibold text-sm truncate ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{video.title}</span>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ml-2 shrink-0 ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X className="w-4 h-4" /></button>
        </div>
        <div className="aspect-video bg-black">
          <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title={video.title} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
        <div className={`p-4 flex flex-wrap items-center justify-between gap-3 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
          <div>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>By <span className="font-medium">{video.channelName}</span> · {video.duration} · {video.views} views</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-blue-400 flex items-center gap-0.5"><Zap className="w-3 h-3" />+{video.xpOnWatch} XP watching</span>
              <span className="text-xs text-violet-400 flex items-center gap-0.5"><Award className="w-3 h-3" />+{video.xpOnComplete} XP on completion</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <ExternalLink className="w-3.5 h-3.5" /> YouTube
            </a>
            {!video.completed && (
              <button onClick={onMarkComplete} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete (+{video.xpOnComplete} XP)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  TAB 3: XP Store
// ─────────────────────────────────────────────────────────────

const XPStoreTab: React.FC<TabProps> = ({ dark, currentUser, onGainXP }) => {
  const [rewards, setRewards] = useState<XPReward[]>(XP_REWARDS);
  const [filterCat, setFilterCat] = useState<'all' | XPReward['category']>('all');
  const [confirmReward, setConfirmReward] = useState<XPReward | null>(null);
  const [spentXP, setSpentXP] = useState(0);

  const userXP = (currentUser?.xp ?? 0) - spentXP;
  const cats = [
    { id: 'all' as const, label: 'All Rewards' },
    { id: 'boosts' as const, label: '⚡ Boosts' },
    { id: 'badges' as const, label: '🏅 Badges' },
    { id: 'perks' as const, label: '🔓 Perks' },
    { id: 'social' as const, label: '🌐 Social' },
  ];

  const filtered = filterCat === 'all' ? rewards : rewards.filter(r => r.category === filterCat);

  const handleRedeem = (reward: XPReward) => {
    if (userXP < reward.xpCost || reward.redeemed) return;
    setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, redeemed: true } : r));
    setSpentXP(prev => prev + reward.xpCost);
    setConfirmReward(null);
    onGainXP(-reward.xpCost, `Redeemed: ${reward.title}!`);
  };

  return (
    <div>
      {/* XP Balance Hero */}
      <div className={`rounded-2xl p-6 mb-6 border relative overflow-hidden ${dark ? 'bg-gradient-to-br from-violet-950/60 to-purple-950/40 border-violet-800/40' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'}`}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className={`text-sm font-medium mb-1 ${dark ? 'text-violet-300' : 'text-violet-600'}`}>Your XP Balance</p>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{userXP.toLocaleString()}</span>
              <span className={`text-lg font-semibold mb-1.5 ${dark ? 'text-violet-400' : 'text-violet-500'}`}>XP</span>
            </div>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Earn XP by watching videos, completing quests & referring friends!</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${dark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <Trophy className="w-3.5 h-3.5" />Level {currentUser?.level ?? 1}
            </div>
            <div className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{rewards.filter(r => r.redeemed).length} items redeemed</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {cats.map(cat => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCat === cat.id ? 'bg-violet-600 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>{cat.label}
          </button>
        ))}
      </div>

      {/* Reward Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(reward => {
          const canAfford = userXP >= reward.xpCost;
          return (
            <div key={reward.id} className={`rounded-2xl border p-5 flex flex-col gap-3 relative overflow-hidden transition-all ${
              reward.redeemed ? dark ? 'opacity-60 bg-slate-900/50 border-slate-700/40' : 'opacity-60 bg-slate-50 border-slate-200'
              : dark ? `bg-slate-900/70 ${tierBorder(reward.tier)} hover:scale-[1.02] cursor-pointer` : `bg-white ${tierBorder(reward.tier)} hover:scale-[1.02] cursor-pointer`
            }`}>
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${tierGradient(reward.tier)} opacity-10 blur-2xl`} />
              <div className="flex items-start justify-between relative">
                <span className="text-3xl">{reward.icon}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tierBadge(reward.tier)}`}>{reward.tier}</span>
                  {reward.limitedTime && reward.expiresIn && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">⏳ {reward.expiresIn}</span>}
                </div>
              </div>
              <div>
                <h3 className={`font-bold text-sm ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{reward.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{reward.description}</p>
              </div>
              <div className="mt-auto">
                <div className={`flex items-center justify-between mb-2.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className={`text-lg font-black flex items-center gap-1 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                    <Sparkles className="w-4 h-4 text-violet-400" />{reward.xpCost.toLocaleString()} XP
                  </span>
                  {!canAfford && !reward.redeemed && <span className="flex items-center gap-1 text-xs text-red-400"><Lock className="w-3 h-3" />{(reward.xpCost - userXP).toLocaleString()} more</span>}
                </div>
                <button onClick={() => !reward.redeemed && canAfford && setConfirmReward(reward)} disabled={!canAfford || reward.redeemed}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    reward.redeemed ? dark ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
                    : canAfford ? `bg-gradient-to-r ${tierGradient(reward.tier)} text-white hover:opacity-90 shadow-lg`
                    : dark ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}>
                  {reward.redeemed ? <><CheckCircle2 className="w-4 h-4" /> Redeemed</> : canAfford ? <><Unlock className="w-4 h-4" /> Redeem Now</> : <><Lock className="w-4 h-4" /> Not enough XP</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 text-center ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-2xl`}>
            <div className="text-5xl mb-3">{confirmReward.icon}</div>
            <h3 className={`font-bold text-lg mb-1 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{confirmReward.title}</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{confirmReward.description}</p>
            <div className={`p-3 rounded-xl mb-4 ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Spend <strong className="text-violet-400">{confirmReward.xpCost.toLocaleString()} XP</strong>?</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Remaining: {(userXP - confirmReward.xpCost).toLocaleString()} XP</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReward(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
              <button onClick={() => handleRedeem(confirmReward)} className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${tierGradient(confirmReward.tier)} text-white text-sm font-semibold hover:opacity-90 transition-all`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  TAB 4: Refer & Earn
// ─────────────────────────────────────────────────────────────

const ReferEarnTab: React.FC<TabProps> = ({ dark, currentUser, onGainXP }) => {
  const [referrals] = useState<ReferralEntry[]>(REFERRAL_LIST);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const referralCode = `SQST-${(currentUser?.id || 'DEMO').slice(-6).toUpperCase()}`;
  const referralLink = `https://skillquest.app/join?ref=${referralCode}`;
  const activeReferrals = referrals.filter(r => r.status === 'active').length;
  const totalXPFromReferrals = referrals.filter(r => r.status === 'active').reduce((acc, r) => acc + r.xpEarned, 0);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(referralLink); } catch { inputRef.current?.select(); document.execCommand('copy'); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
    onGainXP(25, `Invite sent to ${emailInput}! +25 XP`);
    setEmailInput('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className={`rounded-2xl p-6 border relative overflow-hidden ${dark ? 'bg-gradient-to-br from-emerald-950/50 to-teal-950/40 border-emerald-800/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-800'}`}>
                <UserPlus className="w-5 h-5 text-emerald-400" />Refer Friends, Earn XP!
              </h2>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Share SkillQuest and earn XP for every friend that joins and completes their first session.</p>
            </div>
            <div className={`text-center px-4 py-2 rounded-xl ${dark ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-200'}`}>
              <div className={`text-2xl font-black ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>+200 XP</div>
              <div className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>per active friend</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', icon: '🔗', label: 'Share your link', desc: 'Copy & share' },
              { step: '2', icon: '👋', label: 'Friend joins', desc: '+50 XP instantly' },
              { step: '3', icon: '🚀', label: 'They learn', desc: '+150 XP bonus' },
            ].map(s => (
              <div key={s.step} className={`text-center p-3 rounded-xl ${dark ? 'bg-slate-900/60' : 'bg-white/70'}`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>Step {s.step}</div>
                <div className={`text-xs font-semibold mt-0.5 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{s.label}</div>
                <div className={`text-[10px] mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className={`rounded-2xl p-5 border ${dark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-3 text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>🔗 Your Unique Referral Link</h3>
        <div className="flex gap-2">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${dark ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
            <Link className={`w-4 h-4 shrink-0 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input ref={inputRef} readOnly value={referralLink} className={`bg-transparent text-sm flex-1 outline-none min-w-0 ${dark ? 'text-slate-300' : 'text-slate-600'}`} />
          </div>
          <button onClick={handleCopy} className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all ${
            copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
          }`}>
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <div className={`flex items-center gap-2 mt-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="text-xs">Referral code:</span>
          <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${dark ? 'bg-slate-800 text-violet-400' : 'bg-slate-100 text-violet-600'}`}>{referralCode}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join SkillQuest! ${referralLink}`)}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all">
            <Share2 className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on SkillQuest! ${referralLink}`)}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all">
            <Share2 className="w-3.5 h-3.5" /> Twitter/X
          </button>
          <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition-all">
            <Send className="w-3.5 h-3.5" /> Telegram
          </button>
        </div>
      </div>

      {/* Email Invite */}
      <div className={`rounded-2xl p-5 border ${dark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-3 text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>📧 Invite via Email</h3>
        <form onSubmit={handleSendEmail} className="flex gap-2">
          <input value={emailInput} onChange={e => setEmailInput(e.target.value)} type="email" placeholder="friend@college.edu" className={`flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
            dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-violet-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-400'
          }`} />
          <button type="submit" className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all ${
            emailSent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
          }`}>
            {emailSent ? <><Check className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Invite</>}
          </button>
        </form>
        <p className={`text-xs mt-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Earn +25 XP for every invite, +200 XP when your friend is active!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Referred', value: referrals.length, icon: '👥', color: 'text-blue-400' },
          { label: 'Active Friends', value: activeReferrals, icon: '🟢', color: 'text-emerald-400' },
          { label: 'XP Earned', value: totalXPFromReferrals, icon: '⚡', color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl p-4 border text-center ${dark ? 'bg-slate-900/70 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Referral History */}
      <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <h3 className={`font-semibold text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>📋 Referral History</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{referrals.length} friends</span>
        </div>
        <div className={`divide-y ${dark ? 'divide-slate-700/30' : 'divide-slate-100'}`}>
          {referrals.map(ref => (
            <div key={ref.id} className={`px-5 py-4 flex items-center gap-3 ${dark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
              <img src={ref.friendAvatar} alt={ref.friendName} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20"
                onError={e => { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=10'; }} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{ref.friendName}</p>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Joined {new Date(ref.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                {ref.status === 'active' && <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><Zap className="w-3 h-3" />+{ref.xpEarned} XP</span>}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  ref.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : ref.status === 'joined' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {ref.status === 'active' ? '✅ Active' : ref.status === 'joined' ? '👋 Joined' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-4 text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>🏆 Referral Milestone Rewards</h3>
        <div className="space-y-3">
          {[
            { count: 1, xp: 200,  label: 'First Friend',      emoji: '🌱' },
            { count: 3, xp: 500,  label: 'Campus Connector',  emoji: '🔗' },
            { count: 5, xp: 1000, label: 'Community Builder', emoji: '🏙️' },
            { count: 10, xp: 2500, label: 'Campus Legend',    emoji: '🌟' },
          ].map(m => {
            const unlocked = activeReferrals >= m.count;
            return (
              <div key={m.count} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                unlocked ? dark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                : dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{m.label}</p>
                  <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Refer {m.count} active {m.count === 1 ? 'friend' : 'friends'}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${unlocked ? 'text-emerald-400' : dark ? 'text-slate-500' : 'text-slate-400'}`}>+{m.xp.toLocaleString()} XP</div>
                  <div className={`text-[10px] ${unlocked ? 'text-emerald-400' : dark ? 'text-slate-500' : 'text-slate-400'}`}>{unlocked ? '✅ Earned!' : `${activeReferrals}/${m.count}`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── end of TutorHubView ─────────────────────────────────────

