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
  engineCheckHours?: number;
  generalCheckHours?: number;
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
  squawk?: number;
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
  id:string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime: string;
  duration: number; // in milliseconds
}

export interface Logbook {
  id: string;
  name: string;
  totalHours: number;
  engineCheckHours?: number;
  generalCheckHours?: number;
}

export interface LogbookEntry {
  id: string;
  logbookId: string;
  date: string;
  startLocation: string;
  endLocation: string;
  duration: number; // in hours
  reason: string;
  batteryStatus: 'OK' | 'Not OK';
  oilPressure: number;
  oilTemp: number;
  waterTemp: number;
}

export interface Payment {
  id: string;
  date: string;
  hasAgency: boolean;
  agencyName?: string;
  paymentMethod: 'Cash' | 'Card';
  currency: 'Dollars' | 'Colones' | 'Euros';
  amount: number;
}
