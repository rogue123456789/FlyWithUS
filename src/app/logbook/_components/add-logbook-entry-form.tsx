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
import type { Logbook } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useI18n } from '@/context/i18n-context';
import { format } from 'date-fns';

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      date: z
        .string({ required_error: t('AddLogbookEntryForm.dateRequired') })
        .min(1, t('AddLogbookEntryForm.dateRequired')),
      time: z
        .string({ required_error: t('AddLogbookEntryForm.timeRequired') })
        .min(1, t('AddLogbookEntryForm.timeRequired')),
      logbookSelection: z.enum(['existing', 'new']).default('existing'),
      logbookId: z.string().optional(),
      newLogbookName: z.string().optional(),
      currentHourCounter: z.coerce.number().optional(),
      engineCheckHours: z.coerce.number().optional(),
      generalCheckHours: z.coerce.number().optional(),
      startLocation: z
        .string()
        .min(2, { message: t('AddLogbookEntryForm.startLocationRequired') }),
      endLocation: z
        .string()
        .min(2, { message: t('AddLogbookEntryForm.endLocationRequired') }),
      duration: z.coerce
        .number()
        .min(0.1, { message: t('AddLogbookEntryForm.durationError') }),
      reason: z
        .string()
        .min(2, { message: t('AddLogbookEntryForm.reasonRequired') }),
      batteryStatus: z.enum(['OK', 'Not OK'], {
        required_error: t('AddLogbookEntryForm.batteryStatusRequired'),
      }),
      oilPressure: z.coerce.number(),
      oilTemp: z.coerce.number(),
      waterTemp: z.coerce.number(),
    })
    .refine(
      (data) => {
        if (data.logbookSelection === 'existing') {
          return !!data.logbookId;
        }
        if (data.logbookSelection === 'new') {
          return data.newLogbookName && data.newLogbookName.length > 1;
        }
        return true;
      },
      {
        message: t('AddLogbookEntryForm.logbookSelectionError'),
        path: ['logbookSelection'],
      }
    );

type AddLogbookEntryFormProps = {
  logbooks: Logbook[];
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddLogbookEntryForm({
  logbooks,
  onSubmit,
}: AddLogbookEntryFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      time: '',
      duration: 0.1,
      startLocation: '',
      endLocation: '',
      reason: '',
      logbookSelection: 'existing',
      oilPressure: 50,
      oilTemp: 90,
      waterTemp: 90,
    },
  });

  const logbookSelection = form.watch('logbookSelection');

  React.useEffect(() => {
    // Set date and time on the client-side to avoid hydration mismatch
    form.setValue('date', format(new Date(), 'yyyy-MM-dd'));
    form.setValue('time', format(new Date(), 'HH:mm'));
  }, [form]);

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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddLogbookEntryForm.date')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddLogbookEntryForm.time')}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logbookSelection"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('AddLogbookEntryForm.logbook')}</FormLabel>
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
                      {t('AddLogbookEntryForm.existingLogbook')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="new" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('AddLogbookEntryForm.newLogbook')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {logbookSelection === 'existing' && (
          <FormField
            control={form.control}
            name="logbookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddLogbookEntryForm.selectLogbook')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'AddLogbookEntryForm.selectLogbookPlaceholder'
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {logbooks.map((logbook) => (
                      <SelectItem key={logbook.id} value={logbook.id}>
                        {logbook.name} ({logbook.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {logbookSelection === 'new' && (
          <div className="space-y-4 rounded-md border p-4">
            <FormField
              control={form.control}
              name="newLogbookName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('AddLogbookEntryForm.newLogbookName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'AddLogbookEntryForm.newLogbookNamePlaceholder'
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
              name="currentHourCounter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('AddLogbookEntryForm.currentHourCounter')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1250.5"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineCheckHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('AddLogbookEntryForm.engineCheckHours')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
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
                name="generalCheckHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('AddLogbookEntryForm.generalCheckHours')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 100"
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
            name="startLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddLogbookEntryForm.startLocation')}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. KSQL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddLogbookEntryForm.endLocation')}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. KPAO" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddLogbookEntryForm.duration')}</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddLogbookEntryForm.reason')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('AddLogbookEntryForm.reasonPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-md border p-4">
          <h3 className="mb-4 text-lg font-medium">
            {t('AddLogbookEntryForm.checksTitle')}
          </h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="batteryStatus"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('AddLogbookEntryForm.battery')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="OK" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('AddLogbookEntryForm.ok')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Not OK" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('AddLogbookEntryForm.notOk')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="oilPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('AddLogbookEntryForm.oilPressure')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oilTemp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('AddLogbookEntryForm.oilTemp')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waterTemp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('AddLogbookEntryForm.waterTemp')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          {t('AddLogbookEntryForm.recordEntry')}
        </Button>
      </form>
    </Form>
  );
}
