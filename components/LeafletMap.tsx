"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  pin?: { lat: number; lng: number } | null;
  accuracy?: number | null;
  me?: { lat: number; lng: number } | null;
  editable?: boolean;
  onPin?: (p: { lat: number; lng: number }) => void;
  className?: string;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 29 17 29s17-16.3 17-29C34 7.6 26.4 0 17 0z" fill="#008751"/><circle cx="17" cy="17" r="7" fill="#fff"/></svg>`,
  iconSize: [34, 46],
  iconAnchor: [17, 46],
});

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb55"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), zoom));
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

function ClickToPin({ onPin }: { onPin: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({ click: (e) => onPin({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function LeafletMap({ center, zoom = 18, pin, accuracy, me, editable, onPin, className }: MapProps) {
  const [satellite, setSatellite] = useState(true);
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 ${className ?? "h-80"}`}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} maxZoom={20} className="h-full w-full" scrollWheelZoom>
        {satellite ? (
          <TileLayer
            key="sat"
            maxZoom={20}
            maxNativeZoom={19}
            attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            key="osm"
            maxZoom={20}
            maxNativeZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <Recenter center={center} zoom={zoom} />
        {editable && onPin && <ClickToPin onPin={onPin} />}
        {me && <Marker position={[me.lat, me.lng]} icon={meIcon} />}
        {pin && accuracy ? (
          <Circle center={[pin.lat, pin.lng]} radius={accuracy} pathOptions={{ color: "#008751", weight: 1, fillOpacity: 0.12 }} />
        ) : null}
        {pin && (
          <Marker
            position={[pin.lat, pin.lng]}
            icon={pinIcon}
            draggable={Boolean(editable)}
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                onPin?.({ lat: ll.lat, lng: ll.lng });
              },
            }}
          />
        )}
      </MapContainer>
      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="absolute right-2 top-2 z-[1000] rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow"
      >
        {satellite ? "Street map" : "Satellite"}
      </button>
    </div>
  );
}
