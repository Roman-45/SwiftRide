import type { User, Trip, Suggestion } from '../types';

export const CITY_CENTER = { lat: 37.7749, lng: -122.4194 };

export const seedUsers: User[] = [
  { id: 'u_pass_1', name: 'Mira Whitfield', email: 'mira@example.com', phone: '+1 (415) 555-0142', role: 'passenger', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'u_pass_2', name: 'Kofi Osei',      email: 'kofi@example.com', phone: '+1 (415) 555-0188', role: 'passenger', createdAt: '2025-11-01T09:32:00Z' },
  { id: 'u_drv_1',  name: 'Dominic Rivera', email: 'dom@example.com',  phone: '+1 (415) 555-0113', role: 'driver', driverStatus: 'approved', rating: 4.9, ratingCount: 312, plate: 'SR · 7QX428', createdAt: '2025-08-04T10:00:00Z' },
  { id: 'u_drv_2',  name: 'Sam Park',       email: 'sam@example.com',  phone: '+1 (415) 555-0901', role: 'driver', driverStatus: 'approved', rating: 4.7, ratingCount: 188, plate: 'SR · 3FB902', createdAt: '2025-09-21T12:00:00Z' },
  { id: 'u_drv_3',  name: 'Nadia Brekke',   email: 'nadia@example.com',phone: '+1 (415) 555-0488', role: 'driver', driverStatus: 'pending',  rating: 0,   ratingCount: 0,   plate: 'SR · 9WR104', createdAt: '2026-04-17T14:40:00Z' },
  { id: 'u_drv_4',  name: 'Theo Okonkwo',   email: 'theo@example.com', phone: '+1 (415) 555-0212', role: 'driver', driverStatus: 'suspended', rating: 3.9, ratingCount: 44, plate: 'SR · 5LP311', createdAt: '2025-07-09T07:10:00Z' },
  { id: 'u_adm_1',  name: 'Elena Vargas',   email: 'elena@example.com',phone: '+1 (415) 555-0101', role: 'admin', createdAt: '2025-06-01T08:00:00Z' },
];

export const seedSuggestions: Suggestion[] = [
  { id: 's_work',    label: 'Work',               icon: 'briefcase', place: { label: '201 Mission St',      sub: 'Downtown',       coords: { lat: 37.7910, lng: -122.3942 } } },
  { id: 's_coffee',  label: 'Monograph Coffee',   icon: 'coffee',    place: { label: '48 Monograph Coffee', sub: 'Midtown',        coords: { lat: 37.7770, lng: -122.4220 } } },
  { id: 's_airport', label: 'Airport',            icon: 'plane',     place: { label: 'SFO — Terminal 2',    sub: 'San Francisco Intl', coords: { lat: 37.6213, lng: -122.3790 } } },
];

const now = Date.now();
const d = (h: number) => new Date(now - h * 3600_000).toISOString();

export const seedTrips: Trip[] = [
  { id: 't_a72f', passengerId: 'u_pass_1', driverId: 'u_drv_1', pickup: { label: '1209 Alder St', sub: 'Cedar Park', coords: { lat: 37.7699, lng: -122.4269 } }, dropoff: { label: 'Harbor Green Terminal', sub: 'Pier 9', coords: { lat: 37.8020, lng: -122.4050 } }, distanceMi: 3.4, fare: 14.80, status: 'Completed', createdAt: d(26), acceptedAt: d(25.9), startedAt: d(25.8), completedAt: d(25.6), rating: 5 },
  { id: 't_a72e', passengerId: 'u_pass_1', driverId: 'u_drv_2', pickup: { label: '12th & Bay',   sub: 'Cedar Park', coords: { lat: 37.7725, lng: -122.4210 } }, dropoff: { label: 'Midtown Commons',        sub: 'Midtown',         coords: { lat: 37.7810, lng: -122.4150 } }, distanceMi: 1.8, fare: 9.40,  status: 'Completed', createdAt: d(52), acceptedAt: d(51.9), startedAt: d(51.8), completedAt: d(51.7), rating: 4 },
  { id: 't_a72d', passengerId: 'u_pass_1', driverId: 'u_drv_1', pickup: { label: 'Cedar Park Library', sub: 'Cedar Park', coords: { lat: 37.7760, lng: -122.4289 } }, dropoff: { label: 'SFO — Terminal 2',     sub: 'San Francisco Intl', coords: { lat: 37.6213, lng: -122.3790 } }, distanceMi: 18.6, fare: 56.40, status: 'Completed', createdAt: d(120), acceptedAt: d(119.9), startedAt: d(119.8), completedAt: d(119.3), rating: 5 },
  { id: 't_a72c', passengerId: 'u_pass_2', driverId: null,      pickup: { label: 'Pier 9',       sub: 'Harbor Green', coords: { lat: 37.8014, lng: -122.4010 } }, dropoff: { label: '201 Mission St',         sub: 'Downtown',        coords: { lat: 37.7910, lng: -122.3942 } }, distanceMi: 2.2, fare: null, status: 'Pending',   createdAt: d(0.02) },
  { id: 't_a72b', passengerId: 'u_pass_1', driverId: 'u_drv_2', pickup: { label: '10 Laurel Way', sub: 'Cedar Park', coords: { lat: 37.7688, lng: -122.4250 } }, dropoff: { label: 'Cedar Park Station',    sub: 'Cedar Park',      coords: { lat: 37.7710, lng: -122.4310 } }, distanceMi: 0.9, fare: null,  status: 'Cancelled', createdAt: d(200) },
];

export function randomToken(prefix = 'tok'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
