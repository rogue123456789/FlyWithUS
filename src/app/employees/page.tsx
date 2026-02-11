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
import type { Employee, WorkLog } from '@/lib/types';
import {
  Clock,
  LogIn,
  LogOut,
  Download,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useI18n } from '@/context/i18n-context';

function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const duration = intervalToDuration({ start: 0, end: ms });
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;
  const seconds = duration.seconds ?? 0;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function LiveTimer({ startTime }: { startTime: string }) {
  const [duration, setDuration] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateDuration = () => {
      setDuration(formatDistanceStrict(parseISO(startTime), new Date()));
    };

    updateDuration();
    const timer = setInterval(updateDuration, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (duration === null) {
    return <span className="font-mono">...</span>;
  }

  return <span className="font-mono">{duration}</span>;
}

export default function EmployeesPage() {
  const firestore = useFirestore();

  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'employees') : null),
    [firestore]
  );
  const { data: employees } = useCollection<Employee>(employeesCollection);

  const workLogsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'work_logs') : null),
    [firestore]
  );
  const { data: workLogs } = useCollection<WorkLog>(workLogsCollection);

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const [logToEdit, setLogToEdit] = React.useState<WorkLog | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const selectedEmployee = employees?.find((e) => e.id === selectedEmployeeId);

  const handleClockIn = async (employeeId: string) => {
    const employeeRef = doc(firestore, 'employees', employeeId);
    try {
      await updateDoc(employeeRef, {
        status: 'Clocked In',
        lastClockIn: new Date().toISOString(),
      });
      const employee = employees?.find((e) => e.id === employeeId);
      if (employee) {
        toast({
          title: t('EmployeesPage.toastClockInTitle'),
          description: t('EmployeesPage.toastClockInDescription', {
            name: employee.name,
          }),
        });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleClockOut = async (employeeId: string) => {
    const employee = employees?.find((e) => e.id === employeeId);
    if (!employee || !employee.lastClockIn) return;

    const clockInTime = parseISO(employee.lastClockIn);
    const clockOutTime = new Date();
    const duration = differenceInMilliseconds(clockOutTime, clockInTime);

    const newWorkLog = {
      employeeId: employee.id,
      employeeName: employee.name,
      date: clockInTime.toISOString(),
      clockInTime: clockInTime.toISOString(),
      clockOutTime: clockOutTime.toISOString(),
      duration,
    };

    const employeeRef = doc(firestore, 'employees', employeeId);
    const workLogsCol = collection(firestore, 'work_logs');

    try {
      await addDoc(workLogsCol, newWorkLog);
      await updateDoc(employeeRef, {
        status: 'Clocked Out',
        lastClockIn: null,
      });
      toast({
        title: t('EmployeesPage.toastClockOutTitle'),
        description: t('EmployeesPage.toastClockOutDescription', {
          name: employee.name,
          duration: formatDuration(duration),
        }),
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleExport = () => {
    if (!sortedWorkLogs) return;
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
    if (!workLogs) return [];
    return [...workLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [workLogs]);

  const handleUpdateWorkLog = async (values: {
    date: string;
    clockInTime: string;
    clockOutTime: string;
  }) => {
    if (!logToEdit) return;

    const clockInDateTime = new Date(`${values.date}T${values.clockInTime}`);
    const clockOutDateTime = new Date(`${values.date}T${values.clockOutTime}`);
    const duration = differenceInMilliseconds(clockOutDateTime, clockInDateTime);

    const updatedLogData = {
      date: clockInDateTime.toISOString(),
      clockInTime: clockInDateTime.toISOString(),
      clockOutTime: clockOutDateTime.toISOString(),
      duration,
    };

    const logRef = doc(firestore, 'work_logs', logToEdit.id);
    try {
      await updateDoc(logRef, updatedLogData);
      toast({ title: t('EmployeesPage.toastUpdatedTitle') });
      setLogToEdit(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('EmployeesPage.title')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download /> {t('EmployeesPage.export')}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock /> {t('EmployeesPage.timeClockCardTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={setSelectedEmployeeId}
            value={selectedEmployeeId ?? ''}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('EmployeesPage.selectEmployeePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((employee) => (
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
                  {t('EmployeesPage.clockedInAt')}{' '}
                  {selectedEmployee.lastClockIn &&
                    new Date(selectedEmployee.lastClockIn).toLocaleTimeString(
                      'en-US',
                      {
                        timeZone: 'America/Costa_Rica',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('EmployeesPage.sessionDuration')}{' '}
                  {selectedEmployee.lastClockIn && (
                    <LiveTimer startTime={selectedEmployee.lastClockIn} />
                  )}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleClockOut(selectedEmployee.id)}
              >
                <LogOut /> {t('EmployeesPage.clockOut')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <p>
                {selectedEmployee
                  ? t('EmployeesPage.clockedOutMessage', {
                      name: selectedEmployee.name,
                    })
                  : t('EmployeesPage.selectEmployeeMessage')}
              </p>
              <Button
                onClick={() => handleClockIn(selectedEmployeeId!)}
                disabled={!selectedEmployeeId}
              >
                <LogIn /> {t('EmployeesPage.clockIn')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('EmployeesPage.workLogHistoryCardTitle')}</CardTitle>
          <CardDescription>
            {t('EmployeesPage.workLogHistoryCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('EmployeesPage.tableEmployee')}</TableHead>
                <TableHead>{t('EmployeesPage.tableDate')}</TableHead>
                <TableHead>{t('EmployeesPage.tableClockIn')}</TableHead>
                <TableHead>{t('EmployeesPage.tableClockOut')}</TableHead>
                <TableHead>{t('EmployeesPage.tableDuration')}</TableHead>
                <TableHead className="text-right">
                  {t('EmployeesPage.tableActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWorkLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t('EmployeesPage.noWorkLogs')}
                  </TableCell>
                </TableRow>
              )}
              {sortedWorkLogs.map((log: WorkLog) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.employeeName}
                  </TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString('en-US', {
                      timeZone: 'America/Costa_Rica',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(log.clockInTime).toLocaleTimeString('en-US', {
                      timeZone: 'America/Costa_Rica',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(log.clockOutTime).toLocaleTimeString('en-US', {
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
                          {t('EmployeesPage.edit')}
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
              <DialogTitle>{t('EmployeesPage.dialogEditTitle')}</DialogTitle>
            </DialogHeader>
            <EditWorkLogForm log={logToEdit} onSubmit={handleUpdateWorkLog} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
