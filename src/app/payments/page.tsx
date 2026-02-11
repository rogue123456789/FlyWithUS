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
import type { Payment } from '@/lib/types';
import {
  Download,
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AddPaymentForm } from './_components/add-payment-form';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { downloadCsv } from '@/lib/utils';
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
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import { useAuthReady } from '@/context/auth-ready-context';

export default function PaymentsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAuthReady = useAuthReady();
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );

  const [paymentToDelete, setPaymentToDelete] = React.useState<Payment | null>(
    null
  );
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const paymentsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'payments')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: payments } = useCollection<Payment>(paymentsCollection);

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

  const handleAddPayment = async (values: any) => {
    if (!firestore) return;
    try {
      const newPayment = {
        ...values,
        date: new Date(values.date + 'T00:00:00').toISOString(),
      };
      await addDoc(collection(firestore, 'payments'), newPayment);
      toast({
        title: t('PaymentsPage.toastAddedTitle'),
        description: t('PaymentsPage.toastAddedDescription'),
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        await deleteDoc(doc(firestore, 'payments', paymentToDelete.id));
        toast({
          title: t('PaymentsPage.toastDeletedTitle'),
          description: t('PaymentsPage.toastDeletedDescription', {
            paymentId: paymentToDelete.id,
          }),
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setPaymentToDelete(null);
        window.location.reload();
      }
    }
  };

  const handleClearAll = async () => {
    if (!firestore || !payments || payments.length === 0) {
      toast({ title: t('PaymentsPage.toastNoLogs') });
      setIsClearDialogOpen(false);
      return;
    }

    toast({ title: t('PaymentsPage.toastClearingTitle') });

    try {
      const batch = writeBatch(firestore);
      payments.forEach((p) => {
        const logRef = doc(firestore, 'payments', p.id);
        batch.delete(logRef);
      });
      await batch.commit();
      toast({ title: t('PaymentsPage.toastClearedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('PaymentsPage.toastClearErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsClearDialogOpen(false);
      window.location.reload();
    }
  };
  const handleExport = () => {
    if (!sortedPayments) return;
    downloadCsv(
      sortedPayments,
      `payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const sortedPayments = React.useMemo(() => {
    if (!payments) return [];
    return [...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [payments]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('Nav.payments')}
        actions={
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('PaymentsPage.export')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsClearDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('PaymentsPage.clearAll')}
                </Button>
              </>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('PaymentsPage.addPayment')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('PaymentsPage.addDialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('PaymentsPage.addDialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <AddPaymentForm onSubmit={handleAddPayment} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('PaymentsPage.allPaymentsCardTitle')}</CardTitle>
          <CardDescription>
            {t('PaymentsPage.allPaymentsCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('PaymentsPage.tableDate')}</TableHead>
                <TableHead>{t('PaymentsPage.tableAgency')}</TableHead>
                <TableHead>{t('PaymentsPage.tablePaymentMethod')}</TableHead>
                <TableHead>{t('PaymentsPage.tableCurrency')}</TableHead>
                <TableHead>{t('PaymentsPage.tableAmount')}</TableHead>
                <TableHead className="text-right">
                  {t('PaymentsPage.tableActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(parseISO(payment.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {payment.hasAgency ? payment.agencyName : 'N/A'}
                  </TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.currency}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency:
                        payment.currency === 'Dollars'
                          ? 'USD'
                          : payment.currency === 'Colones'
                          ? 'CRC'
                          : 'EUR',
                    }).format(payment.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('PaymentsPage.edit')}
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onSelect={() => setPaymentToDelete(payment)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('PaymentsPage.delete')}
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
      <AlertDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('PaymentsPage.clearDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('PaymentsPage.clearDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('PaymentsPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('PaymentsPage.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('PaymentsPage.deleteDialogDescription', {
                paymentId: paymentToDelete?.id,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('PaymentsPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
