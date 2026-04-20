// Real backend API client. All requests go through http.ts which handles the
// { success, data, message } envelope + JWT header. This file is the ONLY place
// that knows about backend field names (PascalCase-looking camelCase from C#,
// flat coords, etc.); the rest of the app uses the types in ../types.ts.

import type {
  AdminStats, AuthResponse, DriverCard, DriverLiveLocation, Earnings,
  EstimateResult, LatLng, Place, Receipt, Role, Suggestion, Trip,
  TripStatus, User,
} from '../types';
import { http, ApiError } from './http';

export { ApiError };

// --- Backend DTO shapes (raw — not exported) ---

interface BackendUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: 'Passenger' | 'Driver' | 'Admin';
  createdAt: string;
}

interface BackendLoginResponse {
  token: string;
  user: BackendUser;
}

interface BackendTrip {
  id: number;
  passengerId: number;
  driverId: number | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedFare: number;
  status: TripStatus;
  createdAt: string;
  completedAt: string | null;
  distanceKm: number | null;
}

interface BackendReceipt {
  tripId: number;
  passengerId: number;
  driverId: number | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedFare: number;
  status: TripStatus;
  createdAt: string;
  completedAt: string | null;
  passengerName: string | null;
  driverName: string | null;
  driverPhone: string | null;
  licensePlate: string | null;
  vehicleModel: string | null;
  paymentId: number | null;
  paymentAmount: number | null;
  paymentStatus: string | null;
  paidAt: string | null;
}

interface BackendDriverCard {
  driverUserId: number;
  name: string | null;
  phoneNumber: string | null;
  licensePlate: string | null;
  vehicleModel: string | null;
  averageRating: number;
  reviewCount: number;
}

interface BackendDriverLocation {
  lat: number;
  lng: number;
  distanceKm: number | null;
  etaMinutes: number | null;
  etaTarget: 'to_pickup' | 'to_dropoff' | null;
}

interface BackendEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  completedTrips: number;
  dailyBreakdown: { day: string; amount: number; tripCount: number }[];
}

interface BackendAdminStats {
  totalPassengers: number;
  totalDrivers: number;
  approvedDrivers: number;
  totalTrips: number;
  completedTrips: number;
  pendingTrips: number;
  totalRevenue: number;
}

interface BackendAdminUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: 'Passenger' | 'Driver' | 'Admin';
  createdAt: string;
}

interface BackendAdminDriver {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  licensePlate: string | null;
  vehicleModel: string | null;
  isAvailable: boolean;
  isApproved: boolean;
}

interface BackendAdminTrip {
  id: number;
  passengerId: number;
  driverId: number | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  estimatedFare: number;
  status: TripStatus;
  createdAt: string;
  completedAt: string | null;
}

interface BackendSuggestions {
  frequentDestinations: Array<{ address: string | null; lat: number; lng: number; visitCount: number; lastVisitedAt: string }>;
  frequentRoutes: Array<{ pickupAddress: string | null; dropoffAddress: string | null; pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number; tripCount: number; lastTakenAt: string; averageFare: number }>;
  contextual: { address: string | null; lat: number; lng: number } | null;
  context: string;
}

// --- Adapters ---

function backendRoleToRole(r: BackendUser['role']): Role {
  if (r === 'Passenger') return 'passenger';
  if (r === 'Driver') return 'driver';
  return 'admin';
}

function mapUser(u: BackendUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phoneNumber ?? '',
    role: backendRoleToRole(u.role),
    createdAt: u.createdAt,
  };
}

function placeFrom(address: string | null, lat: number, lng: number): Place {
  return {
    label: address ?? 'Unnamed location',
    coords: { lat, lng },
  };
}

function mapTrip(t: BackendTrip): Trip {
  return {
    id: String(t.id),
    passengerId: String(t.passengerId),
    driverId: t.driverId == null ? null : String(t.driverId),
    pickup: placeFrom(t.pickupAddress, t.pickupLat, t.pickupLng),
    dropoff: placeFrom(t.dropoffAddress, t.dropoffLat, t.dropoffLng),
    distanceKm: t.distanceKm ?? null,
    fareRwf: t.estimatedFare ?? null,
    status: t.status,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
  };
}

function mapReceipt(r: BackendReceipt): Receipt {
  return {
    tripId: String(r.tripId),
    status: r.status,
    createdAt: r.createdAt,
    completedAt: r.completedAt,
    pickup: placeFrom(r.pickupAddress, r.pickupLat, r.pickupLng),
    dropoff: placeFrom(r.dropoffAddress, r.dropoffLat, r.dropoffLng),
    // Backend computes real distance on complete; we expose the estimate as
    // the single fare figure and let the UI show a dash if it's missing.
    distanceKm: null,
    fareRwf: r.paymentAmount ?? r.estimatedFare ?? null,
    driverName: r.driverName,
    driverPhone: r.driverPhone,
    licensePlate: r.licensePlate,
    vehicleModel: r.vehicleModel,
    paymentStatus: r.paymentStatus,
    paidAt: r.paidAt,
  };
}

