'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useState } from 'react';
import { useI18n } from '@/context/i18n-context';

type UpdatePasswordFormProps = {
  onSubmit: (values: z.infer<ReturnType<typeof getFormSchema>>) => Promise<void>;
};

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: t('UpdatePasswordForm.currentPasswordRequired') }),
      newPassword: z
        .string()
        .min(6, { message: t('UpdatePasswordForm.newPasswordRequired') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('UpdatePasswordForm.passwordsNoMatch'),
      path: ['confirmPassword'],
    });

export function UpdatePasswordForm({ onSubmit }: UpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await onSubmit(values);
      form.reset();
    } catch (error: any) {
      // Error is handled and toasted by the parent component.
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UpdatePasswordForm.currentPassword')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UpdatePasswordForm.newPassword')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UpdatePasswordForm.confirmNewPassword')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? t('UpdatePasswordForm.updatingButton')
            : t('UpdatePasswordForm.updateButton')}
        </Button>
      </form>
    </Form>
  );
}
