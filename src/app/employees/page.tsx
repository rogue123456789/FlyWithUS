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
import { employees } from '@/lib/data';
import type { Employee } from '@/lib/types';
import { Clock, LogIn, LogOut } from 'lucide-react';

function TimeClock() {
  const [isClockedIn, setIsClockedIn] = React.useState(false);
  const [clockInTime, setClockInTime] = React.useState<Date | null>(null);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(new Date());
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setClockInTime(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isClockedIn ? (
          <div className="flex items-center justify-between">
            <p>
              Clocked in at:{' '}
              {clockInTime?.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <Button variant="destructive" onClick={handleClockOut}>
              <LogOut className="mr-2 h-4 w-4" /> Clock Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>You are currently clocked out.</p>
            <Button onClick={handleClockIn}>
              <LogIn className="mr-2 h-4 w-4" /> Clock In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmployeesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Employees" />

      <TimeClock />

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
