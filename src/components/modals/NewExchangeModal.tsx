import React, { useState } from 'react';
import { User, SkillCategory } from '../../types';
import { Repeat, X, Sparkles, Send, Calendar, Clock, BookOpen, GraduationCap } from 'lucide-react';

interface NewExchangeModalProps {
  currentUser: User;
  allUsers: User[];
  preselectedUser?: User;
  initialOffer?: string;
  initialRequest?: string;
  onClose: () => void;
  onSubmitProposal: (payload: {
    toUserId: string;
    skillOffered: string;
    skillRequested: string;
    message: string;
    preferredSchedule: string;
  }) => Promise<void>;
}

export const NewExchangeModal: React.FC<NewExchangeModalProps> = ({
  currentUser,
  allUsers,
  preselectedUser,
  initialOffer,
  initialRequest,
  onClose,
  onSubmitProposal,
}) => {
  const eligiblePeers = allUsers.filter((u) => u.id !== currentUser.id);

  const [selectedUserId, setSelectedUserId] = useState<string>(
    preselectedUser ? preselectedUser.id : eligiblePeers[0]?.id || ''
  );

  const targetUser = allUsers.find((u) => u.id === selectedUserId);

  const [skillOffered, setSkillOffered] = useState<string>(
    initialOffer || currentUser.skillsTeaching[0]?.name || ''
  );
  const [skillRequested, setSkillRequested] = useState<string>(
    initialRequest || targetUser?.skillsTeaching[0]?.name || ''
  );
  const [message, setMessage] = useState<string>(
    `Hey! I saw your profile on SkillQuest. I'd love to exchange knowledge—I can guide you through ${skillOffered || 'my skills'} in exchange for some help with ${skillRequested || 'your expertise'}.`
  );
  const [preferredSchedule, setPreferredSchedule] = useState<string>('Weekends (2 hours) or evenings after 7 PM');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !skillOffered || !skillRequested) return;

    setLoading(true);
    try {
      await onSubmitProposal({
        toUserId: selectedUserId,
        skillOffered,
        skillRequested,
        message,
        preferredSchedule,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Propose Skill Exchange</h3>
              <p className="text-xs text-slate-400">100% Free peer-to-peer reciprocal knowledge exchange</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Peer Selection */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Select Campus Peer to Exchange With:</label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                const uid = e.target.value;
                setSelectedUserId(uid);
                const u = allUsers.find((user) => user.id === uid);
                if (u && u.skillsTeaching.length > 0) {
                  setSkillRequested(u.skillsTeaching[0].name);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {eligiblePeers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.college} ({p.branch})
                </option>
              ))}
            </select>
          </div>

          {targetUser && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img src={targetUser.avatar} alt={targetUser.name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="font-bold text-slate-200">{targetUser.name}</p>
                <p className="text-[11px] text-slate-400">
                  {targetUser.college} • Lvl {targetUser.level} • {targetUser.stats.reputationRating}★
                </p>
              </div>
            </div>
          )}

          {/* Skill Swap Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-indigo-300 mb-1.5">Skill You Will Teach:</label>
              <input
                type="text"
                value={skillOffered}
                onChange={(e) => setSkillOffered(e.target.value)}
                placeholder="e.g. Next.js, PyTorch, Docker"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block font-bold text-violet-300 mb-1.5">Skill You Want to Learn:</label>
              <input
                type="text"
                value={skillRequested}
                onChange={(e) => setSkillRequested(e.target.value)}
                placeholder="e.g. System Design, Kubernetes"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-violet-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Personalized Introduction & Topics:</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Preferred Schedule */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Preferred Meeting Schedule / Frequency:</label>
            <input
              type="text"
              value={preferredSchedule}
              onChange={(e) => setPreferredSchedule(e.target.value)}
              placeholder="e.g. Weekends (2 hours) or Tue/Thu evenings"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Exchange Proposal'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
