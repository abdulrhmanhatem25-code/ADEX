import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { getAdexPageKey } from "@/layout/adexPageTheme";

function DashboardLayoutContent() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  const location = useLocation();
  const adexPage = getAdexPageKey(location.pathname);

  return (
    <div data-adex-page={adexPage} className="contents">
      {/* ── Header — fixed، واخد عرض الشاشة، بيتحرك مع الـ sidebar ── */}
      <header
        className={`fixed top-0 start-0 end-0 h-14 z-40 bg-white shadow-sm border-b border-border/60 dark:border-sidebar-border ${isExpanded ? "md:ps-52" : "md:ps-12"
          }`}
      >
        <Header />
      </header>

      {/* ── Sidebar — fixed، فوق الهيدر ── */}
      <div className="fixed bg-white start-0 top-0 bottom-0 z-50 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <AppSidebar />
        </div>
      </div>

      {/* ── Content area — بيتحرك مع الـ sidebar ويبدأ تحت الهيدر ── */}
      <div
        className={`flex flex-col w-full min-h-screen pt-14 transition-all duration-300 ease-in-out ${isExpanded ? "md:ps-52" : "md:ps-12"
          }`}
      >
        <main className="flex-1 bg-white overflow-y-auto p-4 md:p-5">
          <Outlet key={location.key} />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
}
