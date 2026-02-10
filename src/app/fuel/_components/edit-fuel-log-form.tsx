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
import type { FuelLog, Plane } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z
  .object({
    date: z.string().min(1, 'A date is required.'),
    customerType: z.enum(['Company', 'External', 'Refueling']),
    aircraftSelection: z.enum(['existing', 'new']).default('existing'),
    planeId: z.string().optional(),
    newPlaneId: z.string().optional(),
    newPlaneName: z.string().optional(),
    startQuantity: z.coerce.number(),
    liters: z.coerce
      .number()
      .min(0.1, { message: 'Liters must be positive.' }),
    cost: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.customerType !== 'Refueling') {
        return data.startQuantity >= data.liters;
      }
      return true;
    },
    {
      message: 'Liters dispensed cannot be more than start quantity.',
      path: ['liters'],
    }
  )
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
      message: 'Please select an aircraft or provide details for a new one.',
      path: ['aircraftSelection'],
    }
  );

type EditFuelLogFormProps = {
  log: FuelLog;
  planes: Plane[];
  onSubmit: (values: z.infer<typeof formSchema> & { leftOverQuantity: number }) => void;
};

export function EditFuelLogForm({
  log,
  planes,
  onSubmit,
}: EditFuelLogFormProps) {
  const isExistingPlane = planes.some((p) => p.id === log.planeId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: log.date,
      customerType: log.customerType,
      aircraftSelection: isExistingPlane ? 'existing' : 'new',
      planeId: isExistingPlane ? log.planeId : undefined,
      newPlaneId: isExistingPlane ? undefined : log.planeId,
      newPlaneName: '',
      startQuantity: log.startQuantity,
      liters: log.liters,
      cost: log.cost || 0,
    },
  });

  const customerType = form.watch('customerType');
  const aircraftSelection = form.watch('aircraftSelection');
  const startQuantity = form.watch('startQuantity');
  const liters = form.watch('liters');

  const leftOverQuantity = React.useMemo(() => {
    const start = Number(startQuantity);
    const changed = Number(liters);
    if (!isNaN(start) && !isNaN(changed)) {
      if (customerType === 'Refueling') {
        return (start + changed).toFixed(1);
      }
      if (start >= changed) {
        return (start - changed).toFixed(1);
      }
    }
    return '';
  }, [startQuantity, liters, customerType]);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = {
      ...values,
      leftOverQuantity: parseFloat(leftOverQuantity),
    };
    onSubmit(finalValues);
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
              <FormLabel>Date</FormLabel>
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
              <FormLabel>Customer Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                  <SelectItem value="Refueling">Refueling</SelectItem>
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
                  <FormLabel>Aircraft</FormLabel>
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
                          Existing Aircraft
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="new" />
                        </FormControl>
                        <FormLabel className="font-normal">New Aircraft</FormLabel>
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
                    <FormLabel>Select Aircraft</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an aircraft" />
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
                      <FormLabel>New Aircraft ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. N99999"
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
                      <FormLabel>New Aircraft Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Cessna 152"
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
                <FormLabel>Start Quantity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} readOnly />
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
                <FormLabel>
                  {customerType === 'Refueling'
                    ? 'Liters Added'
                    : 'Liters Dispensed'}
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {customerType === 'Refueling' && (
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>Left Over Quantity</FormLabel>
          <FormControl>
            <Input type="number" value={leftOverQuantity} readOnly disabled />
          </FormControl>
        </FormItem>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
