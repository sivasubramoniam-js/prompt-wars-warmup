import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import SafetyCard from './components/SafetyCard';
import MapWidget from './components/MapWidget';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsProcessing(true);
    setError(null);
    setData(null);
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }
      
      setData(json);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Is the Flask server running?');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        
        <header className="text-center mb-16 mt-8">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-3xl mb-8 shadow-2xl border border-blue-500/20 shadow-blue-500/10 relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <ShieldAlert size={56} className="text-blue-400 relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300 drop-shadow-sm">
            Sahay
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Multimodal Disaster Response Advisor. <br className="hidden md:block" /> 
            <span className="text-slate-300 font-medium">Upload your situation, get immediate life-saving actions.</span>
          </p>
        </header>

        <UploadForm onSubmit={handleSubmit} isProcessing={isProcessing} />

        {error && (
          <div className="glass-panel p-6 bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-top-4 flex items-start gap-4 mx-auto max-w-2xl">
            <ShieldAlert className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Error analyzing emergency</p>
              <p className="text-sm mt-1 opacity-90 leading-relaxed font-mono bg-red-950/50 p-2 rounded mt-2">{error}</p>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <SafetyCard data={data} />
            {data.evacuation_plan && (
              <MapWidget planText={data.evacuation_plan} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
