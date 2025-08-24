
'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category, Subcategory } from '@/lib/types';

interface TopicFiltersProps {
  categories: Category[];
}

export function TopicFilters({ categories }: TopicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState('en');

  // Derive state from URL search params
  const categoryFilter = searchParams.get('category') || 'all';
  const subcategoryFilter = searchParams.get('subcategory') || 'all';

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

  const availableSubcategories = useMemo(() => {
    if (categoryFilter === 'all') return [];
    const category = categories.find(c => c.id === categoryFilter);
    return category?.subcategories || [];
  }, [categoryFilter, categories]);

  const handleFilterChange = (key: 'category' | 'subcategory', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // If the category changes, the subcategory selection should be reset.
    if (key === 'category') {
      params.delete('subcategory');
    }

    // Use router.push to navigate to the new URL, triggering a re-render
    // on the server with the new search parameters.
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.filter(c => c.id !== 'election_2025').map(category => (
            <SelectItem key={category.id} value={category.id}>
              {lang === 'nb' ? category.label_nb : category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subcategoryFilter}
        onValueChange={(value) => handleFilterChange('subcategory', value)}
        disabled={availableSubcategories.length === 0}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Subcategory" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subcategories</SelectItem>
          {availableSubcategories.map(subcategory => (
            <SelectItem key={subcategory.id} value={subcategory.id}>
              {lang === 'nb' ? subcategory.label_nb : subcategory.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
