'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/context/i18n-context';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, { message: t('AddEmployeeForm.nameRequired') }),
    role: z.enum(['Pilot', 'Mechanic', 'Admin'], {
      required_error: t('AddEmployeeForm.roleRequired'),
    }),
  });

type AddEmployeeFormProps = {
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddEmployeeForm({ onSubmit }: AddEmployeeFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function handleFormSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    onSubmit(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddEmployeeForm.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('AddEmployeeForm.namePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddEmployeeForm.role')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AddEmployeeForm.rolePlaceholder')}
                    />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t('AddEmployeeForm.addEmployee')}
        </Button>
      </form>
    </Form>
  );
}