function mapDriverCard(c: BackendDriverCard): DriverCard {
  return {
    driverId: String(c.driverUserId),
    name: c.name ?? 'Driver',
    rating: Number(c.averageRating ?? 0),
    reviewCount: c.reviewCount ?? 0,
    licensePlate: c.licensePlate ?? '—',
    vehicleModel: c.vehicleModel ?? '—',
    phone: c.phoneNumber ?? '',
  };
}

function mapLocation(l: BackendDriverLocation): DriverLiveLocation {
  return {
    coords: { lat: l.lat, lng: l.lng },
    distanceKm: l.distanceKm,
    etaMinutes: l.etaMinutes,
    etaTarget: l.etaTarget,
  };
}

function mapEarnings(e: BackendEarnings): Earnings {
  return {
    today: e.today,
    week: e.thisWeek,
    month: e.thisMonth,
    total: e.total,
    completedTrips: e.completedTrips,
    daily: (e.dailyBreakdown ?? []).map((d) => ({
      day: d.day,
      amount: d.amount,
      tripCount: d.tripCount,
    })),
  };
}

function mapAdminStats(s: BackendAdminStats): AdminStats {
  return {
    totalPassengers: s.totalPassengers,
    totalDrivers: s.totalDrivers,
    approvedDrivers: s.approvedDrivers,
    totalTrips: s.totalTrips,
    completedTrips: s.completedTrips,
    pendingTrips: s.pendingTrips,
    totalRevenue: s.totalRevenue,
  };
}

// --- Auth ---

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await http.post<BackendLoginResponse>('/api/auth/login', { email, password });
  return { token: res.token, user: mapUser(res.user) };
}

export async function register(params: {
  name: string; email: string; phone: string; password: string;
  role: Exclude<Role, 'admin'>; licensePlate?: string; vehicleModel?: string;
}): Promise<AuthResponse> {
  const res = await http.post<BackendLoginResponse>('/api/auth/register', {
    name: params.name,
    email: params.email,
    password: params.password,
    phoneNumber: params.phone,
    role: params.role === 'passenger' ? 'Passenger' : 'Driver',
    licensePlate: params.licensePlate,
    vehicleModel: params.vehicleModel,
  });
  return { token: res.token, user: mapUser(res.user) };
}

// Used on app boot to re-verify a stored token.
export async function getMe(): Promise<User> {
  const u = await http.get<BackendUser>('/api/auth/me');
  return mapUser(u);
}

// --- Passenger trips ---

export async function estimateFare(pickup: LatLng, dropoff: LatLng): Promise<EstimateResult> {
  const res = await http.post<{ distanceKm: number; estimatedFare: number }>(
    '/api/trips/estimate',
    { pickupLat: pickup.lat, pickupLng: pickup.lng, dropoffLat: dropoff.lat, dropoffLng: dropoff.lng },
  );
  // Backend doesn't return a time estimate; derive a soft guess at 30 km/h.
  const minutes = Math.max(3, Math.round((res.distanceKm / 30) * 60));
  return { distanceKm: res.distanceKm, fareRwf: res.estimatedFare, minutes };
}

export async function bookTrip(params: {
  pickup: Place; dropoff: Place;
}): Promise<Trip> {
  const trip = await http.post<BackendTrip>('/api/trips/book', {
    pickupAddress: params.pickup.label,
    dropoffAddress: params.dropoff.label,
    pickupLat: params.pickup.coords.lat,
    pickupLng: params.pickup.coords.lng,
    dropoffLat: params.dropoff.coords.lat,
    dropoffLng: params.dropoff.coords.lng,
  });
  return mapTrip(trip);
}

export async function getMyTrips(): Promise<Trip[]> {
  const list = await http.get<BackendTrip[]>('/api/trips');
  return list.map(mapTrip);
}

export async function getTrip(id: string): Promise<Trip> {
  const trip = await http.get<BackendTrip>(`/api/trips/${id}`);
  return mapTrip(trip);
}

export async function cancelTrip(id: string): Promise<void> {
  await http.del<unknown>(`/api/trips/${id}/cancel`);
}

export async function reviewTrip(id: string, rating: number, comment?: string): Promise<void> {
  await http.post<unknown>(`/api/trips/${id}/review`, { rating, comment });
}

export async function getDriverCard(tripId: string): Promise<DriverCard> {
  const card = await http.get<BackendDriverCard>(`/api/trips/${tripId}/driver-card`);
  return mapDriverCard(card);
}

