import React, { useState, useRef } from 'react';
import { Camera, Mic, Send, Loader2 } from 'lucide-react';

export default function UploadForm({ onSubmit, isProcessing }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone", err);
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text && !image && !audioBlob) {
      alert("Please provide at least one input (image, audio, or text).");
      return;
    }
    
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    if (audioBlob) {
      const file = new File([audioBlob], "audio_record.webm", { type: "audio/webm" });
      formData.append('audio', file);
    }
    
    onSubmit(formData);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 w-full max-w-2xl mx-auto backdrop-blur-3xl transition-all">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-100">Emergency Feed</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Situation Description</label>
          <textarea 
            rows={4}
            className="input-field resize-none focus:ring-blue-500/50"
            placeholder="Type your emergency details, news headlines, or location..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${image ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 hover:bg-slate-800'}`} onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              {image ? (
                <>
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-2 overflow-hidden ring-2 ring-blue-500/50">
                    <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="preview" />
                  </div>
                  <span className="text-sm text-blue-300 font-medium truncate w-full px-2">{image.name}</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-800 group-hover:bg-slate-700 group-hover:scale-110 text-slate-400 rounded-full flex items-center justify-center mb-2 transition-all">
                    <Camera size={24} />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 font-medium transition-colors">Upload Photo</span>
                </>
              )}
            </div>

            <div 
              className={`border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isRecording ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : audioBlob ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900/50 hover:bg-slate-800'}`}
              onClick={handleMicClick}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110' : audioBlob ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30' : 'bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:scale-110'}`}>
                <Mic size={24} />
              </div>
              <span className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400' : audioBlob ? 'text-green-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {isRecording ? 'Recording... Tap to Stop' : audioBlob ? 'Audio Attached! Tap to redo' : 'Record Audio'}
              </span>
            </div>
        </div>

        <button 
          type="submit" 
          disabled={isProcessing}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-lg font-semibold tracking-wide"
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" /> Analyzing Situation...</>
          ) : (
            <><Send size={20} /> Request Emergency Assessment</>
          )}
        </button>
      </form>
    </div>
  );
}
