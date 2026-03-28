import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'}`} size={20} />
        <Moon className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100 text-blue-400' : 'rotate-90 scale-0 opacity-0'}`} size={20} />
      </div>
    </button>
  );
}
