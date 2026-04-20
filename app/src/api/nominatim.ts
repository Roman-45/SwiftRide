// OSM Nominatim place search — used for the passenger booking dropoff
// typeahead. We already use OpenStreetMap for tiles (per brief), so
// Nominatim is the natural companion. Restricted to Rwanda via
// countrycodes=rw since the backend only accepts Rwanda coordinates.
//
// Public service — no key needed. Nominatim's usage policy says: set a
// descriptive User-Agent (we can't set User-Agent from browser JS, so
// Referer is the closest proxy), limit concurrent usage, and cache.
// We cache identical queries for the session.

import type { Suggestion } from '../types';

interface NominatimHit {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: {
    road?: string; suburb?: string; city?: string; town?: string; village?: string;
    state?: string; country?: string;
  };
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const sessionCache = new Map<string, Suggestion[]>();

function pickIcon(hit: NominatimHit): string {
  const cls = hit.class ?? '';
  const typ = hit.type ?? '';
  if (typ.includes('airport') || cls.includes('aeroway')) return 'plane';
  if (cls.includes('shop') || typ.includes('mall')) return 'briefcase';
  if (cls.includes('amenity') && typ.includes('cafe')) return 'coffee';
  return 'map-pin';
}

function toSuggestion(hit: NominatimHit): Suggestion {
  const a = hit.address ?? {};
  const locality = a.suburb || a.city || a.town || a.village || a.state;
  const label = hit.name || a.road || hit.display_name.split(',')[0] || 'Unknown';
  return {
    id: `nom-${hit.place_id}`,
    label,
    icon: pickIcon(hit),
    place: {
      label,
      sub: locality ?? a.country ?? hit.display_name,
      coords: { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) },
    },
  };
}

export async function searchPlaces(q: string): Promise<Suggestion[]> {
  const query = q.trim();
  if (query.length < 3) return [];

  const cached = sessionCache.get(query);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'rw',
  });

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { 'Accept-Language': 'en' },
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimHit[];
  const out = data.map(toSuggestion);
  sessionCache.set(query, out);
  return out;
}
