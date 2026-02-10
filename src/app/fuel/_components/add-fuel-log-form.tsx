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

const formSchema = z.object({
  customerType: z.enum(['Company', 'External']),
  planeId: z.string().optional(),
  gallons: z.coerce.number().min(0.1, { message: 'Gallons must be positive.' }),
  totalCost: z.coerce.number().min(0.01, { message: 'Cost must be positive.' }),
});

type AddFuelLogFormProps = {
  planes: Plane[];
};

export function AddFuelLogForm({ planes }: AddFuelLogFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        customerType: 'Company',
        gallons: 10,
        totalCost: 60,
    },
  });

  const customerType = form.watch('customerType');

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Fuel Logged',
      description: `Successfully logged ${values.gallons} gallons of fuel.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="planeId"
          render={({ field }) => (
            <FormItem className={cn(customerType !== 'Company' && 'hidden')}>
              <FormLabel>Plane</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plane" />
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
            name="gallons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallons</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">Log Fuel</Button>
      </form>
    </Form>
  );
}
