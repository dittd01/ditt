
'use client';

import { useState, useMemo } from 'react';
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
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react';
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
    id: string;
    title: string;
    category: string;
    subcategory: string;
    categoryId: string;
    status: string;
    votes: number;
    updated: string;
}

type SortDescriptor = {
    key: keyof Omit<PollRowData, 'id' | 'categoryId'>;
    direction: 'ascending' | 'descending';
}

const getCategoryInfo = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { cat: 'N/A', sub: 'N/A', catId: 'N/A' };
    
    // For election, there's no subcategory
    if (categoryId === 'election_2025') {
        return {
            cat: category.label,
            sub: 'N/A',
            catId: category.id,
        }
    }
    
    const subcategory = category.subcategories.find(s => s.id === subcategoryId);
    return {
        cat: category.label,
        sub: subcategory?.label || 'N/A',
        catId: category.id
    }
}

export default function PollsPage() {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ key: 'votes', direction: 'descending' });

  const polls = useMemo(() => {
    return allTopics.map((topic): PollRowData => {
        const { cat, sub, catId } = getCategoryInfo(topic.categoryId, topic.subcategoryId);
        return {
            id: topic.id,
            title: topic.question,
            category: cat,
            subcategory: sub,
            categoryId: catId,
            status: topic.status.charAt(0).toUpperCase() + topic.status.slice(1),
            votes: topic.totalVotes,
            updated: new Date().toISOString().split('T')[0] 
        }
    });
  }, []);
  
  const sortedAndFilteredPolls = useMemo(() => {
    let filteredPolls = polls.filter(poll => {
      const searchMatch = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || poll.status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || poll.categoryId === categoryFilter;
      return searchMatch && statusMatch && categoryMatch;
    });

    return filteredPolls.sort((a, b) => {
        const aValue = a[sortDescriptor.key];
        const bValue = b[sortDescriptor.key];
        
        let cmp = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            cmp = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            cmp = aValue - bValue;
        }

        if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
        }
        return cmp;
    });
  }, [searchTerm, statusFilter, categoryFilter, polls, sortDescriptor]);

  const handleAction = (action: string, pollTitle: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Triggered "${action}" for poll: ${pollTitle}`,
    });
  };

  const handleSortChange = (key: SortDescriptor['key']) => {
    if (sortDescriptor.key === key) {
      setSortDescriptor({
        key,
        direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending',
      });
    } else {
      setSortDescriptor({ key, direction: 'ascending' });
    }
  };
  
  const SortableHeader = ({ sortKey, children, className }: { sortKey: SortDescriptor['key'], children: React.ReactNode, className?: string}) => (
    <TableHead className={className}>
        <Button variant="ghost" onClick={() => handleSortChange(sortKey)} className="-ml-4 h-8">
            {children}
            {sortDescriptor.key === sortKey && (
                 <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform ${sortDescriptor.direction === 'descending' ? 'rotate-180' : ''}`} />
            )}
        </Button>
    </TableHead>
  );

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
                   {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                    ))}
              </SelectContent>
          </Select>
      </div>


      <Table>
        <TableHeader>
            <TableRow>
                <SortableHeader sortKey="category">Category</SortableHeader>
                <SortableHeader sortKey="subcategory">Subcategory</SortableHeader>
                <SortableHeader sortKey="title" className="w-[40%]">Title</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="votes">Total Votes</SortableHeader>
                <SortableHeader sortKey="updated">Last Updated</SortableHeader>
                <TableHead className="w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedAndFilteredPolls.map((poll) => (
                 <TableRow key={poll.id}>
                    <TableCell>{poll.category}</TableCell>
                    <TableCell>{poll.subcategory}</TableCell>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell><Badge variant={poll.status === 'Live' ? 'default' : 'secondary'}>{poll.status}</Badge></TableCell>
                    <TableCell>{poll.votes.toLocaleString()}</TableCell>
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
