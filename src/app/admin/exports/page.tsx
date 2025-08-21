
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
import { exportsData } from '@/app/admin/data';

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
            {exportsData.map((exp) => (
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
