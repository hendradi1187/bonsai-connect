import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-12 items-center border-b bg-background/95 backdrop-blur px-4">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground">
              {user?.role === "juri" ? "Judge Panel" : "Admin Panel"}
            </span>
          </header>
          <main className="flex-1 bg-surface p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
