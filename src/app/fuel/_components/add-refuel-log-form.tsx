'use client';

import * as React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    date: z.string().min(1, t('AddRefuelLogForm.dateRequired')),
    litersRefueled: z.coerce
      .number()
      .min(0.1, { message: t('AddRefuelLogForm.litersError') }),
    cost: z.coerce.number().min(0.01, { message: t('AddRefuelLogForm.costError') }),
  });

type AddRefuelLogFormProps = {
  onFormSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddRefuelLogForm({ onFormSubmit }: AddRefuelLogFormProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      litersRefueled: 100,
      cost: 200,
    },
  });

  React.useEffect(() => {
    form.setValue('date', new Date().toISOString().slice(0, 10));
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: t('AddRefuelLogForm.toastLoggedTitle'),
      description: t('AddRefuelLogForm.toastLoggedDescription', {
        liters: values.litersRefueled,
      }),
    });
    onFormSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddRefuelLogForm.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="litersRefueled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddRefuelLogForm.litersRefueled')}</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddRefuelLogForm.totalCost')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t('AddRefuelLogForm.costPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t('AddRefuelLogForm.logRefuel')}
        </Button>
      </form>
    </Form>
  );
}
