
'use client';

import { useState } from 'react';
import Link, { type LinkProps } from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, CheckSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { categories } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';


export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          <span className="font-bold">Ditt Demokrati</span>
        </MobileLink>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-y-auto">
          <div className="flex flex-col space-y-3">
             <MobileLink
                href="/all"
                onOpenChange={setOpen}
                className="text-foreground"
              >
                Explore
              </MobileLink>
              <MobileLink
                href="/propose"
                onOpenChange={setOpen}
                className="text-foreground"
              >
                Propose Topic
              </MobileLink>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger className="text-sm">Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {categories.map((category) =>
                      category.subcategories.length > 0 ? (
                        <Accordion
                          key={category.id}
                          type="single"
                          collapsible
                        >
                          <AccordionItem value={category.id}>
                            <AccordionTrigger className="pl-4 text-xs">
                              {category.label}
                            </AccordionTrigger>
                            <AccordionContent className="pl-8">
                              {category.subcategories.map((item) => (
                                <MobileLink
                                  key={item.id}
                                  href={`/?cat=${category.id}&sub=${item.id}`}
                                  className="block py-1 text-muted-foreground"
                                  onOpenChange={setOpen}
                                >
                                  {item.label}
                                </MobileLink>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                         <MobileLink
                            key={category.id}
                            href={`/?cat=${category.id}`}
                            className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                            onOpenChange={setOpen}
                        >
                            {category.label}
                        </MobileLink>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}
