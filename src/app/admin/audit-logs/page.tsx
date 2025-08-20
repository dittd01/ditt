
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

const mockLogs = [
    { ts: '2023-10-27 10:45:12', actor: 'admin@...', action: 'poll.update_status', entity: 'poll/xyz123', notes: 'Status -> Archived' },
    { ts: '2023-10-27 10:30:05', actor: 'moderator@...', action: 'suggestion.approve', entity: 'suggestion/abc789', notes: 'Approved as new topic' },
    { ts: '2023-10-26 15:00:00', actor: 'system', action: 'export.complete', entity: 'export/def456', notes: 'Weekly votes export' },
]

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
            {mockLogs.map((log, i) => (
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
