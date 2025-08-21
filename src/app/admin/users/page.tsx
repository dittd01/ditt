
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
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { parse } from 'date-fns';

type User = typeof staticUsersData[0] & { password?: string };

type SortDescriptor = {
    key: keyof Omit<User, 'id' | 'avatar' | 'username' | 'password'> | 'name' | 'username';
    direction: 'ascending' | 'descending';
}

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>(staticUsersData);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ key: 'last_seen', direction: 'descending' });
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

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = allUsers.filter(user => {
        const term = debouncedSearchTerm.toLowerCase();
        return (
            user.id.toLowerCase().includes(term) ||
            user.name.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.type.toLowerCase().includes(term) ||
            user.locale.toLowerCase().includes(term)
        );
    });

    return filtered.sort((a, b) => {
        const aValue = a[sortDescriptor.key];
        const bValue = b[sortDescriptor.key];

        let cmp = 0;
        if (sortDescriptor.key === 'created' || sortDescriptor.key === 'last_seen') {
            const formatString = sortDescriptor.key === 'created' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm';
            const dateA = parse(aValue, formatString, new Date());
            const dateB = parse(bValue, formatString, new Date());
            cmp = dateA.getTime() - dateB.getTime();
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            cmp = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            cmp = aValue - bValue;
        }

        if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
        }
        return cmp;
    });

  }, [allUsers, debouncedSearchTerm, sortDescriptor]);
  
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


  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="View user data. PII is redacted for non-admins."
      >
        <div className="flex gap-2">
            <Input 
              placeholder="Search by name, username, ID, type, locale..." 
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
                <SortableHeader sortKey="name">User</SortableHeader>
                <SortableHeader sortKey="username">Username</SortableHeader>
                <TableHead>User ID (Masked)</TableHead>
                <TableHead>Password</TableHead>
                <SortableHeader sortKey="type">Type</SortableHeader>
                <SortableHeader sortKey="created">Created At</SortableHeader>
                <SortableHeader sortKey="locale">Locale</SortableHeader>
                <SortableHeader sortKey="device">Device Type</SortableHeader>
                <SortableHeader sortKey="last_seen">Last Seen</SortableHeader>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedAndFilteredUsers.map((user, i) => (
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
                    <TableCell className="font-mono">
                        {user.type === 'Mock' ? user.password : '********'}
                    </TableCell>
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
