import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { PageProvider } from "@/contexts/page-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 w-full bg-background overflow-x-hidden p-6 md:p-12 mb-16 md:mb-0">
            {children}
          </main>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </PageProvider>
  )
}
