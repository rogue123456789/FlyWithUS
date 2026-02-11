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
import type { WorkLog } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useI18n } from '@/context/i18n-context';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    date: z.string().min(1, t('EditWorkLogForm.dateRequired')),
    clockInTime: z.string().min(1, t('EditWorkLogForm.clockInTimeRequired')),
    clockOutTime: z.string().min(1, t('EditWorkLogForm.clockOutTimeRequired')),
  });

type EditWorkLogFormProps = {
  log: WorkLog;
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

// Helper to format ISO date to HH:mm for time input
const formatToTimeInput = (isoString: string) => {
  if (!isoString) return '';
  return format(parseISO(isoString), 'HH:mm');
};

export function EditWorkLogForm({ log, onSubmit }: EditWorkLogFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(parseISO(log.date), 'yyyy-MM-dd'),
      clockInTime: formatToTimeInput(log.clockInTime),
      clockOutTime: formatToTimeInput(log.clockOutTime),
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('EditWorkLogForm.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clockInTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('EditWorkLogForm.clockInTime')}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clockOutTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('EditWorkLogForm.clockOutTime')}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {t('EditWorkLogForm.saveChanges')}
        </Button>
      </form>
    </Form>
  );
}
