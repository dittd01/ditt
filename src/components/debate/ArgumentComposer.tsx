
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const argumentSchema = z.object({
  text: z
    .string()
    .min(10, {
      message: 'Argument must be at least 10 characters.',
    })
    .max(750, {
      message: 'Argument must not be longer than 750 characters.',
    }),
});

type ArgumentFormValues = z.infer<typeof argumentSchema>;

interface ArgumentComposerProps {
    onSubmit: (values: ArgumentFormValues) => void;
    onCancel: () => void;
}

export function ArgumentComposer({ onSubmit, onCancel }: ArgumentComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ArgumentFormValues>({
    resolver: zodResolver(argumentSchema),
    defaultValues: {
      text: '',
    },
  });

  async function handleSubmit(values: ArgumentFormValues) {
    setIsSubmitting(true);
    // In a real app, this would involve an async call to the backend
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(values);
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Card className="bg-muted/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardHeader>
            <CardTitle className="text-lg">Add Your Argument</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Clearly state your point. Keep it focused and respectful."
                      className="resize-y min-h-[100px] bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Argument
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
