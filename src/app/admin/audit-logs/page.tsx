
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auditLogsData } from '@/app/admin/data';

export default function AuditLogsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all significant actions performed in the system."
      >
        <div className="flex gap-4">
            <Input placeholder="Filter by actor..." className="w-[200px]" />
            <Input placeholder="Filter by action..." className="w-[200px]" />
            <DateRangePicker />
        </div>
      </PageHeader>
      <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Notes</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {auditLogsData.map((log, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-mono">{log.ts}</TableCell>
                    <TableCell>{log.actor}</TableCell>
                    <TableCell className="font-mono">{log.action}</TableCell>
                    <TableCell className="font-mono">{log.entity}</TableCell>
                    <TableCell>{log.notes}</TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
