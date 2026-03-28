import React, { useState, useRef } from 'react';
import { Camera, Mic, Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UploadForm({ onSubmit, isProcessing }) {
  const { t } = useTranslation();
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
    <section className="glass-panel p-6 sm:p-8 w-full max-w-2xl mx-auto backdrop-blur-3xl transition-all" aria-labelledby="form-heading">
      <h2 id="form-heading" className="text-2xl font-bold mb-6 text-center">{t('emergency_feed')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="situation-description" className="block text-sm font-bold mb-2 opacity-70 uppercase tracking-wider">
            {t('situation_description')}
          </label>
          <textarea 
            id="situation-description"
            rows={4}
            className="input-field resize-none"
            placeholder={t('placeholder_text')}
            value={text}
            onChange={e => setText(e.target.value)}
            aria-required="false"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              type="button"
              aria-label={image ? `Change uploaded image: ${image.name}` : t('upload_photo')}
              className={`border w-full rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group focus:outline-none focus:ring-2 focus:ring-blue-400 ${image ? 'bg-blue-600/10 border-blue-600/30' : 'bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`} 
              onClick={() => fileInputRef.current.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" tabIndex={-1} accept="image/*" onChange={handleImageChange} />
              {image ? (
                <>
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-2 overflow-hidden ring-2 ring-blue-500/50">
                    <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview of uploaded emergency condition" />
                  </div>
                  <span className="text-xs font-bold truncate w-full px-2">{image.name}</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-hover:scale-110 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mb-2 transition-all">
                    <Camera size={24} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold transition-colors opacity-70 group-hover:opacity-100 uppercase tracking-widest">{t('upload_photo')}</span>
                </>
              )}
            </button>

            <button 
              type="button"
              aria-label={isRecording ? t('recording') : audioBlob ? t('audio_attached') : t('record_audio')}
              className={`border w-full rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRecording ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : audioBlob ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
              onClick={handleMicClick}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110' : audioBlob ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30' : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-110'}`}>
                <Mic size={24} aria-hidden="true" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isRecording ? 'text-red-500' : audioBlob ? 'text-green-500' : 'opacity-70 group-hover:opacity-100'}`}>
                {isRecording ? t('recording') : audioBlob ? t('audio_attached') : t('record_audio')}
              </span>
            </button>
        </div>

        <button 
          type="submit" 
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="btn-primary w-full flex items-center justify-center gap-3 mt-4 text-sm font-bold uppercase tracking-widest"
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" aria-hidden="true" /> {t('analyzing')}</>
          ) : (
            <><Send size={18} aria-hidden="true" /> {t('request_assessment')}</>
          )}
        </button>
      </form>
    </section>
  );
}
