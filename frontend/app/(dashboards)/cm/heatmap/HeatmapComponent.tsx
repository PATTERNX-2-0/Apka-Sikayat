"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

// ==========================================
// MOCK DATA: DELHI DISTRICTS
// ==========================================
interface DistrictData {
  id: string;
  name: string;
  coords: [number, number];
  complaints: number;
  status: 'CRITICAL' | 'HIGH' | 'HEALTHY';
}

const DELHI_DISTRICTS: DistrictData[] = [
  { id: 'D01', name: 'Central Delhi', coords: [28.6465, 77.2157], complaints: 85, status: 'HEALTHY' },
  { id: 'D02', name: 'East Delhi', coords: [28.6300, 77.2900], complaints: 420, status: 'HIGH' },
  { id: 'D03', name: 'New Delhi', coords: [28.6139, 77.2090], complaints: 45, status: 'HEALTHY' },
  { id: 'D04', name: 'North Delhi', coords: [28.6830, 77.1850], complaints: 150, status: 'HEALTHY' },
  { id: 'D05', name: 'North East Delhi', coords: [28.7100, 77.2600], complaints: 890, status: 'CRITICAL' },
  { id: 'D06', name: 'North West Delhi', coords: [28.7300, 77.1300], complaints: 210, status: 'HIGH' },
  { id: 'D07', name: 'Shahdara', coords: [28.6800, 77.3000], complaints: 560, status: 'CRITICAL' },
  { id: 'D08', name: 'South Delhi', coords: [28.5355, 77.2100], complaints: 120, status: 'HEALTHY' },
  { id: 'D09', name: 'South East Delhi', coords: [28.5500, 77.2500], complaints: 340, status: 'HIGH' },
  { id: 'D10', name: 'South West Delhi', coords: [28.5800, 77.0500], complaints: 180, status: 'HEALTHY' },
  { id: 'D11', name: 'West Delhi', coords: [28.6500, 77.1000], complaints: 410, status: 'HIGH' },
];

export default function HeatmapComponent() {
  const [activeDistrict, setActiveDistrict] = useState<DistrictData | null>(null);

  // Styling Helpers based on your required theme
  const getStyleConfig = (status: string) => {
    switch(status) {
      case 'CRITICAL': return { color: '#EF4444', fillColor: '#EF4444', icon: ShieldAlert }; // Red
      case 'HIGH': return { color: '#FF9933', fillColor: '#FF8C00', icon: Activity }; // Saffron
      case 'HEALTHY': return { color: '#22C55E', fillColor: '#22C55E', icon: CheckCircle2 }; // Green
      default: return { color: '#87CEEB', fillColor: '#87CEEB', icon: Activity };
    }
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-gray-200 shadow-inner z-0">
      <MapContainer 
        center={[28.6139, 77.2090]} // Center of Delhi
        zoom={11} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        {/* Clean, Premium Muted Base Map from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Move Zoom Control to bottom right so it doesn't overlap our custom UI */}
        <ZoomControl position="bottomright" />

        {DELHI_DISTRICTS.map((district) => {
          const config = getStyleConfig(district.status);
          const radiusSize = district.complaints > 500 ? 30 : district.complaints > 200 ? 20 : 12;

          return (
            <CircleMarker
              key={district.id}
              center={district.coords}
              radius={radiusSize}
              pathOptions={{ 
                color: config.color, 
                fillColor: config.fillColor, 
                fillOpacity: 0.6, 
                weight: 2 
              }}
              eventHandlers={{
                mouseover: () => setActiveDistrict(district),
                mouseout: () => setActiveDistrict(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                <div className="p-1">
                  <p className="font-black text-gray-900 mb-1">{district.name}</p>
                  <p className="text-xs text-gray-600 font-bold">{district.complaints} Active Cases</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Interactive Overlay Box (Top Left inside the map) */}
      {activeDistrict && (
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-100 min-w-[250px] animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-[#1E3A8A] text-lg">{activeDistrict.name}</h3>
            {React.createElement(getStyleConfig(activeDistrict.status).icon, { 
              className: `w-5 h-5 ${getStyleConfig(activeDistrict.status).color}` 
            })}
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Density</p>
              <p className="text-2xl font-black text-gray-900">{activeDistrict.complaints}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zone Status</p>
              <span className={`inline-flex px-2 py-1 rounded text-xs font-black uppercase tracking-wider ${
                activeDistrict.status === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                activeDistrict.status === 'HIGH' ? 'bg-[#FF9933]/20 text-[#FF8C00]' :
                'bg-green-100 text-green-600'
              }`}>
                {activeDistrict.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}