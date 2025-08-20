
'use client';

import { Suspense, useCallback, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const MAX_VISIBLE_CATEGORIES = 7;

function CategoryNavContent({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [dropdownCategories, setDropdownCategories] = useState<Category[]>([]);

  const allCategories = [{ id: 'all', label: 'All', subcategories: [] }, ...categories];
  const selectedCategoryId = searchParams.get('cat') || (pathname === '/election-2025' ? 'election_2025' : 'all');

  useEffect(() => {
    if (isMobile) {
      setVisibleCategories(allCategories);
      setDropdownCategories([]);
    } else {
      const electionCategory = allCategories.find(c => c.id === 'election_2025');
      const otherCategories = allCategories.filter(c => c.id !== 'election_2025');
      
      const visible = [...otherCategories.slice(0, MAX_VISIBLE_CATEGORIES - (electionCategory ? 1 : 0))];
      if (electionCategory) {
        visible.splice(1, 0, electionCategory); // Place "Election 2025" after "All"
      }
      
      const dropdown = otherCategories.slice(MAX_VISIBLE_CATEGORIES - (electionCategory ? 1 : 0));

      setVisibleCategories(visible);
      setDropdownCategories(dropdown);
    }
  }, [isMobile, categories]);


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
  
  const renderCategoryButton = (cat: Category) => (
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
  );

  return (
    <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div role="tablist" className={cn("relative flex items-center border-b", isMobile && "no-scrollbar overflow-x-auto")}>
          {visibleCategories.map(renderCategoryButton)}
          
          {dropdownCategories.length > 0 && !isMobile && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                  More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {dropdownCategories.map((cat) => (
                  <DropdownMenuItem key={cat.id} onClick={() => handleSelectCategory(cat.id)}
                    className={cn(selectedCategoryId === cat.id && 'bg-accent/50 text-accent-foreground')}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
