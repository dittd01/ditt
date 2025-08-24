

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
import { MoreHorizontal, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestionsData as staticSuggestions } from '@/app/admin/data';
import { Label } from '@/components/ui/label';
import type { Topic } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { currentUser } from '@/lib/user-data';


type Suggestion = {
  id: number | string;
  text: string;
  verdict: string;
  status: string;
  created: string;
  author?: string;
};

// Mock data for what the AI would generate for a selected suggestion
const mockAiReviewData = {
    canonical_nb: "Bør statlig støtte til kultur dobles?",
    canonical_description: "This topic concerns the level of government funding allocated to cultural activities and artists. Increased funding could support artistic creation and cultural preservation, while opponents may argue for fiscal restraint or alternative funding models.",
    key_pro_argument: "Increased funding can stimulate artistic innovation and make culture more accessible to the public.",
    key_con_argument: "Doubling the culture budget would require cuts in other important sectors or increased taxes.",
    category: "culture-media-sports",
    subcategory: "culture_funding"
}

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
    const existingIds = new Set(combined.map(s => String(s.id)));
    
    manualReviewQueue.forEach(item => {
      if (!existingIds.has(String(item.id))) {
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
    // For prototype, we filter both static and local suggestions
    setAllSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Also remove from localStorage if it exists there
    const manualReviewQueue: Suggestion[] = JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
    const updatedQueue = manualReviewQueue.filter(item => item.id !== suggestionId);
    localStorage.setItem('manual_review_queue', JSON.stringify(updatedQueue));
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
      window.dispatchEvent(new Event('topicAdded')); // Generic event to trigger UI updates
  }

  const approveSuggestion = (suggestion: Suggestion) => {
      if (!suggestion) return;

      const slug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const newTopic: Topic = {
          id: `topic_${suggestion.id}`,
          slug: slug,
          question: suggestion.text,
          question_en: suggestion.text,
          description: "This topic was approved by an administrator from the suggestions queue.",
          description_en: "This topic was approved by an administrator from the suggestions queue.",
          categoryId: 'culture-media-sports', // using mock data
          subcategoryId: 'culture_funding', // using mock data
          imageUrl: 'https://placehold.co/600x400.png',
          aiHint: 'approved idea',
          status: 'live',
          voteType: 'yesno',
          votes: { yes: 0, no: 0, abstain: 0},
          totalVotes: 0, votesLastWeek: 0, votesLastMonth: 0, votesLastYear: 0, history: [],
          averageImportance: 2.5,
          author: suggestion.author || 'System',
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
      addToUserHistory(suggestion, 'Rejected', 'Rejected by admin: Does not meet platform guidelines.');
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
                  <TableHead>Author</TableHead>
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
                      <TableCell>{s.author || 'User'}</TableCell>
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
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); approveSuggestion(s); }}>Approve</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); rejectSuggestion(s); }}>Reject</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
            {selectedSuggestion && (
                <>
                    <DialogHeader>
                        <DialogTitle>Review Suggestion</DialogTitle>
                        <DialogDescription>
                            Review the AI-refined proposal below before approving or rejecting it.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Original User Suggestion</Label>
                            <Input value={selectedSuggestion.text} readOnly className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>AI-Generated Question (Neutral)</Label>
                            <Input value={mockAiReviewData.canonical_nb} readOnly />
                            <p className="text-sm text-muted-foreground">This is the final question wording that will be used for the poll.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>AI-Generated Description</Label>
                            <Textarea value={mockAiReviewData.canonical_description} readOnly className="resize-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Key Argument For</Label>
                                <Textarea value={mockAiReviewData.key_pro_argument} readOnly className="resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label>Key Argument Against</Label>
                                <Textarea value={mockAiReviewData.key_con_argument} readOnly className="resize-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Assigned Category</Label>
                            <div>
                                <Badge variant="secondary">{mockAiReviewData.category}</Badge>
                                <ArrowRight className="h-4 w-4 inline-block mx-2" />
                                <Badge variant="secondary">{mockAiReviewData.subcategory}</Badge>
                            </div>
                        </div>
                         <div className="space-y-2 pt-4">
                             <Label htmlFor="moderation-notes">Moderation Notes (Optional)</Label>
                             <Textarea id="moderation-notes" placeholder="Add an optional note for the user or for the audit log..." />
                         </div>
                    </div>
                    
                    <DialogFooter className="flex justify-between w-full">
                         <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Back</Button>
                         <div className="flex gap-2">
                             <Button variant="destructive" onClick={() => rejectSuggestion(selectedSuggestion)}><XCircle className="mr-2" /> Reject</Button>
                             <Button onClick={() => approveSuggestion(selectedSuggestion)}><CheckCircle className="mr-2" /> Approve</Button>
                         </div>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
