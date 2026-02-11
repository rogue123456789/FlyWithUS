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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useI18n } from '@/context/i18n-context';
import { format } from 'date-fns';

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      date: z.string().min(1, t('AddPaymentForm.dateRequired')),
      hasAgency: z.enum(['yes', 'no'], {
        required_error: t('AddPaymentForm.fromAgency'),
      }),
      agencyName: z.string().optional(),
      paymentMethod: z.enum(['Cash', 'Card'], {
        required_error: t('AddPaymentForm.paymentMethodRequired'),
      }),
      currency: z.enum(['Dollars', 'Colones', 'Euros'], {
        required_error: t('AddPaymentForm.currencyRequired'),
      }),
      amount: z.coerce
        .number()
        .min(0.01, { message: t('AddPaymentForm.amountError') }),
    })
    .refine(
      (data) => {
        if (data.hasAgency === 'yes') {
          return !!data.agencyName && data.agencyName.length > 0;
        }
        return true;
      },
      {
        message: t('AddPaymentForm.agencyNameRequired'),
        path: ['agencyName'],
      }
    );

type AddPaymentFormProps = {
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => void;
};

export function AddPaymentForm({ onSubmit }: AddPaymentFormProps) {
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      hasAgency: 'no',
    },
  });

  const hasAgency = form.watch('hasAgency');

  function handleFormSubmit(values: z.infer<ReturnType<typeof getFormSchema>>) {
    const submissionValues = {
      ...values,
      hasAgency: values.hasAgency === 'yes',
    };
    onSubmit(submissionValues);
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
              <FormLabel>{t('AddPaymentForm.date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasAgency"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('AddPaymentForm.fromAgency')}</FormLabel>
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
                      {t('AddPaymentForm.yes')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('AddPaymentForm.no')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {hasAgency === 'yes' && (
          <FormField
            control={form.control}
            name="agencyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddPaymentForm.agencyName')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('AddPaymentForm.agencyName')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('AddPaymentForm.paymentMethod')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AddPaymentForm.paymentMethod')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cash">{t('AddPaymentForm.cash')}</SelectItem>
                  <SelectItem value="Card">{t('AddPaymentForm.card')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddPaymentForm.currency')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('AddPaymentForm.currency')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dollars">
                      {t('AddPaymentForm.dollars')}
                    </SelectItem>
                    <SelectItem value="Colones">
                      {t('AddPaymentForm.colones')}
                    </SelectItem>
                    <SelectItem value="Euros">
                      {t('AddPaymentForm.euros')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('AddPaymentForm.amount')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          {t('AddPaymentForm.recordPayment')}
        </Button>
      </form>
    </Form>
  );
}
