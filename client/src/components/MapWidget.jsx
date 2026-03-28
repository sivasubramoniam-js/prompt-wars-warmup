import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 28.6139, 
  lng: 77.2090
};

export default function MapWidget({ planText }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''; 

  if (!apiKey) {
    return (
      <div className="glass-panel p-6 sm:p-8 mt-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-100">
          <span className="text-2xl">🗺️</span> Evacuation Plan & Route
        </h3>
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 mb-6">
          <p className="text-slate-300 text-lg leading-relaxed">{planText}</p>
        </div>
        <div className="w-full h-[350px] border border-slate-700/50 rounded-2xl bg-slate-900/80 flex flex-col items-center justify-center text-slate-400 text-center px-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-800/20 border-[20px] border-slate-900/50 mix-blend-overlay"></div>
          <div className="absolute inset-x-0 h-px bg-slate-700/50 top-1/2"></div>
          <div className="absolute inset-y-0 w-px bg-slate-700/50 left-1/2"></div>
          
          <div className="relative z-10 bg-slate-900/90 p-6 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md text-center max-w-sm">
            <span className="text-4xl mb-4 block">📍</span>
            <p className="font-semibold text-slate-200 mb-2">Google Maps Integration Ready</p>
            <p className="text-sm mt-2 text-slate-400">Set <code className="bg-slate-800 py-1 px-2 rounded text-blue-400 mx-1">VITE_GOOGLE_MAPS_API_KEY</code> in your .env file to enable live map view.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 mt-6 duration-700 animate-in fade-in slide-in-from-bottom-4 text-slate-100">
      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
        <span className="text-2xl">🗺️</span> Evacuation Plan & Route
      </h3>
      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 mb-6">
        <p className="text-slate-300 text-lg leading-relaxed">{planText}</p>
      </div>
      
      <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }],
                },
              ]
            }}
          >
            <Marker position={defaultCenter} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
