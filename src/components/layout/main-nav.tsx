
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { categories } from '@/lib/data';
import React, { useState, useEffect } from 'react';

export function MainNav() {
    const pathname = usePathname();
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
        setLang(selectedLang);
    }, []);
  
    const trendingText = lang === 'nb' ? 'Populært' : 'Trending';
    const exploreText = lang === 'nb' ? 'Utforsk' : 'Explore';
    const categoriesText = lang === 'nb' ? 'Kategorier' : 'Categories';
    const proposeText = lang === 'nb' ? 'Foreslå Tema' : 'Propose Topic';
    const financesText = lang === 'nb' ? 'Offentlige Finanser' : 'Public Finances';

    return (
        <div className="hidden md:flex">
        <Link href="/" className="mr-6 flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-semibold">Ditt Demokrati</span>
        </Link>
        <NavigationMenu>
            <NavigationMenuList>
             <NavigationMenuItem>
              <NavigationMenuLink asChild active={pathname === '/'}>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  {trendingText}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild active={pathname === '/all'}>
                <Link href="/all" className={navigationMenuTriggerStyle()}>
                  {exploreText}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
                <NavigationMenuTrigger>{categoriesText}</NavigationMenuTrigger>
                <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {categories.filter(c => c.id !== 'election_2025').map((category) => (
                    <ListItem
                        key={category.id}
                        title={lang === 'nb' ? category.label_nb : category.label}
                        href={`/?cat=${category.id}`}
                    >
                        {category.subcategories.map(s => lang === 'nb' ? s.label_nb : s.label).slice(0,3).join(', ')}...
                    </ListItem>
                    ))}
                </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild active={pathname === '/propose'}>
                <Link href="/propose" className={navigationMenuTriggerStyle()}>
                  {proposeText}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild active={pathname === '/finances'}>
                <Link href="/finances" className={navigationMenuTriggerStyle()}>
                  {financesText}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            </NavigationMenuList>
        </NavigationMenu>
        </div>
    );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
