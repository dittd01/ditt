
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function PollsPage() {
  const { toast } = useToast();

  const handleAction = (action: string, pollTitle: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Triggered "${action}" for poll: ${pollTitle}`,
    });
  };

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
      
      <div className="flex flex-wrap items-center gap-4">
          <Input placeholder="Search by title..." className="w-full sm:w-auto sm:flex-1" />
          <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
          </Select>
          <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                   {categories.filter(c => c.id !== 'election_2025').map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                    ))}
              </SelectContent>
          </Select>
          <Button>Apply</Button>
      </div>


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
                                <DropdownMenuItem onClick={() => handleAction('Edit', poll.title)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('Duplicate', poll.title)}>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(poll.status === 'Active' ? 'Archive' : 'Activate', poll.title)}>{poll.status === 'Active' ? 'Archive' : 'Activate'}</DropdownMenuItem>
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
