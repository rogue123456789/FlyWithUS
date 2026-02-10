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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z
  .object({
    pilotName: z.string().min(2, { message: 'Pilot name is required.' }),
    aircraftSelection: z.enum(['existing', 'new']).default('existing'),
    planeId: z.string().optional(),
    newPlaneId: z.string().optional(),
    newPlaneName: z.string().optional(),
    takeoffLocation: z
      .string()
      .min(2, { message: 'Takeoff location is required.' }),
    landingLocation: z
      .string()
      .min(2, { message: 'Landing location is required.' }),
    flightDuration: z.coerce
      .number()
      .min(0.1, { message: 'Duration must be at least 0.1 hours.' }),
    flightReason: z
      .string()
      .min(2, { message: 'Reason for flying is required.' }),
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
      message: 'Please select an aircraft or provide details for a new one.',
      path: ['aircraftSelection'],
    }
  );

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
      takeoffLocation: '',
      landingLocation: '',
      flightReason: '',
      aircraftSelection: 'existing',
    },
  });

  const aircraftSelection = form.watch('aircraftSelection');

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would submit to a server action or API endpoint
    toast({
      title: 'Flight Hours Recorded',
      description: `Successfully recorded flight for ${values.pilotName}.`,
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="takeoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Took Off From</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. KSQL" {...field} />
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
                <FormLabel>Landed At</FormLabel>
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
          name="flightReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Flying</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Training flight" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Record Flight Hours
        </Button>
      </form>
    </Form>
  );
}
