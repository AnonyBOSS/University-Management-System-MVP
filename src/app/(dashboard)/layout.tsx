import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Dashboard layout — wraps all protected pages with sidebar and topbar.
 * Redirects to login if user is not authenticated.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
        {/* Sidebar — handles its own mobile/desktop rendering */}
        <Sidebar userRole={user.role} />

        {/* Main content area */}
        <div className="lg:pl-64">
          <Topbar user={user} />
          <main className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
