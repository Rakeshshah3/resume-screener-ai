import React, { useState } from 'react';

export default function JobForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Title</label>
          <input 
            required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Senior Go Engineer"
            className="w-full bg-[#121826] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</label>
          <input 
            required type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g., SpaceAI"
            className="w-full bg-[#121826] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location Status</label>
        <input 
          required type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Remote / Paris, FR"
          className="w-full bg-[#121826] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw Job Description</label>
        <textarea 
          required rows="4" name="description" value={formData.description} onChange={handleInputChange} placeholder="Paste the technical criteria here..."
          className="w-full bg-[#121826] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none leading-relaxed"
        />
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/60">
        <button 
          type="button" onClick={onCancel} disabled={isSubmitting}
          className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit" disabled={isSubmitting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Confirm Posting'}
        </button>
      </div>
    </form>
  );
}