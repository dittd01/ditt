
'use client';
import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { usersData as staticUsersData } from '@/app/admin/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

type User = typeof staticUsersData[0];

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>(staticUsersData);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    // This effect runs on the client and will read from localStorage
    const customUsers: User[] = JSON.parse(localStorage.getItem('custom_users') || '[]');
    
    // Combine static data with localStorage data, avoiding duplicates
    setAllUsers(prevUsers => {
        const combined = [...staticUsersData];
        const existingIds = new Set(combined.map(u => u.id));
        customUsers.forEach(user => {
            if (!existingIds.has(user.id)) {
                combined.push(user);
            }
        });
        return combined.sort((a,b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    });
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    const params = new URLSearchParams(searchParams);
    if (newSearchTerm) {
      params.set('q', newSearchTerm);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
        const term = debouncedSearchTerm.toLowerCase();
        return (
            user.id.toLowerCase().includes(term) ||
            user.name.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term)
        );
    });
  }, [allUsers, debouncedSearchTerm]);


  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="View user data. PII is redacted for non-admins."
      >
        <div className="flex gap-2">
            <Input 
              placeholder="Search by name, username, or ID..." 
              className="w-[300px]"
              value={searchTerm}
              onChange={handleSearchChange} 
            />
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
            {filteredUsers.map((user, i) => (
                 <TableRow key={user.id}>
                    <TableCell>
                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                        </Link>
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
