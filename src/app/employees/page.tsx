'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { employees as initialEmployees } from '@/lib/data';
import type { Employee } from '@/lib/types';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

function TimeClock({
  employees,
  onClockIn,
  onClockOut,
  selectedEmployeeId,
  onSelectEmployee,
}: {
  employees: Employee[];
  onClockIn: (employeeId: string) => void;
  onClockOut: (employeeId: string) => void;
  selectedEmployeeId: string | null;
  onSelectEmployee: (employeeId: string) => void;
}) {
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleClockIn = () => {
    if (selectedEmployeeId) {
      onClockIn(selectedEmployeeId);
    }
  };

  const handleClockOut = () => {
    if (selectedEmployeeId) {
      onClockOut(selectedEmployeeId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          onValueChange={onSelectEmployee}
          value={selectedEmployeeId ?? ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEmployee && selectedEmployee.status === 'Clocked In' ? (
          <div className="flex items-center justify-between">
            <div>
              <p>
                Clocked in at:{' '}
                {selectedEmployee.lastClockIn &&
                  new Date(selectedEmployee.lastClockIn).toLocaleTimeString(
                    [],
                    {
                      timeZone: 'America/Costa_Rica',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
              </p>
              <p className="text-sm text-muted-foreground">
                (Time in Costa Rica)
              </p>
            </div>
            <Button variant="destructive" onClick={handleClockOut}>
              <LogOut className="mr-2 h-4 w-4" /> Clock Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>
              {selectedEmployee
                ? `${selectedEmployee.name} is clocked out.`
                : 'Please select an employee.'}
            </p>
            <Button onClick={handleClockIn} disabled={!selectedEmployeeId}>
              <LogIn className="mr-2 h-4 w-4" /> Clock In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    'employees',
    initialEmployees
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const { toast } = useToast();

  const handleClockIn = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              status: 'Clocked In',
              lastClockIn: new Date().toISOString(),
            }
          : emp
      )
    );
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      toast({
        title: 'Clocked In',
        description: `${employee.name} has been clocked in.`,
      });
    }
  };

  const handleClockOut = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, status: 'Clocked Out', lastClockIn: undefined }
          : emp
      )
    );
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      toast({
        title: 'Clocked Out',
        description: `${employee.name} has been clocked out.`,
      });
    }
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Employees" />

      <TimeClock
        employees={employees}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={handleSelectEmployee}
      />

      <Card>
        <CardHeader>
          <CardTitle>Employee Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee: Employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        employee.status === 'Clocked In'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        employee.status === 'Clocked In'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : ''
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
