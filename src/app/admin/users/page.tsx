
import { PageHeader } from '@/components/admin/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const mockUsers = [
    { id: 'voter_...a3b4', created: '2023-10-27', locale: 'nb-NO', device: 'Mobile', last_seen: '2023-10-27 10:30' },
    { id: 'voter_...c5d6', created: '2023-10-26', locale: 'en-US', device: 'Desktop', last_seen: '2023-10-27 09:15' },
    { id: 'voter_...e7f8', created: '2023-10-25', locale: 'en-GB', device: 'Desktop', last_seen: '2023-10-25 18:00' },
];

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="View user data. PII is redacted for non-admins."
      >
        <Input placeholder="Search by user ID..." className="w-[300px]" />
      </PageHeader>
      
       <Table>
        <TableHeader>
            <TableRow>
                <TableHead>User ID (Masked)</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Device Type</TableHead>
                <TableHead>Last Seen</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {mockUsers.map((user, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell>{user.created}</TableCell>
                    <TableCell>{user.locale}</TableCell>
                    <TableCell>{user.device}</TableCell>
                    <TableCell>{user.last_seen}</TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
