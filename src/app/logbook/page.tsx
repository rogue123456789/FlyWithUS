'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Logbook, LogbookEntry } from '@/lib/types';
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { AddLogbookEntryForm } from './_components/add-logbook-entry-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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
  addDoc,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import { useAuthReady } from '@/context/auth-ready-context';
import { downloadCsv } from '@/lib/utils';

const AddLogbookEntryDialog = ({
  onAddLogbookEntry,
  logbooks,
}: {
  onAddLogbookEntry: (values: any) => void;
  logbooks: Logbook[];
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const handleFormSubmit = (values: any) => {
    onAddLogbookEntry(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('LogbookPage.recordLogbook')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('LogbookPage.addDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('LogbookPage.addDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <AddLogbookEntryForm
          logbooks={logbooks}
          onSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function LogbookPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAuthReady = useAuthReady();
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);

  const logbookEntriesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'logbook_entries')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: logbookEntries } =
    useCollection<LogbookEntry>(logbookEntriesCollection);

  const logbooksCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'logbooks')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: logbooks } = useCollection<Logbook>(logbooksCollection);

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

  const getLogbookName = React.useCallback(
    (logbookId: string) => {
      if (!logbooks) return logbookId;
      const logbook = logbooks.find((lb) => lb.id === logbookId);
      return logbook?.name || logbookId;
    },
    [logbooks]
  );

  const handleAddLogbookEntry = async (newEntryData: any) => {
    if (!firestore) return;
    try {
      let logbookId;
      if (newEntryData.logbookSelection === 'new') {
        const currentHours = newEntryData.currentHourCounter || 0;
        const newLogbookData = {
          name: newEntryData.newLogbookName,
          totalHours: currentHours + newEntryData.duration,
          engineCheckHours: newEntryData.engineCheckHours,
          generalCheckHours: newEntryData.generalCheckHours,
        };
        const newLogbookRef = await addDoc(
          collection(firestore, 'logbooks'),
          newLogbookData
        );
        logbookId = newLogbookRef.id;
      } else {
        logbookId = newEntryData.logbookId;
        const logbookRef = doc(firestore, 'logbooks', logbookId);
        await updateDoc(logbookRef, {
          totalHours: increment(newEntryData.duration),
        });
      }

      const newEntry = {
        date: new Date(
          `${newEntryData.date}T${newEntryData.time}`
        ).toISOString(),
        logbookId: logbookId,
        startLocation: newEntryData.startLocation,
        endLocation: newEntryData.endLocation,
        duration: newEntryData.duration,
        reason: newEntryData.reason,
        batteryStatus: newEntryData.batteryStatus,
        oilPressure: newEntryData.oilPressure,
        oilTemp: newEntryData.oilTemp,
        waterTemp: newEntryData.waterTemp,
      };
      await addDoc(collection(firestore, 'logbook_entries'), newEntry);

      const logbookName =
        newEntryData.logbookSelection === 'new'
          ? newEntryData.newLogbookName
          : logbooks?.find((lb) => lb.id === logbookId)?.name;

      toast({
        title: t('LogbookPage.toastAddedTitle'),
        description: t('LogbookPage.toastAddedDescription', {
          logbookName: logbookName || logbookId,
        }),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const sortedLogbookEntries = React.useMemo(() => {
    if (!logbookEntries) return [];
    return [...logbookEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logbookEntries]);

  const handleClearAllLogbookEntries = async () => {
    if (!firestore || !logbookEntries || logbookEntries.length === 0) {
      toast({ title: t('LogbookPage.toastNoLogs') });
      setIsClearDialogOpen(false);
      return;
    }

    toast({ title: t('LogbookPage.toastClearingTitle') });

    try {
      const batch = writeBatch(firestore);

      const hourReductions: { [logbookId: string]: number } = {};

      logbookEntries.forEach((entry) => {
        if (hourReductions[entry.logbookId]) {
          hourReductions[entry.logbookId] -= entry.duration;
        } else {
          hourReductions[entry.logbookId] = -entry.duration;
        }

        const entryRef = doc(firestore, 'logbook_entries', entry.id);
        batch.delete(entryRef);
      });

      for (const logbookId in hourReductions) {
        const logbookRef = doc(firestore, 'logbooks', logbookId);
        batch.update(logbookRef, {
          totalHours: increment(hourReductions[logbookId]),
        });
      }

      await batch.commit();

      toast({ title: t('LogbookPage.toastClearedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('LogbookPage.toastClearErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsClearDialogOpen(false);
    }
  };

  const handleExport = () => {
    if (!sortedLogbookEntries) return;
    const dataToExport = sortedLogbookEntries.map((log) => ({
      ...log,
      logbookName: getLogbookName(log.logbookId),
    }));
    downloadCsv(
      dataToExport,
      `logbook-entries-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('Nav.logbook')}
        actions={
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('LogbookPage.export')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsClearDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('LogbookPage.clearAll')}
                </Button>
              </>
            )}
            <AddLogbookEntryDialog
              onAddLogbookEntry={handleAddLogbookEntry}
              logbooks={logbooks ?? []}
            />
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('Nav.logbook')}</CardTitle>
          <CardDescription>
            {t('LogbookPage.allLogbooksCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('LogbookPage.tableDate')}</TableHead>
                <TableHead>{t('LogbookPage.tableLogbook')}</TableHead>
                <TableHead>{t('LogbookPage.tableFrom')}</TableHead>
                <TableHead>{t('LogbookPage.tableTo')}</TableHead>
                <TableHead>{t('LogbookPage.tableDuration')}</TableHead>
                <TableHead>{t('LogbookPage.tableBattery')}</TableHead>
                <TableHead>{t('LogbookPage.tableOilPressure')}</TableHead>
                <TableHead>{t('LogbookPage.tableOilTemp')}</TableHead>
                <TableHead>{t('LogbookPage.tableWaterTemp')}</TableHead>
                <TableHead>{t('LogbookPage.tableReason')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogbookEntries.map((log: LogbookEntry) => (
                <TableRow key={log.id}>
                  <TableCell suppressHydrationWarning>
                    {format(parseISO(log.date), 'MMM d, yyyy, p')}
                  </TableCell>
                  <TableCell>{getLogbookName(log.logbookId)}</TableCell>
                  <TableCell>{log.startLocation}</TableCell>
                  <TableCell>{log.endLocation}</TableCell>
                  <TableCell>{log.duration.toFixed(1)}h</TableCell>
                  <TableCell>{log.batteryStatus}</TableCell>
                  <TableCell>{log.oilPressure}</TableCell>
                  <TableCell>{log.oilTemp}</TableCell>
                  <TableCell>{log.waterTemp}</TableCell>
                  <TableCell>{log.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('LogbookPage.clearDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('LogbookPage.clearDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('PaymentsPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllLogbookEntries}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
