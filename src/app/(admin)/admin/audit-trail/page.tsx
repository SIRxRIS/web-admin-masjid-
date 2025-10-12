import { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/utils/roles";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { AuditTrailDashboard } from "@/components/admin/audit-trail";
import { getAuditLogs, getAuditLogStats } from "@/actions/audit-log";

export const metadata: Metadata = {
  title: "Audit Trail - Admin Dashboard",
  description: "Monitor and track all data changes and user activities",
};

export default async function AuditTrailPage() {
  const [initialLogs, stats] = await Promise.all([
    getAuditLogs(1, 50),
    getAuditLogStats(),
  ]);

  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Audit Trail"
        />
        
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Monitor and track all data changes and user activities in the system
          </p>
        </div>

        <AuditTrailDashboard 
          initialLogs={initialLogs}
          stats={stats}
        />
      </div>
    </RoleGuard>
  );
}