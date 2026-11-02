import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Sparkles,
  Repeat,
  Plus,
  Star,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Code2,
  Cpu,
  Server,
  Cloud,
  Shield,
  Palette,
  Database,
  Trophy,
  Smartphone,
  GraduationCap,
  Youtube,
  Play,
  Copy,
  Check,
  Video,
  Music,
  Scissors,
  Camera
} from 'lucide-react';
import { SkillItem, SkillCategory, User, YouTubePlaylist } from '../types';

interface ExploreSkillsViewProps {
  skills: SkillItem[];
  allUsers: User[];
  currentUser: User;
  onOpenExchangeModal: (targetUser: User, initialOffer?: string, initialRequest?: string) => void;
  onOpenAIMentor: (skillName: string) => void;
  onAddLearningSkill: (skillName: string, category: SkillCategory) => void;
  onAddTeachingSkill: (skillName: string, category: SkillCategory) => void;
}

const CATEGORIES: ('All' | SkillCategory)[] = [
  'All',
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
];

export const ExploreSkillsView: React.FC<ExploreSkillsViewProps> = ({
  skills,
  allUsers,
  currentUser,
  onOpenExchangeModal,
  onOpenAIMentor,
  onAddLearningSkill,
  onAddTeachingSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | SkillCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [inspectSkill, setInspectSkill] = useState<SkillItem | null>(null);
  const [inspectTab, setInspectTab] = useState<'tutors' | 'youtube'>('tutors');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getPlaylistsForSkill = (skill: SkillItem): YouTubePlaylist[] => {
    if (skill.youtubePlaylists && skill.youtubePlaylists.length > 0) {
      return skill.youtubePlaylists;
    }
    const encoded = encodeURIComponent(`${skill.name} full course playlist tutorial`);
    return [
      {
        id: `yt-fallback-1`,
        title: `${skill.name} Full Course & Hands-on Tutorials`,
        channelName: 'freeCodeCamp / Top Tech Creators',
        playlistUrl: `https://www.youtube.com/results?search_query=${encoded}`,
        videoCount: 'Full Series',
        duration: '10+ Hours',
        badge: 'Recommended',
        description: `Curated learning playlists and comprehensive practical projects for mastering ${skill.name}.`,
        keyTopics: skill.popularTopics
      },
      {
        id: `yt-fallback-2`,
        title: `${skill.name} Placement & Interview Masterclass`,
        channelName: 'Striver & Top Campus Educators',
        playlistUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill.name} interview placement playlist`)}`,
        videoCount: 'Series',
        duration: '15+ Hours',
        badge: 'Placement Prep',
        description: `Core patterns, coding questions, and deep architectural understanding for ${skill.name}.`,
        keyTopics: skill.popularTopics
      }
    ];
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === 'All' || skill.difficulty === difficultyFilter;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.popularTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Tutors teaching selected inspected skill
  const tutorsForInspectedSkill = inspectSkill
    ? allUsers.filter((u) =>
        u.skillsTeaching.some((st) => st.name.toLowerCase() === inspectSkill.name.toLowerCase())
      )
    : [];

  const getSkillIcon = (category: SkillCategory) => {
    switch (category) {
      case 'AI & Machine Learning':
        return Cpu;
      case 'Web Development':
        return Server;
      case 'Cloud & DevOps':
        return Cloud;
      case 'Cybersecurity':
        return Shield;
      case 'UI/UX Design':
      case 'Graphic & Poster Design':
        return Palette;
      case 'Video & Animation':
        return Video;
      case 'Music & Audio Production':
        return Music;
      case 'Arts & Crafts':
        return Scissors;
      case 'Photography & Creative Media':
        return Camera;
      case 'Core CSE':
        return Database;
      case 'Competitive Programming':
        return Trophy;
      case 'Mobile App Dev':
        return Smartphone;
      default:
        return Code2;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header & Search Bar */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Campus Skill Exchange Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Explore Tech & Creative Skills • Find Peer Mentors
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Discover coding, video editing, Canva poster design, music remixing, arts & crafts, and media skills taught by students across campuses.
          </p>

          {/* Search & Difficulty Filter */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g. Video Editing, Canva, Music Remixing, Art & Craft, React)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill) => {
          const Icon = getSkillIcon(skill.category);
          const isUserLearning = currentUser.skillsLearning.some(
            (sl) => sl.name.toLowerCase() === skill.name.toLowerCase()
          );
          const isUserTeaching = currentUser.skillsTeaching.some(
            (st) => st.name.toLowerCase() === skill.name.toLowerCase()
          );

          return (
            <div
              key={skill.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-950/20 group"
            >
              <div>
                {/* Top header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {skill.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">{skill.category}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      skill.difficulty === 'Beginner'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : skill.difficulty === 'Intermediate'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {skill.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                {/* Topic tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {skill.popularTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Peer stats */}
                <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <strong className="text-slate-200 font-semibold">{skill.totalTutors}</strong> Peer Tutors
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    <strong className="text-slate-200 font-semibold">{skill.totalLearners}</strong> Learners
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/70 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInspectSkill(skill);
                      setInspectTab('tutors');
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Tutors ({skill.totalTutors})</span>
                  </button>

                  <button
                    onClick={() => {
                      setInspectSkill(skill);
                      setInspectTab('youtube');
                    }}
                    className="w-full py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-300 hover:text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-500/30 shadow-sm"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube Playlists ({getPlaylistsForSkill(skill).length})</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenAIMentor(skill.name)}
                  className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700/80"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate AI Roadmap</span>
                </button>

                {/* Quick Add to learning or teaching */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  {!isUserLearning ? (
                    <button
                      onClick={() => onAddLearningSkill(skill.name, skill.category)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add to Want to Learn
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> In your learning list
                    </span>
                  )}

                  {!isUserTeaching ? (
                    <button
                      onClick={() => onAddTeachingSkill(skill.name, skill.category)}
                      className="text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> I can teach this
                    </button>
                  ) : (
                    <span className="text-indigo-400 font-semibold">Taught by you</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Skill Modal: Peer Tutors & YouTube Playlists Tabs */}
      {inspectSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span>{inspectSkill.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        {inspectSkill.category}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inspectTab === 'tutors'
                        ? `Connect with ${tutorsForInspectedSkill.length} college peers ready to mentor you in this skill`
                        : `Curated learning playlists from top engineering educators on YouTube`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectSkill(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs Switcher: Peer Tutors vs YouTube Playlists */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setInspectTab('tutors')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    inspectTab === 'tutors'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-300" />
                  <span>Peer Tutors ({tutorsForInspectedSkill.length})</span>
                </button>

                <button
                  onClick={() => setInspectTab('youtube')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    inspectTab === 'youtube'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span>YouTube Playlists ({getPlaylistsForSkill(inspectSkill).length})</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* TAB 1: PEER TUTORS */}
              {inspectTab === 'tutors' && (
                <div className="space-y-4">
                  {tutorsForInspectedSkill.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 space-y-3">
                      <p className="text-sm">No campus peers currently listed teaching this skill.</p>
                      <button
                        onClick={() => {
                          onAddTeachingSkill(inspectSkill.name, inspectSkill.category);
                          setInspectSkill(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                      >
                        Be the First to Teach {inspectSkill.name}!
                      </button>
                    </div>
                  ) : (
                    tutorsForInspectedSkill.map((tutor) => {
                      const teachingInfo = tutor.skillsTeaching.find(
                        (st) => st.name.toLowerCase() === inspectSkill.name.toLowerCase()
                      );
                      const isSelf = tutor.id === currentUser.id;

                      return (
                        <div
                          key={tutor.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={tutor.avatar}
                              alt={tutor.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-100">{tutor.name}</h4>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300">
                                  Lvl {tutor.level}
                                </span>
                                <span className="flex items-center text-xs text-amber-400 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                                  {tutor.stats.reputationRating}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {tutor.college} • {tutor.branch}
                              </p>
                              {teachingInfo && (
                                <p className="text-xs text-indigo-300 mt-1.5 italic">
                                  "{teachingInfo.description}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Propose exchange button */}
                          <div className="w-full sm:w-auto">
                            {!isSelf ? (
                              <button
                                onClick={() => {
                                  onOpenExchangeModal(tutor, undefined, inspectSkill.name);
                                  setInspectSkill(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                              >
                                <Repeat className="w-3.5 h-3.5" />
                                <span>Propose Exchange</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">This is you</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: YOUTUBE PLAYLISTS */}
              {inspectTab === 'youtube' && (
                <div className="space-y-4">
                  {/* Top Banner with Search Fallback */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>Curated Video Learning</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        High-quality free courses from verified instructors (FreeCodeCamp, Striver, Chai aur Code, etc.).
                      </p>
                    </div>

                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        inspectSkill.name + ' full playlist tutorial course'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Search className="w-3.5 h-3.5 text-red-400" />
                      <span>Search More on YouTube</span>
                      <ExternalLink className="w-3 h-3 text-red-400" />
                    </a>
                  </div>

                  {/* Playlist Cards */}
                  <div className="space-y-3.5">
                    {getPlaylistsForSkill(inspectSkill).map((pl) => (
                      <div
                        key={pl.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/30 transition-all space-y-3 group"
                      >
                        {/* Header: Channel info & badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-red-600/15 border border-red-500/25 flex items-center justify-center text-red-400">
                              <Youtube className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-200">{pl.channelName}</span>
                            {pl.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {pl.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            {pl.videoCount && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {pl.videoCount}
                              </span>
                            )}
                            {pl.duration && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                ⏱️ {pl.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-red-300 transition-colors">
                            {pl.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {pl.description}
                          </p>
                        </div>

                        {/* Topic Tags */}
                        {pl.keyTopics && pl.keyTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {pl.keyTopics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Direct Link Action Bar */}
                        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500">
                            Direct YouTube Link
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyLink(pl.playlistUrl, pl.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                            >
                              {copiedId === pl.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            <a
                              href={pl.playlistUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-red-600/20"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>Open on YouTube</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hybrid Learning Pro-Tip */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-indigo-300">SkillQuest Hybrid Learning Method</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Watch these YouTube playlists to build theoretical foundations and code along. Then switch to the <strong>Peer Tutors</strong> tab to find campus engineering peers, exchange skills, and do mock interviews or project reviews together!
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                {!currentUser.skillsLearning.some(
                  (sl) => sl.name.toLowerCase() === inspectSkill.name.toLowerCase()
                ) && (
                  <button
                    onClick={() => {
                      onAddLearningSkill(inspectSkill.name, inspectSkill.category);
                      setInspectSkill(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add to My Learning List</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setInspectSkill(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
