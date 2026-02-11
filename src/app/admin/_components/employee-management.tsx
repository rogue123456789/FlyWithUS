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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { useI18n } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { AddEmployeeForm } from './add-employee-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type EmployeeManagementProps = {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
};

export function EmployeeManagement({
  employees,
  setEmployees,
}: EmployeeManagementProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(
    null
  );

  const handleAddEmployee = (values: {
    name: string;
    role: 'Pilot' | 'Mechanic' | 'Admin';
  }) => {
    const newEmployee: Employee = {
      id: `emp${Date.now()}`,
      name: values.name,
      role: values.role,
      status: 'Clocked Out',
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    setIsAddDialogOpen(false);
    toast({
      title: t('EmployeeManagement.toastAddedTitle'),
      description: t('EmployeeManagement.toastAddedDescription', {
        name: values.name,
      }),
    });
  };

  const confirmDeleteEmployee = () => {
    if (employeeToDelete) {
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      toast({
        title: t('EmployeeManagement.toastDeletedTitle'),
      });
      window.location.reload();
    }
  };

  const handleRoleChange = (
    employeeId: string,
    newRole: 'Pilot' | 'Mechanic' | 'Admin'
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, role: newRole } : emp))
    );
    toast({
      title: t('EmployeeManagement.toastRoleUpdatedTitle'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('EmployeeManagement.addEmployee')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('EmployeeManagement.addDialogTitle')}
              </DialogTitle>
            </DialogHeader>
            <AddEmployeeForm onSubmit={handleAddEmployee} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('EmployeeManagement.name')}</TableHead>
            <TableHead>{t('EmployeeManagement.status')}</TableHead>
            <TableHead>{t('EmployeeManagement.role')}</TableHead>
            <TableHead className="text-right">
              {t('EmployeeManagement.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.status}</TableCell>
              <TableCell>
                <Select
                  value={employee.role}
                  onValueChange={(newRole: 'Pilot' | 'Mechanic' | 'Admin') =>
                    handleRoleChange(employee.id, newRole)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={t('EmployeeManagement.changeRolePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pilot">
                      {t('AddEmployeeForm.pilot')}
                    </SelectItem>
                    <SelectItem value="Mechanic">
                      {t('AddEmployeeForm.mechanic')}
                    </SelectItem>
                    <SelectItem value="Admin">
                      {t('AddEmployeeForm.adminRole')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => setEmployeeToDelete(employee)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('EmployeeManagement.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('EmployeeManagement.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('EmployeeManagement.deleteDialogDescription', {
                name: employeeToDelete?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('EmployeeManagement.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmployee}>
              {t('EmployeeManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
