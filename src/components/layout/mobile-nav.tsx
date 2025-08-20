
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          <span className="font-bold">Ditt Demokrati</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-y-auto">
          <div className="flex flex-col space-y-3">
             <Link
                href="/all"
                onClick={() => setOpen(false)}
                className="text-foreground"
              >
                Explore
              </Link>
              <Link
                href="/propose"
                onClick={() => setOpen(false)}
                className="text-foreground"
              >
                Propose Topic
              </Link>
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
                                <Link
                                  key={item.id}
                                  href={`/?cat=${category.id}&sub=${item.id}`}
                                  className="block py-1 text-muted-foreground"
                                  onClick={() => setOpen(false)}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                         <Link
                            key={category.id}
                            href={`/?cat=${category.id}`}
                            className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                            onClick={() => setOpen(false)}
                        >
                            {category.label}
                        </Link>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              onClick={() => setOpen(false)}
              className="text-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
