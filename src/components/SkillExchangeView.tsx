import React, { useState } from 'react';
import {
  Repeat,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Star,
  Users,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Send,
  Award,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { SkillExchange, User } from '../types';

interface SkillExchangeViewProps {
  exchanges: SkillExchange[];
  currentUser: User;
  onOpenExchangeModal: () => void;
  onAcceptExchange: (exchangeId: string) => void;
  onDeclineExchange: (exchangeId: string) => void;
  onToggleMilestone: (exchangeId: string, milestoneId: string, completed: boolean) => void;
  onAddNote: (exchangeId: string, note: string) => void;
  onOpenReviewModal: (exchange: SkillExchange) => void;
  onOpenAIMentor: (skillName?: string) => void;
}

export const SkillExchangeView: React.FC<SkillExchangeViewProps> = ({
  exchanges,
  currentUser,
  onOpenExchangeModal,
  onAcceptExchange,
  onDeclineExchange,
  onToggleMilestone,
  onAddNote,
  onOpenReviewModal,
  onOpenAIMentor,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'incoming' | 'sent' | 'completed'>('active');
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Segregate exchanges
  const userExchanges = exchanges.filter(
    (e) => e.fromUserId === currentUser.id || e.toUserId === currentUser.id
  );

  const activeSessions = userExchanges.filter(
    (e) => e.status === 'in_progress' || e.status === 'accepted'
  );

  const incomingRequests = userExchanges.filter(
    (e) => e.toUserId === currentUser.id && e.status === 'pending'
  );

  const sentRequests = userExchanges.filter(
    (e) => e.fromUserId === currentUser.id && e.status === 'pending'
  );

  const completedExchanges = userExchanges.filter((e) => e.status === 'completed');

  // Currently focused exchange for session room details
  const currentFocusedExchange =
    userExchanges.find((e) => e.id === selectedExchangeId) || activeSessions[0] || userExchanges[0];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentFocusedExchange) return;
    onAddNote(currentFocusedExchange.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Repeat className="w-4 h-4" />
            <span>Non-Monetary P2P Learning Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Peer Skill Exchange Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Teach what you master, learn what you crave. Track collaborative sessions, milestones, meeting links, and earn XP together.
          </p>
        </div>

        <button
          onClick={onOpenExchangeModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Skill Exchange Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>Active Sessions</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950/50 text-[10px]">
            {activeSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'incoming'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>Incoming Requests</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sent'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>Sent Proposals</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950/50 text-[10px]">
            {sentRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>Completed History</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950/50 text-[10px]">
            {completedExchanges.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* List of Active Sessions (1 col) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Ongoing Partnerships ({activeSessions.length})
            </h3>

            {activeSessions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center">
                <p className="text-xs text-slate-400">No ongoing active exchanges.</p>
                <button
                  onClick={onOpenExchangeModal}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  Propose an Exchange
                </button>
              </div>
            ) : (
              activeSessions.map((exc) => {
                const isRequester = exc.fromUserId === currentUser.id;
                const peerName = isRequester ? exc.toUserName : exc.fromUserName;
                const peerAvatar = isRequester ? exc.toUserAvatar : exc.fromUserAvatar;
                const isSelected = currentFocusedExchange?.id === exc.id;

                return (
                  <div
                    key={exc.id}
                    onClick={() => setSelectedExchangeId(exc.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={peerAvatar} alt={peerName} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{exc.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">With {peerName}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="text-indigo-400 font-semibold">{exc.skillOffered} ⇄ {exc.skillRequested}</span>
                      <span className="text-emerald-400 font-bold">In Progress</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed Collaborative Workspace Session Room (2 cols) */}
          <div className="lg:col-span-2">
            {currentFocusedExchange ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                
                {/* Session Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      Live Collaborative Session
                    </span>
                    <h2 className="text-xl font-black text-slate-100 mt-2">
                      {currentFocusedExchange.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Exchange between <strong className="text-slate-200">{currentFocusedExchange.fromUserName}</strong> ({currentFocusedExchange.fromUserCollege}) and <strong className="text-slate-200">{currentFocusedExchange.toUserName}</strong> ({currentFocusedExchange.toUserCollege})
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {currentFocusedExchange.meetLink && (
                      <a
                        href={currentFocusedExchange.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                    )}

                    <button
                      onClick={() => onOpenReviewModal(currentFocusedExchange)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Rate Peer (+200 XP)</span>
                    </button>
                  </div>
                </div>

                {/* Skill Synergy Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Taught by {currentFocusedExchange.fromUserName}:</p>
                    <p className="text-sm font-bold text-indigo-300 mt-0.5">{currentFocusedExchange.skillOffered}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Taught by {currentFocusedExchange.toUserName}:</p>
                    <p className="text-sm font-bold text-violet-300 mt-0.5">{currentFocusedExchange.skillRequested}</p>
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Learning Milestones Checklist</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {currentFocusedExchange.milestones.filter((m) => m.completed).length}/
                      {currentFocusedExchange.milestones.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentFocusedExchange.milestones.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          m.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200 line-through opacity-80'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={(e) => onToggleMilestone(currentFocusedExchange.id, m.id, e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                        />
                        <span className="text-xs font-medium">{m.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shared Peer Notes & Scratchpad */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Shared Session Notes & Peer Scratchpad</span>
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    {currentFocusedExchange.sessionNotes && currentFocusedExchange.sessionNotes.length > 0 ? (
                      currentFocusedExchange.sessionNotes.map((note, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300">
                          {note}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No notes logged yet. Use the input below to save meeting notes, code links or homework tasks.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddNoteSubmit} className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a session note, GitHub repo URL, or problem link..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p>Select an active session from the left to view the workspace.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Incoming Requests Tab */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold">No pending incoming exchange requests.</p>
              <p className="text-xs text-slate-500 mt-1">
                Peers interested in your teaching skills will propose exchanges here.
              </p>
            </div>
          ) : (
            incomingRequests.map((exc) => (
              <div
                key={exc.id}
                className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img src={exc.fromUserAvatar} alt={exc.fromUserName} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{exc.fromUserName}</h3>
                      <span className="text-xs text-slate-400">({exc.fromUserCollege})</span>
                    </div>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">Proposal: {exc.title}</p>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-w-xl italic">
                      "{exc.message}"
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        They offer to teach: <strong>{exc.skillOffered}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300">
                        They want to learn: <strong>{exc.skillRequested}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => onAcceptExchange(exc.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Proposal</span>
                  </button>
                  <button
                    onClick={() => onDeclineExchange(exc.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent Proposals Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
              <p className="text-sm font-semibold">You have not sent any pending proposals.</p>
              <button
                onClick={onOpenExchangeModal}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Send a Proposal to a Peer
              </button>
            </div>
          ) : (
            sentRequests.map((exc) => (
              <div
                key={exc.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img src={exc.toUserAvatar} alt={exc.toUserName} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">To: {exc.toUserName} ({exc.toUserCollege})</h4>
                    <p className="text-xs text-indigo-300 mt-0.5">{exc.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Schedule: {exc.preferredSchedule}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Peer Response</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed History Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedExchanges.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
              <p className="text-sm font-semibold">No completed exchanges recorded yet.</p>
            </div>
          ) : (
            completedExchanges.map((exc) => (
              <div
                key={exc.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{exc.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        +200 XP Awarded
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Partnership: {exc.fromUserName} ⇄ {exc.toUserName} • Finished on {exc.completedAt || 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>5.0 Verified Exchange</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
