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
import type { Plane, FlightLog } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/context/i18n-context';
import { format, parseISO } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    date: z
      .string({
        required_error: t('AddFlightLogForm.dateRequired'),
      })
      .min(1, t('AddFlightLogForm.dateRequired')),
    pilotName: z
      .string()
      .min(2, { message: t('AddFlightLogForm.pilotNameRequired') }),
    planeId: z.string().min(1, { message: 'Aircraft is required.' }),
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
    landingFeesPaid: z.enum(['yes', 'no']).default('no'),
  });

type EditFlightLogFormProps = {
  log: FlightLog;
  planes: Plane[];
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function EditFlightLogForm({
  log,
  planes,
  onSubmit,
}: EditFlightLogFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(parseISO(log.date), 'yyyy-MM-dd'),
      pilotName: log.pilotName,
      planeId: log.planeId,
      takeoffLocation: log.takeoffLocation,
      landingLocation: log.landingLocation,
      flightDuration: log.flightDuration,
      flightReason: log.flightReason,
      squawk: log.squawk,
      landingFeesPaid: log.landingFeesPaid ? 'yes' : 'no',
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
        <FormField
          control={form.control}
          name="landingFeesPaid"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('AddFlightLogForm.landingFeesPaid')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('AddFlightLogForm.yes')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('AddFlightLogForm.no')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t('AddFlightLogForm.saveChanges')}
        </Button>
      </form>
    </Form>
  );
}
