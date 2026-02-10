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
import { useToast } from '@/hooks/use-toast';
import type { Plane } from '@/lib/types';

const formSchema = z.object({
  pilotName: z.string().min(2, { message: 'Pilot name is required.' }),
  planeId: z.string({ required_error: 'Please select a plane.' }),
  flightDuration: z.coerce.number().min(0.1, { message: 'Duration must be at least 0.1 hours.' }),
  paymentMethod: z.enum(['Cash', 'Card', 'Account']),
});

type AddFlightLogFormProps = {
  planes: Plane[];
};

export function AddFlightLogForm({ planes }: AddFlightLogFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pilotName: '',
      flightDuration: 0.1,
      paymentMethod: 'Card',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would submit to a server action or API endpoint
    toast({
      title: 'Flight Logged',
      description: `Successfully logged flight for ${values.pilotName}.`,
    });
    // Here you would typically also close the dialog
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="pilotName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilot Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
        <FormField
          control={form.control}
          name="flightDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flight Duration (hours)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Account">Account</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Log Flight</Button>
      </form>
    </Form>
  );
}
