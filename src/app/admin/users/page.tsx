
import { PageHeader } from '@/components/admin/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { usersData } from '@/app/admin/data';
import { Badge } from '@/components/ui/badge';

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
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Device Type</TableHead>
                <TableHead>Last Seen</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {usersData.map((user, i) => (
                 <TableRow key={i}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell><Badge variant="outline">{user.type}</Badge></TableCell>
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
