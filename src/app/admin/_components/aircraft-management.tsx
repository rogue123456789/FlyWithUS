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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { Plane } from '@/lib/types';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';

type AircraftManagementProps = {
  planes: Plane[];
  setPlanes: React.Dispatch<React.SetStateAction<Plane[]>>;
};

export function AircraftManagement({
  planes,
  setPlanes,
}: AircraftManagementProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleDelete = (planeId: string) => {
    setPlanes((prev) => prev.filter((p) => p.id !== planeId));
    toast({
      title: t('AircraftManagement.toastDeletedTitle'),
      description: t('AircraftManagement.toastDeletedDescription', {
        planeId,
      }),
    });
  };

  return (
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
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('AircraftManagement.delete')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('AircraftManagement.deleteDialogTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('AircraftManagement.deleteDialogDescription', {
                        planeId: plane.id,
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('AircraftManagement.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(plane.id)}>
                      {t('AircraftManagement.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
