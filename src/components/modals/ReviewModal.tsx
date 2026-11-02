import React, { useState } from 'react';
import { SkillExchange, User } from '../../types';
import { Star, Award, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  exchange: SkillExchange;
  currentUser: User;
  onClose: () => void;
  onSubmitReview: (review: {
    exchangeId: string;
    toUserId: string;
    rating: number;
    comment: string;
    tags: string[];
    skillExchanged: string;
  }) => Promise<void>;
}

const ENDORSEMENT_TAGS = [
  'Patient Mentor',
  'Clear Explanations',
  'Code Walkthroughs',
  'Punctual & Prepared',
  'Real-World Examples',
  'Problem-Solving Guru',
  'Encouraging & Friendly',
  'Great Interview Prep',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  exchange,
  currentUser,
  onClose,
  onSubmitReview,
}) => {
  const isFromUser = exchange.fromUserId === currentUser.id;
  const targetUserId = isFromUser ? exchange.toUserId : exchange.fromUserId;
  const targetUserName = isFromUser ? exchange.toUserName : exchange.fromUserName;
  const skillTaughtByTarget = isFromUser ? exchange.skillRequested : exchange.skillOffered;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>(
    `Fantastic learning session with ${targetUserName}! They explained the core principles of ${skillTaughtByTarget} with great practical demos.`
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clear Explanations', 'Patient Mentor']);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await onSubmitReview({
        exchangeId: exchange.id,
        toUserId: targetUserId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        skillExchanged: skillTaughtByTarget,
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
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Rate Peer & Complete Session</h3>
              <p className="text-xs text-amber-300 font-semibold">+200 XP will be awarded to both peers!</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-base">
              {targetUserName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-200">{targetUserName}</p>
              <p className="text-[11px] text-slate-400">Skill Exchanged: {skillTaughtByTarget}</p>
            </div>
          </div>

          {/* Star rating selector */}
          <div className="text-center py-2">
            <p className="font-bold text-slate-300 mb-2">Select Star Rating:</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-400 font-semibold mt-1">
              {rating === 5
                ? 'Outstanding Mentor! (5/5)'
                : rating === 4
                ? 'Great Session (4/5)'
                : rating === 3
                ? 'Good Exchange (3/5)'
                : 'Needs Improvement'}
            </p>
          </div>

          {/* Endorsement Tags */}
          <div>
            <label className="block font-bold text-slate-300 mb-2">Select Peer Endorsement Badges:</label>
            <div className="flex flex-wrap gap-2">
              {ENDORSEMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Feedback & Public Review:</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn from your peer? How was their teaching style?"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
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
              disabled={loading || !comment.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{loading ? 'Submitting...' : 'Submit & Claim +200 XP'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
