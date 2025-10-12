import { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/utils/roles";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SystemHealthDashboard } from "@/components/admin/system-health";
import { getSystemHealthMetrics } from "@/actions/system-health";

export const metadata: Metadata = {
  title: "System Health Dashboard | Admin Dashboard",
  description: "Monitor kesehatan sistem dan performa aplikasi",
};

export default async function SystemHealthPage() {
  const healthMetrics = await getSystemHealthMetrics();

  return (
    <RoleGuard requiredRole={ROLES.ADMIN}>
      <div className="mx-auto max-w-7xl">
        <PageBreadcrumb
          pageTitle="System Health Dashboard"
        />

        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              System Health Dashboard
            </h2>
            <p className="text-body-color dark:text-dark-6">
              Monitor kesehatan sistem, performa database, dan metrics aplikasi
            </p>
          </div>

          <SystemHealthDashboard initialData={healthMetrics} />
        </div>
      </div>
    </RoleGuard>
  );
}