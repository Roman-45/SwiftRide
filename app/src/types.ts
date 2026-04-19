export type Role = 'passenger' | 'driver' | 'admin';

export type DriverStatus = 'pending' | 'approved' | 'suspended';

export type TripStatus = 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  driverStatus?: DriverStatus;
  rating?: number;
  ratingCount?: number;
  plate?: string;
  createdAt: string;
}

export interface LatLng { lat: number; lng: number }

export interface Place {
  label: string;
  sub?: string;
  coords: LatLng;
}

export interface Trip {
  id: string;
  passengerId: string;
  driverId: string | null;
  pickup: Place;
  dropoff: Place;
  distanceMi: number;
  fare: number | null;
  status: TripStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  driverLocation?: LatLng;
  rating?: number;
  review?: string;
}

export interface Suggestion {
  id: string;
  label: string;
  icon: string;
  place: Place;
}

export interface DriverCard {
  driverId: string;
  name: string;
  rating: number;
  ratingCount: number;
  plate: string;
  phone: string;
  etaMinutes: number;
}

export interface Earnings {
  today: number;
  seven: number;
  thirty: number;
  allTime: number;
  tripsToday: number;
  onlineToday: string;
  chart: { day: string; value: number; today?: boolean }[];
}

export interface AdminStats {
  passengers: number;
  drivers: number;
  approvedDrivers: number;
  trips: number;
  completedTrips: number;
  pendingTrips: number;
  revenue: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
