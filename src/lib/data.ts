import type { Employee, Plane, FlightLog, FuelLog, WorkLog } from '@/lib/types';

export const employees: Employee[] = [
  { id: '1', name: 'John Doe', role: 'Pilot', status: 'Clocked Out' },
  { id: '2', name: 'Jane Smith', role: 'Admin', status: 'Clocked Out' },
  { id: '3', name: 'Peter Jones', role: 'Mechanic', status: 'Clocked Out' },
  { id: '4', name: 'Emily White', role: 'Pilot', status: 'Clocked Out' },
];

export const planes: Plane[] = [
  { id: 'N12345', name: 'Cessna 172 Skyhawk', totalHours: 1250.5, nextMaintenanceHours: 1300 },
  { id: 'N54321', name: 'Piper PA-28 Cherokee', totalHours: 875.2, nextMaintenanceHours: 900 },
  { id: 'N67890', name: 'Diamond DA40', totalHours: 450.0, nextMaintenanceHours: 500 },
  { id: 'N09876', name: 'Cirrus SR22', totalHours: 2100.8, nextMaintenanceHours: 2200 },
];

export const flightLogs: FlightLog[] = [
  { id: 'fl1', pilotName: 'John Doe', planeId: 'N12345', takeoffLocation: 'KSQL', landingLocation: 'KPAO', flightDuration: 1.5, date: '2024-07-14T10:00:00.000Z', flightReason: 'Training' },
  { id: 'fl2', pilotName: 'Emily White', planeId: 'N54321', takeoffLocation: 'KPAO', landingLocation: 'KOAK', flightDuration: 2.1, date: '2024-07-14T11:00:00.000Z', flightReason: 'Cross-country' },
  { id: 'fl3', pilotName: 'John Doe', planeId: 'N67890', takeoffLocation: 'KSQL', landingLocation: 'KSQL', flightDuration: 0.8, date: '2024-07-13T09:00:00.000Z', flightReason: 'Pattern work' },
  { id: 'fl4', pilotName: 'Guest Pilot', planeId: 'N12345', takeoffLocation: 'KOAK', landingLocation: 'KRNO', flightDuration: 3.0, date: '2024-07-12T14:00:00.000Z', flightReason: 'Personal' },
  { id: 'fl5', pilotName: 'Emily White', planeId: 'N09876', takeoffLocation: 'KPAO', landingLocation: 'KSQL', flightDuration: 1.2, date: '2024-07-11T16:00:00.000Z', flightReason: 'Checkride' },
];

export const fuelLogs: FuelLog[] = [
  { id: 'ful1', customerType: 'Company', planeId: 'N12345', startQuantity: 65, liters: 25.5, leftOverQuantity: 39.5, date: '2024-07-14T10:00:00.000Z' },
  { id: 'ful2', customerType: 'External', planeId: undefined, startQuantity: 50, liters: 40.0, leftOverQuantity: 10.0, date: '2024-07-13T09:00:00.000Z' },
  { id: 'ful3', customerType: 'Company', planeId: 'N12345', startQuantity: 85, liters: 20, leftOverQuantity: 65, date: '2024-07-12T14:00:00.000Z' },
  { id: 'ful4', customerType: 'Refueling', planeId: 'N/A', startQuantity: 120, liters: 35.0, leftOverQuantity: 85.0, date: '2024-07-11T16:00:00.000Z', cost: 70 },
];

export const workLogs: WorkLog[] = [];