export async function getDriverLiveLocation(tripId: string): Promise<DriverLiveLocation> {
  const loc = await http.get<BackendDriverLocation>(`/api/trips/${tripId}/driver-location`);
  return mapLocation(loc);
}

export async function getTripReceipt(id: string): Promise<Receipt> {
  const r = await http.get<BackendReceipt>(`/api/trips/${id}/receipt`);
  return mapReceipt(r);
}

export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const s = await http.get<BackendSuggestions>('/api/suggestions');
    const out: Suggestion[] = [];
    s.frequentDestinations.slice(0, 3).forEach((d, i) => {
      out.push({
        id: `freq-dest-${i}`,
        label: d.address ?? 'Saved place',
        icon: 'briefcase',
        place: placeFrom(d.address, d.lat, d.lng),
      });
    });
    if (s.contextual) {
      out.unshift({
        id: 'ctx',
        label: s.contextual.address ?? 'Usual spot',
        icon: s.context.includes('morning') ? 'coffee' : 'briefcase',
        place: placeFrom(s.contextual.address, s.contextual.lat, s.contextual.lng),
      });
    }
    return out;
  } catch {
    // Suggestions are best-effort; a 500 shouldn't break booking.
    return [];
  }
}

// --- Driver ---

export async function getPendingTrips(): Promise<Trip[]> {
  const list = await http.get<BackendTrip[]>('/api/driver/pending-trips');
  return list.map(mapTrip);
}

export async function acceptTrip(tripId: string): Promise<void> {
  await http.post<unknown>(`/api/driver/trips/${tripId}/accept`);
}

export async function startTrip(tripId: string): Promise<void> {
  await http.post<unknown>(`/api/driver/trips/${tripId}/start`);
}

export async function completeTrip(tripId: string): Promise<void> {
  await http.post<unknown>(`/api/driver/trips/${tripId}/complete`);
}

export async function getDriverTrip(tripId: string): Promise<Trip> {
  const trip = await http.get<BackendTrip>(`/api/driver/trips/${tripId}`);
  return mapTrip(trip);
}

export async function pushDriverLocation(coords: LatLng): Promise<void> {
  await http.put<unknown>('/api/driver/location', { lat: coords.lat, lng: coords.lng });
}

export async function setDriverAvailability(isAvailable: boolean): Promise<void> {
  await http.put<unknown>('/api/driver/availability', { isAvailable });
}

export async function getEarnings(): Promise<Earnings> {
  const e = await http.get<BackendEarnings>('/api/driver/earnings');
  return mapEarnings(e);
}

// --- Admin ---

export async function getAdminStats(): Promise<AdminStats> {
  const s = await http.get<BackendAdminStats>('/api/admin/stats');
  return mapAdminStats(s);
}

export async function getAdminPassengers(): Promise<User[]> {
  const list = await http.get<BackendAdminUser[]>('/api/admin/users');
  return list
    .filter((u) => u.role === 'Passenger')
    .map((u) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      phone: u.phoneNumber ?? '',
      role: 'passenger' as const,
      createdAt: u.createdAt,
    }));
}

export async function getAdminDrivers(): Promise<User[]> {
  const list = await http.get<BackendAdminDriver[]>('/api/admin/drivers');
  return list.map((d) => ({
    id: String(d.userId),
    name: d.name,
    email: d.email,
    phone: d.phoneNumber ?? '',
    role: 'driver' as const,
    createdAt: '',
    isApproved: d.isApproved,
    isAvailable: d.isAvailable,
    licensePlate: d.licensePlate ?? undefined,
    vehicleModel: d.vehicleModel ?? undefined,
  }));
}

export async function approveDriver(driverId: string): Promise<void> {
  await http.put<unknown>(`/api/admin/drivers/${driverId}/approve`);
}

export async function suspendDriver(driverId: string): Promise<void> {
  await http.put<unknown>(`/api/admin/drivers/${driverId}/suspend`);
}

export async function getAdminTrips(status?: TripStatus | 'All'): Promise<Trip[]> {
  const q = !status || status === 'All' ? '' : `?status=${encodeURIComponent(status)}`;
  const list = await http.get<BackendAdminTrip[]>(`/api/admin/trips${q}`);
  return list.map((t) => ({
    id: String(t.id),
    passengerId: String(t.passengerId),
    driverId: t.driverId == null ? null : String(t.driverId),
    pickup: { label: t.pickupAddress ?? '—', coords: { lat: 0, lng: 0 } },
    dropoff: { label: t.dropoffAddress ?? '—', coords: { lat: 0, lng: 0 } },
    distanceKm: null,
    fareRwf: t.estimatedFare ?? null,
    status: t.status,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
  }));
}
