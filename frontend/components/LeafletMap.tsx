"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom leaflet marker icons
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LeafletMapProps {
  complaints: any[];
}

export default function LeafletMap({ complaints }: LeafletMapProps) {
  const [icons, setIcons] = useState<any>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Safely initialize leaflet icons on the client side only
    setIcons({
      green: createCustomIcon('green'),
      yellow: createCustomIcon('yellow'),
      orange: createCustomIcon('orange'),
      red: createCustomIcon('red')
    });
    // Re-mount the map container to clear stale instances
    setMapKey(prev => prev + 1);
  }, []);

  const getMarkerIcon = (complaint: any) => {
    if (!icons) return undefined;
    if (['Resolved', 'Closed', 'Citizen_Verified'].includes(complaint.status)) return icons.green;
    if (complaint.priority === 'CRITICAL' || complaint.priority === 'EMERGENCY') return icons.red;
    if (complaint.priority === 'HIGH') return icons.orange;
    return icons.yellow;
  };

  return (
    <MapContainer 
      key={mapKey}
      center={[28.6139, 77.2090]} 
      zoom={13} 
      scrollWheelZoom={false} 
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((c) => {
        const lat = c.location?.lat || c.latitude || 28.6139;
        const lng = c.location?.lng || c.longitude || 77.2090;
        const icon = getMarkerIcon(c);
        if (!icon) return null;
        return (
          <Marker key={c.id} position={[lat, lng]} icon={icon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-bold text-[#1E3A8A]">{c.id}</p>
                <p className="text-xs text-gray-800 font-medium">{c.title || c.category}</p>
                <p className="text-[10px] text-gray-500">{c.location?.address}</p>
                <p className="text-[10px] font-bold">Priority: {c.priority} | Status: {c.status}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
