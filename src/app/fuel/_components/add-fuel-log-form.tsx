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
import type { Plane } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z
  .object({
    customerType: z.enum(['Company', 'External']),
    aircraftSelection: z.enum(['existing', 'new']).default('existing'),
    planeId: z.string().optional(),
    newPlaneId: z.string().optional(),
    newPlaneName: z.string().optional(),
    liters: z.coerce.number().min(0.1, { message: 'Liters must be positive.' }),
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
  onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export function AddFuelLogForm({ planes, onSubmit }: AddFuelLogFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: 'Company',
      liters: 10,
      aircraftSelection: 'existing',
    },
  });

  const customerType = form.watch('customerType');
  const aircraftSelection = form.watch('aircraftSelection');

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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="liters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liters</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Log Fuel</Button>
      </form>
    </Form>
  );
}
