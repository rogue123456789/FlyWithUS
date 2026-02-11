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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { FuelLog, Plane } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useI18n } from '@/context/i18n-context';

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      date: z.string().min(1, t('AddFuelLogForm.dateRequired')),
      customerType: z.enum(['Company', 'External']),
      aircraftSelection: z.enum(['existing', 'new']).default('existing'),
      planeId: z.string().optional(),
      newPlaneId: z.string().optional(),
      newPlaneName: z.string().optional(),
      startQuantity: z.coerce
        .number()
        .min(0, { message: t('AddFuelLogForm.startQuantityError') }),
      liters: z.coerce
        .number()
        .min(0.1, { message: t('AddFuelLogForm.litersError') }),
    })
    .refine((data) => data.startQuantity >= data.liters, {
      message: t('AddFuelLogForm.litersDispensedError'),
      path: ['liters'],
    })
    .refine(
      (data) => {
        if (data.customerType === 'Company') {
          if (data.aircraftSelection === 'existing') {
            return !!data.planeId;
          }
          if (data.aircraftSelection === 'new') {
            return (
              data.newPlaneId &&
              data.newPlaneId.length > 1 &&
              data.newPlaneName &&
              data.newPlaneName.length > 1
            );
          }
        }
        return true;
      },
      {
        message: t('AddFuelLogForm.aircraftSelectionError'),
        path: ['aircraftSelection'],
      }
    );

type AddFuelLogFormProps = {
  planes: Plane[];
  fuelLogs: FuelLog[];
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddFuelLogForm({
  planes,
  fuelLogs,
  onSubmit,
}: AddFuelLogFormProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      customerType: 'Company',
      startQuantity: 100,
      liters: 10,
      aircraftSelection: 'existing',
    },
  });

  const customerType = form.watch('customerType');
  const aircraftSelection = form.watch('aircraftSelection');
  const startQuantity = form.watch('startQuantity');
  const liters = form.watch('liters');

  const [isStartQuantityReadOnly, setIsStartQuantityReadOnly] =
    React.useState(false);

  React.useEffect(() => {
    // Since there is one giant fuel tank, the start quantity is always the
    // leftover quantity from the last transaction, regardless of the plane.
    const sortedLogs = [...fuelLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedLogs.length > 0) {
      form.setValue('startQuantity', sortedLogs[0].leftOverQuantity);
      setIsStartQuantityReadOnly(true);
    } else {
      // For the very first log, allow the user to set the initial quantity.
      form.setValue('startQuantity', 100);
      setIsStartQuantityReadOnly(false);
    }
  }, [fuelLogs, form.setValue]);

  const leftOverQuantity = React.useMemo(() => {
    const start = Number(startQuantity);
    const taken = Number(liters);
    if (!isNaN(start) && !isNaN(taken) && start >= taken) {
      return (start - taken).toFixed(1);
    }
    return '';
  }, [startQuantity, liters]);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    toast({
      title: t('AddFuelLogForm.toastLoggedTitle'),
      description: t('AddFuelLogForm.toastLoggedDescription', {
        liters: values.liters,
      }),
    });
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddFuelLogForm.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddFuelLogForm.customerType')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AddFuelLogForm.selectCustomerType')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Company">
                    {t('AddFuelLogForm.company')}
                  </SelectItem>
                  <SelectItem value="External">
                    {t('AddFuelLogForm.external')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {customerType === 'Company' && (
          <>
            <FormField
              control={form.control}
              name="aircraftSelection"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('AddFuelLogForm.aircraft')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="existing" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('AddFuelLogForm.existingAircraft')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="new" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('AddFuelLogForm.newAircraft')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {aircraftSelection === 'existing' && (
              <FormField
                control={form.control}
                name="planeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('AddFuelLogForm.selectAircraft')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'AddFuelLogForm.selectAircraftPlaceholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {planes.map((plane) => (
                          <SelectItem key={plane.id} value={plane.id}>
                            {plane.name} ({plane.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {aircraftSelection === 'new' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newPlaneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('AddFuelLogForm.newAircraftId')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'AddFuelLogForm.newAircraftIdPlaceholder'
                          )}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPlaneName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('AddFuelLogForm.newAircraftName')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'AddFuelLogForm.newAircraftNamePlaceholder'
                          )}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFuelLogForm.startQuantity')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    readOnly={isStartQuantityReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFuelLogForm.litersDispensed')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <FormLabel>{t('AddFuelLogForm.leftOverQuantity')}</FormLabel>
          <FormControl>
            <Input type="number" value={leftOverQuantity} readOnly disabled />
          </FormControl>
        </FormItem>

        <Button type="submit" className="w-full">
          {t('AddFuelLogForm.logFuel')}
        </Button>
      </form>
    </Form>
  );
}
