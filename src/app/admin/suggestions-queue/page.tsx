
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, CheckCircle, XCircle, FileClock, Wand2, MessageSquareWarning, Send } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestionsData as staticSuggestions } from '@/app/admin/data';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Topic } from '@/lib/types';


type Suggestion = {
  id: number | string;
  text: string;
  verdict: string;
  status: string;
  created: string;
};

export default function SuggestionsQueuePage() {
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>(staticSuggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs on the client and will read from localStorage
    const manualReviewQueue: Suggestion[] = JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
    
    // Combine static data with localStorage data, avoiding duplicates
    const combined = [...staticSuggestions];
    const existingIds = new Set(combined.map(s => s.id));
    
    manualReviewQueue.forEach(item => {
      if (!existingIds.has(item.id)) {
        combined.push(item);
      }
    });

    setAllSuggestions(combined.sort((a,b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
  }, []);

  const handleRowClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  }

  const removeFromQueue = (suggestionId: number | string) => {
    const manualReviewQueue: Suggestion[] = JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
    const updatedQueue = manualReviewQueue.filter(item => item.id !== suggestionId);
    localStorage.setItem('manual_review_queue', JSON.stringify(updatedQueue));
    setAllSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }

  const addToUserHistory = (suggestion: Suggestion, newVerdict: 'Approved' | 'Rejected', reason: string) => {
      const userSuggestions = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
      const slug = newVerdict === 'Approved' ? suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null;
      
      userSuggestions.unshift({
          id: suggestion.id,
          text: suggestion.text,
          verdict: newVerdict,
          reason: reason,
          slug: slug
      });
      localStorage.setItem('user_suggestions', JSON.stringify(userSuggestions));
      window.dispatchEvent(new Event('topicAdded'));
  }

  const approveSuggestion = (suggestion: Suggestion) => {
      if (!suggestion) return;

      const slug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const newTopic: Topic = {
          id: `topic_${suggestion.id}`,
          slug: slug,
          question: suggestion.text,
          question_en: suggestion.text, // Assuming EN is same as NB for simplicity
          description: "This topic was approved by an administrator.",
          description_en: "This topic was approved by an administrator.",
          categoryId: 'taxation', // Mock data
          subcategoryId: 'wealth_tax', // Mock data
          imageUrl: 'https://placehold.co/600x400.png',
          aiHint: 'approved idea',
          status: 'live',
          voteType: 'yesno',
          votes: { yes: 0, no: 0, abstain: 0},
          totalVotes: 0, votesLastWeek: 0, votesLastMonth: 0, votesLastYear: 0, history: [],
          options: [
              { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
              { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
              { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
          ],
      };

      const customTopics = JSON.parse(localStorage.getItem('custom_topics') || '[]');
      customTopics.push(newTopic);
      localStorage.setItem('custom_topics', JSON.stringify(customTopics));

      removeFromQueue(suggestion.id);
      addToUserHistory(suggestion, 'Approved', 'Approved by admin.');
      
      toast({
          title: "Suggestion Approved",
          description: `"${suggestion.text}" is now live.`,
      });

      setIsModalOpen(false);
  };

  const rejectSuggestion = (suggestion: Suggestion) => {
      if (!suggestion) return;
      removeFromQueue(suggestion.id);
      addToUserHistory(suggestion, 'Rejected', 'Rejected by admin: Does not meet guidelines.');
      toast({
          variant: 'destructive',
          title: "Suggestion Rejected",
          description: `"${suggestion.text}" has been rejected.`,
      });
      setIsModalOpen(false);
  }

  return (
    <>
      <div className="space-y-8">
        <PageHeader
          title="Suggestions Queue"
          subtitle="Review, approve, and manage user-submitted topics."
        />

        <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>User Suggestion</TableHead>
                  <TableHead>AI Verdict</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {allSuggestions.map((s) => (
                   <TableRow key={s.id} onClick={() => handleRowClick(s)} className="cursor-pointer">
                      <TableCell className="font-medium">{s.text}</TableCell>
                      <TableCell>
                        <Badge variant={s.verdict === 'reject' || s.verdict === 'rejected_by_ai' ? 'destructive' : 'outline'}>
                          {s.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'Pending' ? 'destructive' : 'secondary'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.created}</TableCell>
                      <TableCell>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => approveSuggestion(s)}>Approve</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => rejectSuggestion(s)}>Reject...</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            {selectedSuggestion && (
                <>
                    <DialogHeader>
                        <DialogTitle className="truncate">{selectedSuggestion.text}</DialogTitle>
                        <DialogDescription>
                            Review the details of this suggestion and take action.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 pr-6 -mr-6">
                        <div className="space-y-6">
                            {/* Details Box */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileClock /> Original Submission</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{selectedSuggestion.text}</p>
                                </CardContent>
                            </Card>

                            {/* AI Review Box */}
                            <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><Wand2 /> AI Review</CardTitle>
                                    <CardDescription>
                                        This section contains the AI's detailed analysis, including policy checks, quality scores, and reasons for its verdict.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <Label>AI Verdict</Label>
                                        <p className="font-semibold capitalize">{selectedSuggestion.verdict}</p>
                                    </div>
                                    <div>
                                        <Label>AI Suggested Rephrase</Label>
                                        <Textarea readOnly value={`This is where the AI's suggested neutral rephrasing of "${selectedSuggestion.text}" would appear.`} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions Box */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><CheckCircle /> Moderation Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Textarea placeholder="Add an optional moderation note for the user..." />
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                     <Button variant="secondary" onClick={() => setIsModalOpen(false)}><MessageSquareWarning className="mr-2" /> Close</Button>
                                     <Button variant="destructive" onClick={() => rejectSuggestion(selectedSuggestion)}><XCircle className="mr-2" /> Reject</Button>
                                     <Button onClick={() => approveSuggestion(selectedSuggestion)}><CheckCircle className="mr-2" /> Approve</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </ScrollArea>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
