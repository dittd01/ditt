
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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { suggestionsData as staticSuggestions } from '@/app/admin/data';

type Suggestion = {
  id: number | string;
  text: string;
  verdict: string;
  status: string;
  created: string;
};

export default function SuggestionsQueuePage() {
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>(staticSuggestions);

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

  return (
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
                 <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.text}</TableCell>
                    <TableCell>
                      <Badge variant={s.verdict === 'rejected_by_ai' ? 'destructive' : 'outline'}>
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
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Approve</DropdownMenuItem>
                                <DropdownMenuItem>Merge...</DropdownMenuItem>
                                <DropdownMenuItem>Reject...</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
