
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestionsData as staticSuggestions } from '@/app/admin/data';
import { Label } from '@/components/ui/label';

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

  const handleAction = (action: string) => {
    toast({
        title: `Action: ${action}`,
        description: `Triggered "${action}" for suggestion: ${selectedSuggestion?.text}`,
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
                          {s.verdict === 'rejected_by_ai' ? 'AI Rejected' : s.verdict}
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
                                  <DropdownMenuItem onClick={() => handleAction('Approve')}>Approve</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction('Reject')}>Reject...</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction('Edit')}>Edit</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
            {selectedSuggestion && (
                <div className="flex flex-col h-full">
                    <DialogHeader>
                        <DialogTitle className="truncate">{selectedSuggestion.text}</DialogTitle>
                        <DialogDescription>
                            Review the details of this suggestion and take action.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="details" className="flex-1 min-h-0 flex flex-col">
                        <TabsList className="mt-4">
                            <TabsTrigger value="details"><FileClock className="mr-2" /> Details</TabsTrigger>
                            <TabsTrigger value="ai-review"><Wand2 className="mr-2" /> AI Review</TabsTrigger>
                            <TabsTrigger value="actions"><CheckCircle className="mr-2" /> Actions</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-y-auto p-1">
                            <TabsContent value="details" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>Original Submission</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{selectedSuggestion.text}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="ai-review" className="mt-4 space-y-4">
                                <Card className="border-amber-500 bg-amber-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-amber-700">AI Verdict: <span className="capitalize">{selectedSuggestion.verdict}</span></CardTitle>
                                        <CardDescription>
                                            This section will contain the AI's detailed analysis, including policy checks, quality scores, and reasons for its verdict.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>AI Suggested Rephrase</Label>
                                            <Textarea readOnly value={`This is where the AI's suggested neutral rephrasing of "${selectedSuggestion.text}" would appear.`} />
                                        </div>
                                         <Button variant="secondary">Apply Rephrase & Preview</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="actions" className="mt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Moderation Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Textarea placeholder="Add an optional moderation note..." />
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                         <Button variant="secondary" onClick={() => handleAction('Request Changes')}><MessageSquareWarning className="mr-2" /> Request Changes</Button>
                                         <Button variant="destructive" onClick={() => handleAction('Reject')}><XCircle className="mr-2" /> Reject</Button>
                                         <Button onClick={() => handleAction('Approve')}><CheckCircle className="mr-2" /> Approve</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
