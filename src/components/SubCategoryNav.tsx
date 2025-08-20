
'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Suspense } from 'react';

function SubCategoryNavContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (searchQuery.trim()) {
      current.set('q', searchQuery.trim());
    } else {
      current.delete('q');
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';

    if (pathname !== '/') {
        router.push(`/${query}`);
    } else {
        router.replace(`/${query}`, { scroll: false });
    }
  };

  // Do not render on certain pages
  if (pathname.startsWith('/t/') || pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/about')) {
    return null;
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-2">
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search topics..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>
    </div>
  );
}

export function SubCategoryNav() {
    return (
        <Suspense>
            <SubCategoryNavContent />
        </Suspense>
    )
}
