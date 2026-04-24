import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar userRole={user.role} />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <Topbar user={user} />
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
