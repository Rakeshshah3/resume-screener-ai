import React, { useState } from 'react';
import { resumeService } from '../services/api';

export default function ResumeUpload({ jobId, jobTitle, onBack, onRefreshData }) {
  const [fileQueue, setFileQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (processing) return;
    const files = Array.from(e.dataTransfer.files);
    filterAndQueueFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    filterAndQueueFiles(files);
  };

  const filterAndQueueFiles = (files) => {
    const validFiles = files.filter(file => file.type === 'application/pdf');
    if (validFiles.length !== files.length) {
      setStatus({ 
        type: 'error', 
        message: 'Invalid format detected. The ingestion pipeline layer strictly accepts PDF configurations only.' 
      });
      return;
    }
    setFileQueue(prev => [...prev, ...validFiles]);
    setStatus({ type: '', message: '' }); 
  };

  const removeFileFromQueue = (index) => {
    setFileQueue(prev => prev.filter((_, i) => i !== index));
  };

  const executeIngestionPipeline = async () => {
    if (fileQueue.length === 0) return;
    
    setProcessing(true);
    setStatus({ type: 'info', message: 'Analyzing document architecture and parsing vector metrics...' });

    try {
      // Stream uploads in parallel arrays securely
      await Promise.all(fileQueue.map(file => resumeService.uploadResume(file)));
      
      // 🚀 FIXED: Replaces any structural window popups natively with an elegant inline status block
      setStatus({ 
        type: 'success', 
        message: `Pipeline processing complete. Successfully parsed and extracted skill matrices from ${fileQueue.length} resume(s).` 
      });
      
      setFileQueue([]); // Flush queue files layout cleanly

      // Hold the gorgeous success state visible briefly, then auto-return back home
      setTimeout(() => {
        if (onRefreshData) onRefreshData();
        if (onBack) onBack();
      }, 1500);

    } catch (err) {
      console.error("Ingestion sequence exception error:", err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Pipeline processing exception. Please verify your token state or server status.' 
      });
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 font-sans antialiased selection:bg-emerald-500/20">
      
      {/* Upper Navigation Header Area */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-6 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Upload Candidates</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest resume records for <span className="text-emerald-400 font-semibold">{jobTitle || 'Data Scientist'} Role</span>
          </p>
        </div>
        <button 
          onClick={onBack}
          disabled={processing}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-700/60 shadow-sm transition-all cursor-pointer active:scale-98"
        >
          &larr; Back
        </button>
      </div>

      {/* Embedded Status Notification Alerts */}
      {status.message && (
        <div className={`p-4 rounded-xl border text-xs font-medium mb-6 transition-all transform animate-fade-in ${
          status.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
            : status.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold shadow-md shadow-emerald-950/10'
            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-sm">{status.type === 'error' ? '⚠️' : status.type === 'success' ? '✨' : '🧬'}</span>
            <p>{status.message}</p>
          </div>
        </div>
      )}

      {/* Interactive Dropzone Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center bg-[#111726]/20 border-slate-800 hover:border-slate-700 ${
          processing ? 'opacity-40 pointer-events-none' : 'hover:bg-[#111726]/40'
        }`}
      >
        <input
          type="file"
          id="file-browse-input"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="h-10 w-10 bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-center text-lg text-slate-400 mb-3 shadow-inner">
          📥
        </div>
        
        <p className="text-[13px] font-medium text-slate-300">
          <label htmlFor="file-browse-input" className="text-emerald-400 font-bold hover:underline cursor-pointer transition-all">Click to browse</label> or drag & drop application records
        </p>
        <p className="text-slate-500 text-[11px] mt-1.5 font-normal">Supports secure vector processing for PDF formatting configurations only.</p>
      </div>

      {/* 💎 HIGHLY ATTRACTIVE & PREMIUM INGESTION DOCUMENT QUEUE */}
      {fileQueue.length > 0 && (
        <div className="mt-8 bg-slate-900/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 animate-slide-up">
          {/* Neon Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Ingestion Document Queue</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-950/60 border border-slate-800 px-2.5 py-0.5 rounded-full text-emerald-400 shadow-sm">
              Staged: {fileQueue.length} Active Records
            </span>
          </div>
          
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {fileQueue.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-emerald-500/20 hover:bg-slate-950/80 transition-all group shadow-inner">
                <div className="flex items-center gap-4 truncate">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center font-mono text-[9px] font-bold text-emerald-400 tracking-wider shadow-inner group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate text-[12px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Metric Allocation Weight: <span className="text-slate-400 font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeFileFromQueue(idx)}
                  className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 flex items-center justify-center text-lg transition-all cursor-pointer font-light active:scale-90"
                  title="Remove document from pipeline queue"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-end">
            <button
              onClick={executeIngestionPipeline}
              disabled={processing}
              className={`font-bold text-xs px-6 py-2.5 rounded-xl shadow-md border transition-all active:scale-98 cursor-pointer tracking-wide ${
                processing 
                  ? 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 shadow-emerald-950/40 shadow-xl'
              }`}
            >
              {processing ? 'Processing Documents...' : `Process Ingestion Layer (${fileQueue.length})`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}