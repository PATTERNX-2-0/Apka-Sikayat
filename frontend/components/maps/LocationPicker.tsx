"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon missing in Next.js - safely initialized on the client side only
let customIcon: L.Icon | undefined = undefined;
if (typeof window !== 'undefined') {
  customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Sub-component to handle map clicks
function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Sub-component to pan/set view of the map dynamically
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]); // Default: New Delhi
  const [initialCenter] = useState<[number, number]>([28.6139, 77.2090]); // Static center for the MapContainer mount
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Force a fresh mount on the client side to avoid HMR and Strict Mode duplicate container collisions
    setMapKey(prev => prev + 1);

    // Auto-locate user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          onLocationSelect(newPos[0], newPos[1]);
        },
        () => console.log("Geolocation denied")
      );
    }
  }, [onLocationSelect]);

  if (!mounted) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0 relative">
      <MapContainer 
        key={mapKey} 
        center={initialCenter} 
        zoom={12} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={position} />
        <MapEvents onSelect={(lat, lng) => {
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }} />
        {customIcon && <Marker position={position} icon={customIcon} />}
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-[#1E3A8A] shadow-md z-[1000] pointer-events-none border border-gray-100">
        Click map to set precise location
      </div>
    </div>
  );
}