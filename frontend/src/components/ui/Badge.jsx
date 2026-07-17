import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const baseStyle = "text-[11px] font-medium px-2 py-0.5 rounded-md border tracking-wide transition-colors duration-150";
  
  const variants = {
    default: "bg-slate-800 text-slate-400 border-slate-700/50",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 line-through decoration-rose-400/30",
    mono: "bg-slate-800 border-slate-700/50 text-slate-400 font-mono text-[10px]"
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}