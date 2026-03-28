import React from 'react';
import { AlertTriangle, Share2, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SafetyCard({ data }) {
  const { t } = useTranslation();
  if (!data) return null;

  const { is_emergency, status, immediate_actions, instruction, contact_instructions } = data;

  const colors = status == 'emergency' ? {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-600 dark:text-red-400',
    icon: <AlertTriangle className="text-red-500" size={40} />,
    badge: 'bg-red-500',
    gradient: 'from-red-500/20 to-transparent'
  } : {
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    text: 'text-green-600 dark:text-green-400',
    icon: <CheckCircle2 className="text-green-500" size={40} />,
    badge: 'bg-green-500',
    gradient: 'from-green-500/20 to-transparent'
  };

  return (
    <div className={`glass-panel border-l-8 ${colors.border} overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-700`}>
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${colors.gradient} opacity-30 pointer-events-none`}></div>

      <div className="relative z-10 p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-[2rem] ${colors.bg} shadow-inner border border-white/10`}>
              {colors.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50 mb-2 truncate">{t('status')}</p>
              <h2 className={`text-4xl font-black tracking-tight flex items-center gap-4 ${colors.text}`}>
                {(status || 'Normal').toUpperCase()}
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.badge}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${colors.badge}`}></span>
                </span>
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-6 flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-500" /> {t('immediate_actions')}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {immediate_actions && immediate_actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-5 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:scale-[1.01] transition-transform">
                  <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/20">
                    {idx + 1}
                  </span>
                  <p className="text-lg leading-relaxed font-semibold opacity-90">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 relative overflow-hidden group shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={16} /> {t('shareable_card')}
              </h3>
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                onClick={() => navigator.clipboard.writeText(contact_instructions || instruction)}
              >
                <Copy size={14} /> Copy for emergency broadcast
              </button>
            </div>
            <p className="text-xl italic font-serif leading-relaxed px-4 border-l-4 border-blue-500/50">
              "{contact_instructions || instruction}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
