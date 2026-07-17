import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

export default function CandidateDashboard({ onLogout }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set()); // Tracks backend application row history
  const [appliedJobsRaw, setAppliedJobsRaw] = useState([]); 
  const [loadingData, setLoadingData] = useState(false);
  const [notice, setNotice] = useState({ type: '', msg: '' });
  const [applyingId, setApplyingId] = useState(null); 

  useEffect(() => {
    fetchCandidateHubData();
  }, []);

  const fetchCandidateHubData = async () => {
    setLoadingData(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch system vacancies
      const jobsRes = await axios.get('http://127.0.0.1:8000/jobs/', { headers });
      setAvailableJobs(jobsRes.data || []);

      // 2. Pull user details for initial skill tracking checks
      const userRes = await axios.get('http://127.0.0.1:8000/auth/me', { headers });
      if (userRes.data && userRes.data.skills) {
        const skillsArray = userRes.data.skills.split(',').map(s => s.trim().toLowerCase());
        setCandidateSkills(skillsArray);
      } else {
        setCandidateSkills([]);
      }

      // 3. Fetch actual applications history and map target IDs straight to a flat Set layout
      const historyRes = await axios.get('http://127.0.0.1:8000/match/candidate/history', { headers });
      const historyData = historyRes.data || [];
      setAppliedJobsRaw(historyData);
      
      // Extract every numeric job_id to absolute primitive string numbers
      const idSet = new Set(historyData.map(app => Number(app.job_id)));
      setAppliedJobIds(idSet);

    } catch (err) {
      console.error("Failed to compile candidate metrics loop:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setNotice({ type: 'error', msg: 'Please isolate a valid file system node for parsing.' });
      return;
    }

    setNotice({ type: '', msg: '' });
    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:8000/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setNotice({ type: 'success', msg: '🚀 Profile vector updated! System alignments computed.' });
      setFile(null);
      fetchCandidateHubData(); 
    } catch (err) {
      setNotice({
        type: 'error',
        msg: err.response?.data?.detail || 'Failed to sync target file vector to parsing server.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleApplyToJob = async (jobId) => {
    setApplyingId(jobId);
    setNotice({ type: '', msg: '' });
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post(`http://127.0.0.1:8000/match/apply/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotice({
        type: 'success',
        msg: `✨ Application Transmitted! Computed alignment score: ${res.data.match_score}%`
      });
      
      await fetchCandidateHubData();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "";
      if (errorMsg.toLowerCase().includes("already submitted") || errorMsg.toLowerCase().includes("already applied")) {
        setNotice({ type: '', msg: '' }); 
        await fetchCandidateHubData();
      } else {
        setNotice({
          type: 'error',
          msg: errorMsg || "Application process structural error encountered."
        });
      }
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] bg-radial-[at_top,_var(--tw-gradient-stops)] from-[#0b1c24] via-[#030712] to-[#030712] text-slate-100 font-sans antialiased p-4 md:p-8 relative overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation Header */}
        <div className="backdrop-blur-md bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl shadow-black/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CANDIDATE<span className="text-cyan-500 font-medium">HUB</span>
              </h1>
            </div>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 font-medium tracking-wide">
              Deploy your capability models and evaluate neural alignment matches against live server positions.
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            Disconnect Session
          </button>
        </div>

        {notice.msg && (
          <div className={`p-4 text-xs font-semibold rounded-xl border text-center shadow-lg backdrop-blur-md transition-all ${
            notice.type === 'success' ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/20 border-rose-800/60 text-rose-400'
          }`}>
            {notice.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Uploader Column */}
          <div className="backdrop-blur-md bg-slate-900/20 border border-slate-800/70 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Sync Profile Vector</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Stream your plain text or PDF resume object</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all text-center bg-slate-950/30 relative cursor-pointer group/upload">
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 block">{file ? `Selected: ${file.name}` : "Drag & Drop or Click to browse"}</span>
                  <span className="text-[9px] font-mono text-slate-600 block">PDF, DOCX, TXT up to 10MB</span>
                </div>
              </div>
              <button type="submit" disabled={uploading || !file} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all tracking-widest uppercase shadow-xl">
                {uploading ? "Parsing Matrix Data..." : "Analyze Document Vector"}
              </button>
            </form>
          </div>

          {/* Openings Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-md bg-slate-900/20 border border-slate-800/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
              
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Available Corporate Openings</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Live target tracking nodes published on system clusters</p>
              </div>

              {loadingData ? (
                <div className="text-center py-16 text-xs font-mono text-slate-500 animate-pulse">Syncing target jobs database...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableJobs.map((job) => {
                    
                    const isApplied = appliedJobIds.has(Number(job.id));
                    const rawApp = appliedJobsRaw.find(a => Number(a.job_id) === Number(job.id));
                    
                    // 🚀 NEW STATE SELECTION MAPPING: Reads current hiring lifecycle token
                    const appStatus = rawApp ? rawApp.status : 'Applied';
                    
                    const matchPercent = isApplied && rawApp
                      ? rawApp.match_percentage 
                      : (candidateSkills.length > 0 && job.skills 
                          ? (() => {
                              const jobSkills = job.skills.split(',').map(s => s.trim().toLowerCase());
                              const matches = jobSkills.filter(s => candidateSkills.includes(s));
                              return Math.round((matches.length / jobSkills.length) * 100);
                            })()
                          : 0);

                    return (
                      <div key={job.id} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-between space-y-4 relative transition-all shadow-md">
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-slate-200">{job.title}</h4>
                              <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 block">{job.company} • {job.location}</span>
                            </div>
                            
                            {(isApplied || candidateSkills.length > 0) && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono tracking-wide border whitespace-nowrap ${
                                matchPercent >= 75 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                                matchPercent >= 40 ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                                'bg-slate-900 border-slate-800 text-slate-500'
                              }`}>
                                {matchPercent}% Match
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-3 leading-relaxed">{job.description}</p>
                        </div>

                        {/* Technology tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.skills ? (
                            job.skills.split(',').map((s, idx) => {
                              const holdsSkill = candidateSkills.includes(s.trim().toLowerCase());
                              return (
                                <span key={idx} className={`text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded border transition-colors ${
                                  holdsSkill ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-400' : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                                }`}>
                                  {s.trim()}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[8px] font-mono text-slate-600 italic">No technology tags listed</span>
                          )}
                        </div>

                        {/* 🚀 MUTATING RECRUITMENT STATUS SELECTION INTERACTION FRAME */}
                        <button
                          onClick={() => handleApplyToJob(job.id)}
                          disabled={applyingId !== null || isApplied}
                          className={`w-full mt-2 border font-extrabold text-[10px] py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-md ${
                            isApplied 
                              ? appStatus === 'Shortlisted'
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 cursor-not-allowed shadow-none' 
                                : appStatus === 'Rejected'
                                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-400 cursor-not-allowed shadow-none'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border-transparent cursor-pointer disabled:opacity-50'
                          }`}
                        >
                          {applyingId === job.id 
                            ? "Processing..." 
                            : isApplied 
                              ? appStatus === 'Shortlisted' 
                                ? "✓ Shortlisted" 
                                : appStatus === 'Rejected' 
                                  ? "✕ Rejected" 
                                  : "✓ Applied" 
                              : "Apply to Job"}
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}