
'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

function CategoryNavContent({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const allCategories = [{ id: 'all', label: 'All', subcategories: [] }, ...categories];
  const selectedCategoryId = searchParams.get('cat') || (pathname === '/election-2025' ? 'election_2025' : 'all');

  const handleSelectCategory = useCallback(
    (categoryId: string | null) => {
      if (pathname.startsWith('/t/')) {
        router.push('/');
        return;
      }
      if (categoryId === 'election_2025') {
        router.push('/election-2025');
        return;
      }
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (categoryId && categoryId !== 'all') {
        current.set('cat', categoryId);
      } else {
        current.delete('cat');
      }
      current.delete('sub'); // Reset subcategory when main category changes
      const search = current.toString();
      const query = search ? `?${search}` : '';

      // If we are on a page that isn't the main page, navigate to main page
      if (pathname !== '/') {
        router.push(`/${query}`);
      } else {
        router.replace(`/${query}`, { scroll: false });
      }
    },
    [searchParams, router, pathname]
  );
  
  // Do not render the category nav on the topic detail page or admin pages
  if (pathname.startsWith('/t/') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div role="tablist" className="relative flex items-center border-b no-scrollbar overflow-x-auto">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategoryId === cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={cn(
                'whitespace-nowrap px-3 py-3 text-sm font-medium relative transition-colors',
                selectedCategoryId === cat.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.label}
              {selectedCategoryId === cat.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <Suspense>
      <CategoryNavContent categories={categories} />
    </Suspense>
  );
}
