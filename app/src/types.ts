export type Role = 'passenger' | 'driver' | 'admin';

export type DriverApproval = 'approved' | 'pending' | 'suspended' | 'unknown';

export type TripStatus = 'Pending' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  // Optional driver fields — populated on admin-side lists.
  isApproved?: boolean;
  isAvailable?: boolean;
  licensePlate?: string;
  vehicleModel?: string;
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
  distanceKm: number | null;
  fareRwf: number | null;
  status: TripStatus;
  createdAt: string;
  completedAt?: string | null;
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
  reviewCount: number;
  licensePlate: string;
  vehicleModel: string;
  phone: string;
}

export interface DriverLiveLocation {
  coords: LatLng;
  distanceKm: number | null;
  etaMinutes: number | null;
  etaTarget: 'to_pickup' | 'to_dropoff' | null;
}

export interface Earnings {
  today: number;
  week: number;
  month: number;
  total: number;
  completedTrips: number;
  daily: { day: string; amount: number; tripCount: number }[];
}

export interface AdminStats {
  totalPassengers: number;
  totalDrivers: number;
  approvedDrivers: number;
  totalTrips: number;
  completedTrips: number;
  pendingTrips: number;
  totalRevenue: number;
}

export interface EstimateResult {
  distanceKm: number;
  fareRwf: number;
  minutes: number;
}

export interface Receipt {
  tripId: string;
  status: TripStatus;
  createdAt: string;
  completedAt?: string | null;
  pickup: Place;
  dropoff: Place;
  distanceKm: number | null;
  fareRwf: number | null;
  driverName?: string | null;
  driverPhone?: string | null;
  licensePlate?: string | null;
  vehicleModel?: string | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
