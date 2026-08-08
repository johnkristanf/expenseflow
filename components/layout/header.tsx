"use client";

import { usePage } from "@/contexts/page-context";
import { Search, Bell, HelpCircle } from "lucide-react";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const { title } = usePage();

  return (
    <>
      {/* TopAppBar (Desktop) */}
      <header className="bg-background border-b border-border w-full px-6 md:px-12 h-16 sticky top-0 z-40 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2" />
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
        </div>
        
        <div className="flex-1 flex justify-end pr-8">
          <div className="relative w-64 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full bg-background border border-border rounded-lg py-1.5 pl-9 pr-4 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors active:opacity-80 p-1 rounded hover:bg-accent">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors active:opacity-80 p-1 rounded hover:bg-accent">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
           <Image
             src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQgj2_MEvcm6FxB9rLT9LH4_PNIhQ048KDfFv7K_ZrBeYk_YxFkzjvWq-_axirBp1LhKIhbXkrXWJtrQiTDXCer5qY8Z8cqttK5o-ErW-ocNczXmw3PddIvYjYlccicQVD1vv4Sd9yDsEtD41ZavI82uolxmlr54B5t-9pYC45rJip5p6ULpXGSXA6_kybmpBNGhWtU6yXLiOjQYAgsYCZEr-mXB3gbopu708Mt8Wkn6TWHLl2fxiJDw"
             alt="User Avatar"
             fill
             className="object-cover"
             unoptimized
           />
        </div>
      </header>
    </>
  );
}
