import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import SafetyCard from './components/SafetyCard';
import MapWidget from './components/MapWidget';
import { NewsDashboard } from './components/NewsDashboard';
import { WeatherMonitor } from './components/WeatherMonitor';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { useJsApiLoader } from '@react-google-maps/api';
import { ShieldAlert, Info, Map as MapIcon, LayoutDashboard, Send, Activity, Zap, Flame, Globe, Cloud } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const libraries = ['places'];

export default function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [signals, setSignals] = useState([]);
  
  const emergencyFeedRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToFeed = () => {
    emergencyFeedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.log("Defaulting to Marathahalli Location")
      );
    }

    const fetchSignals = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/signals`);
        setSignals(res.data.signals || []);
      } catch (err) {
        console.error("Signal fetch failed");
      }
    };
    fetchSignals();
    const interval = setInterval(fetchSignals, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (formData) => {
    setIsProcessing(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const json = await response.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setActiveTab('feed');
    } catch (err) {
      setError(err.message || 'Check Flask server connectivity.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Background Blurs */}
      <div className="fixed top-0 right-0 w-[80vw] h-[80vh] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-soft"></div>

      {/* GLOBAL NAVBAR */}
      <nav className="sticky top-0 z-[60] bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-600/30 ring-2 ring-white/10">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter block leading-none">SAHAY</span>
            <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 mt-1 block">Global Signal Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </nav>

      {/* SIGNAL BAR (World Monitor Style - Marquee) */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-6 py-2 overflow-hidden relative z-40 group">
        <div className="absolute left-0 top-0 bottom-0 px-6 bg-slate-50 dark:bg-slate-950/80 z-50 flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
          <Globe size={14} className="text-blue-500" />
          <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Global Risk Matrix</span>
        </div>

        <div className="pl-48 flex items-center">
          {(() => {
            const totalChars = signals.reduce((acc, sig) => acc + sig.title.length + 20, 0); // +20 for gap/type
            const duration = Math.max(20, totalChars * 0.15); // Adjust multiplier for speed
            return (
              <div
                className="animate-marquee hover:[animation-play-state:paused] flex items-center gap-12 whitespace-nowrap"
                style={{ animationDuration: `${duration}s` }}
              >
                {signals.length > 0 ? (
                  [...signals, ...signals].map((sig, idx) => (
                    <div key={idx} className="flex items-center gap-3 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                      <div className={`w-2 h-2 rounded-full ${sig.severity === 'Red' ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`}></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{sig.title}</span>
                      <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">[{sig.type}]</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-30 animate-pulse">Establishing Signal Uplink...</div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 relative z-10">

        {/* MOBILE NAVIGATION TABS */}
        <div className="lg:hidden col-span-12 flex rounded-3xl glass-panel p-1.5 border-slate-200 dark:border-slate-800 shadow-2xl mb-2">
          {[
            { id: 'feed', icon: <Send size={18} />, label: t('emergency_feed') },
            { id: 'news', icon: <LayoutDashboard size={18} />, label: t('news_alerts') },
            { id: 'weather', icon: <Cloud size={18} />, label: 'Weather' },
            { id: 'map', icon: <MapIcon size={18} />, label: t('live_map') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'opacity-50'}`}
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* LEFT COLUMN: UPLOAD & RESULTS */}
        <div className={`col-span-1 lg:col-span-8 space-y-8 ${activeTab !== 'feed' ? 'hidden lg:block' : 'block animate-in slide-in-from-left-8 duration-700'}`}>
          <div className="hidden lg:block mb-8 p-8 glass-panel rounded-[3rem] border border-blue-500/10 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldAlert size={120} />
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-[0.9]">
              {t('app_title')}
            </h1>
            <p className="text-xl font-bold opacity-60 leading-relaxed max-w-3xl">
              Cross-signal situational analysis converged. Upload emergency feed to generate mission-critical assessment.
            </p>
          </div>

          {/* HAZARD MAP ABOVE FEED */}
          <div className="hidden lg:block">
            <MapWidget
              planText={data?.evacuation_plan || "Select an assessment or upload context to generate routing."}
              userLocation={userLocation}
              isLoaded={isLoaded}
            />
          </div>

          <div ref={emergencyFeedRef} className="scroll-mt-24">
            <UploadForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          </div>

          {error && (
            <div className="p-8 bg-red-600/10 border border-red-500/20 rounded-[2.5rem] text-red-600 dark:text-red-400 flex items-start gap-5 animate-in slide-in-from-top-4 shadow-2xl">
              <ShieldAlert className="mt-1 flex-shrink-0" size={28} />
              <div>
                <p className="font-black uppercase tracking-widest text-xs mb-1">Signal Loss / Error</p>
                <p className="text-lg font-bold">{error}</p>
              </div>
            </div>
          )}

          {data && (
            <div className="space-y-12 pt-4">
              <SafetyCard data={data} />
            </div>
          )}
        </div>


        {/* RIGHT COLUMN: NEWS, WEATHER & ANALYTICS */}
        <div className={`col-span-1 lg:col-span-4 space-y-8 ${activeTab === 'feed' ? 'hidden lg:block' : 'block animate-in slide-in-from-right-8 duration-700'}`}>
          <div className={`glass-panel p-8 rounded-[3rem] shadow-2xl ${activeTab === 'news' ? 'block' : 'hidden lg:block'}`}>
            <NewsDashboard />
          </div>

          <div className={`glass-panel p-8 rounded-[3rem] shadow-2xl ${activeTab === 'weather' ? 'block' : 'hidden lg:block'}`}>
            <WeatherMonitor isLoaded={isLoaded} />
          </div>

          <div className={`hidden lg:block`}>
            {/* The map is now centrally located at the top of the feed */}
            <div className="glass-panel p-8 rounded-[3rem] bg-blue-600/5 dark:bg-blue-600/10 border-blue-500/20 shadow-inner relative overflow-hidden">
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Info size={14} className="text-blue-500" /> Operational Status
               </h4>
               <p className="text-xs font-bold leading-relaxed opacity-60 italic">
                 Map analysis and satellite signals are currently aggregated above the main feed for better situational workflow.
               </p>
            </div>
          </div>

          {/* SENSOR DATA / INTEL PANEL */}
          <div className="glass-panel p-8 rounded-[3rem] bg-indigo-600/5 dark:bg-indigo-600/10 border-indigo-500/20 hidden lg:block shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <Activity className="text-indigo-500" size={24} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Infrastructure Intel</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Network Integrity', val: '99.4%', status: 'Stable' },
                { label: 'Gemini Latency', val: '0.4s', status: 'Optimal' },
                { label: 'Active Streams', val: '12 Global', status: 'Live' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{stat.label}</span>
                  <div className="text-right">
                    <p className="text-xs font-black tracking-wider">{stat.val}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">{stat.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto p-12 border-t border-slate-200 dark:border-slate-800 mt-20 text-center">
        <p className="text-xs font-black opacity-30 uppercase tracking-[0.4em] mb-2 flex items-center justify-center gap-2">
          <Zap size={14} className="text-blue-500" /> Powered by Gemini 2.5-flash
        </p>
        <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.25em]">
          Sahay Situational Intelligence Matrix © 2026
        </p>
      </footer>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-10 right-10 z-[100] group">
        <button 
          onClick={scrollToFeed}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all active:scale-95 group-hover:rotate-12"
          aria-label="Back to Emergency Feed"
        >
          <Send size={28} className="-mr-1 -mt-1" />
        </button>
        <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t('emergency_feed')}
        </div>
      </div>
    </div>
  );
}
