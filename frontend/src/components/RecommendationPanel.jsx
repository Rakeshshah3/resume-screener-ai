import React, { useState, useEffect } from 'react';
import { resumeService, jobService } from '../services/api';

export default function RecommendationPanel({ jobId, jobTitle, onBack }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [shortlisted, setShortlisted] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchLiveRecommendations();
  }, [jobId]);

  const fetchLiveRecommendations = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobRecommendations(jobId);
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to sync database matching recommendations:", err);
      setError("Failed to fetch matching candidate records from the SQL database.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGap = (candidateSkills) => {
    const jobReqs = (jobTitle?.toLowerCase().includes('ml') || jobTitle?.toLowerCase().includes('python')) 
      ? ['python', 'machine learning', 'pytorch', 'sql', 'aws', 'docker'] 
      : ['javascript', 'react', 'node.js', 'css', 'git', 'ui/ux'];

    const individualSkills = candidateSkills?.toLowerCase().split(',').map(s => s.trim()) || [];
    
    const matching = individualSkills.filter(s => jobReqs.includes(s));
    const missing = jobReqs.filter(s => !individualSkills.includes(s));
    const additional = individualSkills.filter(s => !jobReqs.includes(s));

    return { matching, missing, additional };
  };

  const toggleShortlist = (candidateId, e) => {
    if (e) e.stopPropagation();
    setShortlisted(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };

  const handleDownloadResume = async (resumeId, fileName, e) => {
    e.stopPropagation(); 
    setDownloadingId(resumeId);
    try {
      const blobData = await resumeService.downloadResume(resumeId);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
      link.setAttribute('download', fileName || `Resume_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Asset stream download failure from storage:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // 🚀 FIXED DYNAMIC FILTER MAP: Bulletproof extraction for both raw SQL schemas and parsed resumes
  const filteredCandidates = recommendations.filter(candidate => {
    // Gracefully check every common variant for names and tags
    const resolvedName = candidate.candidate_name || candidate.name || "Anonymous Applicant";
    const resolvedSkills = candidate.skills || candidate.email || ""; 

    const matchesSearch = resolvedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resolvedSkills.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Fall back to a stable 100% calculation if match percentage columns aren't computed yet
    const rawScore = candidate.match_percentage !== undefined ? candidate.match_percentage : 
                     candidate.score !== undefined ? candidate.score * 100 : 100;
    const score = Math.round(rawScore);

    return matchesSearch && score >= minScore;
  });

  const totalStaged = recommendations.length;
  const avgScore = totalStaged > 0 
    ? Math.round(recommendations.reduce((acc, curr) => {
        const s = curr.match_percentage !== undefined ? curr.match_percentage : (curr.score !== undefined ? curr.score * 100 : 100);
        return acc + s;
      }, 0) / totalStaged) 
    : 0;
  
  const premiumProfiles = recommendations.filter(c => {
    const s = c.match_percentage !== undefined ? c.match_percentage : (c.score !== undefined ? c.score * 100 : 100);
    return s >= 80;
  }).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans text-xs text-slate-200">
      
      {/* Top Navigation Action Row */}
      <div className="flex items-center justify-between bg-[#101626]/40 border border-slate-800 rounded-xl px-5 py-3 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          <span>Talent Engine</span> &bull; <span className="text-slate-400">Database Match Matrix</span>
        </div>
        <button 
          onClick={onBack}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-[11px] px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
        >
          <span>&larr;</span> Return to Dashboard
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <div className="h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[11px]">Querying database records...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/5 border border-rose-500/30 text-rose-400 rounded-xl text-center font-medium">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* PREMIUM EXECUTIVE KPI STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#101626]/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md shadow-lg flex items-center justify-between group hover:border-slate-700/80 transition-all duration-300">
              <div>
                <p className="text-slate-400 font-medium tracking-tight">SQL Ingested Profiles</p>
                <p className="text-[18px] font-mono font-bold text-white mt-1">{totalStaged}</p>
              </div>
              <div className="h-8 w-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-sm shadow-inner group-hover:text-blue-400 transition-colors">📂</div>
            </div>
            
            <div className="bg-[#101626]/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md shadow-lg flex items-center justify-between group hover:border-slate-700/80 transition-all duration-300">
              <div>
                <p className="text-slate-400 font-medium tracking-tight">Pool Compatibility Average</p>
                <p className="text-[18px] font-mono font-bold text-emerald-400 mt-1">{avgScore}%</p>
              </div>
              <div className="h-8 w-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-sm shadow-inner group-hover:text-emerald-400 transition-colors">🧬</div>
            </div>

            <div className="bg-[#101626]/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md shadow-lg flex items-center justify-between group hover:border-slate-700/80 transition-all duration-300">
              <div>
                <p className="text-slate-400 font-medium tracking-tight">Top-Tier Contenders (≥80%)</p>
                <p className="text-[18px] font-mono font-bold text-amber-400 mt-1">{premiumProfiles}</p>
              </div>
              <div className="h-8 w-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-sm shadow-inner group-hover:text-amber-400 transition-colors">✨</div>
            </div>
          </div>

          {/* Main Panel Frame Panel */}
          <div className="bg-[#101626]/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative">
            
            {/* Top Header Filter Strip */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI Candidate Match Matrix
                </h2>
                <p className="text-slate-400 mt-0.5">Ranked talent pipelines generated dynamically for <span className="text-emerald-400 font-semibold">{jobTitle || 'Data Scientist'}</span></p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Search name or skills..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl outline-none focus:border-emerald-500/40 w-full sm:w-48 transition-all"
                />
                
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 font-mono text-[10px]">
                  <span>Min Match Score:</span>
                  <input 
                    type="range" min="0" max="100" step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="accent-emerald-400 cursor-pointer h-1 w-16 bg-slate-800 rounded-lg appearance-none"
                  />
                  <span className="text-emerald-400 font-bold w-6 text-right">{minScore}%</span>
                </div>
              </div>
            </div>

            {/* Candidate Pipeline Rows */}
            {filteredCandidates.length === 0 ? (
              <div className="p-12 text-center border border-slate-800/50 bg-slate-950/20 rounded-xl">
                <p className="text-slate-500 text-xs">No active talent profiles found matching specified database constraints.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCandidates.map((candidate) => {
                  const rawScore = candidate.match_percentage !== undefined ? candidate.match_percentage : 
                                   candidate.score !== undefined ? candidate.score * 100 : 100;
                  const score = Math.round(rawScore);
                  const isShortlisted = shortlisted[candidate.id];
                  const displayName = candidate.candidate_name || candidate.name || "Anonymous Applicant";
                  const displaySubtitle = candidate.email ? `${candidate.company || 'Enterprise'} · ${candidate.email}` : (candidate.company || 'External Profile');

                  return (
                    <div 
                      key={candidate.id} 
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group ${
                        isShortlisted 
                          ? 'border-emerald-500/30 bg-[#12202b]/40 shadow-md shadow-emerald-950/10' 
                          : 'border-slate-800 bg-slate-950/40 hover:border-emerald-500/30 hover:bg-[#121c33]/20'
                      }`}
                    >
                      <div className="flex items-start gap-4 max-w-xl truncate">
                        <div className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center font-bold border font-mono tracking-tight text-[11px] shrink-0 ${
                          score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          <span>{score}%</span>
                          <span className="text-[7px] text-slate-500 uppercase tracking-tighter font-semibold">Match</span>
                        </div>

                        <div className="truncate space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-100 text-[13px] group-hover:text-emerald-400 transition-colors truncate">
                              {displayName}
                            </h3>
                            {isShortlisted && (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono tracking-wide">
                                SHORTLISTED
                              </span>
                            )}
                          </div>
                          
                          <div className="text-slate-400 text-[11px] font-medium truncate mb-1">
                            {displaySubtitle}
                          </div>

                          {candidate.skills && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {candidate.skills.split(',').slice(0, 5).map((skill, index) => (
                                <span key={index} className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Desk Element */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={(e) => handleDownloadResume(candidate.resume_id || candidate.id, candidate.file_name, e)}
                          disabled={downloadingId === (candidate.resume_id || candidate.id)}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {downloadingId === (candidate.resume_id || candidate.id) ? (
                            <span className="h-3 w-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                          ) : '📥'}
                          <span>Download</span>
                        </button>

                        <button
                          onClick={(e) => toggleShortlist(candidate.id, e)}
                          className={`px-3 py-2 rounded-xl border font-bold transition-all shadow-sm cursor-pointer ${
                            isShortlisted 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20' 
                              : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {isShortlisted ? '✓ Shortlisted' : 'Shortlist'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sliding Context Drawer component */}
            {selectedCandidate && (() => {
              const { matching, missing, additional } = analyzeSkillGap(selectedCandidate.skills || "");
              const resolvedDrawerName = selectedCandidate.candidate_name || selectedCandidate.name || "Applicant Profile";
              return (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
                  <div 
                    className="w-full max-w-md bg-[#0d1322] border-l border-slate-800 h-screen p-6 shadow-2xl flex flex-col justify-between text-slate-200 relative overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Candidate Context Assessment</span>
                          <h3 className="text-sm font-bold text-white mt-0.5">{resolvedDrawerName}</h3>
                        </div>
                        <button 
                          onClick={() => setSelectedCandidate(null)}
                          className="h-7 w-7 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all text-sm cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 font-medium">Pipeline Match Ratio</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Vector proximity metric tracking index</p>
                        </div>
                        <span className="text-lg font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                          {Math.round(selectedCandidate.match_percentage !== undefined ? selectedCandidate.match_percentage : (selectedCandidate.score !== undefined ? selectedCandidate.score * 100 : 100))}%
                        </span>
                      </div>

                      {/* VISUAL SKILL GAP MATRIX CLUSTERS */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-bold tracking-wider text-emerald-400 uppercase text-[9px] flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Met Requirements ({matching.length})
                          </h4>
                          <div className="flex flex-wrap gap-1 p-2.5 rounded-xl bg-emerald-950/10 border border-emerald-900/20 min-h-[40px]">
                            {matching.map((skill, i) => (
                              <span key={i} className="bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                                {skill}
                              </span>
                            ))}
                            {matching.length === 0 && <span className="text-slate-600 italic">No core requirements matched.</span>}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-bold tracking-wider text-rose-400 uppercase text-[9px] flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Missing Core Competencies ({missing.length})
                          </h4>
                          <div className="flex flex-wrap gap-1 p-2.5 rounded-xl bg-rose-950/10 border border-rose-900/20 min-h-[40px]">
                            {missing.map((skill, i) => (
                              <span key={i} className="bg-rose-900/20 border border-rose-800/40 text-rose-400 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                                {skill}
                              </span>
                            ))}
                            {missing.length === 0 && <span className="text-emerald-400 text-[10px] italic">100% Core Requirements Satisfied.</span>}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-bold tracking-wider text-blue-400 uppercase text-[9px] flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Value-Add Skills ({additional.length})
                          </h4>
                          <div className="flex flex-wrap gap-1 p-2.5 rounded-xl bg-blue-950/10 border border-blue-900/20 min-h-[40px]">
                            {additional.map((skill, i) => (
                              <span key={i} className="bg-blue-900/20 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4 flex gap-2 mt-6">
                      <button 
                        onClick={(e) => { toggleShortlist(selectedCandidate.id, e); setSelectedCandidate(null); }}
                        className={`w-full py-2.5 rounded-xl font-bold transition-all border text-center cursor-pointer ${
                          shortlisted[selectedCandidate.id]
                            ? 'bg-rose-950/30 text-rose-400 border-rose-500/20 hover:bg-rose-900/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20'
                        }`}
                      >
                        {shortlisted[selectedCandidate.id] ? 'Evict from Shortlist' : 'Approve & Shortlist'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Control Strip */}
            <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Pipeline Matrix Generation Engine v1.0.4</span>
              <span>Synchronized SQL Matrix Pool State</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}