import React, { useState } from 'react';
import { User, SkillCategory } from '../../types';
import { UserPlus, X, GraduationCap, Sparkles, BookOpen, Compass } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (newUser: Partial<User>) => Promise<void>;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('IIT Bombay');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year B.Tech');
  const [bio, setBio] = useState('');
  const [teachSkill, setTeachSkill] = useState('Rust & WebAssembly');
  const [learnSkill, setLearnSkill] = useState('Large Language Models');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const avatarIndex = Math.floor(Math.random() * 20) + 10;
      await onRegister({
        name: name.trim(),
        college,
        branch,
        year,
        bio: bio.trim() || `Computer Science student passionate about peer learning and software engineering.`,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        skillsTeaching: [
          {
            id: `st-new-${Date.now()}`,
            name: teachSkill,
            category: 'Web Development',
            proficiency: 'Intermediate',
            experienceMonths: 12,
            description: `Passionate about sharing insights on ${teachSkill}`,
            tags: [teachSkill, 'CSE'],
          },
        ],
        skillsLearning: [
          {
            id: `sl-new-${Date.now()}`,
            name: learnSkill,
            category: 'AI & Machine Learning',
            targetProficiency: 'Advanced',
            priority: 'High',
            notes: `Aiming to master ${learnSkill} through weekly exchanges.`,
          },
        ],
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Join SkillQuest Campus Network</h3>
              <p className="text-xs text-slate-400">Create your student profile and start exchanging skills</p>
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
          
          <div>
            <label className="block font-bold text-slate-300 mb-1">Student Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikramaditya Sharma"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">College / University:</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. IIT Delhi, BITS Pilani, DTU"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Branch / Major:</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science, AI & Data Science"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Year of Study:</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="1st Year B.Tech">1st Year B.Tech</option>
              <option value="2nd Year B.Tech">2nd Year B.Tech</option>
              <option value="3rd Year B.Tech">3rd Year B.Tech</option>
              <option value="4th Year B.Tech">4th Year B.Tech</option>
              <option value="M.Tech / MS Scholar">M.Tech / MS Scholar</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Bio & Learning Philosophy:</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Passionate about distributed systems, backend architectures, and open source."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-indigo-300 mb-1">Initial Skill You Can Teach:</label>
              <input
                type="text"
                value={teachSkill}
                onChange={(e) => setTeachSkill(e.target.value)}
                placeholder="e.g. Next.js, Python, DSA"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-slate-100 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block font-bold text-violet-300 mb-1">Initial Skill You Want to Learn:</label>
              <input
                type="text"
                value={learnSkill}
                onChange={(e) => setLearnSkill(e.target.value)}
                placeholder="e.g. PyTorch, Docker, Kubernetes"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-violet-500/40 text-slate-100 focus:outline-none focus:border-violet-400"
              />
            </div>
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
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Profile...' : 'Complete Registration (+100 XP)'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
