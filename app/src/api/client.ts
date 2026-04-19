import type {
  AdminStats, AuthResponse, DriverCard, Earnings, Role, Suggestion, Trip, TripStatus, User, LatLng,
} from '../types';
import { seedSuggestions, seedTrips, seedUsers, randomToken } from './seed';

// Mock API latency so loading states are real.
const LAT = () => 200 + Math.random() * 250;
const wait = <T,>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(v), LAT()));
const fail = (msg: string, status = 400): Promise<never> =>
  new Promise((_, rej) => setTimeout(() => rej(new ApiError(msg, status)), LAT()));

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

// In-memory stores (persisted to sessionStorage so refresh keeps things consistent).
type Store = { users: User[]; trips: Trip[] };
const STORE_KEY = 'sr-store-v1';
function loadStore(): Store {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch { /* noop */ }
  return { users: [...seedUsers], trips: [...seedTrips] };
}
function saveStore(s: Store) { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* noop */ } }
const store = loadStore();

function findUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// --- Auth ---
export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = findUserByEmail(email);
  if (!user) return fail('No account with that email.', 401);
  // Accept any password ≥ 4 chars in the prototype.
  if (!password || password.length < 4) return fail('Incorrect password.', 401);
  return wait({ token: randomToken('jwt'), user });
}

export async function register(params: { name: string; email: string; phone: string; password: string; role: Exclude<Role, 'admin'> }): Promise<AuthResponse> {
  if (findUserByEmail(params.email)) return fail('That email is already registered.', 409);
  if (params.password.length < 6) return fail('Password must be at least 6 characters.', 400);
  const user: User = {
    id: `u_${params.role}_${Math.random().toString(36).slice(2, 7)}`,
    name: params.name,
    email: params.email,
    phone: params.phone,
    role: params.role,
    createdAt: new Date().toISOString(),
    ...(params.role === 'driver' ? { driverStatus: 'pending' as const, rating: 0, ratingCount: 0, plate: 'SR · pending' } : {}),
  };
  store.users.push(user);
  saveStore(store);
  return wait({ token: randomToken('jwt'), user });
}

// --- Suggestions ---
export async function getSuggestions(): Promise<Suggestion[]> { return wait(seedSuggestions); }

export async function searchPlaces(q: string): Promise<Suggestion[]> {
  if (q.trim().length < 3) return wait([]);
  const all: Suggestion[] = [
    ...seedSuggestions,
    { id: 'p_mission', label: 'Mission Dolores Park', icon: 'map-pin', place: { label: 'Mission Dolores Park', sub: 'Mission',        coords: { lat: 37.7596, lng: -122.4269 } } },
    { id: 'p_harbor',  label: 'Harbor Green Terminal', icon: 'map-pin', place: { label: 'Harbor Green Terminal', sub: 'Pier 9',          coords: { lat: 37.8020, lng: -122.4050 } } },
    { id: 'p_midtown', label: 'Midtown Commons',       icon: 'map-pin', place: { label: 'Midtown Commons',      sub: 'Midtown',         coords: { lat: 37.7810, lng: -122.4150 } } },
    { id: 'p_ferry',   label: 'Ferry Building',        icon: 'map-pin', place: { label: 'Ferry Building',       sub: 'Embarcadero',     coords: { lat: 37.7955, lng: -122.3937 } } },
    { id: 'p_twin',    label: 'Twin Peaks Overlook',   icon: 'map-pin', place: { label: 'Twin Peaks Overlook',  sub: 'Twin Peaks',      coords: { lat: 37.7544, lng: -122.4477 } } },
  ];
  const t = q.toLowerCase();
  return wait(all.filter((s) => s.label.toLowerCase().includes(t) || (s.place.sub?.toLowerCase().includes(t) ?? false)));
}

