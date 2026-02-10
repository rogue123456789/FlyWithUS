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
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z
  .object({
    date: z.coerce.date({
      required_error: 'A date is required.',
    }),
    customerType: z.enum(['Company', 'External']),
    aircraftSelection: z.enum(['existing', 'new']).default('existing'),
    planeId: z.string().optional(),
    newPlaneId: z.string().optional(),
    newPlaneName: z.string().optional(),
    startQuantity: z.coerce
      .number()
      .min(0, { message: 'Start quantity must be a positive number.' }),
    liters: z.coerce.number().min(0.1, { message: 'Liters must be positive.' }),
  })
  .refine((data) => data.startQuantity >= data.liters, {
    message: 'Liters dispensed cannot be more than start quantity.',
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
      message: 'Please select an aircraft or provide details for a new one.',
      path: ['aircraftSelection'],
    }
  );

type AddFuelLogFormProps = {
  planes: Plane[];
  fuelLogs: FuelLog[];
  onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export function AddFuelLogForm({
  planes,
  fuelLogs,
  onSubmit,
}: AddFuelLogFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // @ts-ignore
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
  const planeId = form.watch('planeId');

  const [isStartQuantityReadOnly, setIsStartQuantityReadOnly] =
    React.useState(false);

  React.useEffect(() => {
    if (
      customerType === 'Company' &&
      aircraftSelection === 'existing' &&
      planeId
    ) {
      const planeLogs = fuelLogs
        .filter((log) => log.planeId === planeId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (planeLogs.length > 0) {
        form.setValue('startQuantity', planeLogs[0].leftOverQuantity);
        setIsStartQuantityReadOnly(true);
      } else {
        form.setValue('startQuantity', 100); // Default for unlogged plane
        setIsStartQuantityReadOnly(false);
      }
    } else {
      // Reset for "new" aircraft or "external" customer
      form.setValue('startQuantity', 100);
      setIsStartQuantityReadOnly(false);
    }
  }, [planeId, customerType, aircraftSelection, fuelLogs, form]);

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
      title: 'Fuel Logged',
      description: `Successfully logged ${values.liters} liters of fuel.`,
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
              <FormLabel>Date</FormLabel>
              <FormControl>
                 <Input
                  type="date"
                  {...field}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().slice(0, 10)
                      : field.value
                  }
                />
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
                <FormLabel>Liters Dispensed</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <FormLabel>Left Over Quantity</FormLabel>
          <FormControl>
            <Input type="number" value={leftOverQuantity} readOnly disabled />
          </FormControl>
        </FormItem>

        <Button type="submit" className="w-full">
          Log Fuel
        </Button>
      </form>
    </Form>
  );
}
