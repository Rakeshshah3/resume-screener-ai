import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CorporateOpenings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  // Fetch active system listings on component load
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://127.0.0.1:8000/jobs/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch vacancies dashboard matrix:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // 🚀 INTERACTIVE ACTION HANDLER FOR THE TARGETED ROLE MATCH
  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`http://127.0.0.1:8000/match/apply/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`✨ Application Successful!\nYour neural alignment score for this role is: ${res.data.match_score}%`);
      
      // Optional: Refresh the page or trigger a parent reload state to update logs
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.detail || "Application transmission handshake dropped.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div className="text-xs font-mono text-slate-500 animate-pulse">Syncing jobs repository matrix...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="backdrop-blur-md bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4 transition-all hover:border-slate-700/80 group shadow-lg">
          
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-200 tracking-wide">{job.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{job.company} • <span className="text-slate-500">{job.location}</span></p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans line-clamp-3 leading-relaxed">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-1 pt-1">
              {job.skills && job.skills.split(',').map((skill, idx) => (
                <span key={idx} className="text-[8px] font-mono font-medium bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/80">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* 🚀 THE STRATEGIC INTERACTIVE APPLICATION TRIGGER BUTTON */}
          <button
            onClick={() => handleApply(job.id)}
            disabled={applyingId !== null}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 border border-transparent disabled:border-slate-800 text-white font-extrabold text-[10px] py-2.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            {applyingId === job.id ? "Syncing Application..." : "Apply to Job"}
          </button>

        </div>
      ))}
    </div>
  );
}