import React, { useState } from 'react';
import { SkillCategory } from '../../types';
import { BookOpen, Compass, X, Plus } from 'lucide-react';

interface AddSkillModalProps {
  type: 'teach' | 'learn';
  onClose: () => void;
  onAddTeachingSkill: (skill: {
    name: string;
    category: SkillCategory;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    experienceMonths: number;
    description: string;
    tags: string[];
  }) => Promise<void>;
  onAddLearningSkill: (skill: {
    name: string;
    category: SkillCategory;
    targetProficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
  }) => Promise<void>;
}

const CATEGORIES: SkillCategory[] = [
  'Web Development',
  'AI & Machine Learning',
  'Data Structures & Algorithms',
  'Video & Animation',
  'Graphic & Poster Design',
  'Music & Audio Production',
  'Arts & Crafts',
  'Photography & Creative Media',
  'UI/UX Design',
  'Cloud & DevOps',
  'Cybersecurity',
  'Mobile App Dev',
  'Competitive Programming',
  'Core CSE',
  'Data Science & Analytics',
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  type,
  onClose,
  onAddTeachingSkill,
  onAddLearningSkill,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Web Development');
  const [proficiency, setProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [experienceMonths, setExperienceMonths] = useState(12);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (type === 'teach') {
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        await onAddTeachingSkill({
          name: name.trim(),
          category,
          proficiency,
          experienceMonths: Number(experienceMonths) || 6,
          description: description.trim() || `Experienced in ${name.trim()} and passionate about teaching peers.`,
          tags: tags.length > 0 ? tags : [name.trim(), category],
        });
      } else {
        await onAddLearningSkill({
          name: name.trim(),
          category,
          targetProficiency: proficiency,
          priority,
          notes: notes.trim() || `Excited to master ${name.trim()} through peer mentorship.`,
        });
      }
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
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === 'teach'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
              }`}
            >
              {type === 'teach' ? <BookOpen className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {type === 'teach' ? 'Add Skill I Can Teach' : 'Add Skill I Want to Learn'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'teach'
                  ? 'Share your strengths to match with learners'
                  : 'Specify learning goals to find peer tutors'}
              </p>
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
            <label className="block font-bold text-slate-300 mb-1.5">Skill Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js, PyTorch, LeetCode, Docker, Figma, Rust"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {type === 'teach' ? 'Current Proficiency:' : 'Target Proficiency:'}
              </label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {type === 'teach' ? (
            <>
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Months of Experience:</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={experienceMonths}
                  onChange={(e) => setExperienceMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Teaching Bio & Focus Topics:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Can teach React Hooks, State Management, SSR, and project architecture."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Tags (comma separated):</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Frontend, React, TypeScript, Tailwind"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Learning Priority:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="High">High Priority (Urgent / Active Project)</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority (Casual Interest)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Learning Goal Notes / Topics to Cover:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Want to understand Transformers, fine-tuning LLMs, and deployment on Cloud Run."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Add to Skill Portfolio'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
