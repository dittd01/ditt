
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

const mockSuggestions = [
    { id: 1, text: 'Increase inheritance tax to 25% for amounts over 10M NOK', verdict: 'create', status: 'Pending', created: '2023-10-27' },
    { id: 2, text: 'Stop taxing working capital so hard', verdict: 'merge', status: 'Pending', created: '2023-10-27' },
    { id: 3, text: 'Should we build trains and also stop giving money to rich people?', verdict: 'reject', status: 'Pending', created: '2023-10-26' },
    { id: 4, text: 'Better roads in the north', verdict: 'create', status: 'Approved', created: '2023-10-25' },
    { id: 5, text: 'Abolish the monarchy', verdict: 'reject', status: 'Rejected', created: '2023-10-24' },
]

export default function SuggestionsQueuePage() {
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
            {mockSuggestions.map((s) => (
                 <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.text}</TableCell>
                    <TableCell><Badge variant="outline">{s.verdict}</Badge></TableCell>
                    <TableCell><Badge variant={s.status === 'Pending' ? 'destructive' : 'secondary'}>{s.status}</Badge></TableCell>
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
