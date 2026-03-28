import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Cloud, Sun, CloudRain, Wind, Plus, X, Thermometer, Droplets, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@react-google-maps/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export function WeatherMonitor({ isLoaded }) {
  const { t } = useTranslation();
  const [cities, setCities] = useState(() => {
    const saved = localStorage.getItem('sahay_weather_cities');
    return saved ? JSON.parse(saved) : ['Bangalore'];
  });
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sahay_weather_cities', JSON.stringify(cities));
    fetchWeatherAll();
    const interval = setInterval(fetchWeatherAll, 600000);
    return () => clearInterval(interval);
  }, [cities]);

  const fetchWeatherAll = async () => {
    setLoading(true);
    const results = {};
    for (const city of cities) {
      try {
        const res = await axios.get(`${API_URL}/api/weather?city=${city}`);
        results[city] = res.data;
      } catch (err) {
        console.error(`Weather Fetch failed for ${city}:`, err);
      }
    }
    setWeatherData(results);
    setLoading(false);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const cityName = place.name || (place.address_components && place.address_components[0].long_name);
      
      if (cityName && cities.length < 4 && !cities.includes(cityName)) {
        setCities([...cities, cityName]);
      } else if (cities.length >= 4) {
        alert("Maximum 4 locations allowed.");
      }
    }
  };

  const removeCity = (city) => {
    if (city === 'Bangalore') {
      alert("Bangalore is default and cannot be removed.");
      return;
    }
    setCities(cities.filter(c => c !== city));
  };

  const getWeatherIcon = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('rain') || d.includes('drizzle')) return <CloudRain className="text-blue-500" size={32} />;
    if (d.includes('cloud')) return <Cloud className="text-slate-400" size={32} />;
    if (d.includes('sun') || d.includes('clear')) return <Sun className="text-amber-500" size={32} />;
    return <Wind className="text-slate-300" size={32} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-black flex items-center gap-3">
          <Cloud size={24} className="text-blue-500" /> Weather
        </h3>
        
        {isLoaded ? (
          <Autocomplete 
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <div className="relative w-full max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search City..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </Autocomplete>
        ) : (
          <div className="w-full max-w-[200px] h-8 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cities.map((city) => (
          <div key={city} className="glass-panel p-5 rounded-[2rem] border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            {city !== 'Bangalore' && (
              <button 
                onClick={() => removeCity(city)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            )}
            
            <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Station</p>
                  <h4 className="text-lg font-black truncate max-w-[120px]">{city}</h4>
               </div>
               {weatherData[city] ? getWeatherIcon(weatherData[city].desc) : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>}
            </div>

            {weatherData[city] ? (
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black">{weatherData[city].temp}°</span>
                   <span className="text-xs font-bold opacity-60 mb-2 truncate max-w-[80px]">{weatherData[city].desc}</span>
                </div>
                <div className="flex justify-between items-center opacity-60">
                   <div className="flex items-center gap-1">
                      <Droplets size={12} /> <span className="text-[9px] font-bold">{weatherData[city].humidity}%</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Wind size={12} /> <span className="text-[9px] font-bold">{weatherData[city].wind}km/h</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
