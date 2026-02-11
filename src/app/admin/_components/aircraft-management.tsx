'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { Plane } from '@/lib/types';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

type AircraftManagementProps = {
  planes: Plane[];
};

export function AircraftManagement({ planes }: AircraftManagementProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [planeToDelete, setPlaneToDelete] = React.useState<Plane | null>(null);

  const confirmDelete = async () => {
    if (planeToDelete) {
      try {
        await deleteDoc(doc(firestore, 'aircrafts', planeToDelete.id));
        toast({
          title: t('AircraftManagement.toastDeletedTitle'),
          description: t('AircraftManagement.toastDeletedDescription', {
            planeId: planeToDelete.id,
          }),
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setPlaneToDelete(null);
      }
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('AircraftManagement.id')}</TableHead>
            <TableHead>{t('AircraftManagement.name')}</TableHead>
            <TableHead>{t('AircraftManagement.totalHours')}</TableHead>
            <TableHead>{t('AircraftManagement.nextMaintenance')}</TableHead>
            <TableHead className="text-right">
              {t('AircraftManagement.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planes.map((plane) => (
            <TableRow key={plane.id}>
              <TableCell>{plane.id}</TableCell>
              <TableCell>{plane.name}</TableCell>
              <TableCell>{plane.totalHours.toFixed(1)}</TableCell>
              <TableCell>{plane.nextMaintenanceHours.toFixed(1)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => setPlaneToDelete(plane)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('AircraftManagement.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog
        open={!!planeToDelete}
        onOpenChange={(open) => !open && setPlaneToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('AircraftManagement.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('AircraftManagement.deleteDialogDescription', {
                planeId: planeToDelete?.id,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('AircraftManagement.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
