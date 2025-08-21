
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
import React from 'react';

export function MainNav() {
    const pathname = usePathname();
  
    return (
        <div className="hidden md:flex">
        <Link href="/" className="mr-6 flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-semibold">Ditt Demokrati</span>
        </Link>
        <NavigationMenu>
            <NavigationMenuList>
            <NavigationMenuItem>
                <Link href="/all" legacyBehavior passHref>
                  <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === '/all'}
                  >
                      Explore
                  </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
                <Link href="/propose" legacyBehavior passHref>
                  <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === '/propose'}
                  >
                      Propose Topic
                  </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {categories.filter(c => c.id !== 'election_2025').map((category) => (
                    <ListItem
                        key={category.id}
                        title={category.label}
                        href={`/?cat=${category.id}`}
                    >
                        {category.subcategories.map(s => s.label).slice(0,3).join(', ')}...
                    </ListItem>
                    ))}
                </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
            
             <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === '/about'}
                  >
                      About
                  </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>

             <NavigationMenuItem>
                <Link href="/privacy" legacyBehavior passHref>
                  <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === '/privacy'}
                  >
                      Privacy
                  </NavigationMenuLink>
                </Link>
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
