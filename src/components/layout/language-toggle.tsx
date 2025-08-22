
"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
  const { toast } = useToast();

  const setLanguage = (lang: 'en' | 'nb') => {
    localStorage.setItem('selectedLanguage', lang);
    // In a real app with i18n routing, you'd likely use router.push(...)
    // For this prototype, we'll just reload to reflect changes.
    toast({
        title: "Språk endret",
        description: "Laster siden på nytt for å bruke det valgte språket.",
    })
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("nb")}>
          Norsk (Bokmål)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
