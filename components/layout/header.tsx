"use client";

import { usePage } from "@/contexts/page-context";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserDropdown />
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserDropdown size="sm" />
        </div>
      </header>
    </>
  );
}

