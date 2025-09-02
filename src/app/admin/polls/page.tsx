

'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { MoreHorizontal, PlusCircle, ArrowUpDown, Trash2, Archive } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getPollsTableData, PollRowData, categories } from '@/app/admin/data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Subcategory } from '@/lib/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { Checkbox } from '@/components/ui/checkbox';

type SortDescriptor = {
    key: keyof Omit<PollRowData, 'id' | 'categoryId' | 'subcategoryId'>;
    direction: 'ascending' | 'descending';
}

export default function PollsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [polls, setPolls] = useState<PollRowData[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ key: 'votes', direction: 'descending' });
  const [lang, setLang] = useState('en');
  const [selectedPollIds, setSelectedPollIds] = useState<string[]>([]);

  // Filters from URL
  const searchTerm = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';
  const subcategoryFilter = searchParams.get('subcategory') || 'all';
  
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
    setPolls(getPollsTableData());

    const handleTopicAdded = () => {
      // Re-fetch data when a new topic is added
      setPolls(getPollsTableData());
    };

    window.addEventListener('topicAdded', handleTopicAdded);
    return () => {
      window.removeEventListener('topicAdded', handleTopicAdded);
    };
  }, []);
  
  const availableSubcategories = useMemo(() => {
      if (categoryFilter === 'all' || categoryFilter === 'election_2025') {
          return [];
      }
      const category = categories.find(c => c.id === categoryFilter);
      return category?.subcategories || [];
  }, [categoryFilter]);

  const handleFilterChange = (key: 'q' | 'status' | 'category' | 'subcategory', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset subcategory if category changes
    if (key === 'category') {
        params.delete('subcategory');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }
  
  const sortedAndFilteredPolls = useMemo(() => {
    let filteredPolls = polls.filter(poll => {
      const searchMatch = debouncedSearchTerm ? (
        poll.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        poll.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ) : true;
      const statusMatch = statusFilter === 'all' || poll.status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || poll.categoryId === categoryFilter;
      const subcategoryMatch = subcategoryFilter === 'all' || poll.subcategoryId === subcategoryFilter;
      return searchMatch && statusMatch && categoryMatch && subcategoryMatch;
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
  }, [debouncedSearchTerm, statusFilter, categoryFilter, subcategoryFilter, polls, sortDescriptor]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPollIds(sortedAndFilteredPolls.map(p => p.id));
    } else {
      setSelectedPollIds([]);
    }
  };

  const handleRowSelect = (pollId: string, checked: boolean) => {
    if (checked) {
      setSelectedPollIds(prev => [...prev, pollId]);
    } else {
      setSelectedPollIds(prev => prev.filter(id => id !== pollId));
    }
  };
  
  const numSelected = selectedPollIds.length;

  const handleBulkAction = (action: 'archive' | 'delete') => {
    toast({
        title: 'Action Triggered',
        description: `Would ${action} ${numSelected} polls. (This is a mock action)`
    });
    setSelectedPollIds([]);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Polls Management"
        subtitle="Create, edit, and manage all voting polls."
      >
        <Button asChild>
          <Link href="/admin/polls/new">
            <PlusCircle className="mr-2" />
            Create Poll
          </Link>
        </Button>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-4">
          <Input 
            placeholder="Search by title or author..." 
            className="w-full sm:w-auto sm:flex-1"
            defaultValue={searchTerm}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
          <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
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
          <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                   {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{lang === 'nb' ? category.label_nb : category.label}</SelectItem>
                    ))}
              </SelectContent>
          </Select>
          <Select value={subcategoryFilter} onValueChange={(value) => handleFilterChange('subcategory', value)} disabled={availableSubcategories.length === 0}>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                   {availableSubcategories.map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>{lang === 'nb' ? subcategory.label_nb : subcategory.label}</SelectItem>
                    ))}
              </SelectContent>
          </Select>
      </div>

       {numSelected > 0 && (
            <div className="flex items-center gap-4 rounded-lg border bg-card p-2">
                <span className="text-sm font-medium pl-2">{numSelected} selected</span>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                        <Archive className="mr-2"/> Archive
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                        <Trash2 className="mr-2"/> Delete
                    </Button>
                </div>
            </div>
        )}

      <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                        checked={numSelected > 0 && numSelected === sortedAndFilteredPolls.length}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </TableHead>
                <SortableHeader sortKey="title" className="w-[40%]">Title</SortableHeader>
                <SortableHeader sortKey="author">Author</SortableHeader>
                <SortableHeader sortKey="category">Category</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="votes">Total Votes</SortableHeader>
                <SortableHeader sortKey="updated">Last Updated</SortableHeader>
                <TableHead className="w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedAndFilteredPolls.map((poll) => (
                 <TableRow key={poll.id} data-state={selectedPollIds.includes(poll.id) && 'selected'}>
                    <TableCell>
                         <Checkbox
                            checked={selectedPollIds.includes(poll.id)}
                            onCheckedChange={(checked) => handleRowSelect(poll.id, Boolean(checked))}
                            aria-label={`Select poll "${poll.title}"`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell>{poll.author}</TableCell>
                    <TableCell>{poll.category}</TableCell>
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/polls/${poll.id}`}>Edit</Link>
                                </DropdownMenuItem>
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
