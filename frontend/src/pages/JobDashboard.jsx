import React, { useState, useEffect } from 'react';
import { jobService } from '../services/api';
import RecommendationPanel from '../components/RecommendationPanel';
import Badge from '../components/ui/Badge';
import JobForm from '../components/forms/JobForm';
import ResumeUpload from './ResumeUpload';

export default function JobDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Workflow navigation states
  const [selectedJob, setSelectedJob] = useState(null);
  const [uploadingJob, setUploadingJob] = useState(null);

  useEffect(() => {
    fetchJobsPipeline();
  }, []);

  const fetchJobsPipeline = () => {
    setLoading(true);
    jobService.getJobs()
      .then(data => {
        // Safe check for empty databases
        if (data && data.length > 0) {
          setJobs(data);
          setError(null);
        } else {
          loadFallbackData();
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard database fetch failure:", err);
        setError("Unable to sync active database records. Displaying local simulation environment.");
        loadFallbackData();
        setLoading(false);
      });
  };

  const loadFallbackData = () => {
    setJobs([
      { 
        id: 1, 
        title: "Senior Python Developer", 
        company: "AeroAI Labs", 
        location: "New York, NY (Hybrid)", 
        description: "Architect highly optimized backends and microservices utilizing FastAPI, PostgreSQL, and robust Docker orchestration pipelines." 
      },
      { 
        id: 2, 
        title: "AI/ML Research Engineer", 
        company: "NeuralLabs Group", 
        location: "Remote", 
        description: "Design, fine-tune, and deploy predictive transformer models tailored for semantic text parsing and vector-matching matrices." 
      }
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleFormSubmit = async (jobPayload) => {
    setFormSubmitting(true);
    setError(null);
    try {
      const newJob = await jobService.createJob(jobPayload);
      setJobs(prev => [newJob, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Pipeline post error:", err);
      setError("Failed to stream job record to backend database.");
      setIsModalOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Safe data synchronization passback from nested views
  const handleRefreshFromPipeline = () => {
    fetchJobsPipeline();
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-8 font-sans antialiased selection:bg-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <RecommendationPanel 
          jobId={selectedJob.id} 
          jobTitle={selectedJob.title} 
          onBack={() => setSelectedJob(null)} 
          onRefreshData={handleRefreshFromPipeline}
        />
      </div>
    );
  }

  if (uploadingJob) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-8 font-sans antialiased selection:bg-emerald-500/20 relative overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <ResumeUpload 
          jobId={uploadingJob.id} 
          jobTitle={uploadingJob.title} 
          onBack={() => setUploadingJob(null)} 
          onRefreshData={handleRefreshFromPipeline}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans antialiased selection:bg-emerald-500/20 relative overflow-hidden">
      
      {/* Premium Background Ambient Glow Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Premium Sticky Top Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-md relative z-20">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-500/20" />
            <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">Recruit.AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-500/20 transition-all duration-200 cursor-pointer hidden sm:block active:scale-98"
            >
              + Add New Job
            </button>

            {/* Profile Menu Dropdown Control */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer flex items-center justify-center font-bold text-xs text-slate-300 tracking-wider focus:outline-none focus:border-slate-600"
              >
                RC
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-800 bg-[#101626] p-1.5 shadow-2xl z-50 animate-fade-in text-xs backdrop-blur-md">
                    <div className="px-3 py-2 border-b border-slate-800 text-slate-400 font-mono text-[10px] truncate">
                      recruiter@enterprise.com
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left mt-1 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      Disconnect Session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Viewport */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-6 relative z-10">
        
        {/* Network Status Indicator */}
        {error && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center justify-between shadow-xl backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-slate-500 hover:text-slate-300 font-bold ml-4 transition-colors cursor-pointer">✕</button>
          </div>
        )}

        {/* Dynamic Section Heading */}
        <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Executive Control Center</div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-0.5">Active Job Pipelines</h1>
            <p className="text-xs text-slate-400 mt-0.5">Deploy positions, inject candidate resume streams, and parse evaluation matrices.</p>
          </div>
          <button 
            onClick={fetchJobsPipeline}
            className="self-start text-[11px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-98"
          >
            ↻ Refresh Sync
          </button>
        </div>

        {/* Operational Grid Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 text-xs font-mono tracking-wider gap-3">
            <div className="h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Syncing database registry records...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-[#101626]/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 hover:bg-[#121c33]/20 transition-all duration-300 group shadow-2xl backdrop-blur-sm hover:translate-y-[-2px]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 truncate">
                      <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5">
                        <span>{job.company}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-slate-500 font-normal">{job.location}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400 shadow-sm shrink-0">
                      ID: #{job.id}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed bg-[#0a0f1d]/60 p-4 rounded-xl border border-slate-800/80 font-normal shadow-inner min-h-[74px]">
                    {job.description}
                  </p>
                </div>

                {/* Card Action Controls */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-sm font-mono uppercase tracking-wider">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" /> Sync Active
                    </span>
                    <button 
                      onClick={() => setUploadingJob(job)}
                      className="text-[11px] bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md font-medium"
                    >
                      + Ingest PDF
                    </button>
                  </div>
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="text-xs font-bold text-slate-300 hover:text-white hover:translate-x-0.5 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Review Matrix</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Trigger for Mobile Views */}
      <div className="sm:hidden fixed bottom-6 right-6 z-35">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 w-12 rounded-full shadow-2xl flex items-center justify-center font-bold text-xl border border-emerald-500/20 transition-all cursor-pointer active:scale-90"
        >
          +
        </button>
      </div>

      {/* Creation Modal System Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0d1322] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Initialize Position Record</h2>
              <p className="text-xs text-slate-400 mt-0.5">Specify operational job parameters to parse matching matrices directly.</p>
            </div>

            <JobForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => setIsModalOpen(false)} 
              isSubmitting={formSubmitting} 
            />
          </div>
        </div>
      )}

    </div>
  );
}