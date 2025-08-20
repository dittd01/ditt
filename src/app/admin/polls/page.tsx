
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

const mockPolls = [
    { title: 'Raise wealth-tax threshold to NOK 10m?', category: 'Taxation', subcategory: 'Wealth Tax', status: 'Active', votes: '150,234', updated: '2023-10-26' },
    { title: 'High-speed rail Oslo–Trondheim?', category: 'Infrastructure', subcategory: 'Rail', status: 'Active', votes: '120,876', updated: '2023-10-25' },
    { title: 'Halt new oil & gas exploration licenses?', category: 'Environment', subcategory: 'Oil & Gas', status: 'Archived', votes: '76,543', updated: '2023-09-15' },
    { title: 'Introduce national citizens’ initiative (50k signatures)?', category: 'Governance', subcategory: 'Direct Democracy', status: 'Draft', votes: '0', updated: '2023-10-27' },
]

export default function PollsPage() {
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
            {mockPolls.map((poll, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell>{poll.category} / {poll.subcategory}</TableCell>
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
