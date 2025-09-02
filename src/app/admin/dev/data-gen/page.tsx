

'use client';

import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { simulateDebateAction, populatePollAction } from '@/app/actions';
import { allTopics } from '@/lib/data';
import { Loader2, Wand2 } from 'lucide-react';
import type { Topic } from '@/lib/types';
import { currentUser } from '@/lib/user-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

export default function DataGeneratorPage() {
    const [titles, setTitles] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const { toast } = useToast();

    const handleGenerate = async () => {
        const titleList = titles.split('\n').map(t => t.trim()).filter(t => t.length > 10);
        if (titleList.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No valid titles found',
                description: 'Please enter at least one poll title, each on a new line.',
            });
            return;
        }

        setIsLoading(true);
        setCompletedCount(0);
        setTotalCount(titleList.length);

        for (const title of titleList) {
            try {
                // 1. Populate the poll details from the title
                const populateResult = await populatePollAction({ title });

                if (!populateResult.success) {
                    throw new Error(`Failed to populate poll details for "${title}": ${populateResult.message}`);
                }
                
                const { data: pollData } = populateResult;
                const slug = pollData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                
                const newTopic: Topic = {
                    id: `topic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    slug,
                    question: pollData.title,
                    question_en: pollData.title, // Assuming same for now
                    description: pollData.description,
                    description_en: pollData.description,
                    background_md: pollData.background_md || '',
                    pros: pollData.pros,
                    cons: pollData.cons,
                    sources: pollData.sources || [],
                    categoryId: pollData.category,
                    subcategoryId: pollData.subcategory,
                    imageUrl: 'https://placehold.co/600x400.png',
                    aiHint: 'debate topic',
                    status: 'live',
                    voteType: 'yesno',
                    votes: { yes: 0, no: 0, abstain: 0},
                    totalVotes: 0, votesLastWeek: 0, votesLastMonth: 0, votesLastYear: 0, history: [],
                    averageImportance: 2.5,
                    author: currentUser.displayName,
                    options: [
                        { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
                        { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
                        { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
                    ],
                };
                
                // In a real app, we would write `newTopic` to Firestore here.
                // For the prototype, we add to localStorage.
                const customTopics = JSON.parse(localStorage.getItem('custom_topics') || '[]');
                customTopics.push(newTopic);
                localStorage.setItem('custom_topics', JSON.stringify(customTopics));
                window.dispatchEvent(new Event('topicAdded'));

                toast({
                    title: `Topic Created: "${title}"`,
                    description: 'Debate and arguments will be generated next.',
                });

            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: `Error processing "${title}"`,
                    description: error.message,
                });
            } finally {
                setCompletedCount(prev => prev + 1);
            }
        }

        setIsLoading(false);
        toast({
            title: 'Batch Generation Complete!',
            description: `Processed ${titleList.length} topics.`,
        });
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Developer: Batch Data Generator"
                subtitle="Use AI to generate multiple, fully-detailed polls from a list of titles."
            />
            
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>How to use this tool</AlertTitle>
                <AlertDescription>
                   Enter one poll title per line. The AI will generate a complete topic for each, including a description, pros, cons, and more. This is a developer tool for populating the site with realistic data quickly.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle>Enter Poll Titles</CardTitle>
                    <CardDescription>
                        Each title should be on its own line.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={titles}
                        onChange={(e) => setTitles(e.target.value)}
                        placeholder="Bør velgere kunne gi personstemmer ved stortingsvalg?&#10;Bør nasjonale borgerinitiativ kunne tvinge Stortinget til å votere over forslag?"
                        className="h-48 font-mono text-sm"
                        disabled={isLoading}
                    />
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                     <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                        Generate Topics
                    </Button>
                    {isLoading && (
                        <div className="text-sm text-muted-foreground">
                            Processing topic {completedCount + 1} of {totalCount}...
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
