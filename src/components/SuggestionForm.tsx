
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { curateSuggestionAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';
import type { Topic } from '@/lib/types';


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
      const result = await curateSuggestionAction(values.suggestion);
      
      if (result.success) {
        form.reset();

        // If a new topic was created, add it to localStorage to simulate a live update
        if (result.action === 'create' && result.newTopic) {
            const customTopics = JSON.parse(localStorage.getItem('custom_topics') || '[]');
            customTopics.push(result.newTopic);
            localStorage.setItem('custom_topics', JSON.stringify(customTopics));

            const userSuggestions = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
            if (result.suggestionForProfile) {
                userSuggestions.unshift(result.suggestionForProfile);
            }
            localStorage.setItem('user_suggestions', JSON.stringify(userSuggestions));

            // Dispatch an event to notify other components of the change
            window.dispatchEvent(new Event('topicAdded'));
            
            toast({
              title: 'Suggestion Received',
              description: result.message,
              action: (
                <Button asChild>
                  <Link href={`/t/${result.newTopic.slug}`}>View Topic</Link>
                </Button>
              )
            });

        } else {
             toast({
              title: 'Suggestion Received',
              description: result.message,
            });
        }

      } else {
        toast({
          variant: 'destructive',
          title: 'Suggestion Failed',
          description: result.message,
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
        <CardTitle>Propose a New Topic</CardTitle>
        <CardDescription>
          Don't see an issue you care about? Submit a new topic for voting.
          Our AI curator will review it for neutrality, clarity, and duplicates.
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
                  <FormLabel>Your Topic Suggestion</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Should Norway invest 50 billion NOK in new high-speed rail between Oslo and Bergen?'"
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
              {isSubmitting ? 'Submitting...' : 'Submit Topic Suggestion'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
