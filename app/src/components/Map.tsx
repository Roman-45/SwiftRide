import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../types';

// Inline SVG icons → data URLs so we don't ship leaflet's default markers.
function markerIcon(fill: string, glyph: string) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40">
      <defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/></filter></defs>
      <path d="M17 1 C8 1 2 8 2 16 C2 26 17 39 17 39 C17 39 32 26 32 16 C32 8 26 1 17 1 Z" fill="${fill}" stroke="#F7F5F1" stroke-width="2" filter="url(#s)"/>
      <circle cx="17" cy="15" r="7" fill="#F7F5F1"/>
      <text x="17" y="19" text-anchor="middle" font-family="Geist Mono, monospace" font-size="10" font-weight="600" fill="${fill}">${glyph}</text>
    </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [34, 40],
    iconAnchor: [17, 39],
    popupAnchor: [0, -36],
  });
}

const PICKUP_ICON = markerIcon('#171512', 'A');
const DROPOFF_ICON = markerIcon('#E0531A', 'B');
const DRIVER_ICON = markerIcon('#1B4C9A', '•');

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [points, map]);
  return null;
}

export function Map({
  pickup,
  dropoff,
  driver,
  height = 480,
  interactive = true,
  followDriver = false,
}: {
  pickup?: LatLng;
  dropoff?: LatLng;
  driver?: LatLng | null;
  height?: number | string;
  interactive?: boolean;
  followDriver?: boolean;
}) {
  const center = pickup ?? dropoff ?? driver ?? { lat: 37.7749, lng: -122.4194 };
  const points = useMemo(() => {
    const p: LatLng[] = [];
    if (pickup) p.push(pickup);
    if (dropoff) p.push(dropoff);
    if (driver) p.push(driver);
    return p;
  }, [pickup, dropoff, driver]);

  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (followDriver && driver && mapRef.current) {
      mapRef.current.panTo([driver.lat, driver.lng], { animate: true });
    }
  }, [driver, followDriver]);

  const routeCoords = useMemo<L.LatLngTuple[]>(() => {
    if (!pickup || !dropoff) return [];
    return [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]];
  }, [pickup, dropoff]);

  return (
    <div className="rounded-lg overflow-hidden border border-line" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        style={{ height: '100%', width: '100%' }}
        ref={(m) => { mapRef.current = m as L.Map | null; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routeCoords.length === 2 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#E0531A', weight: 4, opacity: 0.9 }} />
        )}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={DROPOFF_ICON} />}
        {driver && <Marker position={[driver.lat, driver.lng]} icon={DRIVER_ICON} />}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
