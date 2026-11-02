import React, { useState, useEffect } from 'react';
import { User, SkillCategory } from '../../types';
import { apiService } from '../../services/api';
import {
  Sparkles,
  BookOpen,
  Users,
  X,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Code2,
  Zap,
  Target,
  ArrowRight,
  Youtube,
  ExternalLink
} from 'lucide-react';

interface AIMentorModalProps {
  currentUser: User;
  allUsers: User[];
  initialSkill?: string;
  initialPeer?: User;
  onClose: () => void;
  onOpenExchangeModal: (peer: User, initialOffer?: string, initialRequest?: string) => void;
}

export const AIMentorModal: React.FC<AIMentorModalProps> = ({
  currentUser,
  allUsers,
  initialSkill,
  initialPeer,
  onClose,
  onOpenExchangeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'synergy'>(
    initialPeer ? 'synergy' : 'roadmap'
  );

  // Roadmap state
  const [targetSkill, setTargetSkill] = useState<string>(
    initialSkill || currentUser.skillsLearning[0]?.name || 'Next.js'
  );
  const [skillCategory, setSkillCategory] = useState<string>('Web Development');
  const [currentLevel, setCurrentLevel] = useState<string>('Beginner');
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Synergy state
  const eligiblePeers = allUsers.filter((u) => u.id !== currentUser.id);
  const [selectedPeerId, setSelectedPeerId] = useState<string>(
    initialPeer ? initialPeer.id : eligiblePeers[0]?.id || ''
  );
  const [synergyData, setSynergyData] = useState<any>(null);
  const [loadingSynergy, setLoadingSynergy] = useState(false);

  const selectedPeer = allUsers.find((u) => u.id === selectedPeerId);

  // Auto generate on modal open if skill provided
  useEffect(() => {
    if (initialSkill) {
      handleGenerateRoadmap(initialSkill);
    }
    if (initialPeer) {
      handleAnalyzeSynergy(initialPeer.id);
    }
  }, []);

  const handleGenerateRoadmap = async (skillToUse?: string) => {
    const s = skillToUse || targetSkill;
    if (!s) return;
    setLoadingRoadmap(true);
    try {
      const res = await apiService.generateLearningRoadmap(
        s,
        currentUser.id,
        skillCategory,
        currentLevel
      );
      if (res.success) {
        setRoadmapData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleAnalyzeSynergy = async (peerIdToUse?: string) => {
    const pId = peerIdToUse || selectedPeerId;
    if (!pId) return;
    setLoadingSynergy(true);
    try {
      const res = await apiService.getMatchSynergyAnalysis(currentUser.id, pId);
      if (res.success) {
        setSynergyData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSynergy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-amber-400 p-[1.5px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-100">SkillQuest AI Academic Advisor</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized study roadmaps and peer synergy insights powered by Gemini
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

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => {
              setActiveTab('roadmap');
              if (!roadmapData) handleGenerateRoadmap();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'roadmap'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>AI Learning Roadmap</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('synergy');
              if (!synergyData) handleAnalyzeSynergy();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'synergy'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Peer Synergy Deep-Dive</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: AI Learning Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Skill:</label>
                  <input
                    type="text"
                    value={targetSkill}
                    onChange={(e) => setTargetSkill(e.target.value)}
                    placeholder="e.g. Next.js, PyTorch, LeetCode"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Current Level:</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => handleGenerateRoadmap()}
                    disabled={loadingRoadmap || !targetSkill.trim()}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {loadingRoadmap ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{loadingRoadmap ? 'Generating...' : 'Generate Roadmap'}</span>
                  </button>
                </div>
              </div>

              {/* Roadmap Result View */}
              {loadingRoadmap && (
                <div className="text-center py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">
                    Consulting Gemini AI for {targetSkill} academic milestones...
                  </p>
                  <p className="text-xs text-slate-500">Synthesizing CSE curriculum and practical project goals</p>
                </div>
              )}

              {!loadingRoadmap && roadmapData && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Overview box */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-indigo-300">
                        {roadmapData.skill || roadmapData.skillName || targetSkill} Master Plan
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[11px]">
                        Est. {roadmapData.estimatedWeeks || roadmapData.duration || 6} Weeks Total
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {roadmapData.overview || roadmapData.goal || `A comprehensive 3-stage peer learning path for ${targetSkill}.`}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-indigo-900/40 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Supplemental video learning:
                      </span>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          (roadmapData.skill || roadmapData.skillName || targetSkill) + ' full course playlist tutorial'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 text-[11px] font-semibold transition-colors"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-400" />
                        <span>Watch {roadmapData.skill || roadmapData.skillName || targetSkill} Playlists on YouTube</span>
                        <ExternalLink className="w-3 h-3 text-red-400" />
                      </a>
                    </div>
                  </div>

                  {/* 3 Stages */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Stage-by-Stage Learning Sprints</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {roadmapData.stages?.map((stage: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Stage {idx + 1} • {stage.duration || `Stage ${idx + 1}`}
                            </span>
                            <h6 className="text-sm font-bold text-slate-100 mt-2">
                              {stage.stageName || stage.title || `Stage ${idx + 1}`}
                            </h6>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {stage.goal || ''}
                            </p>

                            <div className="mt-3 pt-2 border-t border-slate-800/80">
                              <p className="text-[11px] font-semibold text-slate-300 mb-1">Key Topics:</p>
                              <ul className="space-y-1">
                                {(stage.topics || stage.keyTopics || []).map((topic: string, i: number) => (
                                  <li key={i} className="text-slate-400 text-[11px] flex items-start gap-1.5">
                                    <span className="text-indigo-400">•</span>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/60 p-2 rounded-lg">
                            <p className="text-[10px] text-amber-400 font-bold uppercase">Milestone Project:</p>
                            <p className="text-xs font-semibold text-slate-200 mt-0.5">
                              {stage.projectMilestone || stage.handsOnChallenge || 'Hands-on practice application.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peer Learning Advice */}
                  {(roadmapData.peerStudyAdvice || roadmapData.mentorTips) && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h5 className="font-bold text-slate-200 flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Peer Mentorship Recommendation:</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{roadmapData.peerStudyAdvice || (Array.isArray(roadmapData.mentorTips) ? roadmapData.mentorTips.join(' • ') : roadmapData.mentorTips)}"
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: Peer Synergy Deep-Dive */}
          {activeTab === 'synergy' && (
            <div className="space-y-6">
              
              {/* Peer Picker */}
              <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex-1 w-full">
                  <label className="block font-bold text-slate-300 mb-1">Select Student Peer to Compare:</label>
                  <select
                    value={selectedPeerId}
                    onChange={(e) => {
                      setSelectedPeerId(e.target.value);
                      handleAnalyzeSynergy(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {eligiblePeers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.college} ({p.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="self-end w-full sm:w-auto">
                  <button
                    onClick={() => handleAnalyzeSynergy()}
                    disabled={loadingSynergy}
                    className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {loadingSynergy ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Run Synergy Analysis</span>
                  </button>
                </div>
              </div>

              {loadingSynergy && (
                <div className="text-center py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">
                    Evaluating skill reciprocity & learning compatibility with Gemini...
                  </p>
                </div>
              )}

              {!loadingSynergy && synergyData && selectedPeer && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Synergy Score Header */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedPeer.avatar}
                        alt={selectedPeer.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-100">{selectedPeer.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {synergyData.compatibilityRating || 'High Synergy'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {selectedPeer.college} • {selectedPeer.branch}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400">
                          {synergyData.synergyScore || 94}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Reciprocal Match</span>
                      </div>

                      <button
                        onClick={() => {
                          onOpenExchangeModal(selectedPeer);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                      >
                        <span>Propose Exchange</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Why this match works */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-slate-200 flex items-center gap-2 mb-1.5">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>Match Compatibility Analysis:</span>
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {synergyData.whyThisMatchWorks || synergyData.summary || 'Strong mutual alignment of technical learning objectives and complementary strengths.'}
                    </p>
                  </div>

                  {/* Mutual Exchange Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                      <h6 className="font-bold text-indigo-300 text-xs uppercase mb-1">
                        What {selectedPeer.name} Teaches You:
                      </h6>
                      <p className="text-xs text-slate-200">
                        {synergyData.whatStudent1Teaches || 'Comprehensive peer architecture walkthroughs and code review sessions.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20">
                      <h6 className="font-bold text-violet-300 text-xs uppercase mb-1">
                        What You Teach {selectedPeer.name}:
                      </h6>
                      <p className="text-xs text-slate-200">
                        {synergyData.whatStudent2Teaches || 'Hands-on debugging, best practices, and practical project guidance.'}
                      </p>
                    </div>
                  </div>

                  {/* Collaborative Project Idea */}
                  {(synergyData.collaborativeProjectIdea || synergyData.projectIdea) && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h5 className="font-bold text-slate-200 flex items-center gap-2 mb-1">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span>Recommended Collaborative Project Concept:</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {synergyData.collaborativeProjectIdea || synergyData.projectIdea}
                      </p>
                    </div>
                  )}

                  {/* Suggested Routine */}
                  {synergyData.suggestedRoutine && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Suggested Cadence: {synergyData.suggestedRoutine}</span>
                    </p>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by Google Gemini 2.5 • Antigravity AI
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
