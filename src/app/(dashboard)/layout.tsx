import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { GlobalStoreProvider } from "@/lib/global-store";

import { MobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GlobalStoreProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="pb-16 md:pb-0">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <MobileNav />
        </SidebarInset>
      </SidebarProvider>
    </GlobalStoreProvider>
  );
}
