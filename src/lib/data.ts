import type { Employee, Plane, FlightLog, FuelLog } from '@/lib/types';
import { subDays, format } from 'date-fns';

export const employees: Employee[] = [
  { id: '1', name: 'John Doe', role: 'Pilot', status: 'Clocked In', lastClockIn: new Date().toISOString() },
  { id: '2', name: 'Jane Smith', role: 'Admin', status: 'Clocked Out' },
  { id: '3', name: 'Peter Jones', role: 'Mechanic', status: 'Clocked In', lastClockIn: new Date().toISOString() },
  { id: '4', name: 'Emily White', role: 'Pilot', status: 'Clocked Out' },
];

export const planes: Plane[] = [
  { id: 'N12345', name: 'Cessna 172 Skyhawk', totalHours: 1250.5, nextMaintenanceHours: 1300 },
  { id: 'N54321', name: 'Piper PA-28 Cherokee', totalHours: 875.2, nextMaintenanceHours: 900 },
  { id: 'N67890', name: 'Diamond DA40', totalHours: 450.0, nextMaintenanceHours: 500 },
  { id: 'N09876', name: 'Cirrus SR22', totalHours: 2100.8, nextMaintenanceHours: 2200 },
];

export const flightLogs: FlightLog[] = [
  { id: 'fl1', pilotName: 'John Doe', planeId: 'N12345', takeoffLocation: 'KSQL', landingLocation: 'KPAO', flightDuration: 1.5, date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), flightReason: 'Training' },
  { id: 'fl2', pilotName: 'Emily White', planeId: 'N54321', takeoffLocation: 'KPAO', landingLocation: 'KOAK', flightDuration: 2.1, date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), flightReason: 'Cross-country' },
  { id: 'fl3', pilotName: 'John Doe', planeId: 'N67890', takeoffLocation: 'KSQL', landingLocation: 'KSQL', flightDuration: 0.8, date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), flightReason: 'Pattern work' },
  { id: 'fl4', pilotName: 'Guest Pilot', planeId: 'N12345', takeoffLocation: 'KOAK', landingLocation: 'KRNO', flightDuration: 3.0, date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), flightReason: 'Personal' },
  { id: 'fl5', pilotName: 'Emily White', planeId: 'N09876', takeoffLocation: 'KPAO', landingLocation: 'KSQL', flightDuration: 1.2, date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), flightReason: 'Checkride' },
];

export const fuelLogs: FuelLog[] = [
  { id: 'ful1', customerType: 'Company', planeId: 'N12345', gallons: 25.5, totalCost: 153.00, date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { id: 'ful2', customerType: 'External', gallons: 40.0, totalCost: 260.00, date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { id: 'ful3', customerType: 'Company', planeId: 'N54321', gallons: 18.2, totalCost: 109.20, date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { id: 'ful4', customerType: 'Company', planeId: 'N09876', gallons: 35.0, totalCost: 210.00, date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
];
