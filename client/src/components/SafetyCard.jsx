import React from 'react';
import { AlertTriangle, Share2, ShieldQuestion, CheckCircle2 } from 'lucide-react';

export default function SafetyCard({ data }) {
  if (!data) return null;

  const { urgency_level, immediate_actions, shareable_safety_card } = data;

  let colors = {
    bg: 'bg-green-500/10',
    border: 'border-green-500/50',
    text: 'text-green-500',
    icon: <CheckCircle2 className="text-green-500 size-10" />,
    badge: 'bg-green-500',
    gradient: 'from-green-500/20 to-transparent'
  };

  const statusLower = (urgency_level || '').toLowerCase();
  
  if (statusLower === 'red') {
    colors = {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-500',
      icon: <AlertTriangle className="text-red-500 size-10" />,
      badge: 'bg-red-500',
      gradient: 'from-red-500/20 to-transparent'
    };
  } else if (statusLower === 'yellow') {
    colors = {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-500',
      icon: <AlertTriangle className="text-yellow-500 size-10" />,
      badge: 'bg-yellow-500',
      gradient: 'from-yellow-500/20 to-transparent'
    };
  }

  return (
    <div className={`glass-panel border-2 ${colors.border} mt-8 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${colors.gradient} opacity-50 pointer-events-none`}></div>
      
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${colors.bg} shadow-lg backdrop-blur-md border border-white/5`}>
              {colors.icon}
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">Disaster Response Analysis</p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Status: <span className={colors.text}>{urgency_level.toUpperCase()}</span>
                <span className="relative flex h-3 w-3 ml-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.badge}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${colors.badge}`}></span>
                </span>
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <ShieldQuestion size={24} className="text-blue-400" /> Immediate Life-Saving Actions
            </h3>
            <ul className="space-y-4">
              {immediate_actions && immediate_actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors shadow-inner">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 leading-relaxed text-lg font-medium">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={16} /> Shareable Summary
              </h3>
              <button 
                className="text-white hover:text-blue-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow border border-slate-600 flex items-center gap-2 active:scale-95" 
                onClick={() => navigator.clipboard.writeText(shareable_safety_card)}
              >
                Copy for WhatsApp
              </button>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed pt-2 pl-2 border-l-2 border-slate-700 ml-1">
              "{shareable_safety_card}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
