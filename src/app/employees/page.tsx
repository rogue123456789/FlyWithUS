'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  employees as initialEmployees,
  workLogs as initialWorkLogs,
} from '@/lib/data';
import type { Employee, WorkLog } from '@/lib/types';
import {
  Clock,
  LogIn,
  LogOut,
  Trash2,
  Download,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  format,
  parseISO,
  differenceInMilliseconds,
  formatDistanceStrict,
  intervalToDuration,
} from 'date-fns';
import { downloadCsv } from '@/lib/utils';
import { EditWorkLogForm } from './_components/edit-work-log-form';

function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const duration = intervalToDuration({ start: 0, end: ms });
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;
  const seconds = duration.seconds ?? 0;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function LiveTimer({ startTime }: { startTime: string }) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const duration = formatDistanceStrict(parseISO(startTime), currentTime);

  return <span className="font-mono">{duration}</span>;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    'employees',
    initialEmployees
  );
  const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>(
    'workLogs',
    initialWorkLogs
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const [logToEdit, setLogToEdit] = React.useState<WorkLog | null>(null);
  const { toast } = useToast();

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

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
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee || !employee.lastClockIn) return;

    const clockInTime = parseISO(employee.lastClockIn);
    const clockOutTime = new Date();
    const duration = differenceInMilliseconds(clockOutTime, clockInTime);

    const newWorkLog: WorkLog = {
      id: `wl${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      date: clockInTime.toISOString(),
      clockInTime: clockInTime.toISOString(),
      clockOutTime: clockOutTime.toISOString(),
      duration,
    };

    setWorkLogs((prev) => [newWorkLog, ...prev]);
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, status: 'Clocked Out', lastClockIn: undefined }
          : emp
      )
    );
    toast({
      title: 'Clocked Out',
      description: `${
        employee.name
      } has been clocked out. Work duration: ${formatDuration(duration)}`,
    });
  };

  const handleClearLogs = () => {
    setWorkLogs([]);
    toast({
      title: 'Work Logs Cleared',
      description: 'All work logs have been deleted.',
    });
  };

  const handleExport = () => {
    const dataToExport = sortedWorkLogs.map((log) => ({
      'Employee Name': log.employeeName,
      Date: new Date(log.date).toLocaleDateString('en-US', {
        timeZone: 'America/Costa_Rica',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      'Clock In': new Date(log.clockInTime).toLocaleTimeString('en-US', {
        timeZone: 'America/Costa_Rica',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      'Clock Out': new Date(log.clockOutTime).toLocaleTimeString('en-US', {
        timeZone: 'America/Costa_Rica',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      'Duration (Hours)': (log.duration / 3600000).toFixed(2),
    }));
    downloadCsv(
      dataToExport,
      `work-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const sortedWorkLogs = React.useMemo(() => {
    return [...workLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [workLogs]);

  const handleUpdateWorkLog = (values: {
    date: string;
    clockInTime: string;
    clockOutTime: string;
  }) => {
    if (!logToEdit) return;

    const clockInDateTime = new Date(`${values.date}T${values.clockInTime}`);
    const clockOutDateTime = new Date(`${values.date}T${values.clockOutTime}`);
    const duration = differenceInMilliseconds(clockOutDateTime, clockInDateTime);

    const updatedLog: WorkLog = {
      ...logToEdit,
      date: clockInDateTime.toISOString(),
      clockInTime: clockInDateTime.toISOString(),
      clockOutTime: clockOutDateTime.toISOString(),
      duration,
    };

    setWorkLogs((prev) =>
      prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
    );
    toast({ title: 'Work Log Updated' });
    setLogToEdit(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Employees"
        actions={
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 /> Clear Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all work logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLogs}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={handleExport}>
              <Download /> Export
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock /> Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={setSelectedEmployeeId}
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
            <div className="flex items-center justify-between rounded-lg border p-4">
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
                  Session duration:{' '}
                  {selectedEmployee.lastClockIn && (
                    <LiveTimer startTime={selectedEmployee.lastClockIn} />
                  )}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleClockOut(selectedEmployee.id)}
              >
                <LogOut /> Clock Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <p>
                {selectedEmployee
                  ? `${selectedEmployee.name} is clocked out.`
                  : 'Please select an employee.'}
              </p>
              <Button
                onClick={() => handleClockIn(selectedEmployeeId!)}
                disabled={!selectedEmployeeId}
              >
                <LogIn /> Clock In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Log History</CardTitle>
          <CardDescription>
            A record of all completed work sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWorkLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No work logs yet.
                  </TableCell>
                </TableRow>
              )}
              {sortedWorkLogs.map((log: WorkLog) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.employeeName}
                  </TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString([], {
                      timeZone: 'America/Costa_Rica',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(log.clockInTime).toLocaleTimeString([], {
                      timeZone: 'America/Costa_Rica',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(log.clockOutTime).toLocaleTimeString([], {
                      timeZone: 'America/Costa_Rica',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{formatDuration(log.duration)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setLogToEdit(log)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {logToEdit && (
        <Dialog
          open={!!logToEdit}
          onOpenChange={(open) => !open && setLogToEdit(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Work Log</DialogTitle>
            </DialogHeader>
            <EditWorkLogForm log={logToEdit} onSubmit={handleUpdateWorkLog} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
