import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ShieldAlert, Zap, Flame, Wind, Activity, Waves, CloudRain, AlertTriangle, Calendar, Info, ShieldCheck, Globe, Newspaper, Send, Settings, CheckCircle2 } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.25rem'
};

const worldViewDefault = {
  lat: 20, 
  lng: 10
};

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const darkStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

export default function MapWidget({ planText, userLocation, isLoaded }) {
  const { t } = useTranslation();
  const [signals, setSignals] = useState([]);
  const [range, setRange] = useState('1'); 
  const [hoveredSignal, setHoveredSignal] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState(localStorage.getItem('sahay_telegram_chat_id') || '');
  const [telegramStatus, setTelegramStatus] = useState(null); // 'success', 'error', 'sending'
  const mapRef = useRef(null);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 300000); 
    return () => clearInterval(interval);
  }, [range]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/signals?range=${range}`);
      setSignals(res.data.signals || []);
    } catch (err) {
      console.error("Signal logic failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramNotify = async (signal) => {
    if (!telegramChatId) {
       setTelegramStatus('error');
       setTimeout(() => setTelegramStatus(null), 3000);
       return;
    }
    setTelegramStatus('sending');
    try {
       await axios.post(`${API_URL}/api/telegram/alert`, {
          signal,
          chat_id: telegramChatId
       });
       setTelegramStatus('success');
       setTimeout(() => setTelegramStatus(null), 3000);
    } catch (err) {
       console.error("Telegram notification failed:", err);
       setTelegramStatus('error');
       setTimeout(() => setTelegramStatus(null), 3000);
    }
  };

  const saveChatId = (id) => {
     setTelegramChatId(id);
     localStorage.setItem('sahay_telegram_chat_id', id);
  };

  const getSignalColor = (type) => {
    switch(type) {
      case 'FIRE': return '#f97316';
      case 'EARTHQUAKE': return '#ef4444';
      case 'NATURAL': return '#3b82f6';
      case 'FLOOD': return '#0ea5e9';
      case 'TSUNAMI': return '#6366f1';
      case 'STORM': return '#a855f7';
      default: return '#eab308';
    }
  };

  const getSignalIcon = (type) => {
    switch(type) {
      case 'FIRE': return <Flame size={14} className="text-orange-500" />;
      case 'EARTHQUAKE': return <Activity size={14} className="text-red-500" />;
      case 'NATURAL': return <Wind size={14} className="text-blue-500" />;
      case 'FLOOD': return <Waves size={14} className="text-sky-500" />;
      case 'TSUNAMI': return <Waves size={14} className="text-indigo-500" />;
      case 'STORM': return <CloudRain size={14} className="text-purple-500" />;
      case 'OTHER': return <AlertTriangle size={14} className="text-yellow-500" />;
      default: return <ShieldAlert size={14} className="text-blue-500" />;
    }
  };

  const onDisasterClick = (signal) => {
    setSelectedSignal(signal);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: signal.lat, lng: signal.lng });
      mapRef.current.setZoom(6);
    }
  };

  if (!isLoaded) {
    return (
      <div className="glass-panel p-6 sm:p-8 mt-6">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">🌍 {t('live_map')} · Risk Heatmap</h3>
        <div className="w-full h-[350px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
      </div>
    );
  }

  const activeInfoWindowSignal = hoveredSignal || selectedSignal;

  const rangeOptions = [
    { label: 'Today', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '1 Month', value: '30' }
  ];

  return (
    <div className="glass-panel p-6 sm:p-8 mt-6 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2 tracking-tighter uppercase">
            🌍 {t('live_map')} · AI Matrix
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Satellite + Web Search + Telegram Uplink Enabled</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
           {/* Telegram Subscription Bar */}
           <div className="flex items-center gap-3 p-2 pr-4 bg-slate-100 dark:bg-slate-900/80 rounded-[1.25rem] border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                 <Send size={14} />
              </div>
              <input 
                 type="text" 
                 placeholder="Telegram Chat ID" 
                 value={telegramChatId}
                 onChange={(e) => saveChatId(e.target.value)}
                 className="bg-transparent border-none outline-none text-[10px] font-black w-[120px] placeholder:opacity-40"
              />
              <span className="text-[8px] font-black uppercase opacity-30 mt-0.5 tracking-tighter cursor-help group relative">
                 ?
                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] lowercase font-medium">Message @userinfobot to get your ID</span>
              </span>
           </div>

           <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              {rangeOptions.map((opt) => (
                 <button
                    key={opt.value}
                    onClick={() => setRange(opt.value)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === opt.value ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'opacity-40 hover:opacity-100'}`}
                 >
                    {opt.label}
                 </button>
              ))}
           </div>
        </div>
      </div>
      
      <div className="w-full h-[500px] rounded-[3.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative shadow-blue-500/5 group">
        {loading && (
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={worldViewDefault}
          zoom={2.2}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: document.documentElement.classList.contains('dark') ? darkStyles : [],
            restriction: {
              latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
              strictBounds: true
            }
          }}
        >
          {signals.map((signal) => (
            <React.Fragment key={signal.id}>
              <Circle
                center={{ lat: signal.lat, lng: signal.lng }}
                radius={signal.severity === 'Red' ? 800000 : 400000}
                options={{
                  fillColor: getSignalColor(signal.type),
                  fillOpacity: 0.15,
                  strokeColor: getSignalColor(signal.type),
                  strokeOpacity: 0.3,
                  strokeWeight: 1
                }}
              />
              <Marker
                position={{ lat: signal.lat, lng: signal.lng }}
                onClick={() => onDisasterClick(signal)}
                onMouseOver={() => setHoveredSignal(signal)}
                onMouseOut={() => setHoveredSignal(null)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: getSignalColor(signal.type),
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#fff',
                  scale: signal.severity === 'Red' ? 7 : 5
                }}
              />
            </React.Fragment>
          ))}

          {activeInfoWindowSignal && (
            <InfoWindow
              position={{ lat: activeInfoWindowSignal.lat, lng: activeInfoWindowSignal.lng }}
              onCloseClick={() => {
                setSelectedSignal(null);
                setHoveredSignal(null);
              }}
              options={{
                pixelOffset: new window.google.maps.Size(0, -15),
                disableAutoPan: true
              }}
            >
              <div className="p-4 min-w-[300px] max-w-[350px] text-slate-900 font-sans pointer-events-none select-none bg-white">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(activeInfoWindowSignal.type)}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{activeInfoWindowSignal.type}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${activeInfoWindowSignal.threat_level === 'Extreme' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {activeInfoWindowSignal.threat_level || 'N/A'} Threat
                  </span>
                </div>
                <h4 className="font-bold text-sm leading-snug mb-2 italic">"{activeInfoWindowSignal.title}"</h4>
                
                {activeInfoWindowSignal.web_intelligence && (
                   <div className="mb-3 p-3 bg-slate-50 border-l-[3px] border-blue-600 rounded-r-xl">
                      <div className="flex items-center gap-2 mb-1.5 opacity-50">
                         <Newspaper size={12} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Live Search Update</span>
                      </div>
                      <p className="text-[10px] leading-relaxed font-semibold">
                         {activeInfoWindowSignal.web_intelligence}
                      </p>
                   </div>
                )}

                {activeInfoWindowSignal.safety_guideline && (
                  <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2 ring-2 ring-blue-600/5">
                    <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-black text-blue-800 leading-tight uppercase">
                      Action: {activeInfoWindowSignal.safety_guideline}
                    </p>
                  </div>
                )}
                
                <p className="text-[8px] mt-3 opacity-30 font-bold uppercase tracking-widest text-right">{activeInfoWindowSignal.date}</p>
              </div>
            </InfoWindow>
          )}

          {userLocation && (
            <Marker 
              position={userLocation} 
              zIndex={100}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff',
                scale: 1.2
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 px-2 gap-4">
           <div className="space-y-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 opacity-50">
                 <AlertTriangle size={14} className="text-amber-500" /> Ground-Truth Intelligence
              </h4>
              <p className="text-xs font-bold leading-none opacity-40">Connected to Satellite Feeds + Verified Web Context</p>
           </div>
           
           <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border transition-all duration-500 ${telegramStatus === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600' : telegramStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
              <div className={`w-2 h-2 rounded-full ${telegramStatus === 'success' ? 'bg-green-500' : telegramStatus === 'error' ? 'bg-red-500' : telegramStatus === 'sending' ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                 {telegramStatus === 'success' ? 'Uplink Sent' : telegramStatus === 'error' ? 'Check ID' : telegramStatus === 'sending' ? 'Transmitting...' : 'Telegram Service Ready'}
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
           {signals.length > 0 ? signals.map((sig) => (
             <div
               key={sig.id}
               className={`text-left p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col gap-5 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 ${selectedSignal?.id === sig.id ? 'ring-2 ring-blue-500/20 shadow-xl' : ''}`}
             >
                <div className="flex items-start justify-between w-full">
                   <div className="flex items-center gap-4 cursor-pointer" onClick={() => onDisasterClick(sig)}>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 shadow-sm transition-transform hover:scale-110">
                         {getSignalIcon(sig.type)}
                      </div>
                      <div>
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block">{sig.type}</span>
                         <h5 className="text-[13px] font-black leading-snug max-w-[220px]">{sig.title}</h5>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sig.threat_level === 'Extreme' ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-80'}`}>
                        {sig.threat_level || 'Active'}
                     </div>
                     {/* Telegram Dispatch Button */}
                     <button 
                       onClick={() => handleTelegramNotify(sig)}
                       disabled={telegramStatus === 'sending'}
                       className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                       title="Dispatch to Telegram"
                     >
                        <Send size={14} />
                     </button>
                   </div>
                </div>

                {sig.web_intelligence && (
                   <div className="p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl">
                      <div className="flex items-center gap-2 mb-2 opacity-30">
                         <Globe size={12} />
                         <span className="text-[9px] font-black uppercase tracking-widest leading-none">Verified Update</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-bold italic">
                         "{sig.web_intelligence}"
                      </p>
                   </div>
                )}

                {sig.safety_guideline && (
                   <div className="mt-auto pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                         <ShieldCheck size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            Mission Directive: {sig.safety_guideline}
                        </p>
                      </div>
                   </div>
                )}
             </div>
           )) : (
             <div className="col-span-full py-20 text-center opacity-20">
                <Calendar size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Synchronizing with Satellite Intelligence...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
