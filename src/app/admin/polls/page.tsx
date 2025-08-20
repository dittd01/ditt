
'use client';

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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { allTopics, categories } from '@/lib/data';

export default function PollsPage() {

  const getCategoryInfo = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { cat: 'N/A', sub: 'N/A' };
    
    const subcategory = category.subcategories.find(s => s.id === subcategoryId);
    return {
      cat: category.label,
      sub: subcategory?.label || 'N/A'
    }
  }

  const polls = allTopics.map(topic => {
      const { cat, sub } = getCategoryInfo(topic.categoryId, topic.subcategoryId);
      return {
          title: topic.question,
          category: cat,
          subcategory: sub,
          status: topic.status.charAt(0).toUpperCase() + topic.status.slice(1),
          votes: topic.totalVotes.toLocaleString(),
          // In a real app, this would come from the data
          updated: new Date().toISOString().split('T')[0] 
      }
  });


  return (
    <div className="space-y-8">
      <PageHeader
        title="Polls Management"
        subtitle="Create, edit, and manage all voting polls."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Create Poll
        </Button>
      </PageHeader>

      <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Votes</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {polls.map((poll, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell>{poll.category}{poll.subcategory !== 'N/A' ? ` / ${poll.subcategory}`: ''}</TableCell>
                    <TableCell><Badge variant={poll.status === 'Active' ? 'default' : 'secondary'}>{poll.status}</Badge></TableCell>
                    <TableCell>{poll.votes}</TableCell>
                    <TableCell>{poll.updated}</TableCell>
                    <TableCell>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem>{poll.status === 'Active' ? 'Archive' : 'Activate'}</DropdownMenuItem>
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
