
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
import { Download, PlusCircle, RefreshCw } from 'lucide-react';

const mockExports = [
    { id: 1, type: 'Votes', params: 'Poll: #123, Date: 2023-10-01 to 2023-10-27', status: 'Done', created: '2023-10-27', url: '#' },
    { id: 2, type: 'Users', params: 'All users', status: 'Running', created: '2023-10-27', url: null },
    { id: 3, type: 'Audit Logs', params: 'Actor: admin, Last 30 days', status: 'Queued', created: '2023-10-27', url: null },
    { id: 4, type: 'Polls', params: 'Category: Taxation', status: 'Error', created: '2023-10-26', url: null },
]

export default function ExportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Data Exports"
        subtitle="Generate and download datasets for analysis."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Create Export
        </Button>
      </PageHeader>
      
       <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Export Type</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {mockExports.map((exp) => (
                 <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.type}</TableCell>
                    <TableCell>{exp.params}</TableCell>
                    <TableCell>
                        <Badge variant={exp.status === 'Done' ? 'default' : exp.status === 'Error' ? 'destructive' : 'secondary'}>
                            {exp.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{exp.created}</TableCell>
                    <TableCell>
                        {exp.status === 'Done' && <Button asChild variant="outline" size="sm"><a href={exp.url}><Download className="mr-2 h-4 w-4" />Download</a></Button>}
                        {exp.status === 'Running' && <Button variant="outline" size="sm" disabled><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Running</Button>}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
