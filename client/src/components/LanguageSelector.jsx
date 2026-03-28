import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' }
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const changeLanguage = (langCode) => {
    // 1. Update internal state
    setCurrentLang(langCode);
    setIsOpen(false);

    // 2. Programmatically trigger Google Translate
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));
    } else {
      console.warn("Google Translate widget not found yet. It usually initializes in 1-2 seconds.");
    }
  };

  return (
    <div className="relative group">
      {/* Hidden container for actual Google Widget init */}
      <div id="google_translate_element" className="fixed top-[-100px] pointer-events-none opacity-0"></div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel hover:bg-blue-600/5 transition-all border border-slate-200/50 dark:border-slate-800/50 shadow-lg active:scale-95"
      >
        <Globe size={18} className="text-blue-500" />
        <span className="font-black text-xs uppercase tracking-widest opacity-80">
          {languages.find(l => l.code === currentLang)?.name || 'Language'}
        </span>
        <ChevronDown size={14} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-56 rounded-[2rem] glass-panel p-2 z-50 animate-in fade-in slide-in-from-top-4 border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden ring-1 ring-black/5 backdrop-blur-3xl">
            <div className="max-h-80 overflow-y-auto scrollbar-hide py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all flex items-center justify-between text-xs font-bold tracking-wide mb-1 ${currentLang === lang.code ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-600/10'}`}
                >
                  {lang.name}
                  {currentLang === lang.code && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
