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
  flightDuration: number; // in hours
  date: string;
  paymentMethod: 'Cash' | 'Card' | 'Account';
}

export interface FuelLog {
  id: string;
  customerType: 'Company' | 'External';
  planeId?: string;
  gallons: number;
  totalCost: number;
  date: string;
}
