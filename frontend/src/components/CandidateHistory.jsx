import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CandidateHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistoryLog = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // 🚀 FIXED: Pointing directly to the match resource route prefix tree
        const res = await axios.get('http://127.0.0.1:8000/match/candidate/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data || []);
      } catch (err) {
        console.error("Failed to query matrix matching logs repository:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryLog();
  }, []);

  if (loading) return <div className="text-xs font-mono text-slate-500 animate-pulse">Querying alignment history index...</div>;
  if (logs.length === 0) return (
    <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 font-mono bg-slate-950/20">
      Profile file not yet processed against corporate vacancy models. Upload a resume block to trigger automated analysis.
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Neural Matrix Match Log</h3>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Live index of system-evaluated position alignment vectors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log) => (
          <div key={log.job_id} className="backdrop-blur-md bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4 transition-all hover:border-slate-700/80 group">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-200 tracking-wide">{log.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.company} • <span className="text-slate-500">{log.location}</span></p>
                </div>
                
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono tracking-wide border shrink-0 ${
                  log.match_percentage >= 80 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                  log.match_percentage >= 50 ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                  'bg-rose-950/40 border-rose-500/30 text-rose-400'
                }`}>
                  {log.match_percentage}% Match
                </span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {log.job_skills && log.job_skills.split(',').map((skill, idx) => (
                  <span key={idx} className="text-[8px] font-mono font-medium bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/80 group-hover:border-slate-700/40 transition-colors">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}