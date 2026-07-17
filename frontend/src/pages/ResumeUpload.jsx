import React, { useState } from 'react';
import { resumeService } from '../services/api';

export default function ResumeUpload({ jobId, jobTitle, onBack, onRefreshData }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      filterAndQueueFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      filterAndQueueFiles(Array.from(e.target.files));
    }
  };

  const filterAndQueueFiles = (incomingFiles) => {
    const validFiles = incomingFiles.filter(file => file.type === 'application/pdf');
    if (validFiles.length !== incomingFiles.length) {
      setUploadError('Invalid format detected. The ingestion pipeline layer strictly accepts PDF configurations only.');
      return;
    }
    
    // Prevent adding identical duplicate files to the queue matrix
    setFiles(prev => {
      const existingNames = prev.map(f => f.name);
      const uniqueIncoming = validFiles.filter(f => !existingNames.includes(f.name));
      return [...prev, ...uniqueIncoming];
    });
    setUploadError(null); 
  };

  const removeFileFromQueue = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadError("processing_info");

    try {
      await Promise.all(
        files.map(file => resumeService.uploadResume(file))
      );
      
      setUploadError("success_msg");
      setFiles([]); 

      setTimeout(() => {
        if (onRefreshData) onRefreshData();
        onBack(); 
      }, 1500);

    } catch (err) {
      console.error("File ingestion error:", err);
      setUploadError(
        err.response?.data?.detail || 
        "Failed to upload documents. Please verify your token state or server status."
      );
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-8 font-sans antialiased selection:bg-emerald-500/20 relative overflow-hidden">
      
      {/* Premium Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Breadcrumb / Top Navigation Bar */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/60 pb-6 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
            <span>Workspace</span> &bull; <span>Pipeline Ingestion</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Upload Candidates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingesting structured assets for <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded ml-0.5">{jobTitle || 'Data Scientist'}</span>
          </p>
        </div>
        <button 
          onClick={onBack}
          disabled={uploading}
          className="self-start sm:self-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white font-medium text-xs px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-98 disabled:cursor-not-allowed"
        >
          <span>&larr;</span> Return to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Dynamic Status Notification System */}
        {uploadError && (
          <div className={`p-4 rounded-xl border text-xs font-medium transition-all duration-300 transform shadow-2xl backdrop-blur-md animate-fade-in ${
            uploadError === "success_msg"
              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20'
              : uploadError === "processing_info"
              ? 'bg-blue-500/5 border-blue-500/30 text-blue-400 shadow-blue-950/20'
              : 'bg-rose-500/5 border-rose-500/30 text-rose-400 shadow-rose-950/20'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-base leading-none">
                {uploadError === "success_msg" ? '✨' : uploadError === "processing_info" ? '🧬' : '⚠️'}
              </span>
              <div className="space-y-1 w-full">
                <p className="font-semibold uppercase tracking-wider text-[10px]">
                  {uploadError === "success_msg" ? "Pipeline Dynamic Success" : uploadError === "processing_info" ? "Neural Engine Status" : "System Halt Execution Error"}
                </p>
                <p className="text-slate-300 leading-normal">
                  {uploadError === "success_msg" 
                    ? "Pipeline processing complete. Extracted skill metrics successfully synchronized to vector pools." 
                    : uploadError === "processing_info"
                    ? "Analyzing document architecture, mapping token state arrays, and mining vector weights..."
                    : uploadError}
                </p>
                {uploadError === "processing_info" && (
                  <div className="w-full bg-slate-950 rounded-full h-[3px] mt-3 overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full w-4/5 animate-[pulse_1.5s_infinite] rounded-full" style={{ width: '65%' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Unified Ingestion Zone Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border border-dashed rounded-2xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center bg-[#101626]/40 backdrop-blur-md shadow-2xl relative ${
            uploading 
              ? 'border-slate-800 opacity-40 pointer-events-none' 
              : 'border-slate-800 hover:border-emerald-500/40 hover:bg-[#121b30]/50 group cursor-pointer'
          }`}
        >
          <input
            type="file"
            id="file-browse-input"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <label htmlFor="file-browse-input" className="w-full flex flex-col items-center justify-center cursor-pointer">
            <div className="h-12 w-12 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-center text-xl text-slate-400 mb-4 shadow-2xl group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
              📥
            </div>
            
            <p className="text-[14px] font-medium text-slate-200 tracking-tight transition-colors group-hover:text-white">
              <span className="text-emerald-400 font-bold hover:underline">Click to browse local files</span> or drag & drop candidate profiles
            </p>
            <p className="text-slate-500 text-[11px] mt-2 font-normal max-w-sm leading-relaxed">
              Accepts binary structural <span className="text-slate-400 font-mono font-bold">PDF</span> blueprints under a maximum volume capacity restriction of 10MB per unit block.
            </p>
          </label>
        </div>

        {/* High-End Document Queue Table Layout */}
        {files.length > 0 && (
          <div className="bg-[#101626]/40 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 animate-slide-up">
            
            {/* Table Control Strip */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Ingestion Staging Queue</h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-900/80 border border-slate-800 px-2.5 py-0.5 rounded-full text-emerald-400 shadow-inner">
                {files.length} Staged Unit{files.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {/* List Row Elements */}
            <div className="divide-y divide-slate-800 max-h-[280px] overflow-y-auto bg-slate-950/10">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-3.5 text-xs hover:bg-[#121c33]/30 transition-all group">
                  <div className="flex items-center gap-4 truncate">
                    <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center font-mono text-[9px] font-bold text-slate-400 tracking-wider shadow-inner group-hover:bg-emerald-950/30 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-all duration-300">
                      PDF
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate text-[13px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Payload Size:</span>
                        <span className="text-slate-400 font-bold bg-slate-900 px-1.5 py-0.2 rounded">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFileFromQueue(idx)}
                    className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 flex items-center justify-center text-lg transition-all duration-200 cursor-pointer active:scale-90"
                    title="Evict record from processing cache"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Ingestion Footer Processing Desk */}
            <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex justify-end items-center shadow-inner">
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className={`font-bold text-xs px-6 py-2.5 rounded-xl border tracking-wide transition-all duration-200 cursor-pointer shadow-lg active:scale-98 disabled:active:scale-100 ${
                  uploading 
                    ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-50' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 shadow-emerald-950/30 hover:shadow-emerald-500/10'
                }`}
              >
                {uploading ? 'Executing Architecture Analysis...' : `Compile Ingestion Pipeline (${files.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}