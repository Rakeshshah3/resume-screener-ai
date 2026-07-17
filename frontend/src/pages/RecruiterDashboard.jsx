import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RecruiterDashboard({ onLogout }) {
  const [jobForm, setJobForm] = useState({ 
    title: '', 
    company: '', 
    location: '', 
    description: '' 
  });
  
  const [jobsList, setJobsList] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null); // TRACKS ACTIVE SELECTION NODE
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', msg: '' });

  // INLINE DELETION VERIFICATION STATE
  const [deletingJobId, setDeletingJobId] = useState(null);

  // MODAL OVERLAY LOGIC STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Boot loader: Fetch all open job listings
  useEffect(() => {
    fetchJobs();
  }, []);

  // REFLEX TRIGGER: Fetch recommendations automatically when active job changes
  useEffect(() => {
    if (selectedJobId) {
      fetchRecommendations(selectedJobId);
    } else {
      setCandidates([]);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get('http://127.0.0.1:8000/jobs/', { headers });
      const jobs = res.data || [];
      setJobsList(jobs);
      
      // Auto-select the first job node in the cluster if nothing is active yet
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id);
      }
    } catch (err) {
      console.error("Failed to query active jobs directory:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchRecommendations = async (jobId) => {
    setLoadingPipeline(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(`http://127.0.0.1:8000/match/job/${jobId}`, { headers });
      setCandidates(res.data || []);
    } catch (err) {
      console.error("Failed to pull score vectors for job:", jobId, err);
      setCandidates([]);
    } finally {
      setLoadingPipeline(false);
    }
  };

  // 🚀 NEW FEATURE ACTION HANDLER: Patch pipeline selection metrics directly
  const handleUpdateStatus = async (matchId, newStatus) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setNotice({ type: '', msg: '' });

    try {
      await axios.patch(
        `http://127.0.0.1:8000/match/status/${matchId}?status_update=${newStatus}`,
        {},
        { headers }
      );
      setNotice({ type: 'success', msg: `✨ Candidate status marked as ${newStatus} successfully.` });
      if (selectedJobId) {
        fetchRecommendations(selectedJobId); // Refresh live UI matrices metrics
      }
    } catch (err) {
      console.error("Pipeline toggle exception caught:", err);
      setNotice({ type: 'error', msg: 'Failed to update candidate state context on remote node.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setNotice({ type: '', msg: '' });
    setActionLoading(true);

    const token = localStorage.getItem('token');
    
    const payload = {
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      description: jobForm.description
    };

    try {
      const res = await axios.post('http://127.0.0.1:8000/jobs/', payload, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setNotice({ type: 'success', msg: '✨ Position deployed. Backend skills processor synced!' });
      setJobForm({ title: '', company: '', location: '', description: '' });
      
      await fetchJobs();
      if (res.data?.id) {
        setSelectedJobId(res.data.id);
      }
    } catch (err) {
      setNotice({ 
        type: 'error', 
        msg: err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Failed to dispatch job schema.' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteJob = async (jobId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`http://127.0.0.1:8000/jobs/${jobId}`, { headers });
      setNotice({ type: 'success', msg: '🗑️ Vacancy scrubbed from system records successfully.' });
      
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }
      setDeletingJobId(null); 
      await fetchJobs();
    } catch (err) {
      console.error("Failed to execute item cleanup request:", err);
      setNotice({ type: 'error', msg: 'Handshake execution aborted. Failed to scrub vacancy node.' });
    }
  };

  const getSkillBreakdown = () => {
    const activeJob = jobsList.find(j => j.id === selectedJobId);
    if (!selectedCandidate || !activeJob || !activeJob.skills) {
      return { matched: [], missing: [] };
    }

    const rawCandSkills = selectedCandidate.skills || "";
    const candSkills = rawCandSkills.split(',').map(s => s.trim().toLowerCase());
    const jobSkills = activeJob.skills.split(',').map(s => s.trim().toLowerCase());

    return {
      matched: jobSkills.filter(s => candSkills.includes(s)),
      missing: jobSkills.filter(s => !candSkills.includes(s))
    };
  };

  const activeJobTitle = jobsList.find(j => j.id === selectedJobId)?.title || "Selected Node";
  const skillDetails = getSkillBreakdown();

  return (
    <div className="min-h-screen bg-[#030712] bg-radial-[at_top,_var(--tw-gradient-stops)] from-[#0b1329] via-[#030712] to-[#030712] text-slate-100 font-sans antialiased p-4 md:p-8 relative overflow-x-hidden">
      
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation Bar Frame */}
        <div className="backdrop-blur-md bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl shadow-black/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                RECRUITER<span className="text-blue-500 font-medium">CONSOLE</span>
              </h1>
            </div>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 font-medium tracking-wide">
              Evaluate system-computed neural scores and streamline targeted corporate placement loops.
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="group flex items-center gap-2 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            Disconnect Session
          </button>
        </div>

        {notice.msg && (
          <div className={`p-4 text-xs font-semibold rounded-xl border text-center shadow-lg backdrop-blur-md ${
            notice.type === 'success' ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/20 border-rose-800/60 text-rose-400'
          }`}>
            {notice.msg}
          </div>
        )}

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column Stack: Form & listings */}
          <div className="space-y-6">
            <div className="backdrop-blur-md bg-slate-900/20 border border-slate-800/70 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              <div className="mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">Publish Position</h3>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                  <input required type="text" name="title" value={jobForm.title} onChange={handleInputChange} placeholder="Senior Frontend Architect" className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                    <input required type="text" name="company" value={jobForm.company} onChange={handleInputChange} placeholder="Stripe" className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input required type="text" name="location" value={jobForm.location} onChange={handleInputChange} placeholder="Remote, US" className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Description</label>
                  <textarea required name="description" rows="4" value={jobForm.description} onChange={handleInputChange} placeholder="Specify technology stack requirements (e.g. React, Python)..." className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none resize-none" />
                </div>
                <button type="submit" disabled={actionLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer">
                  {actionLoading ? "Processing..." : "Post Position Openings"}
                </button>
              </form>
            </div>

            {/* INTERACTIVE NODES LIST */}
            <div className="backdrop-blur-md bg-slate-900/10 border border-slate-800/50 p-4 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800/60 pb-2">Select Active Job Node</h4>
              {loadingJobs ? (
                <div className="text-[10px] font-mono text-slate-500 animate-pulse">Syncing jobs catalog...</div>
              ) : jobsList.length === 0 ? (
                <div className="text-[10px] font-mono text-slate-600">No vacancies open.</div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {jobsList.map((j) => (
                    <div 
                      key={j.id} 
                      onClick={() => deletingJobId !== j.id && setSelectedJobId(j.id)}
                      className={`p-3 border rounded-xl transition-all cursor-pointer text-left select-none relative group/card ${
                        deletingJobId === j.id
                          ? 'border-rose-800 bg-rose-950/10'
                          : selectedJobId === j.id 
                            ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' 
                            : 'bg-slate-950/40 border-slate-900 hover:border-slate-800/80'
                      }`}
                    >
                      {deletingJobId === j.id ? (
                        <div className="space-y-2 py-1" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[10px] font-bold text-rose-400 tracking-wide leading-relaxed">
                            Are you sure to delete this {j.title}?
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => confirmDeleteJob(j.id)}
                              className="bg-rose-600 text-white text-[9px] font-extrabold px-3 py-1 rounded transition-colors hover:bg-rose-700 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => setDeletingJobId(null)}
                              className="bg-slate-800 text-slate-300 text-[9px] font-extrabold px-3 py-1 rounded border border-slate-700 transition-colors hover:bg-slate-700 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-1.5 pr-6">
                            <span className="font-bold text-xs text-slate-200 block truncate max-w-[145px]">{j.title}</span>
                            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded shrink-0">{j.company}</span>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingJobId(j.id); 
                            }}
                            className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800/60 cursor-pointer z-30"
                            title="Remove Vacancy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>

                          <div className="flex flex-wrap gap-1">
                            {j.skills ? (
                              j.skills.split(',').map((s, idx) => (
                                <span key={idx} className="text-[8px] font-mono font-medium bg-blue-950/40 text-blue-400 px-1 rounded border border-blue-900/30">
                                  {s.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] font-mono text-slate-500 italic">No skill descriptors</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column Grid: Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-md bg-slate-900/20 border border-slate-800/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    Live Evaluation Matrix: <span className="text-blue-400 normal-case font-bold font-sans text-xs">for "{activeJobTitle}"</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Real-time vector matching query rankings (Click row to inspect vectors)</p>
                </div>
                <button 
                  onClick={() => selectedJobId && fetchRecommendations(selectedJobId)}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-400 rounded-xl transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                </button>
              </div>

              {loadingPipeline ? (
                <div className="text-center py-16 text-xs font-mono text-slate-500 animate-pulse">Running talent matching algorithms...</div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-slate-800/60 rounded-xl text-xs text-slate-500 font-mono bg-slate-950/20">
                  No matching candidate records found for this active criteria cluster node.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800/50">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[9px] tracking-wider border-b border-slate-800/80">
                      <tr>
                        <th className="p-4">Candidate Profile</th>
                        <th className="p-4">Reference File Identification</th>
                        <th className="p-4 text-center">AI Score Alignment</th>
                        <th className="p-4 text-center">Pipeline Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 bg-slate-950/10">
                      {candidates.map((c, i) => (
                        <tr 
                          key={i} 
                          onClick={() => {
                            setSelectedCandidate(c);
                            setIsModalOpen(true);
                          }}
                          className="hover:bg-slate-900/40 transition-colors cursor-pointer group/row"
                        >
                          <td className="p-4">
                            <div className="font-bold text-slate-200 tracking-wide text-xs">
                              {c.candidate_name || `Candidate #${c.resume_id}`}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-400 font-mono text-[11px] max-w-[180px] truncate">
                              {c.resume_file || "resume_file.pdf"}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide border ${
                              c.match_percentage >= 80 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                              c.match_percentage >= 50 ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                              'bg-rose-950/40 border-rose-500/30 text-rose-400'
                            }`}>
                              {c.match_percentage}%
                            </span>
                          </td>
                          
                          {/* 🚀 NEW: DYNAMIC RECRUITMENT PROCESSING STATUS COLUMN */}
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black tracking-widest font-mono uppercase border select-none ${
                              c.status === 'Shortlisted' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
                              c.status === 'Rejected' ? 'bg-rose-950/30 border-rose-500/40 text-rose-400' :
                              'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {c.status || "Applied"}
                            </span>
                          </td>
                          
                          {/* 🚀 NEW: RECRUITER ACTIONS CELL PANEL */}
                          <td className="p-4 text-right flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={async () => {
                                const targetId = c.resume_id; 
                                if (!targetId) {
                                  setNotice({ type: 'error', msg: 'Unable to parse valid database resume tracking ID.' });
                                  return;
                                }

                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await axios.get(`http://127.0.0.1:8000/resume/download/${targetId}`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: 'blob' 
                                  });

                                  const fileBlobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                  const temporaryLink = document.createElement('a');
                                  temporaryLink.href = fileBlobUrl;
                                  temporaryLink.setAttribute('download', `Candidate_Resume_Node_${targetId}.pdf`);
                                  document.body.appendChild(temporaryLink);
                                  temporaryLink.click();
                                  
                                  temporaryLink.parentNode.removeChild(temporaryLink);
                                  window.URL.revokeObjectURL(fileBlobUrl);
                                } catch (err) {
                                  console.error("Transmission stream dropped:", err);
                                  setNotice({ type: 'error', msg: 'Network handshake rejected file streaming.' });
                                }
                              }}
                              className="bg-slate-950 group-hover/row:bg-slate-900 border border-slate-800 text-slate-400 font-black px-2 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer relative z-20"
                            >
                              Resume
                            </button>

                            {/* Shortlist interactive trigger component */}
                            {c.status !== 'Shortlisted' && (
                              <button 
                                onClick={() => handleUpdateStatus(c.id, "Shortlisted")}
                                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/20 font-black px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer relative z-20"
                              >
                                Shortlist
                              </button>
                            )}

                            {/* Reject interactive trigger component */}
                            {c.status !== 'Rejected' && (
                              <button 
                                onClick={() => handleUpdateStatus(c.id, "Rejected")}
                                className="bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-rose-400 hover:bg-rose-950/20 font-black px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer relative z-20"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Metrics Counters Frame */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="backdrop-blur-md bg-slate-900/10 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Total Active Roles</span>
                </div>
                <span className="text-3xl font-black text-slate-200 font-mono">{jobsList.length}</span>
              </div>
              <div className="backdrop-blur-md bg-slate-900/10 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Matches Found For Node</span>
                </div>
                <span className="text-3xl font-black text-blue-500 font-mono">{candidates.length}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* OVERLAY MODAL */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800/90 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            
            <div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Candidate Skill Diagnostics</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {selectedCandidate.candidate_name || `Candidate #${selectedCandidate.resume_id}`} — Alignment: {selectedCandidate.match_percentage}%
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-2">● Overlapping Target Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillDetails.matched.length > 0 ? (
                    skillDetails.matched.map((s, idx) => (
                      <span key={idx} className="bg-emerald-950/30 border border-emerald-800/60 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 italic">Zero skill overlaps found</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider block mb-2">● Missing Target Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillDetails.missing.length > 0 ? (
                    skillDetails.missing.map((s, idx) => (
                      <span key={idx} className="bg-rose-950/30 border border-rose-800/60 text-rose-400 font-mono text-[9px] px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 italic">No missing skills required</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCandidate(null);
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Dismiss Interface Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}