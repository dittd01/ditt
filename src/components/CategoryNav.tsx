'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category, Subcategory } from '@/lib/types';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function CategoryNavContent({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const allCategories = [{ id: 'all', label: 'All', subcategories: [] }, ...categories];
  const selectedCategoryId = searchParams.get('cat') || (pathname === '/election-2025' ? 'election_2025' : 'all');
  const selectedSubcategoryId = searchParams.get('sub');

  const [isSticky, setIsSticky] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinalRef = useRef<HTMLDivElement>(null);

  const handleSelectCategory = useCallback(
    (categoryId: string | null) => {
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
      router.push(`/${query}`);
    },
    [searchParams, router]
  );

  const handleSelectSubcategory = useCallback(
    (subcategoryId: string | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (subcategoryId) {
        current.set('sub', subcategoryId);
      } else {
        current.delete('sub');
      }
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`/${query}`);
    },
    [searchParams, router]
  );

  const selectedCategoryData = categories.find((c) => c.id === selectedCategoryId);

  // Observer for sticky nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setIsSticky(e.intersectionRatio < 1),
      { threshold: [1] }
    );
    if (sentinalRef.current) {
      observer.observe(sentinalRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Recalculate hidden categories on resize
  useEffect(() => {
    const calculateHidden = () => {
      if (!navRef.current) return;
      const navWidth = navRef.current.offsetWidth;
      let totalWidth = 0;
      const newHidden: Category[] = [];
      const visibleCategories = allCategories.filter(c => !hiddenCategories.some(h => h.id === c.id));
      
      let currentVisibleWidth = 0;
      for (const child of Array.from(navRef.current.children) as HTMLElement[]) {
          if (child.dataset.role === 'category-button') {
              currentVisibleWidth += child.offsetWidth;
          }
      }

      if (currentVisibleWidth > navWidth - 80) { // Needs hiding
          totalWidth = currentVisibleWidth;
          for (let i = visibleCategories.length - 1; i >= 0; i--) {
              const cat = visibleCategories[i];
              const child = Array.from(navRef.current.children).find(c => (c as HTMLElement).dataset.categoryId === cat.id) as HTMLElement;
              if (child) {
                  totalWidth -= child.offsetWidth;
                  newHidden.unshift(cat);
                  if (totalWidth <= navWidth - 80) break;
              }
          }
          setHiddenCategories(prev => [...prev, ...newHidden]);
      } else { // Needs showing
          if(hiddenCategories.length > 0) {
              const nextToShow = hiddenCategories[0];
              const tempButton = document.createElement('button');
              tempButton.innerText = nextToShow.label;
              tempButton.className = (Array.from(navRef.current.children)[0] as HTMLElement).className;
              tempButton.style.visibility = 'hidden';
              document.body.appendChild(tempButton);
              const nextWidth = tempButton.offsetWidth;
              document.body.removeChild(tempButton);

              if (currentVisibleWidth + nextWidth < navWidth - 80) {
                   setHiddenCategories(prev => prev.slice(1));
              }
          }
      }
    };

    calculateHidden();
    const debouncedCalculate = () => setTimeout(calculateHidden, 100);
    window.addEventListener('resize', debouncedCalculate);
    return () => window.removeEventListener('resize', debouncedCalculate);
  }, [allCategories, hiddenCategories]);

  return (
    <>
      <div ref={sentinalRef} className="h-px"></div>
      <div
        className={cn(
          'sticky top-14 z-40 bg-background/80 backdrop-blur-sm', // top-14 to stick below header
          isSticky && 'shadow-sm'
        )}
      >
        <div className="container mx-auto px-4">
          {/* Main Categories */}
          <div ref={navRef} className="relative flex items-center border-b no-scrollbar overflow-x-auto">
            {allCategories.filter(cat => !hiddenCategories.some(h => h.id === cat.id)).map((cat) => (
                <button
                  key={cat.id}
                  data-role="category-button"
                  data-category-id={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={cn(
                    'whitespace-nowrap px-3 py-3 text-sm font-medium relative',
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
             {hiddenCategories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 ml-auto">
                      More <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hiddenCategories.map((cat) => (
                      <DropdownMenuItem key={cat.id} onClick={() => handleSelectCategory(cat.id)}>
                        {cat.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
          {/* Sub Categories */}
          {selectedCategoryData && selectedCategoryData.id !== 'all' && selectedCategoryData.id !== 'election_2025' && (
            <div className="flex items-center py-2 no-scrollbar overflow-x-auto">
              <button
                onClick={() => handleSelectSubcategory(null)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  !selectedSubcategoryId
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                All
              </button>
              <div className="h-4 w-px bg-border mx-2"></div>
              {selectedCategoryData.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubcategory(sub.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors mr-2',
                    selectedSubcategoryId === sub.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <Suspense fallback={<div className="h-[97px] bg-background"></div>}>
      <CategoryNavContent categories={categories} />
    </Suspense>
  )
}
