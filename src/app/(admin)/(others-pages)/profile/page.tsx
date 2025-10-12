import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Halaman profile pengguna",
};

export default function Profile() {
  return (
    <main className="space-y-6">
      <PageBreadcrumb pageTitle="Profile" />
      <ProfileClient />
    </main>
  );
}
