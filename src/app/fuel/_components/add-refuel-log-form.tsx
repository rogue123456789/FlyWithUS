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
import { Calendar } from '@/components/ui/calendar';

const formSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  litersRefueled: z.coerce
    .number()
    .min(0.1, { message: 'Liters must be positive.' }),
  cost: z.coerce.number().min(0.01, { message: 'Cost must be positive.' }),
});

type AddRefuelLogFormProps = {
  onFormSubmit: (values: z.infer<typeof formSchema>) => void;
};

export function AddRefuelLogForm({ onFormSubmit }: AddRefuelLogFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      litersRefueled: 100,
      cost: 200,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would submit to a server action or API endpoint
    toast({
      title: 'Refuel Logged',
      description: `Successfully logged a refuel of ${values.litersRefueled} liters.`,
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
            <FormItem className="flex flex-col">
              <FormLabel>Date of Refuel</FormLabel>
              <Calendar
                mode="single"
                selected={field.value}
                onDayClick={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                className="rounded-md border"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="litersRefueled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liters Refueled</FormLabel>
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
              <FormLabel>Total Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.75"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Log Refuel
        </Button>
      </form>
    </Form>
  );
}
