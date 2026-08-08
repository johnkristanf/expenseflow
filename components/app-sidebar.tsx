"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Settings,
  CircleDollarSign,
} from "lucide-react"
import { usePage } from "@/contexts/page-context"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data for the dashboard
const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: ReceiptText,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setTitle } = usePage()

  React.useEffect(() => {
    const activeItem = navItems.find((item) => pathname === item.url || pathname?.startsWith(`${item.url}/`))
    if (activeItem) {
      setTitle(activeItem.title)
    }
  }, [pathname, setTitle])

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-border/50 py-4">
        <div className="flex items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">ExpenseFlow</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.url || pathname?.startsWith(`${item.url}/`)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setTitle(item.title)}
                    render={<Link href={item.url} />}
                    isActive={isActive}
                    tooltip={item.title}
                    className="h-10"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}
