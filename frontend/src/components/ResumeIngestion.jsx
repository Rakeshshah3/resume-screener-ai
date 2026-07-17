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
      // Stream uploads securely
      await Promise.all(fileQueue.map(file => resumeService.uploadResume(file)));
      
      // 🚀 SUCCESS UI STATE: Replaces the native window alert popup seamlessly!
      setStatus({ 
        type: 'success', 
        message: `Pipeline processing complete. Successfully parsed and extracted skill matrices from ${fileQueue.length} resume(s).` 
      });
      
      setFileQueue([]); 

      // Display the feedback statement briefly, then route home automatically
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
      
      {/* Navigation Header */}
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

      {/* Modern Feedback Banners */}
      {status.message && (
        <div className={`p-4 rounded-xl border text-xs font-medium mb-6 transition-all ${
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

      {/* Interactive Drag & Drop Area */}
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

      {/* ✨ ATTRACTIVE PREMIUM INGESTION DOCUMENT QUEUE CONTAINER */}
      {fileQueue.length > 0 && (
        <div className="mt-8 bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-400 to-emerald-500/10" />

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Ingestion Document Queue</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-slate-400">
              Staged: {fileQueue.length} Active Records
            </span>
          </div>
          
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {fileQueue.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all group shadow-sm">
                <div className="flex items-center gap-4.5 truncate">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-[9px] font-bold text-emerald-400 shadow-inner">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Metric Weight: <span className="text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeFileFromQueue(idx)}
                  className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 flex items-center justify-center text-sm transition-all cursor-pointer"
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
              className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-md border transition-all active:scale-98 cursor-pointer ${
                processing 
                  ? 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 shadow-emerald-950/30 shadow-lg'
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