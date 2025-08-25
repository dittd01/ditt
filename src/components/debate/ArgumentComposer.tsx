
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, ArrowRight, Lightbulb, Check, X, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { curateArgumentAction } from '@/app/actions';
import type { CurateArgumentOutput, CurateArgumentInput } from '@/ai/flows/curate-argument';
import type { Argument } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle, AlertActions } from '../ui/alert';
import { Input } from '../ui/input';

const argumentSchema = z.object({
  text: z
    .string()
    .min(10, { message: 'Argument must be at least 10 characters.' })
    .max(750, { message: 'Argument must not be longer than 750 characters.' }),
});

type ArgumentFormValues = z.infer<typeof argumentSchema>;
type ComposerStep = 'INPUT' | 'LOADING' | 'REVIEW' | 'MERGE_SUGGESTION' | 'ERROR';

interface ArgumentComposerProps {
    side: 'for' | 'against';
    topicId: string;
    existingArguments: Pick<Argument, 'id' | 'text'>[];
    onSubmit: (values: { text: string }, side: 'for' | 'against') => void;
    onCancel: () => void;
    onMerge: (similarArgumentId: string) => void;
    rebuttalHint?: string | null;
    isHintLoading?: boolean;
}

export function ArgumentComposer({ 
    side, 
    topicId, 
    existingArguments, 
    onSubmit, 
    onCancel, 
    onMerge,
    rebuttalHint,
    isHintLoading
}: ArgumentComposerProps) {
  const [step, setStep] = useState<ComposerStep>('INPUT');
  const [aiResponse, setAiResponse] = useState<CurateArgumentOutput | null>(null);
  const [useOriginal, setUseOriginal] = useState(false);
  const [showHint, setShowHint] = useState(true);
  
  const form = useForm<ArgumentFormValues>({
    resolver: zodResolver(argumentSchema),
    defaultValues: { text: '' },
    mode: 'onChange',
  });

  const textValue = form.watch('text');
  const textLength = textValue?.length || 0;
  const maxLength = 750;

  async function handleInitialSubmit(values: ArgumentFormValues) {
    setStep('LOADING');
    const input: CurateArgumentInput = {
      userText: values.text,
      existingArguments,
      side,
    };
    const result = await curateArgumentAction(input);

    if (result.success && result.data) {
        setAiResponse(result.data);
        if(result.data.action === 'merge' && result.data.mergeSuggestion.similarArgumentId) {
            setStep('MERGE_SUGGESTION');
        } else {
            setStep('REVIEW');
        }
    } else {
        setStep('ERROR');
    }
  }
  
  const handleFinalSubmit = () => {
    if (!aiResponse && step !== 'ERROR') return;
    
    let submissionData;
    if (step === 'ERROR' || useOriginal) {
        submissionData = {
            text: form.getValues('text'),
        }
    } else if (aiResponse) {
        submissionData = {
            text: aiResponse.normalizedText,
        };
    } else {
        onCancel();
        return;
    }

    onSubmit(submissionData, side);
  };
  
  const handleUpvoteAndMerge = () => {
    if (aiResponse?.mergeSuggestion.similarArgumentId) {
        onMerge(aiResponse.mergeSuggestion.similarArgumentId);
    }
  };
  
  const handleHintDismiss = () => {
    setShowHint(false);
  }

  const handleUseSuggestion = () => {
      if (rebuttalHint) {
          form.setValue('text', rebuttalHint, { shouldValidate: true });
          setShowHint(false);
      }
  }

  const renderContent = () => {
    switch (step) {
      case 'LOADING':
        return (
            <CardContent className="flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>AI is analyzing your argument...</p>
            </CardContent>
        );
      
      case 'MERGE_SUGGESTION': {
        const similarArg = existingArguments.find(arg => arg.id === aiResponse?.mergeSuggestion.similarArgumentId);
        return (
             <CardContent>
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900">
                    <Lightbulb className="h-4 w-4 !text-amber-600" />
                    <AlertTitle className="font-bold">Suggestion Found</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">Your point seems very similar to this existing argument:</p>
                        <blockquote className="border-l-2 border-amber-400 pl-3 py-1 bg-amber-50/50 text-sm">
                            "{similarArg?.text}"
                        </blockquote>
                        <p className="mt-3">To keep the debate focused, would you like to upvote this argument instead of posting a new one?</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        );
      }
        
      case 'REVIEW':
        return (
          <>
            <CardHeader>
                <CardTitle>Review AI Suggestions</CardTitle>
                <CardDescription>We've suggested a clearer version of your text. You can accept the changes or use your original.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <FormLabel>Suggested Text</FormLabel>
                    <Textarea readOnly value={aiResponse?.normalizedText} className="resize-none bg-muted/50" />
                </div>
            </CardContent>
          </>
        );
      
      case 'ERROR':
        return (
            <CardContent>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>AI Assistant Unavailable</AlertTitle>
                    <AlertDescription>
                        We couldn't get suggestions for your argument at this time. You can try again or post your original text without AI enhancements.
                    </AlertDescription>
                </Alert>
            </CardContent>
        )

      case 'INPUT':
      default:
        return (
          <>
             <CardHeader>
                <CardTitle className="text-lg">Add Your Argument</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isHintLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span>Loading AI suggestion...</span>
                    </div>
                )}
                {rebuttalHint && showHint && (
                    <Alert>
                         <Lightbulb className="h-4 w-4" />
                         <AlertTitle className="font-semibold text-amber-700 dark:text-amber-500">AI Rebuttal Suggestion</AlertTitle>
                         <AlertDescription>
                            "{rebuttalHint}"
                         </AlertDescription>
                          <AlertActions>
                            <Button variant="ghost" size="sm" onClick={handleHintDismiss}>Dismiss</Button>
                             <Button variant="outline" size="sm" onClick={handleUseSuggestion}>Use this suggestion</Button>
                         </AlertActions>
                    </Alert>
                )}
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
                        <div className="flex justify-between items-center">
                        <FormMessage />
                        <FormDescription className={cn(
                            "text-xs",
                            textLength > maxLength ? "text-destructive" : "text-muted-foreground"
                        )}>
                            {textLength} / {maxLength}
                        </FormDescription>
                        </div>
                    </FormItem>
                    )}
                />
            </CardContent>
          </>
        );
    }
  };

  const renderFooter = () => {
    switch (step) {
        case 'LOADING': return null;
        case 'MERGE_SUGGESTION':
            return (
                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="button" variant="outline" onClick={() => setStep('REVIEW')}>Post my version anyway</Button>
                    <Button type="button" onClick={handleUpvoteAndMerge} className="bg-amber-500 hover:bg-amber-600 text-white">
                        <ThumbsUp className="mr-2"/>
                        Upvote Existing
                    </Button>
                </CardFooter>
            );
        case 'REVIEW':
            return (
                <CardFooter className="flex-col sm:flex-row items-center justify-between gap-2">
                     <Button type="button" variant="link" className="p-0 text-xs" onClick={() => setUseOriginal(!useOriginal)}>
                        {useOriginal ? <Check className="mr-2"/> : <X className="mr-2" />}
                        {useOriginal ? "Use AI Suggestion" : "Use my original text"}
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={() => setStep('INPUT')}>Back</Button>
                        <Button type="button" onClick={handleFinalSubmit}>
                           <Check className="mr-2"/>
                            Post Argument
                        </Button>
                    </div>
                </CardFooter>
            );
        
        case 'ERROR':
             return (
                <CardFooter className="justify-between">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => handleInitialSubmit(form.getValues())}>Try Again</Button>
                      <Button type="button" variant="destructive" onClick={handleFinalSubmit}>Post Original Anyway</Button>
                    </div>
                </CardFooter>
            );

        case 'INPUT':
        default:
            return (
                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={!form.formState.isValid}>
                        <Wand2 className="mr-2" />
                        Analyze & Review
                    </Button>
                </CardFooter>
            );
    }
  };


  return (
    <Card className="bg-muted/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleInitialSubmit)}>
            {renderContent()}
            {renderFooter()}
        </form>
      </Form>
    </Card>
  );
}
