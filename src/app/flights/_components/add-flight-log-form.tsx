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
import type { Plane } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useI18n } from '@/context/i18n-context';
import { format } from 'date-fns';

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      date: z
        .string({
          required_error: t('AddFlightLogForm.dateRequired'),
        })
        .min(1, t('AddFlightLogForm.dateRequired')),
      pilotName: z
        .string()
        .min(2, { message: t('AddFlightLogForm.pilotNameRequired') }),
      aircraftSelection: z.enum(['existing', 'new']).default('existing'),
      planeId: z.string().optional(),
      newPlaneId: z.string().optional(),
      newPlaneName: z.string().optional(),
      takeoffLocation: z
        .string()
        .min(2, { message: t('AddFlightLogForm.takeoffLocationRequired') }),
      landingLocation: z
        .string()
        .min(2, { message: t('AddFlightLogForm.landingLocationRequired') }),
      flightDuration: z.coerce
        .number()
        .min(0.1, { message: t('AddFlightLogForm.flightDurationError') }),
      squawk: z.coerce.number().optional(),
      flightReason: z
        .string()
        .min(2, { message: t('AddFlightLogForm.flightReasonRequired') }),
    })
    .refine(
      (data) => {
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
        return true;
      },
      {
        message: t('AddFlightLogForm.aircraftSelectionError'),
        path: ['aircraftSelection'],
      }
    );

type AddFlightLogFormProps = {
  planes: Plane[];
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddFlightLogForm({ planes, onSubmit }: AddFlightLogFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      pilotName: '',
      flightDuration: 0.1,
      takeoffLocation: '',
      landingLocation: '',
      flightReason: '',
      aircraftSelection: 'existing',
      squawk: 7000,
    },
  });

  const aircraftSelection = form.watch('aircraftSelection');

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
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddFlightLogForm.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pilotName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddFlightLogForm.pilotName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('AddFlightLogForm.pilotName')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aircraftSelection"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('AddFlightLogForm.aircraft')}</FormLabel>
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
                      {t('AddFlightLogForm.existingAircraft')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="new" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('AddFlightLogForm.newAircraft')}
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
                <FormLabel>{t('AddFlightLogForm.selectAircraft')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'AddFlightLogForm.selectAircraftPlaceholder'
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
          <div className="space-y-4 rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newPlaneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('AddFlightLogForm.newAircraftId')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'AddFlightLogForm.newAircraftIdPlaceholder'
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
                      {t('AddFlightLogForm.newAircraftName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'AddFlightLogForm.newAircraftNamePlaceholder'
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
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="takeoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFlightLogForm.tookOffFrom')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'AddFlightLogForm.tookOffFromPlaceholder'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="landingLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFlightLogForm.landedAt')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('AddFlightLogForm.landedAtPlaceholder')}
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
            name="flightDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFlightLogForm.flightDuration')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="squawk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddFlightLogForm.squawk')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('AddFlightLogForm.squawkPlaceholder')}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="flightReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddFlightLogForm.reasonForFlying')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    'AddFlightLogForm.reasonForFlyingPlaceholder'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t('AddFlightLogForm.recordFlightHours')}
        </Button>
      </form>
    </Form>
  );
}
