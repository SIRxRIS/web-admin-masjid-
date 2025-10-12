import { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/utils/roles";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { UserActivityTable } from "@/components/admin/user-activity";
import { getUserActivityLogs, getUserActivityStats } from "@/actions/user-activity";

export const metadata: Metadata = {
  title: "User Activity Monitoring | Admin Dashboard",
  description: "Monitor dan track aktivitas pengguna dalam sistem",
};

export default async function UserActivityPage() {
  const activities = await getUserActivityLogs();

  return (
    <RoleGuard requiredRole={ROLES.ADMIN}>
      <div className="mx-auto max-w-7xl">
        <PageBreadcrumb
          pageTitle="User Activity Monitoring"
        />

        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              User Activity Monitoring
            </h2>
            <p className="text-body-color dark:text-dark-6">
              Monitor dan track semua aktivitas pengguna dalam sistem
            </p>
          </div>

          <UserActivityTable initialData={activities} />
        </div>
      </div>
    </RoleGuard>
  );
}