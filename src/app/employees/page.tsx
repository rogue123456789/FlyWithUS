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
  Trash2,
} from 'lucide-react';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useAuthReady } from '@/context/auth-ready-context';

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
  const { user } = useUser();
  const isAuthReady = useAuthReady();

  const employeesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'employees')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: employees } = useCollection<Employee>(employeesCollection);

  const workLogsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'work_logs')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: workLogs } = useCollection<WorkLog>(workLogsCollection);

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const [logToEdit, setLogToEdit] = React.useState<WorkLog | null>(null);
  const [workLogToDelete, setWorkLogToDelete] = React.useState<WorkLog | null>(
    null
  );
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );
  const { toast } = useToast();
  const { t } = useI18n();

  const adminRef = useMemoFirebase(
    () =>
      isAuthReady && user ? doc(firestore, 'roles_admin', user.uid) : null,
    [isAuthReady, firestore, user]
  );
  const { data: adminRoleDoc } = useDoc(adminRef);

  const openRef = useMemoFirebase(
    () => (isAuthReady && user ? doc(firestore, 'roles_open', user.uid) : null),
    [isAuthReady, firestore, user]
  );
  const { data: openRoleDoc } = useDoc(openRef);

  React.useEffect(() => {
    if (adminRoleDoc) {
      setUserRole('admin');
    } else if (openRoleDoc) {
      setUserRole('open');
    } else {
      setUserRole(null);
    }
  }, [adminRoleDoc, openRoleDoc]);

  const selectedEmployee = employees?.find((e) => e.id === selectedEmployeeId);

  const handleClockIn = async (employeeId: string) => {
    if (!firestore) return;
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
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleClockOut = async (employeeId: string) => {
    if (!firestore) return;
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
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleExport = () => {
    if (!sortedWorkLogs) return;
    const dataToExport = sortedWorkLogs.map((log) => ({
      'Employee Name': log.employeeName,
      Date: format(parseISO(log.date), 'yyyy-MM-dd'),
      'Clock In': format(parseISO(log.clockInTime), 'HH:mm:ss'),
      'Clock Out': format(parseISO(log.clockOutTime), 'HH:mm:ss'),
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
    if (!logToEdit || !firestore) return;

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
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLogToEdit(null);
      window.location.reload();
    }
  };

  const handleDeleteWorkLog = async () => {
    if (!workLogToDelete || !firestore) return;
    try {
      const logRef = doc(firestore, 'work_logs', workLogToDelete.id);
      await deleteDoc(logRef);
      toast({
        title: t('EmployeesPage.toastLogDeletedTitle'),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting log',
        description: error.message,
      });
    } finally {
      setWorkLogToDelete(null);
      window.location.reload();
    }
  };

  const handleClearAllWorkLogs = async () => {
    if (!firestore || !workLogs || workLogs.length === 0) {
      toast({ title: t('EmployeesPage.toastNoLogs') });
      setIsClearDialogOpen(false);
      return;
    }

    toast({ title: t('EmployeesPage.toastClearingTitle') });

    try {
      const batch = writeBatch(firestore);
      workLogs.forEach((log) => {
        const logRef = doc(firestore, 'work_logs', log.id);
        batch.delete(logRef);
      });
      await batch.commit();

      toast({ title: t('EmployeesPage.toastClearedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('EmployeesPage.toastClearErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsClearDialogOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('EmployeesPage.title')}
        actions={
          userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download /> {t('EmployeesPage.export')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsClearDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('EmployeesPage.clearAll')}
              </Button>
            </div>
          )
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
                    format(parseISO(selectedEmployee.lastClockIn), 'p')}
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
                  <TableCell
                    colSpan={userRole === 'admin' ? 6 : 5}
                    className="text-center"
                  >
                    {t('EmployeesPage.noWorkLogs')}
                  </TableCell>
                </TableRow>
              )}
              {sortedWorkLogs.map((log: WorkLog) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.employeeName}
                  </TableCell>
                  <TableCell>{format(parseISO(log.date), 'PP')}</TableCell>
                  <TableCell>
                    {format(parseISO(log.clockInTime), 'p')}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(log.clockOutTime), 'p')}
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setWorkLogToDelete(log)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('EmployeesPage.delete')}
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

      <AlertDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('EmployeesPage.clearDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('EmployeesPage.clearDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('EmployeesPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllWorkLogs}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {workLogToDelete && (
        <AlertDialog
          open={!!workLogToDelete}
          onOpenChange={(open) => !open && setWorkLogToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('EmployeesPage.deleteLogDialogTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('EmployeesPage.deleteLogDialogDescription', {
                  logId: workLogToDelete.id,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWorkLogToDelete(null)}>
                {t('EmployeesPage.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWorkLog}>
                {t('EmployeesPage.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
