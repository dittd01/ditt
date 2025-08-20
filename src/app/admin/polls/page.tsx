
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type { Topic } from '@/lib/types';

interface PollRowData {
    title: string;
    category: string;
    subcategory: string;
    categoryId: string;
    status: string;
    votes: string;
    updated: string;
}

export default function PollsPage() {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredPolls, setFilteredPolls] = useState<PollRowData[]>([]);

  const polls = useMemo(() => {
    const getCategoryInfo = (categoryId: string, subcategoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return { cat: 'N/A', sub: 'N/A', catId: 'N/A' };
        
        const subcategory = category.subcategories.find(s => s.id === subcategoryId);
        return {
          cat: category.label,
          sub: subcategory?.label || 'N/A',
          catId: category.id
        }
    }
    return allTopics.map((topic): PollRowData => {
        const { cat, sub, catId } = getCategoryInfo(topic.categoryId, topic.subcategoryId);
        return {
            title: topic.question,
            category: cat,
            subcategory: sub,
            categoryId: catId,
            status: topic.status.charAt(0).toUpperCase() + topic.status.slice(1),
            votes: topic.totalVotes.toLocaleString(),
            // In a real app, this would come from the data
            updated: new Date().toISOString().split('T')[0] 
        }
    });
  }, []);
  
  useEffect(() => {
    const results = polls.filter(poll => {
      const searchMatch = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || poll.status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || poll.categoryId === categoryFilter;
      return searchMatch && statusMatch && categoryMatch;
    });
    setFilteredPolls(results);
  }, [searchTerm, statusFilter, categoryFilter, polls]);

  const handleAction = (action: string, pollTitle: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Triggered "${action}" for poll: ${pollTitle}`,
    });
  };

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
          <Input 
            placeholder="Search by title..." 
            className="w-full sm:w-auto sm:flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            {filteredPolls.map((poll, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell>{poll.category}{poll.subcategory !== 'N/A' ? ` / ${poll.subcategory}`: ''}</TableCell>
                    <TableCell><Badge variant={poll.status === 'Live' ? 'default' : 'secondary'}>{poll.status}</Badge></TableCell>
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
                                <DropdownMenuItem onClick={() => handleAction(poll.status === 'Live' ? 'Archive' : 'Activate', poll.title)}>{poll.status === 'Live' ? 'Archive' : 'Activate'}</DropdownMenuItem>
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
