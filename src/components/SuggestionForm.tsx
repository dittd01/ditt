'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { moderateSuggestionAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  suggestion: z
    .string()
    .min(10, {
      message: 'Suggestion must be at least 10 characters.',
    })
    .max(500, {
      message: 'Suggestion must not be longer than 500 characters.',
    }),
});

export function SuggestionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { suggestion: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await moderateSuggestionAction(values.suggestion);
      if (result.isAppropriate) {
        toast({
          title: 'Suggestion Submitted',
          description: 'Thank you! Your suggestion has been received and is under review.',
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Suggestion Rejected',
          description: result.reason || 'This suggestion was deemed inappropriate.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not submit your suggestion. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Propose an Option</CardTitle>
        <CardDescription>
          Have a different idea? Submit your own suggestion for this poll. All suggestions are
          reviewed by our AI moderator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="suggestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Suggestion</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'What about a four-day work week pilot program?'"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
