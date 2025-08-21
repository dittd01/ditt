
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
import type { Topic } from '@/lib/types';
import type { CurateTopicSuggestionOutput } from '@/ai/flows/curate-topic-suggestion';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from '@/components/ui/label';

const suggestionSchema = z.object({
  suggestion: z
    .string()
    .min(10, { message: 'Suggestion must be at least 10 characters.' })
    .max(500, { message: 'Suggestion must not be longer than 500 characters.' }),
  description: z.string().optional(),
  pro_argument: z.string().optional(),
  con_argument: z.string().optional(),
});

type FormValues = z.infer<typeof suggestionSchema>;
type FormStep = 'INPUT' | 'REVIEW' | 'SUCCESS';
type AIReviewData = Omit<CurateTopicSuggestionOutput, 'action' | 'confidence' | 'policy_flags'>;

export function SuggestionForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<FormStep>('INPUT');
  const [reviewData, setReviewData] = useState<AIReviewData | null>(null);
  const [newTopicSlug, setNewTopicSlug] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { suggestion: '', description: '', pro_argument: '', con_argument: '' },
  });

  async function handleGetSuggestions(values: FormValues) {
    setIsLoading(true);
    try {
      const result = await curateSuggestionAction({
          user_text: values.suggestion,
          user_description: values.description,
          user_pro_argument: values.pro_argument,
          user_con_argument: values.con_argument,
      });

      if (result.success && (result.action === 'create' || result.action === 'merge')) {
         if (result.action === 'create' && result.curationResult) {
            setReviewData(result.curationResult);
            setStep('REVIEW');
         } else {
            toast({ title: 'Suggestion Merged', description: result.message });
            form.reset();
         }
      } else {
        toast({
          variant: 'destructive',
          title: 'Suggestion Rejected',
          description: result.message || 'The AI curator determined this suggestion could not be approved.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not process your suggestion. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFinalSubmit = async () => {
    if (!reviewData) return;
    setIsLoading(true);
    // In a real app, this would call a `finalizeProposal` action.
    // For now, we simulate success and add the topic to local storage.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const slug = reviewData.canonical_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newTopic: Partial<Topic> = {
        id: `topic_${Date.now()}`,
        slug: slug,
        question: reviewData.canonical_nb,
        description: reviewData.canonical_description, // Use AI-generated description
        categoryId: reviewData.category,
        subcategoryId: reviewData.subcategory,
        imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1738&auto=format&fit=crop',
        aiHint: 'debate ideas',
        status: 'live',
        voteType: 'yesno',
        votes: { yes: 0, no: 0, abstain: 0},
        totalVotes: 0,
        votesLastWeek: 0,
        votesLastMonth: 0,
        votesLastYear: 0,
        options: [
            { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
            { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
            { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
        ],
        // In a real app, you would also save the pro/con arguments to be displayed on the topic page
    };
    
    const customTopics = JSON.parse(localStorage.getItem('custom_topics') || '[]');
    customTopics.push(newTopic);
    localStorage.setItem('custom_topics', JSON.stringify(customTopics));
    window.dispatchEvent(new Event('topicAdded'));

    setNewTopicSlug(slug);
    setStep('SUCCESS');
    setIsLoading(false);
  };
  
  const handleStartOver = () => {
      setStep('INPUT');
      setReviewData(null);
      form.reset();
  }

  return (
    <Card>
      {step === 'INPUT' && (
        <>
          <CardHeader>
            <CardTitle>Propose a New Topic</CardTitle>
            <CardDescription>
              Submit your idea for a poll. Our AI curator will help refine it into a clear, neutral question for everyone to vote on. Provide as much or as little detail as you like.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGetSuggestions)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="suggestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Topic Question</FormLabel>
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
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain the background or context of your proposal. If left blank, our AI will write a summary for you."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="pro_argument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Argument For (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'It would boost economic growth in inland regions.'"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="con_argument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Argument Against (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'The cost is too high and would divert funds from healthcare.'"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                     <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      )}

      {step === 'REVIEW' && reviewData && (
        <>
          <CardHeader>
            <CardTitle>Review AI Suggestions</CardTitle>
            <CardDescription>
              We've refined your proposal into a standardized format. Review the changes below before submitting it for a vote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>Suggested Question (Neutral)</Label>
                <Input value={reviewData.canonical_nb} readOnly />
                <p className="text-sm text-muted-foreground">This is the final question wording that will be used for the poll.</p>
            </div>
             <div className="space-y-2">
                <Label>Suggested Description</Label>
                <Textarea value={reviewData.canonical_description} readOnly className="resize-none" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Key Argument For</Label>
                    <Textarea value={reviewData.key_pro_argument} readOnly className="resize-none" />
                </div>
                 <div className="space-y-2">
                    <Label>Key Argument Against</Label>
                    <Textarea value={reviewData.key_con_argument} readOnly className="resize-none" />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Assigned Category</Label>
                <div>
                  <Badge variant="secondary">{reviewData.category}</Badge>
                  <ArrowRight className="h-4 w-4 inline-block mx-2" />
                  <Badge variant="secondary">{reviewData.subcategory}</Badge>
                </div>
            </div>
            {reviewData.duplicate_of && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p className="font-bold">Duplicate Found</p>
                    <p>This topic seems very similar to an existing one: "{reviewData.duplicate_of}". Submitting may result in your suggestion being merged.</p>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleStartOver} disabled={isLoading}>Back</Button>
            <Button onClick={handleFinalSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Voting
            </Button>
          </CardFooter>
        </>
      )}

       {step === 'SUCCESS' && (
        <>
            <CardHeader>
                <CardTitle className="text-green-600">Suggestion Submitted!</CardTitle>
                <CardDescription>Your topic has been successfully added to the platform and is now live for voting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                    <Link href={`/t/${newTopicSlug}`}>View Your Topic</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={handleStartOver}>Propose Another Topic</Button>
            </CardContent>
        </>
       )}
    </Card>
  );
}
