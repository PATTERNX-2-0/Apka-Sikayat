"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Activity, CheckCircle2, AlertOctagon, Info, Flame, AlertTriangle, CheckSquare, X } from 'lucide-react';

export interface HotspotData {
  id: string;
  name: string;
  coords: [number, number];
  complaints: number;
  status: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'DARK_RED';
  openCases: number;
  resolvedCases: number;
  criticalCases: number;
  severityScore: number;
  impactRadius: number;
  riskScore: number;
  hotspotScore: number;
  categoryBreakdown: { [key: string]: number };
  priorityBreakdown: { [key: string]: number };
  departmentBreakdown: { [key: string]: number };
  criticalIssueNames: string[];
}

interface HeatmapComponentProps {
  hotspots: HotspotData[];
}

function MapResize() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size once map mounts to fix gray box / off-center Leaflet bug
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function HeatmapComponent({ hotspots }: HeatmapComponentProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotData | null>(null);

  // Styling config helper based on 5 levels of density/urgency
  const getStyleConfig = (status: HotspotData['status']) => {
    switch(status) {
      case 'DARK_RED': // Emergency Area
        return { color: '#7F1D1D', fillColor: '#991B1B', text: 'Emergency Area', bgClass: 'bg-red-950 text-red-200 border-red-800', icon: AlertOctagon };
      case 'RED': // Critical
        return { color: '#DC2626', fillColor: '#EF4444', text: 'Critical Zone', bgClass: 'bg-red-100 text-red-700 border-red-200', icon: ShieldAlert };
      case 'ORANGE': // High
        return { color: '#EA580C', fillColor: '#F97316', text: 'High Density', bgClass: 'bg-orange-100 text-orange-700 border-orange-200', icon: Flame };
      case 'YELLOW': // Moderate
        return { color: '#CA8A04', fillColor: '#FACC15', text: 'Moderate Density', bgClass: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle };
      case 'GREEN': // Low
      default:
        return { color: '#16A34A', fillColor: '#22C55E', text: 'Low Density', bgClass: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
    }
  };

  const activeHotspot = selectedHotspot || hoveredHotspot;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-gray-200 shadow-inner z-0">
      <MapContainer 
        center={[28.6139, 77.2090]} // Center of Delhi
        zoom={11} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <MapResize />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <ZoomControl position="bottomright" />

        {hotspots.map((hotspot) => {
          const config = getStyleConfig(hotspot.status);
          // Radius based on calculated impactRadius from AI engine
          const radiusSize = hotspot.impactRadius || 12;

          return (
            <CircleMarker
              key={hotspot.id}
              center={hotspot.coords}
              radius={radiusSize}
              pathOptions={{ 
                color: config.color, 
                fillColor: config.fillColor, 
                fillOpacity: 0.55, 
                weight: selectedHotspot?.id === hotspot.id ? 4 : 2 
              }}
              eventHandlers={{
                mouseover: () => {
                  if (!selectedHotspot) setHoveredHotspot(hotspot);
                },
                mouseout: () => {
                  setHoveredHotspot(null);
                },
                click: () => {
                  setSelectedHotspot(selectedHotspot?.id === hotspot.id ? null : hotspot);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                <div className="p-1">
                  <p className="font-black text-gray-900 mb-0.5">{hotspot.name}</p>
                  {(hotspot.status === 'RED' || hotspot.status === 'DARK_RED') && hotspot.criticalIssueNames?.length > 0 ? (
                    <div className="mt-1 space-y-0.5 max-w-[220px]">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Emergency Problems:</p>
                      {hotspot.criticalIssueNames.map((issue, idx) => (
                        <p key={idx} className="text-xs text-gray-800 font-bold truncate">• {issue}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 font-bold">{hotspot.openCases} Open Cases ({hotspot.criticalCases} Critical)</p>
                  )}
                  <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mt-1">Click for Full Analysis</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Dynamic Detail Overlay Card */}
      {activeHotspot && (
        <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-200 w-[340px] max-h-[85%] overflow-y-auto animate-in fade-in zoom-in duration-200 custom-scrollbar">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Geospatial Target</span>
              <h3 className="font-black text-[#1E3A8A] text-xl leading-none mt-1">{activeHotspot.name}</h3>
            </div>
            <div className="flex gap-2">
              {selectedHotspot && (
                <button 
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getStyleConfig(activeHotspot.status).bgClass}`}>
              {getStyleConfig(activeHotspot.status).text}
            </span>
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
              AI Risk: {activeHotspot.riskScore}%
            </span>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Open</span>
              <span className="text-base font-black text-gray-800">{activeHotspot.openCases}</span>
            </div>
            <div className="bg-red-50/50 border border-red-100/50 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-red-500 uppercase tracking-wider block">Critical</span>
              <span className="text-base font-black text-red-700">{activeHotspot.criticalCases}</span>
            </div>
            <div className="bg-green-50/50 border border-green-100/50 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-green-500 uppercase tracking-wider block">Resolved</span>
              <span className="text-base font-black text-green-700">{activeHotspot.resolvedCases}</span>
            </div>
          </div>

          {/* Detailed breakdowns */}
          <div className="space-y-4 mt-6 border-t border-gray-100 pt-5">
            
            {/* Category breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1.5 text-[#FF9933]" /> Category Breakdown
              </p>
              <div className="space-y-1.5">
                {Object.entries(activeHotspot.categoryBreakdown).slice(0, 3).map(([cat, count]) => {
                  const percent = Math.round((count / activeHotspot.complaints) * 100);
                  return (
                    <div key={cat} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-700 mb-0.5">
                        <span className="truncate pr-4">{cat}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9933] rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Department Breakdown
              </p>
              <div className="space-y-1.5">
                {Object.entries(activeHotspot.departmentBreakdown).slice(0, 3).map(([dept, count]) => {
                  const percent = Math.round((count / activeHotspot.complaints) * 100);
                  return (
                    <div key={dept} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-700 mb-0.5">
                        <span>{dept}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-purple-500" /> Priority Level
              </p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(activeHotspot.priorityBreakdown).map(([prio, count]) => (
                  <span key={prio} className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                    prio === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                    prio === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    prio === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {prio}: {count}
                  </span>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}