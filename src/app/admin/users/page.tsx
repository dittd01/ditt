
'use client';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="View user data. PII is redacted for non-admins."
      >
        <div className="flex gap-2">
            <Input placeholder="Search by user ID..." className="w-[300px]" />
            <Button asChild>
                <Link href="/admin/users/new">
                    <PlusCircle className="mr-2" />
                    Create User
                </Link>
            </Button>
        </div>
      </PageHeader>
      
       <Table>
        <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
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
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>@{user.username}</TableCell>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell><Badge variant={user.type === 'Real' ? 'default' : 'outline'}>{user.type}</Badge></TableCell>
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