// --- Passenger trips ---
export async function getMyTrips(userId: string): Promise<Trip[]> {
  return wait(store.trips.filter((t) => t.passengerId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export async function getTrip(id: string): Promise<Trip> {
  const t = store.trips.find((x) => x.id === id);
  if (!t) return fail('Trip not found.', 404);
  return wait(t);
}

export async function estimateFare(pickup: LatLng, dropoff: LatLng): Promise<{ distanceMi: number; fare: number; minutes: number }> {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(dropoff.lat - pickup.lat);
  const dLng = toRad(dropoff.lng - pickup.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(pickup.lat)) * Math.cos(toRad(dropoff.lat)) * Math.sin(dLng / 2) ** 2;
  const distanceMi = Math.max(0.4, Number((2 * R * Math.asin(Math.sqrt(a))).toFixed(2)));
  const fare = Number((2.75 + distanceMi * 2.85).toFixed(2));
  const minutes = Math.max(3, Math.round(distanceMi * 3.1));
  return wait({ distanceMi, fare, minutes });
}

export async function bookTrip(params: { passengerId: string; pickup: Trip['pickup']; dropoff: Trip['dropoff']; distanceMi: number; fare: number }): Promise<Trip> {
  const active = store.trips.find((t) => t.passengerId === params.passengerId && ['Pending', 'Accepted', 'InProgress'].includes(t.status));
  if (active) return fail('You already have an active trip.', 409);
  const trip: Trip = {
    id: `t_${Math.random().toString(36).slice(2, 7)}`,
    passengerId: params.passengerId,
    driverId: null,
    pickup: params.pickup,
    dropoff: params.dropoff,
    distanceMi: params.distanceMi,
    fare: params.fare,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  store.trips.unshift(trip);
  saveStore(store);
  // Auto-accept after a short delay to drive the ActiveTrip UX.
  setTimeout(() => { transitionTrip(trip.id, 'Accepted'); }, 2500);
  return wait(trip);
}

export async function cancelTrip(id: string): Promise<Trip> {
  const t = store.trips.find((x) => x.id === id);
  if (!t) return fail('Trip not found.', 404);
  if (!['Pending', 'Accepted'].includes(t.status)) return fail('Trip can no longer be cancelled.', 400);
  t.status = 'Cancelled';
  saveStore(store);
  return wait(t);
}

export async function reviewTrip(id: string, rating: number, review?: string): Promise<Trip> {
  const t = store.trips.find((x) => x.id === id);
  if (!t) return fail('Trip not found.', 404);
  t.rating = rating;
  t.review = review;
  saveStore(store);
  return wait(t);
}

export async function getDriverCard(tripId: string): Promise<DriverCard> {
  const t = store.trips.find((x) => x.id === tripId);
  if (!t || !t.driverId) return fail('Driver not assigned yet.', 404);
  const drv = store.users.find((u) => u.id === t.driverId);
  if (!drv) return fail('Driver not found.', 404);
  return wait({
    driverId: drv.id,
    name: drv.name,
    rating: drv.rating ?? 5,
    ratingCount: drv.ratingCount ?? 0,
    plate: drv.plate ?? 'SR · —',
    phone: drv.phone,
    etaMinutes: 4,
  });
}

export async function getDriverLocation(tripId: string): Promise<LatLng> {
  const t = store.trips.find((x) => x.id === tripId);
  if (!t) return fail('Trip not found.', 404);
  if (!t.driverLocation) {
    t.driverLocation = { lat: t.pickup.coords.lat - 0.008, lng: t.pickup.coords.lng - 0.006 };
  } else {
    t.driverLocation = {
      lat: t.driverLocation.lat + (t.pickup.coords.lat - t.driverLocation.lat) * 0.25,
      lng: t.driverLocation.lng + (t.pickup.coords.lng - t.driverLocation.lng) * 0.25,
    };
  }
  saveStore(store);
  return wait(t.driverLocation);
}

export async function getTripReceipt(id: string, passengerId: string): Promise<Trip> {
  const t = store.trips.find((x) => x.id === id);
  if (!t) return fail('Receipt not found.', 404);
  if (t.passengerId !== passengerId) return fail('You are not authorised to view this receipt.', 403);
  return wait(t);
}

// --- Driver ---
export async function getPendingTrips(driverId: string): Promise<Trip[]> {
  const driver = store.users.find((u) => u.id === driverId);
  if (!driver) return fail('Driver not found.', 404);
  if (driver.driverStatus !== 'approved') return wait([]);
  return wait(store.trips.filter((t) => t.status === 'Pending' && !t.driverId));
}

export async function acceptTrip(driverId: string, tripId: string): Promise<Trip> {
  const driver = store.users.find((u) => u.id === driverId);
  if (!driver || driver.driverStatus !== 'approved') return fail('You are not approved to drive yet.', 403);
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return fail('Trip not found.', 404);
  if (trip.status !== 'Pending' || trip.driverId) return fail('Trip already accepted.', 409);
  trip.driverId = driverId;
  trip.status = 'Accepted';
  trip.acceptedAt = new Date().toISOString();
  saveStore(store);
  return wait(trip);
}

export async function startTrip(driverId: string, tripId: string): Promise<Trip> {
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip || trip.driverId !== driverId) return fail('Not your trip.', 403);
  if (trip.status !== 'Accepted') return fail('Trip is not ready to start.', 400);
  trip.status = 'InProgress';
  trip.startedAt = new Date().toISOString();
  saveStore(store);
  return wait(trip);
}

export async function completeTrip(driverId: string, tripId: string): Promise<Trip> {
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip || trip.driverId !== driverId) return fail('Not your trip.', 403);
  if (trip.status !== 'InProgress') return fail('Trip is not in progress.', 400);
  trip.status = 'Completed';
  trip.completedAt = new Date().toISOString();
  if (trip.fare == null) trip.fare = Number((2.75 + trip.distanceMi * 2.85).toFixed(2));
  saveStore(store);
  return wait(trip);
}

export async function getActiveTripForDriver(driverId: string): Promise<Trip | null> {
  const trip = store.trips.find((t) => t.driverId === driverId && ['Accepted', 'InProgress'].includes(t.status));
  return wait(trip ?? null);
}

export async function getActiveTripForPassenger(passengerId: string): Promise<Trip | null> {
  const trip = store.trips.find((t) => t.passengerId === passengerId && ['Pending', 'Accepted', 'InProgress'].includes(t.status));
  return wait(trip ?? null);
}

export async function getEarnings(driverId: string): Promise<Earnings> {
  const driver = store.users.find((u) => u.id === driverId);
  if (!driver) return fail('Driver not found.', 404);
  const mine = store.trips.filter((t) => t.driverId === driverId && t.status === 'Completed');
  const total = mine.reduce((sum, t) => sum + (t.fare ?? 0), 0);
  return wait({
    today: 84.20,
    seven: 612.40,
    thirty: 2418.90,
    allTime: Math.max(total, 18_402.55),
    tripsToday: 6,
    onlineToday: '4h 12m',
    chart: [
      { day: 'Mon', value: 112.40 },
      { day: 'Tue', value: 88.10 },
      { day: 'Wed', value: 141.80 },
      { day: 'Thu', value: 94.60 },
      { day: 'Fri', value: 156.20 },
      { day: 'Sat', value: 19.30 },
      { day: 'Sun', value: 84.20, today: true },
    ],
  });
}

// --- Admin ---
export async function getAdminStats(): Promise<AdminStats> {
  const passengers = store.users.filter((u) => u.role === 'passenger').length;
  const drivers = store.users.filter((u) => u.role === 'driver').length;
  const approvedDrivers = store.users.filter((u) => u.role === 'driver' && u.driverStatus === 'approved').length;
  const trips = store.trips.length;
  const completedTrips = store.trips.filter((t) => t.status === 'Completed').length;
  const pendingTrips = store.trips.filter((t) => t.status === 'Pending').length;
  const revenue = store.trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + (t.fare ?? 0), 0);
  return wait({ passengers, drivers, approvedDrivers, trips, completedTrips, pendingTrips, revenue });
}

export async function getAdminUsers(role?: Role): Promise<User[]> {
  return wait(role ? store.users.filter((u) => u.role === role) : store.users);
}

export async function approveDriver(driverId: string): Promise<User> {
  const u = store.users.find((x) => x.id === driverId);
  if (!u || u.role !== 'driver') return fail('Driver not found.', 404);
  u.driverStatus = 'approved';
  saveStore(store);
  return wait(u);
}

export async function suspendDriver(driverId: string): Promise<User> {
  const u = store.users.find((x) => x.id === driverId);
  if (!u || u.role !== 'driver') return fail('Driver not found.', 404);
  u.driverStatus = 'suspended';
  saveStore(store);
  return wait(u);
}

export async function getAdminTrips(filter?: TripStatus | 'All'): Promise<Trip[]> {
  const t = (!filter || filter === 'All') ? store.trips : store.trips.filter((x) => x.status === filter);
  return wait([...t].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

// Internal helper used by bookTrip timer.
function transitionTrip(tripId: string, next: TripStatus) {
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return;
  if (trip.status === 'Cancelled' || trip.status === 'Completed') return;
  if (next === 'Accepted' && trip.status === 'Pending') {
    trip.driverId = 'u_drv_1';
    trip.status = 'Accepted';
    trip.acceptedAt = new Date().toISOString();
    saveStore(store);
  }
}

export function resetStore() {
  sessionStorage.removeItem(STORE_KEY);
  location.reload();
}
