import { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/utils/roles";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SiteConfigManager } from "@/components/admin/site-config";
import { getSiteConfigurations } from "@/actions/site-config";

export const metadata: Metadata = {
  title: "Site Configuration | Admin Dashboard",
  description: "Kelola pengaturan dan konfigurasi situs web",
};

export default async function SiteConfigPage() {
  const configurations = await getSiteConfigurations();

  return (
    <RoleGuard requiredRole={ROLES.ADMIN}>
      <div className="mx-auto max-w-7xl">
        <PageBreadcrumb
          pageTitle="Site Configuration"
        />

        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              Site Configuration Management
            </h2>
            <p className="text-body-color dark:text-dark-6">
              Kelola pengaturan dan konfigurasi situs web secara terpusat
            </p>
          </div>

          <SiteConfigManager initialData={configurations} />
        </div>
      </div>
    </RoleGuard>
  );
}