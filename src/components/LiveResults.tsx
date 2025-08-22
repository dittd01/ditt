

'use client';

import type { Topic } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LiveResultsProps {
    topic: Topic;
}

export function LiveResults({ topic }: LiveResultsProps) {
    const getPercentage = (optionId: string) => {
        if (!topic || topic.totalVotes === 0) return 0;
        const voteCount = topic.votes[optionId] || 0;
        return (voteCount / topic.totalVotes) * 100;
    };

    const colorMap: Record<string, string> = {
        'yes': 'bg-[hsl(var(--chart-2))]',
        'no': 'bg-[hsl(var(--chart-1))]',
    }

    // Filter out 'abstain' from being displayed in the main results
    const displayOptions = topic.options.filter(option => option.id !== 'abstain');
    const abstainVotes = topic.votes['abstain'] || 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayOptions.map((option) => (
                    <div key={option.id}>
                        <div className="flex justify-between mb-1 text-sm">
                            <span className="text-muted-foreground">{option.label}</span>
                            <span className="font-medium">{getPercentage(option.id).toFixed(1)}%</span>
                        </div>
                        <Progress value={getPercentage(option.id)} className="h-2" colorClassName={colorMap[option.id] || 'bg-primary'} />
                    </div>
                ))}
                <div className="text-sm text-center text-muted-foreground pt-2">
                    <p>{topic.totalVotes.toLocaleString()} total votes cast.</p>
                    {abstainVotes > 0 && <p>{abstainVotes.toLocaleString()} abstained.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
