export interface Employee {
  id: string;
  name: string;
  role: 'Pilot' | 'Mechanic' | 'Admin';
  status: 'Clocked In' | 'Clocked Out';
  lastClockIn?: string;
}

export interface Plane {
  id: string;
  name: string;
  totalHours: number;
  nextMaintenanceHours: number;
}

export interface FlightLog {
  id: string;
  pilotName: string;
  planeId: string;
  takeoffLocation: string;
  landingLocation: string;
  flightDuration: number; // in hours
  flightReason: string;
  date: string;
}

export interface FuelLog {
  id: string;
  customerType: 'Company' | 'External' | 'Refueling';
  planeId?: string;
  startQuantity: number;
  liters: number;
  leftOverQuantity: number;
  date: string;
  cost?: number;
}

export interface WorkLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime: string;
  duration: number; // in milliseconds
}
