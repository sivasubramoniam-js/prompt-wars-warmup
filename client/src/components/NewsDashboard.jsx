import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Newspaper, ExternalLink, RefreshCw, Radio } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export function NewsDashboard() {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newsRes, alertsRes] = await Promise.all([
        axios.get(`${API_URL}/api/news`),
        axios.get(`${API_URL}/api/alerts`)
      ]);
      setNews(newsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching disaster data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Radio className="text-red-500 animate-pulse" size={24} />
          {t('news_alerts')}
        </h3>
        <button onClick={fetchData} className="p-2 glass-panel transition-all active:rotate-180 duration-500" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-2xl border-l-4 glass-panel flex gap-4 ${alert.severity === 'Red' ? 'border-l-red-500 bg-red-500/10' : 'border-l-orange-500 bg-orange-500/10'}`}>
                <AlertTriangle className={alert.severity === 'Red' ? 'text-red-500' : 'text-orange-500'} size={24} />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">{alert.title}</h4>
                  <p className="text-sm opacity-90 font-medium">{alert.region} - {alert.source}</p>
                  <p className="text-xs mt-1 opacity-75 leading-relaxed">{alert.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
            <Newspaper size={16} /> Latest Global Reports
          </h4>
          {loading && (
            <div className="py-10 text-center">
              <RefreshCw className="animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-xs opacity-60">{t('fetching_news')}</p>
            </div>
          )}
          {!loading && news.length === 0 && <p className="text-sm opacity-50 px-4">{t('no_news')}</p>}
          {news.map((item, idx) => (
            <a 
              key={idx} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-blue-600/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors">
                  {item.title}
                </p>
                <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 mt-1 flex-shrink-0" />
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] opacity-50 font-bold uppercase tracking-wider">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
