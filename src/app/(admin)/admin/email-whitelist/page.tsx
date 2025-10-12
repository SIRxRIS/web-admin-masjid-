import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/utils/roles";
import { 
  getEmailWhitelist, 
  createEmailWhitelist, 
  updateEmailWhitelist, 
  deleteEmailWhitelist,
  toggleEmailWhitelistStatus 
} from "@/actions/email-white-list";
import { EmailWhitelistData, EmailWhitelistFormData } from "@/lib/schema/email-whitelist";
import { EmailWhitelistTable } from "@/components/admin/email-whitelist";

export const metadata: Metadata = {
  title: "Email Whitelist - Masjid Jawahiruzzarqa",
  description: "Kelola daftar email yang diizinkan mengakses sistem admin Masjid Jawahiruzzarqa.",
  keywords: ["email", "whitelist", "admin", "masjid", "jawahiruzzarqa"],
};

// Wrapper functions untuk client component
async function handleCreateEmailWhitelist(data: EmailWhitelistFormData): Promise<EmailWhitelistData> {
  "use server";
  return await createEmailWhitelist(data);
}

async function handleUpdateEmailWhitelist(id: string, data: EmailWhitelistFormData): Promise<EmailWhitelistData> {
  "use server";
  return await updateEmailWhitelist(id, data);
}

async function handleDeleteEmailWhitelist(id: string): Promise<boolean> {
  "use server";
  try {
    await deleteEmailWhitelist(id);
    return true;
  } catch (error) {
    console.error("Error deleting email whitelist:", error);
    return false;
  }
}

async function handleToggleEmailWhitelistStatus(id: string, status: boolean): Promise<boolean> {
  "use server";
  try {
    await toggleEmailWhitelistStatus(id, status);
    return true;
  } catch (error) {
    console.error("Error toggling email whitelist status:", error);
    return false;
  }
}

// Main Component
export default async function EmailWhitelistPage() {
  // Fetch initial data
  const emailWhitelistData = await getEmailWhitelist();

  return (
    <RoleGuard requiredRole={ROLES.ADMIN}>
      <div>
        <PageBreadcrumb pageTitle="Email Whitelist" />
        <main className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <EmailWhitelistTable
                initialData={emailWhitelistData || []}
                onCreateEmailWhitelist={handleCreateEmailWhitelist}
                onUpdateEmailWhitelist={handleUpdateEmailWhitelist}
                onDeleteEmailWhitelist={handleDeleteEmailWhitelist}
                onToggleEmailWhitelistStatus={handleToggleEmailWhitelistStatus}
              />
            </section>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}