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
import { useI18n } from '@/context/i18n-context';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string().min(2, { message: t('AddAircraftForm.idRequired') }),
    name: z.string().min(2, { message: t('AddAircraftForm.nameRequired') }),
    totalHours: z.coerce.number().min(0),
    nextMaintenanceHours: z.coerce.number().min(1),
    engineCheckHours: z.coerce.number().min(1).optional(),
    generalCheckHours: z.coerce.number().min(1).optional(),
  });

type AddAircraftFormProps = {
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddAircraftForm({ onSubmit }: AddAircraftFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      totalHours: 0,
      nextMaintenanceHours: 100,
      engineCheckHours: 50,
      generalCheckHours: 100,
    },
  });

  function handleFormSubmit(values: z.infer<ReturnType<typeof getFormSchema>>) {
    onSubmit(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.id')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('AddAircraftForm.idPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('AddAircraftForm.namePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.totalHours')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextMaintenanceHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.nextMaintenance')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="engineCheckHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.engineCheck')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="generalCheckHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddAircraftForm.generalCheck')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          {t('AddAircraftForm.addAircraft')}
        </Button>
      </form>
    </Form>
  );
}
